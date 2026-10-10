import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import type { TournamentStatus } from '@match-padel/types'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate, formatMoney } from '@match-padel/ui'
import { useCurrentClub } from '@/shared/club-context'
import { useClubTournaments } from '../hooks/useClubTournaments'
import { FORMAT_INFO, STATUS, STATUS_FILTERS, tournamentErrorMessage } from '../lib/labels'
import { primaryButton } from './ui'

const PAGE_SIZE = 20

export function TournamentsPage() {
  const club = useCurrentClub()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TournamentStatus | ''>('')
  const { data, isLoading, error } = useClubTournaments(club.clubId, {
    page,
    limit: PAGE_SIZE,
    status: status || undefined,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Torneos"
        subtitle={`${data?.meta.total ?? 0} torneos del club`}
        actions={
          <button type="button" className={primaryButton} onClick={() => navigate(`/${club.clubId}/tournaments/new`)}>
            Nuevo torneo
          </button>
        }
      />
      {error && <Notice>{tournamentErrorMessage(error)}</Notice>}

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={status === f.value}
            onClick={() => {
              setStatus(f.value)
              setPage(1)
            }}
            className={`px-3 py-1.5 text-sm rounded-full border ${status === f.value ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando torneos...</div>
        ) : !data?.items.length ? (
          <div className="p-12 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 text-sm">
              {status ? 'No hay torneos con este estado' : 'Todavía no creaste ningún torneo'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Torneo</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Formato</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Inscripciones</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Inicio</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((t) => {
                  const unit = t.format === 'americano' ? 'jugadores' : 'parejas'
                  const factor = t.format === 'americano' ? 2 : 1
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <Link to={`/${club.clubId}/tournaments/${t.id}`} className="font-medium text-gray-900 hover:text-green-700">
                          {t.name}
                        </Link>
                        <p className="text-xs text-gray-400">
                          {t.entry_fee > 0 ? `Inscripción ${formatMoney(t.entry_fee)}` : 'Inscripción gratis'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{FORMAT_INFO[t.format].label}</td>
                      <td className="px-5 py-4 text-gray-600">
                        {t.teams_confirmed * factor}/{t.max_teams * factor} {unit}
                        {t.teams_pending_payment > 0 && (
                          <p className="text-xs text-yellow-700">{t.teams_pending_payment} con pago pendiente</p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{formatDate(t.start_date, true)}</td>
                      <td className="px-5 py-4">
                        <StatusBadge label={STATUS[t.status].label} tone={STATUS[t.status].tone} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
