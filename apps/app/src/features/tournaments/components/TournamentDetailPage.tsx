import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Coins, Clock, CreditCard, Trophy } from 'lucide-react'
import { useTournament, useRegisterTeam, useWithdrawTeam } from '../hooks/useTournaments'
import { useAuthStore } from '../../auth/store/auth.store'
import { TournamentMatch, TournamentTeam } from '../services/tournamentService'
import { RefundOutcomeNotice } from '../../../shared/components/RefundOutcomeNotice'
import { tournamentErrorMessage } from '../lib/errors'
import {
  clearPendingRegistration,
  loadPendingRegistration,
  savePendingRegistration,
  type PendingRegistration,
} from '../lib/pending-registration'

/** While the return from Mercado Pago waits for the webhook, refetch every 4 s for up to a minute. */
const POLL_MS = 4000
const POLL_WINDOW_MS = 60_000

function scoreText(m: Pick<TournamentMatch, 'score_team1' | 'score_team2'>): string | null {
  const a = m.score_team1
  const b = m.score_team2
  if (!a || !b || a.length === 0) return null
  return a.map((games, i) => `${games}-${b[i] ?? 0}`).join(' ')
}

export function TournamentDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [search, setSearch] = useSearchParams()
  const { user } = useAuthStore()
  // MercadoPago's own redirect param (`success` | `failure` | `pending`), see `back_urls` of the API.
  const paymentParam = search.get('payment')

  const [pollUntil, setPollUntil] = useState<number | null>(() =>
    paymentParam === 'success' || paymentParam === 'pending' ? Date.now() + POLL_WINDOW_MS : null,
  )
  const polling = pollUntil !== null && Date.now() < pollUntil
  const { data: tournament, isLoading } = useTournament(id, { pollMs: polling ? POLL_MS : false })
  const registerTeam = useRegisterTeam(id!)
  const withdrawTeam = useWithdrawTeam(id!)

  const [showRegister, setShowRegister] = useState(false)
  const [partnerId, setPartnerId] = useState('')
  const [teamName, setTeamName] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [pending, setPending] = useState<PendingRegistration | null>(() =>
    user?.id && id ? loadPendingRegistration(user.id, id) : null,
  )
  const [now, setNow] = useState(() => Date.now())

  const teams = tournament?.tournament_teams ?? []
  const myTeam = teams.find((x: TournamentTeam) => x.player1.id === user?.id || x.player2.id === user?.id)

  // Tick once a second only while there is a deadline to show.
  useEffect(() => {
    if (!pending?.expiresAt && !polling) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [pending?.expiresAt, polling])

  // The webhook confirmed the registration (it is in the public list now): the pending state is over.
  useEffect(() => {
    if (myTeam && user?.id && id) {
      clearPendingRegistration(user.id, id)
      setPending(null)
      setPollUntil(null)
      if (search.has('payment')) setSearch({}, { replace: true })
    }
  }, [myTeam, user?.id, id, search, setSearch])

  const playerNames = useMemo(() => {
    const names = new Map<string, string>()
    for (const team of teams) {
      names.set(team.player1.id, team.player1.username)
      names.set(team.player2.id, team.player2.username)
    }
    return names
  }, [teams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{t('tournaments.loadingTournament')}</p>
      </div>
    )
  }

  if (!tournament) return null

  const STATUS_LABELS: Record<string, string> = {
    open: t('tournaments.status.open'),
    in_progress: t('tournaments.status.in_progress'),
    completed: t('tournaments.status.completed'),
    cancelled: t('tournaments.status.cancelled'),
  }
  const FORMAT_LABELS: Record<string, string> = {
    round_robin: t('tournaments.format.round_robin'),
    single_elimination: t('tournaments.format.single_elimination'),
    double_elimination: t('tournaments.format.doubleEliminationLong'),
    americano: t('tournaments.format.americano'),
  }

  const matches = tournament.tournament_matches ?? []
  const isRegistered = !!myTeam
  const isFull = teams.length >= tournament.max_teams
  const fee = tournament.entry_fee ?? 0
  const deadlinePassed =
    !!tournament.registration_deadline && new Date(tournament.registration_deadline).getTime() < now
  const pendingExpired = !!pending?.expiresAt && new Date(pending.expiresAt).getTime() <= now
  const hasPending = !!pending && !isRegistered && !pendingExpired
  const canRegister =
    tournament.status === 'open' && !isRegistered && !hasPending && !isFull && !deadlinePassed

  const sideName = (m: TournamentMatch, side: 1 | 2): string => {
    const team = side === 1 ? m.team1 : m.team2
    const players = side === 1 ? m.team1_players : m.team2_players
    if (players && players.length > 0) return players.map((p) => playerNames.get(p) ?? '?').join(' / ')
    if (team) return team.name ?? t(side === 1 ? 'matches.team1' : 'matches.team2')
    return m.status === 'bye' ? t('tournaments.bye') : t('tournaments.toBeDecided')
  }

  async function handleRegister() {
    if (!partnerId.trim()) return
    setActionError(null)
    try {
      const result = await registerTeam.mutateAsync({ partner_id: partnerId.trim(), team_name: teamName || undefined })
      setShowRegister(false)
      setPartnerId('')
      setTeamName('')
      if (result.payment_required && result.payment) {
        const checkoutUrl = import.meta.env.PROD ? result.payment.init_point : result.payment.sandbox_init_point
        const record: PendingRegistration = {
          tournamentId: result.tournament_id,
          teamId: result.id,
          expiresAt: result.expires_at,
          checkoutUrl,
          amount: result.payment.amount,
        }
        if (user?.id) savePendingRegistration(user.id, record)
        setPending(record)
        window.location.href = checkoutUrl
      }
    } catch (e: unknown) {
      setActionError(tournamentErrorMessage(e, t))
    }
  }

  async function handleWithdraw() {
    if (!confirm(t(hasPending ? 'tournaments.confirmCancelPending' : 'tournaments.confirmWithdraw'))) return
    setActionError(null)
    try {
      await withdrawTeam.mutateAsync()
      if (user?.id && id) clearPendingRegistration(user.id, id)
      setPending(null)
    } catch (e: unknown) {
      setActionError(tournamentErrorMessage(e, t, 'common.error'))
    }
  }

  const remaining = pending?.expiresAt ? Math.max(0, new Date(pending.expiresAt).getTime() - now) : null
  const mm = remaining === null ? '' : String(Math.floor(remaining / 60000)).padStart(2, '0')
  const ss = remaining === null ? '' : String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-foreground truncate flex-1">{tournament.name}</h1>
      </div>

      <div className="px-4 pb-8 space-y-5 mt-4">
        {/* Return from the payment */}
        {paymentParam === 'failure' && !isRegistered && (
          <div role="alert" className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
            {t('tournaments.payment.failure')}
          </div>
        )}
        {(paymentParam === 'success' || paymentParam === 'pending') && !isRegistered && (
          <div role="status" className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 text-sm text-yellow-800 dark:text-yellow-300">
            {t(polling ? 'tournaments.payment.confirming' : 'tournaments.payment.stillPending')}
          </div>
        )}
        {paymentParam === 'success' && isRegistered && (
          <div role="status" className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm text-green-700 dark:text-green-300">
            {t('tournaments.payment.confirmed')}
          </div>
        )}

        {/* Status + meta */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {STATUS_LABELS[tournament.status]}
            </span>
            <span className="text-xs text-muted-foreground">{FORMAT_LABELS[tournament.format]}</span>
          </div>
          {tournament.status === 'cancelled' && (
            <p className="text-sm text-red-500">
              {t('tournaments.cancelledNotice')}
              {tournament.cancel_reason ? ` ${tournament.cancel_reason}` : ''}
            </p>
          )}
          {tournament.description && <p className="text-sm text-muted-foreground">{tournament.description}</p>}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">{t('tournaments.startDate')}</p>
              <p className="font-medium text-foreground">
                {new Date(tournament.start_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            {tournament.end_date && (
              <div>
                <p className="text-xs text-muted-foreground">{t('tournaments.endDate')}</p>
                <p className="font-medium text-foreground">
                  {new Date(tournament.end_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            )}
            {tournament.club && (
              <div>
                <p className="text-xs text-muted-foreground">{t('reservations.club')}</p>
                <p className="font-medium text-foreground">{tournament.club.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">{t('tournaments.teams')}</p>
              <p className="font-medium text-foreground">
                {teams.length}/{tournament.max_teams}
              </p>
            </div>
            {tournament.registration_deadline && tournament.status === 'open' && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">{t('tournaments.registrationDeadline')}</p>
                <p className="font-medium text-foreground">
                  {new Date(tournament.registration_deadline).toLocaleString('es-AR', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
          {tournament.prize_pool != null && tournament.prize_pool > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">{t('tournaments.totalPrize')}</p>
              <p className="text-sm font-medium text-foreground flex items-center gap-1">
                <Coins className="w-4 h-4" /> {t('tournaments.amount', { fee: tournament.prize_pool.toLocaleString('es-AR') })}
              </p>
            </div>
          )}
          {fee > 0 && (
            <p className="text-xs text-muted-foreground">
              {t('tournaments.entryFeeAmount', { fee: fee.toLocaleString('es-AR') })}
            </p>
          )}
        </div>

        {/* Pending payment */}
        {hasPending && pending && (
          <div className="bg-card border border-yellow-500/50 rounded-xl p-4 space-y-3">
            <p className="font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> {t('tournaments.pending.title')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('tournaments.pending.body', { amount: pending.amount.toLocaleString('es-AR') })}
            </p>
            {remaining !== null && (
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {t('tournaments.pending.expiresIn', { time: `${mm}:${ss}` })}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  window.location.href = pending.checkoutUrl
                }}
                className="flex-1 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm"
              >
                {t('tournaments.pending.payNow')}
              </button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawTeam.isPending}
                className="flex-1 py-2 border border-border text-foreground font-medium rounded-lg text-sm disabled:opacity-60"
              >
                {t('tournaments.pending.cancel')}
              </button>
            </div>
          </div>
        )}
        {pending && pendingExpired && !isRegistered && (
          <div role="status" className="bg-muted rounded-xl p-3 text-sm text-foreground">
            {t('tournaments.pending.expired')}
          </div>
        )}

        {/* Withdraw result */}
        {withdrawTeam.isSuccess && (
          <div className="space-y-2">
            <div role="status" className="bg-muted rounded-xl p-3 text-sm text-foreground">
              {t('tournaments.withdrawn')}
            </div>
            <RefundOutcomeNotice refund={withdrawTeam.data.refund} />
          </div>
        )}

        {actionError && (
          <div role="alert" className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
            {actionError}
          </div>
        )}

        {/* Player actions */}
        {canRegister && !showRegister && (
          <button
            onClick={() => setShowRegister(true)}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            {t('tournaments.registerTeam')}
          </button>
        )}
        {tournament.status === 'open' && !isRegistered && !hasPending && (isFull || deadlinePassed) && (
          <p className="text-sm text-muted-foreground text-center">
            {t(isFull ? 'tournaments.full' : 'tournaments.registrationClosed')}
          </p>
        )}

        {isRegistered && tournament.status === 'open' && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawTeam.isPending}
            className="w-full py-3 border border-red-500 text-red-500 font-semibold rounded-xl disabled:opacity-60"
          >
            {withdrawTeam.isPending ? t('tournaments.withdrawing') : t('tournaments.withdrawMyTeam')}
          </button>
        )}

        {/* Register form */}
        {showRegister && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="font-semibold text-foreground">{t('tournaments.registerTeam')}</p>
            {fee > 0 && (
              <p className="text-xs text-muted-foreground">
                {t('tournaments.payOnRegister', { fee: fee.toLocaleString('es-AR') })}
              </p>
            )}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t('tournaments.partnerIdRequired')}</label>
              <input
                type="text"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                placeholder={t('tournaments.partnerIdPlaceholder')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t('tournaments.teamNameOptional')}</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={t('tournaments.teamNamePlaceholder')}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRegister(false)}
                className="flex-1 py-2 border border-border text-foreground font-medium rounded-lg text-sm"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleRegister}
                disabled={!partnerId.trim() || registerTeam.isPending}
                className="flex-1 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm disabled:opacity-60"
              >
                {registerTeam.isPending
                  ? t('tournaments.registering')
                  : t(fee > 0 ? 'tournaments.registerAndPay' : 'tournaments.register')}
              </button>
            </div>
          </div>
        )}

        {/* Teams list */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">{t('tournaments.teamsWithCount', { count: teams.length })}</h2>
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t('tournaments.noTeamsYet')}</p>
          ) : (
            <div className="space-y-2">
              {teams.map((team: TournamentTeam) => (
                <div
                  key={team.id}
                  className={`bg-card border rounded-lg p-3 flex items-center gap-3 ${
                    myTeam?.id === team.id ? 'border-primary/50' : 'border-border'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {team.name ?? `${team.player1.username} & ${team.player2.username}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('tournaments.eloShort', { elo1: team.player1.elo, elo2: team.player2.elo })}
                    </p>
                  </div>
                  {myTeam?.id === team.id && (
                    <span className="text-xs font-medium text-primary">{t('tournaments.myTeam')}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matches, grouped by stage and round (read only) */}
        {matches.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3">{t('matches.title')}</h2>
            <div className="space-y-2">
              {[...matches]
                .sort(
                  (a, b) =>
                    stageOrder(a.stage) - stageOrder(b.stage) || a.round - b.round || a.position - b.position,
                )
                .map((m) => {
                  const score = scoreText(m)
                  const done = m.status === 'completed'
                  return (
                    <div
                      key={m.id}
                      className={`bg-card border border-border rounded-lg p-3 ${m.status === 'bye' || m.status === 'void' ? 'opacity-60' : ''}`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {t(`tournaments.stage.${m.stage}`)} · {t('tournaments.round', { number: m.round })}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground min-w-0 truncate">{sideName(m, 1)}</p>
                        {score ? (
                          <span className="text-sm font-bold text-foreground px-2 flex-shrink-0">{score}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2 flex-shrink-0">{t('matches.vs')}</span>
                        )}
                        <p className="text-sm font-medium text-foreground text-right min-w-0 truncate">
                          {sideName(m, 2)}
                        </p>
                      </div>
                      {done && m.winner_team && (
                        <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" /> {m.winner_team.name}
                        </p>
                      )}
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const STAGE_ORDER = ['main', 'winners', 'losers', 'grand_final', 'group', 'americano']
function stageOrder(stage: string): number {
  const i = STAGE_ORDER.indexOf(stage)
  return i === -1 ? STAGE_ORDER.length : i
}
