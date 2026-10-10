import { useState } from 'react'
import type { ClubStatus } from '@match-padel/types'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { CLUB_STATUS_LABELS, CLUB_STATUS_TONES } from '@/shared/permissions'
import { useDebouncedValue, useRequests } from '../hooks/useRequests'

const PAGE_SIZE = 20

// Applications that are not live. `approved` clubs are in the superadmin's "Clubes" list.
const INBOX_STATUSES: ClubStatus[] = ['pending', 'changes_requested', 'draft', 'rejected', 'suspended']

/**
 * Applications inbox (read-only). Review actions (approve, reject, ask for corrections) and the
 * document viewer arrive with the next card; the API already lets reviewers list clubs by status.
 */
export function RequestsPage() {
  const [status, setStatus] = useState<ClubStatus>('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())
  const { data, isLoading, error } = useRequests({ status, search: debouncedSearch, page, limit: PAGE_SIZE })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes"
        subtitle={`${data?.meta.total ?? 0} solicitudes en estado ${CLUB_STATUS_LABELS[status].toLowerCase()}`}
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Estado de la solicitud">
        {INBOX_STATUSES.map((s) => (
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
            {CLUB_STATUS_LABELS[s]}
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
        placeholder="Buscar club o ciudad..."
        aria-label="Buscar solicitud"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No hay solicitudes en este estado</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Club</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ciudad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Razón social / CUIT</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Actualizada</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.items.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{club.name}</p>
                      <p className="text-xs text-gray-400">{club.email ?? club.address}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{club.city}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {club.legal_name ?? <span className="text-gray-300">—</span>}
                      {club.tax_id && <span className="block text-xs text-gray-400">{club.tax_id}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(club.updated_at, true)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={CLUB_STATUS_LABELS[club.status]} tone={CLUB_STATUS_TONES[club.status]} />
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
