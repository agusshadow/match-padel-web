import { useState } from 'react'
import type { MatchStatus } from '@match-padel/types'
import {
  Notice,
  PageHeader,
  Pagination,
  StatusBadge,
  formatDate,
  formatTime,
  personName,
  type StatusTone,
} from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { useClubMatches } from '../hooks/useClubMatches'

const PAGE_SIZE = 20

const STATUS: Record<MatchStatus, { label: string; tone: StatusTone }> = {
  waiting: { label: 'Esperando', tone: 'yellow' },
  in_progress: { label: 'En juego', tone: 'blue' },
  completed: { label: 'Completado', tone: 'green' },
  cancelled: { label: 'Cancelado', tone: 'red' },
}

export function MatchesPage() {
  const club = useCurrentClub()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useClubMatches(club.clubId, page, PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader title="Partidos" subtitle={`${data?.meta.total ?? 0} partidos en el club`} />
      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin partidos aún</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Jugadores</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Resultado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cancha y horario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-gray-900">
                        {m.players.length === 0
                          ? '—'
                          : m.players.map((p, i) => (
                              <p key={p.user?.id ?? i} className="text-sm">
                                {personName(p.user)}
                                {p.team ? <span className="text-xs text-gray-400"> · Equipo {p.team}</span> : null}
                              </p>
                            ))}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={m.is_ranked ? 'Rankeado' : m.type === 'tournament' ? 'Torneo' : 'Amistoso'}
                          tone={m.is_ranked ? 'orange' : 'gray'}
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
                      <td className="px-4 py-3 text-gray-600">
                        {m.reservation ? (
                          <>
                            <p>{m.reservation.court?.name}</p>
                            <p className="text-xs text-gray-400">
                              {formatDate(m.reservation.start_time)} · {formatTime(m.reservation.start_time)}
                            </p>
                          </>
                        ) : (
                          <span className="text-gray-400">{formatDate(m.created_at)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data?.meta.page ?? page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
