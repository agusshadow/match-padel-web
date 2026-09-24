import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTournament, useRegisterTeam, useWithdrawTeam, useStartTournament } from '../hooks/useTournaments'
import { useAuthStore } from '../../auth/store/auth.store'
import { TournamentTeam } from '../services/tournamentService'

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

export function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { data: tournament, isLoading } = useTournament(id)
  const registerTeam = useRegisterTeam(id!)
  const withdrawTeam = useWithdrawTeam(id!)
  const startTournament = useStartTournament(id!)

  const [showRegister, setShowRegister] = useState(false)
  const [partnerId, setPartnerId] = useState('')
  const [teamName, setTeamName] = useState('')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Cargando torneo...</p>
      </div>
    )
  }

  if (!tournament) return null

  const teams = tournament.tournament_teams ?? []
  const matches = tournament.tournament_matches ?? []
  const isCreator = tournament.created_by === user?.id
  const myTeam = teams.find(
    (t: TournamentTeam) => t.player1.id === user?.id || t.player2.id === user?.id
  )
  const isRegistered = !!myTeam
  const isFull = teams.length >= tournament.max_teams
  const canRegister = tournament.status === 'open' && !isRegistered && !isFull

  async function handleRegister() {
    if (!partnerId.trim()) return
    try {
      await registerTeam.mutateAsync({ partner_id: partnerId.trim(), team_name: teamName || undefined })
      setShowRegister(false)
      setPartnerId('')
      setTeamName('')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al inscribirse'
      alert(msg)
    }
  }

  async function handleWithdraw() {
    if (!confirm('¿Retirarse del torneo?')) return
    try {
      await withdrawTeam.mutateAsync()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error'
      alert(msg)
    }
  }

  async function handleStart() {
    if (!confirm('¿Iniciar el torneo? No se podrán inscribir más equipos.')) return
    try {
      await startTournament.mutateAsync()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error'
      alert(msg)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground text-lg">←</button>
        <h1 className="font-bold text-foreground truncate flex-1">{tournament.name}</h1>
      </div>

      <div className="px-4 pb-8 space-y-5 mt-4">
        {/* Status + meta */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {STATUS_LABELS[tournament.status]}
            </span>
            <span className="text-xs text-muted-foreground">
              {tournament.format === 'round_robin' ? 'Round Robin'
                : tournament.format === 'single_elimination' ? 'Eliminación'
                : tournament.format === 'double_elimination' ? 'Doble Eliminación'
                : 'Americano'}
            </span>
          </div>
          {tournament.description && (
            <p className="text-sm text-muted-foreground">{tournament.description}</p>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Fecha inicio</p>
              <p className="font-medium text-foreground">
                {new Date(tournament.start_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </p>
            </div>
            {tournament.end_date && (
              <div>
                <p className="text-xs text-muted-foreground">Fecha fin</p>
                <p className="font-medium text-foreground">
                  {new Date(tournament.end_date).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            )}
            {tournament.club && (
              <div>
                <p className="text-xs text-muted-foreground">Club</p>
                <p className="font-medium text-foreground">{tournament.club.name}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Equipos</p>
              <p className="font-medium text-foreground">{teams.length}/{tournament.max_teams}</p>
            </div>
          </div>
          {tournament.prize_pool != null && tournament.prize_pool > 0 && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-0.5">Premio total</p>
              <p className="text-sm font-medium text-foreground">💰 ${tournament.prize_pool.toLocaleString('es-AR')}</p>
            </div>
          )}
          {tournament.entry_fee != null && tournament.entry_fee > 0 && (
            <p className="text-xs text-muted-foreground">
              Cuota de entrada: ${tournament.entry_fee.toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {/* Creator actions */}
        {isCreator && tournament.status === 'open' && teams.length >= 2 && (
          <button
            onClick={handleStart}
            disabled={startTournament.isPending}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-60"
          >
            {startTournament.isPending ? 'Iniciando...' : '⚡ Iniciar Torneo'}
          </button>
        )}

        {/* Player actions */}
        {canRegister && !showRegister && (
          <button
            onClick={() => setShowRegister(true)}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl"
          >
            Inscribir Equipo
          </button>
        )}

        {isRegistered && tournament.status === 'open' && (
          <button
            onClick={handleWithdraw}
            disabled={withdrawTeam.isPending}
            className="w-full py-3 border border-red-500 text-red-500 font-semibold rounded-xl disabled:opacity-60"
          >
            {withdrawTeam.isPending ? 'Retirando...' : 'Retirar mi equipo'}
          </button>
        )}

        {/* Register form */}
        {showRegister && (
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="font-semibold text-foreground">Inscribir equipo</p>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">ID del compañero *</label>
              <input
                type="text"
                value={partnerId}
                onChange={(e) => setPartnerId(e.target.value)}
                placeholder="UUID del compañero"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Nombre del equipo (opcional)</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Los Cracks"
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRegister(false)}
                className="flex-1 py-2 border border-border text-foreground font-medium rounded-lg text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegister}
                disabled={!partnerId.trim() || registerTeam.isPending}
                className="flex-1 py-2 bg-primary text-primary-foreground font-medium rounded-lg text-sm disabled:opacity-60"
              >
                {registerTeam.isPending ? 'Inscribiendo...' : 'Inscribir'}
              </button>
            </div>
          </div>
        )}

        {/* Teams list */}
        <div>
          <h2 className="font-semibold text-foreground mb-3">Equipos ({teams.length})</h2>
          {teams.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aún no hay equipos inscritos</p>
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
                      ELO: {team.player1.elo} · {team.player2.elo}
                    </p>
                  </div>
                  {myTeam?.id === team.id && (
                    <span className="text-xs font-medium text-primary">Mi equipo</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matches list */}
        {matches.length > 0 && (
          <div>
            <h2 className="font-semibold text-foreground mb-3">Partidos</h2>
            <div className="space-y-2">
              {matches.map((m) => (
                <div key={m.id} className="bg-card border border-border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Ronda {m.round}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{m.team1.name ?? 'Equipo 1'}</p>
                    {m.score_team1 !== null && m.score_team2 !== null ? (
                      <span className="text-sm font-bold text-foreground px-2">
                        {m.score_team1} – {m.score_team2}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2">vs</span>
                    )}
                    <p className="text-sm font-medium text-foreground text-right">{m.team2.name ?? 'Equipo 2'}</p>
                  </div>
                  {m.winner_team && (
                    <p className="text-xs text-green-500 mt-1">🏆 {m.winner_team.name}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
