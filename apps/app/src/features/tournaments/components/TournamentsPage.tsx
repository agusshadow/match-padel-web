import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTournaments } from '../hooks/useTournaments'
import { Tournament } from '../services/tournamentService'

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-500/10 text-green-600 dark:text-green-400',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-500',
}

function TournamentCard({ t, onClick }: { t: Tournament; onClick: () => void }) {
  const teams = t.teams_count ?? 0
  const pct = Math.round((teams / t.max_teams) * 100)

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 flex flex-col gap-2 hover:border-primary/40 transition-colors active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground leading-tight truncate">{t.name}</p>
          {t.club && (
            <p className="text-xs text-muted-foreground mt-0.5">{t.club.name} · {t.club.city}</p>
          )}
        </div>
        <span className={`flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
          {STATUS_LABELS[t.status]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>🗓️ {new Date(t.start_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
        <span>🏆 {t.format === 'round_robin' ? 'Round Robin' : 'Eliminación'}</span>
        {t.prize_info && <span>💰 Premio</span>}
      </div>

      {/* Capacity bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{teams}/{t.max_teams} equipos</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {(t.min_elo || t.max_elo) && (
        <p className="text-xs text-muted-foreground">
          ELO:{' '}
          {t.min_elo ? `${t.min_elo}+` : ''}
          {t.min_elo && t.max_elo ? ' – ' : ''}
          {t.max_elo ? `hasta ${t.max_elo}` : ''}
        </p>
      )}
    </button>
  )
}

const FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Abiertos', value: 'open' },
  { label: 'En curso', value: 'in_progress' },
  { label: 'Finalizados', value: 'completed' },
]

export function TournamentsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('')
  const { data, isLoading } = useTournaments(filter || undefined)

  const tournaments = data?.data ?? []

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-foreground">Torneos</h1>
          <button
            onClick={() => navigate('/tournaments/new')}
            className="text-sm font-medium bg-primary text-primary-foreground px-3 py-1.5 rounded-lg"
          >
            + Crear
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
          <div className="py-12 text-center text-muted-foreground text-sm">Cargando torneos...</div>
        ) : tournaments.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">🏆</p>
            <p className="font-medium text-foreground">No hay torneos</p>
            <p className="text-sm text-muted-foreground mt-1">Crea el primero</p>
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
