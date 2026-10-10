import { useState } from 'react'
import { Notice, PageHeader, Pagination, formatDateTime, personName } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useAuditLog, useClubOptions } from '../hooks/useAuditLog'

const PAGE_SIZE = 25
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function AuditLogPage() {
  const [clubId, setClubId] = useState('')
  const [actorInput, setActorInput] = useState('')
  const [page, setPage] = useState(1)

  // The actor filter is the user's UUID; only send it once it is complete.
  const actorId = UUID.test(actorInput.trim()) ? actorInput.trim() : ''

  const { data, isLoading, error } = useAuditLog({ clubId, actorId, page, limit: PAGE_SIZE })
  const { data: clubs } = useClubOptions()

  const inputClass =
    'px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500'

  return (
    <div className="space-y-6">
      <PageHeader title="Auditoría" subtitle="Quién cambió qué, y cuándo" />

      <div className="flex gap-3 flex-wrap">
        <select
          aria-label="Filtrar por club"
          value={clubId}
          onChange={(e) => {
            setClubId(e.target.value)
            setPage(1)
          }}
          className={inputClass}
        >
          <option value="">Todos los clubes</option>
          {clubs?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Filtrar por ID de usuario"
          value={actorInput}
          onChange={(e) => {
            setActorInput(e.target.value)
            setPage(1)
          }}
          placeholder="ID del usuario (UUID)"
          className={`${inputClass} w-80 max-w-full`}
        />
      </div>

      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin registros</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Quién</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Club</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 align-top">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(entry.created_at)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">
                          {entry.actor ? personName(entry.actor) : 'Sistema'}
                        </p>
                        {entry.actor?.username && <p className="text-xs text-gray-400">@{entry.actor.username}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-gray-900">{entry.action}</p>
                        {entry.entity && (
                          <p className="text-xs text-gray-400">
                            {entry.entity}
                            {entry.entity_id ? ` · ${entry.entity_id.slice(0, 8)}` : ''}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.club?.name ?? '—'}</td>
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
