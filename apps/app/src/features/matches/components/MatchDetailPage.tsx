import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Copy, Check, Plus, Minus } from 'lucide-react'
import { useMatch, useSubmitScore, useAcceptScore, useCancelMatch } from '../hooks/useMatches'
import { useAuthStore } from '../../auth/store/auth.store'
import type { MatchWithPlayers } from '../services/matchService'

function PlayerSlot({ player }: { player?: MatchWithPlayers['match_players'][0]; label?: string }) {
  const initials = player?.users?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (!player) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
          <span className="text-xl text-muted-foreground">?</span>
        </div>
        <span className="text-xs text-muted-foreground">Libre</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {player.users?.avatar_url ? (
        <img
          src={player.users.avatar_url}
          alt={player.users.full_name}
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
          {initials ?? '?'}
        </div>
      )}
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{player.users?.username ?? 'Usuario'}</p>
        <p className="text-[10px] text-muted-foreground">ELO {player.users?.elo ?? 1000}</p>
      </div>
    </div>
  )
}

function SetScoreInput({
  sets,
  setSets,
  disabled,
}: {
  sets: number[][]
  setSets: (s: number[][]) => void
  disabled?: boolean
}) {
  const addSet = () => setSets([...sets, [0, 0]])
  const removeSet = () => sets.length > 1 && setSets(sets.slice(0, -1))

  const update = (si: number, ti: 0 | 1, val: number) => {
    const next = sets.map((s, i) => (i === si ? s.map((v, j) => (j === ti ? Math.max(0, val) : v)) : s))
    setSets(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Sets</p>
        <div className="flex items-center gap-2">
          <button onClick={removeSet} disabled={sets.length <= 1 || disabled} className="p-1 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-40">
            <Minus size={14} />
          </button>
          <span className="text-sm font-medium w-4 text-center">{sets.length}</span>
          <button onClick={addSet} disabled={sets.length >= 5 || disabled} className="p-1 rounded-full bg-muted hover:bg-muted/80 disabled:opacity-40">
            <Plus size={14} />
          </button>
        </div>
      </div>

      {sets.map((set, si) => (
        <div key={si} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-10">Set {si + 1}</span>
          <input
            type="number"
            min={0}
            max={7}
            value={set[0]}
            onChange={(e) => update(si, 0, parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-14 text-center bg-muted border border-border rounded-lg py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="number"
            min={0}
            max={7}
            value={set[1]}
            onChange={(e) => update(si, 1, parseInt(e.target.value) || 0)}
            disabled={disabled}
            className="w-14 text-center bg-muted border border-border rounded-lg py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
        </div>
      ))}
    </div>
  )
}

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Esperando jugadores',
  in_progress: 'En curso',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: match, isLoading, error } = useMatch(id)
  const submitScore = useSubmitScore()
  const acceptScore = useAcceptScore()
  const cancelMatch = useCancelMatch()

  const [showScoreForm, setShowScoreForm] = useState(false)
  const [sets, setSets] = useState<number[][]>([[0, 0], [0, 0], [0, 0]])
  const [copied, setCopied] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Partido no encontrado.</p>
        <button onClick={() => navigate('/matches')} className="text-primary font-medium">
          Volver a partidos
        </button>
      </div>
    )
  }

  const team1Players = match.match_players?.filter((p) => p.team === 1) ?? []
  const team2Players = match.match_players?.filter((p) => p.team === 2) ?? []
  const team1Slots = [team1Players[0], team1Players[1]]
  const team2Slots = [team2Players[0], team2Players[1]]

  const myTeam = match.match_players?.find((p) => p.user_id === user?.id)?.team
  const isCreator = match.created_by === user?.id
  const canSubmitScore = myTeam && (match.status === 'in_progress' || match.status === 'waiting') && match.score_status !== 'accepted'
  const canAcceptScore = myTeam && match.score_status === 'pending' && match.status !== 'cancelled'
  const canCancel = isCreator && match.status !== 'completed' && match.status !== 'cancelled'

  const handleCopyLobby = () => {
    if (match.lobby_url) {
      navigator.clipboard.writeText(match.lobby_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSubmitScore = async () => {
    await submitScore.mutateAsync({
      id: match.id,
      score: {
        score_team1: sets.map((s) => s[0]),
        score_team2: sets.map((s) => s[1]),
      },
    })
    setShowScoreForm(false)
  }

  const handleAcceptScore = async () => {
    await acceptScore.mutateAsync(match.id)
  }

  const handleCancel = async () => {
    if (window.confirm('¿Cancelar el partido?')) {
      await cancelMatch.mutateAsync(match.id)
      navigate('/matches')
    }
  }

  const completedScore =
    match.status === 'completed' && match.score_team1 && match.score_team2
      ? (match.score_team1 as number[]).map((s, i) => `${s}-${(match.score_team2 as number[])[i]}`)
      : null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-foreground">Detalle del partido</h1>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[match.status]}`}>
          {STATUS_LABELS[match.status]}
        </span>
      </div>

      <div className="flex-1 p-4 space-y-5 overflow-y-auto pb-24">
        {/* Teams */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-4">
            {/* Team 1 */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground text-center mb-3">Equipo 1</p>
              <div className="flex justify-center gap-4">
                {team1Slots.map((p, i) => (
                  <PlayerSlot key={p?.id ?? `t1-${i}`} player={p} />
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="shrink-0 flex flex-col items-center gap-1">
              <span className="text-xl font-bold text-muted-foreground">vs</span>
              {match.is_ranked && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                  Rankeado
                </span>
              )}
            </div>

            {/* Team 2 */}
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground text-center mb-3">Equipo 2</p>
              <div className="flex justify-center gap-4">
                {team2Slots.map((p, i) => (
                  <PlayerSlot key={p?.id ?? `t2-${i}`} player={p} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Score (completed) */}
        {completedScore && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">Resultado</p>
            <div className="flex justify-center gap-4">
              {completedScore.map((s, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] text-muted-foreground">Set {i + 1}</p>
                  <p className="text-lg font-bold text-foreground">{s}</p>
                </div>
              ))}
            </div>
            {match.winner_team && (
              <p className="text-center text-sm font-semibold text-primary mt-2">
                Ganó el Equipo {match.winner_team}
              </p>
            )}
          </div>
        )}

        {/* Lobby URL */}
        {match.status === 'waiting' && match.lobby_url && (
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-medium text-foreground mb-1">Compartir partido</p>
            <p className="text-xs text-muted-foreground mb-3">
              Compartí el código con los jugadores para que se unan
            </p>
            <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3">
              <span className="font-mono text-lg font-bold tracking-widest text-foreground">
                {match.lobby_url}
              </span>
              <button
                onClick={handleCopyLobby}
                className="flex items-center gap-1.5 text-sm text-primary font-medium"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Score form */}
        {showScoreForm && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <p className="font-medium text-foreground">Cargar resultado</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Equipo 1</span>
              <span className="mx-auto" />
              <span>Equipo 2</span>
            </div>
            <SetScoreInput sets={sets} setSets={setSets} disabled={submitScore.isPending} />
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowScoreForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitScore}
                disabled={submitScore.isPending}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-60"
              >
                {submitScore.isPending ? 'Guardando...' : 'Guardar resultado'}
              </button>
            </div>
          </div>
        )}

        {/* Pending score notice */}
        {match.score_status === 'pending' && match.status !== 'cancelled' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
              Resultado pendiente de aprobación
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-500 mt-0.5">
              El equipo contrario debe aceptar el resultado.
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 space-y-2 pb-6">
        {canSubmitScore && !showScoreForm && match.status !== 'cancelled' && (
          <button
            onClick={() => setShowScoreForm(true)}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            Cargar resultado
          </button>
        )}

        {canAcceptScore && (
          <button
            onClick={handleAcceptScore}
            disabled={acceptScore.isPending}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl disabled:opacity-60"
          >
            {acceptScore.isPending ? 'Aceptando...' : 'Aceptar resultado'}
          </button>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelMatch.isPending}
            className="w-full py-3 border border-destructive text-destructive font-medium rounded-xl disabled:opacity-60"
          >
            {cancelMatch.isPending ? 'Cancelando...' : 'Cancelar partido'}
          </button>
        )}
      </div>
    </div>
  )
}
