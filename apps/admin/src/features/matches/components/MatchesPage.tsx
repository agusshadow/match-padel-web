import type { MatchStatus } from '@match-padel/types'
import { Notice, PageHeader, StatusBadge, formatDate, type StatusTone } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { useClubMatches } from '../hooks/useClubMatches'

const STATUS: Record<MatchStatus, { label: string; tone: StatusTone }> = {
  waiting: { label: 'Esperando', tone: 'yellow' },
  in_progress: { label: 'En juego', tone: 'blue' },
  completed: { label: 'Completado', tone: 'green' },
  cancelled: { label: 'Cancelado', tone: 'red' },
}

export function MatchesPage() {
  const club = useCurrentClub()
  const { data, isLoading, error } = useClubMatches(club.clubId)

  return (
    <div className="space-y-6">
      <PageHeader title="Partidos" subtitle="Partidos jugados en el club" />
      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin partidos aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Creador</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Resultado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.creator?.full_name ?? 'Sin nombre'}</p>
                      {m.creator?.username && <p className="text-xs text-gray-400">@{m.creator.username}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={m.type === 'ranked' ? 'Rankeado' : m.type === 'tournament' ? 'Torneo' : 'Amistoso'}
                        tone={m.type === 'ranked' ? 'orange' : 'gray'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={STATUS[m.status].label} tone={STATUS[m.status].tone} />
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {m.score_team1 && m.score_team1.length > 0
                        ? `${m.score_team1.join('-')} vs ${(m.score_team2 ?? []).join('-')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(m.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
