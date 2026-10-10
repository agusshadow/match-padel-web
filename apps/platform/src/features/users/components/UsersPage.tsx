import { useState } from 'react'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate, type StatusTone } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useDebouncedValue, useUsers } from '../hooks/useUsers'

const PAGE_SIZE = 20

const ROLE: Record<string, { label: string; tone: StatusTone }> = {
  player: { label: 'Jugador', tone: 'blue' },
  club_staff: { label: 'Staff de club', tone: 'purple' },
  super_admin: { label: 'Super admin', tone: 'red' },
}

export function UsersPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isLoading, error } = useUsers({ search: debouncedSearch, page, limit: PAGE_SIZE })

  return (
    <div className="space-y-6">
      <PageHeader title="Usuarios" subtitle={`${data?.meta.total ?? 0} usuarios registrados`} />

      <input
        type="search"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        placeholder="Buscar por nombre o username..."
        aria-label="Buscar usuarios"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {error && <Notice>{getErrorMessage(error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin usuarios</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Usuario</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">ELO</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((user) => {
                    const role = ROLE[user.role] ?? { label: user.role, tone: 'gray' as const }
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{user.full_name ?? 'Sin nombre'}</p>
                          <p className="text-xs text-gray-400">
                            @{user.username}
                            {user.email ? ` · ${user.email}` : ''}
                          </p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{user.elo}</td>
                        <td className="px-4 py-3">
                          <StatusBadge label={role.label} tone={role.tone} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(user.created_at, true)}</td>
                      </tr>
                    )
                  })}
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
