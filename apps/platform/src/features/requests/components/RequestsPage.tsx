import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { ApplicationStatusFilter } from '@match-padel/types'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate, personName } from '@match-padel/ui'
import { useAccess } from '@/features/auth'
import { getErrorMessage } from '@/lib/errors'
import { CLUB_STATUS_LABELS, CLUB_STATUS_TONES, REVIEWER_STATUSES } from '@/shared/permissions'
import { useDebouncedValue, useRequests } from '../hooks/useRequests'

const PAGE_SIZE = 20

const SUPERADMIN_FILTERS: ApplicationStatusFilter[] = [
  'pending',
  'changes_requested',
  'approved',
  'rejected',
  'suspended',
  'draft',
  'all',
]

function filterLabel(filter: ApplicationStatusFilter): string {
  return filter === 'all' ? 'Todas' : CLUB_STATUS_LABELS[filter]
}

/** Applications inbox: oldest pending first. Reviewers only get pending and changes requested. */
export function RequestsPage() {
  const { data: access } = useAccess(true)
  const isSuperadmin = access?.platformRole === 'superadmin'
  const filters: ApplicationStatusFilter[] = isSuperadmin ? SUPERADMIN_FILTERS : REVIEWER_STATUSES

  const location = useLocation()
  const navigate = useNavigate()
  const [flash, setFlash] = useState<string | null>(
    (location.state as { flash?: string } | null)?.flash ?? null,
  )
  useEffect(() => {
    // The flash message lives in the navigation state only until it is read.
    if ((location.state as { flash?: string } | null)?.flash) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const [status, setStatus] = useState<ApplicationStatusFilter>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())
  const { data, isLoading, error } = useRequests({
    status,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  })

  const total = data?.meta.total ?? 0
  const rows = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes"
        subtitle={`${total} ${status === 'all' ? 'solicitudes' : `en estado ${CLUB_STATUS_LABELS[status].toLowerCase()}`}${
          status === 'pending' ? ' · las más antiguas primero' : ''
        }`}
      />

      {flash && (
        <Notice tone="success">
          <div className="flex items-start justify-between gap-3">
            <span>{flash}</span>
            <button type="button" onClick={() => setFlash(null)} aria-label="Cerrar aviso" className="leading-none">
              ×
            </button>
          </div>
        </Notice>
      )}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Estado de la solicitud">
        {filters.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={s === status}
            onClick={() => {
              setStatus(s)
              setPage(1)
            }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              s === status
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {filterLabel(s)}
          </button>
        ))}
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        placeholder="Buscar por club, ciudad, razón social o CUIT..."
        aria-label="Buscar solicitud"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay solicitudes con este filtro</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Club</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ciudad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Dueño</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Razón social</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Enviada</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Docs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/requests/${row.id}`} className="font-medium text-green-700 hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.city}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.owner ? (
                        <>
                          {personName(row.owner)}
                          {row.owner.email && <span className="block text-xs text-gray-400">{row.owner.email}</span>}
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.legal_name ?? <span className="text-gray-300">—</span>}
                      {row.tax_id && <span className="block text-xs text-gray-400">{row.tax_id}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={CLUB_STATUS_LABELS[row.status]} tone={CLUB_STATUS_TONES[row.status]} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {row.submitted_at ? formatDate(row.submitted_at, true) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.documents_count}</td>
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
