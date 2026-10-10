import type { ClubTournamentDetail, EliminationStanding } from '@match-padel/types'
import { Notice, StatusBadge } from '@match-padel/ui'
import { placementLabel } from '../lib/bracket'
import { STAGE_LABELS } from '../lib/labels'

const th = 'px-3 py-3 text-right font-medium text-gray-600'
const td = 'px-3 py-3 text-right text-gray-700 tabular-nums'

function Table({ children, min }: { children: React.ReactNode; min: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className={`w-full text-sm ${min}`}>{children}</table>
    </div>
  )
}

function eliminationOrder(rows: EliminationStanding[]): EliminationStanding[] {
  return [...rows].sort((a, b) => {
    if (a.placement === null && b.placement === null) return (a.team_name ?? '').localeCompare(b.team_name ?? '')
    if (a.placement === null) return -1
    if (b.placement === null) return 1
    return a.placement - b.placement
  })
}

export function StandingsTab({ tournament: t }: { tournament: ClubTournamentDetail }) {
  const s = t.standings
  if (s.type === 'none') {
    return <Notice tone="info">Las posiciones aparecen cuando se genera el fixture y se juegan los primeros partidos.</Notice>
  }

  if (s.type === 'round_robin') {
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          3 puntos por victoria. Empates en puntos: se desempata por resultado entre las parejas empatadas, luego
          diferencia de sets y de games.
        </p>
        <Table min="min-w-[720px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">#</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Pareja</th>
              {['PJ', 'G', 'P', 'Pts', 'Sets +/-', 'Games +/-'].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {s.rows.map((r) => (
              <tr key={r.team_id}>
                <td className="px-3 py-3 text-gray-500">{r.position}</td>
                <td className="px-3 py-3 font-medium text-gray-900">{r.team_name ?? '—'}</td>
                <td className={td}>{r.played}</td>
                <td className={td}>{r.wins}</td>
                <td className={td}>{r.losses}</td>
                <td className={`${td} font-semibold`}>{r.points}</td>
                <td className={td}>{r.set_diff > 0 ? `+${r.set_diff}` : r.set_diff}</td>
                <td className={td}>{r.game_diff > 0 ? `+${r.game_diff}` : r.game_diff}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )
  }

  if (s.type === 'elimination') {
    const rows = eliminationOrder(s.rows)
    const counts = new Map<number, number>()
    rows.forEach((r) => r.placement !== null && counts.set(r.placement, (counts.get(r.placement) ?? 0) + 1))
    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          La posición final se define a medida que las parejas quedan eliminadas. Las que caen en la misma ronda
          comparten posición.
        </p>
        <Table min="min-w-[560px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Posición</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Pareja</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">Estado</th>
              <th className={th}>G</th>
              <th className={th}>P</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.team_id}>
                <td className="px-3 py-3 text-gray-700">
                  {placementLabel(r.placement, r.placement !== null && (counts.get(r.placement) ?? 0) > 1)}
                </td>
                <td className="px-3 py-3 font-medium text-gray-900">{r.team_name ?? '—'}</td>
                <td className="px-3 py-3">
                  {r.status === 'champion' ? (
                    <StatusBadge label="Campeón" tone="green" />
                  ) : r.status === 'active' ? (
                    <StatusBadge label="En juego" tone="blue" />
                  ) : (
                    <span className="text-xs text-gray-500">
                      Eliminada{r.eliminated_in ? ` · ${STAGE_LABELS[r.eliminated_in.stage]}, ronda ${r.eliminated_in.round}` : ''}
                    </span>
                  )}
                </td>
                <td className={td}>{r.wins}</td>
                <td className={td}>{r.losses}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Tabla individual: puntos a favor de cada jugador, luego victorias y diferencia de puntos. Descansar es parte
        del formato, por eso no se promedian los partidos jugados.
      </p>
      <Table min="min-w-[640px]">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-3 text-left font-medium text-gray-600">#</th>
            <th className="px-3 py-3 text-left font-medium text-gray-600">Jugador</th>
            {['PJ', 'G', 'E', 'P', 'Pts a favor', 'Dif.'].map((h) => (
              <th key={h} className={th}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {s.rows.map((r) => (
            <tr key={r.player_id}>
              <td className="px-3 py-3 text-gray-500">{r.position}</td>
              <td className="px-3 py-3 font-medium text-gray-900">
                {r.player.username || `${r.player.first_name} ${r.player.last_name}`.trim()}
              </td>
              <td className={td}>{r.played}</td>
              <td className={td}>{r.wins}</td>
              <td className={td}>{r.draws}</td>
              <td className={td}>{r.losses}</td>
              <td className={`${td} font-semibold`}>{r.points_for}</td>
              <td className={td}>{r.point_diff > 0 ? `+${r.point_diff}` : r.point_diff}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
