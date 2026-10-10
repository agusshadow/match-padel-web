import { useState } from 'react'
import { Trophy } from 'lucide-react'
import type { TournamentStatus } from '@match-padel/types'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate, formatMoney, type StatusTone } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { useClubTournaments } from '../hooks/useClubTournaments'

const STATUS: Record<TournamentStatus, { label: string; tone: StatusTone }> = {
  draft: { label: 'Borrador', tone: 'gray' },
  open: { label: 'Abierto', tone: 'green' },
  in_progress: { label: 'En curso', tone: 'blue' },
  completed: { label: 'Finalizado', tone: 'gray' },
  cancelled: { label: 'Cancelado', tone: 'red' },
}

const PAGE_SIZE = 20

const FORMAT_LABELS: Record<string, string> = {
  round_robin: 'Round robin',
  single_elimination: 'Eliminación simple',
  double_elimination: 'Doble eliminación',
  americano: 'Americano',
}

export function TournamentsPage() {
  const club = useCurrentClub()
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useClubTournaments(club.clubId, page, PAGE_SIZE)

  return (
    <div className="space-y-6">
      <PageHeader title="Torneos" subtitle={`${data?.meta.total ?? 0} torneos del club`} />
      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando torneos...</div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 text-sm">No hay torneos aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Torneo</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Formato</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Equipos</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Inicio</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">Inscripción {formatMoney(t.entry_fee)}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-600">{FORMAT_LABELS[t.format] ?? t.format}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {t.teams[0]?.count ?? 0}/{t.max_teams}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{formatDate(t.start_date, true)}</td>
                    <td className="px-5 py-4">
                      <StatusBadge label={STATUS[t.status].label} tone={STATUS[t.status].tone} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
