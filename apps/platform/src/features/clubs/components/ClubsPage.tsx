import { useMemo, useState } from 'react'
import { Notice, PageHeader, StatusBadge, formatDate } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useClubs, useSetClubActive } from '../hooks/useClubs'
import { CreateClubDialog } from './CreateClubDialog'

export function ClubsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading, error } = useClubs()
  const setActive = useSetClubActive()

  const clubs = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!data) return []
    return term ? data.filter((c) => `${c.name} ${c.city}`.toLowerCase().includes(term)) : data
  }, [data, search])

  const toggle = (id: string, name: string, isActive: boolean) => {
    if (isActive && !window.confirm(`¿Desactivar "${name}"? Los jugadores dejarán de verlo en la app.`)) return
    setActive.mutate({ id, isActive: !isActive })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clubes"
        subtitle={`${data?.length ?? 0} clubes en la plataforma`}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nuevo club
          </button>
        }
      />

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar club o ciudad..."
        aria-label="Buscar club"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      {error && <Notice>{getErrorMessage(error)}</Notice>}
      {setActive.error && <Notice>{getErrorMessage(setActive.error)}</Notice>}

      {showForm && <CreateClubDialog onClose={() => setShowForm(false)} />}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : clubs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron clubes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Club</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ciudad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Alta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{club.name}</p>
                      <p className="text-xs text-gray-400">{club.address}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{club.city}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(club.created_at, true)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={club.is_active ? 'Activo' : 'Inactivo'}
                        tone={club.is_active ? 'green' : 'gray'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        disabled={setActive.isPending}
                        onClick={() => toggle(club.id, club.name, club.is_active)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                      >
                        {club.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
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
