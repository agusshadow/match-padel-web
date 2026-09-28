import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Calendar, Trophy, Coins } from 'lucide-react'
import { useTournaments } from '../hooks/useTournaments'
import { Tournament } from '../services/tournamentService'

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-600 dark:text-green-400',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-500',
}

function TournamentCard({ t: tournament, onClick }: { t: Tournament; onClick: () => void }) {
  const { t } = useTranslation()
  const teams = tournament.teams_count ?? 0
  const pct = Math.round((teams / tournament.max_teams) * 100)

  const STATUS_LABELS: Record<string, string> = {
    open: t('tournaments.status.open'),
    in_progress: t('tournaments.status.in_progress'),
    completed: t('tournaments.status.completed'),
    cancelled: t('tournaments.status.cancelled'),
  }

  const FORMAT_LABELS: Record<string, string> = {
    round_robin: t('tournaments.format.round_robin'),
    single_elimination: t('tournaments.format.single_elimination'),
    double_elimination: t('tournaments.format.double_elimination'),
    americano: t('tournaments.format.americano'),
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/40 transition-colors active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-tight truncate">{tournament.name}</p>
          {tournament.club && (
            <p className="text-xs text-muted-foreground mt-0.5">{tournament.club.name} · {tournament.club.city}</p>
          )}
        </div>
        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[tournament.status]}`}>
          {STATUS_LABELS[tournament.status]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(tournament.start_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
        </span>
        <span className="inline-flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" />
          {FORMAT_LABELS[tournament.format]}
        </span>
        {tournament.prize_pool != null && tournament.prize_pool > 0 && (
          <span className="inline-flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" /> {t('tournaments.prize')}
          </span>
        )}
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{t('tournaments.teamsCount', { count: teams, max: tournament.max_teams })}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {tournament.entry_fee != null && tournament.entry_fee > 0 && (
        <p className="text-xs text-muted-foreground">
          {t('tournaments.entryFee', { fee: tournament.entry_fee.toLocaleString('es-AR') })}
        </p>
      )}
    </button>
  )
}

export function TournamentsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const FILTERS = [
    { label: t('tournaments.filterAll'), value: '' },
    { label: t('tournaments.filterOpen'), value: 'open' },
    { label: t('tournaments.status.in_progress'), value: 'in_progress' },
    { label: t('tournaments.filterCompleted'), value: 'completed' },
  ]
  const [filter, setFilter] = useState('')
  const { data, isLoading } = useTournaments(filter || undefined)

  const tournaments = data?.data ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-foreground">{t('tournaments.title')}</h1>
          <button
            onClick={() => navigate('/tournaments/new')}
            className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"
          >
            + {t('common.create')}
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                filter === f.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('tournaments.loading')}</div>
        ) : tournaments.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium text-foreground">{t('tournaments.noTournaments')}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('tournaments.createFirst')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tournaments.map((t) => (
              <TournamentCard
                key={t.id}
                t={t}
                onClick={() => navigate(`/tournaments/${t.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
