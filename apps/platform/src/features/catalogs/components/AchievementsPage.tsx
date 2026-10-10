import { useState } from 'react'
import type { CatalogAchievement, CatalogAchievementDetail } from '@match-padel/types'
import { Notice, PageHeader, Pagination } from '@match-padel/ui'
import { CONDITION_LABELS } from '../constants'
import { useCatalogPage } from '../hooks/useCatalogPage'
import { useCatalogList, useCatalogSetActive } from '../hooks/useCatalogs'
import { catalogErrorMessage } from '../lib/errors'
import { AchievementFormDialog } from './AchievementFormDialog'
import { ActiveBadge, CatalogToolbar } from './CatalogUi'
import { DeactivateAchievement } from './DeactivateItem'
import { isHttpsUrl } from '../lib/schemas'

export function AchievementsPage() {
  const state = useCatalogPage()
  const { data, isLoading, error } = useCatalogList<CatalogAchievement>('achievements', state.query)
  const setActive = useCatalogSetActive<CatalogAchievementDetail>('achievements')
  const [form, setForm] = useState<{ item?: CatalogAchievement } | null>(null)
  const [deactivating, setDeactivating] = useState<CatalogAchievement | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logros"
        subtitle={`${data?.meta.total ?? 0} logros en el catálogo`}
        actions={
          <button
            onClick={() => {
              setSuccess(null)
              setForm({})
            }}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nuevo logro
          </button>
        }
      />

      <CatalogToolbar
        search={state.search}
        onSearch={state.setSearch}
        active={state.active}
        onActive={state.setActive}
        placeholder="Buscar por nombre, código o descripción..."
      />

      {!!error && <Notice>{catalogErrorMessage(error)}</Notice>}
      {!!setActive.error && <Notice>{catalogErrorMessage(setActive.error)}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {form && (
        <AchievementFormDialog item={form.item} onClose={() => setForm(null)} onSaved={(m) => setSuccess(m)} />
      )}
      {deactivating && (
        <DeactivateAchievement
          item={deactivating}
          onClose={() => setDeactivating(null)}
          onDone={(m) => setSuccess(m)}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron logros</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Logro</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ícono</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Condición</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Puntos</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{a.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{a.code}</p>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{a.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {isHttpsUrl(a.icon) ? (
                        <img src={a.icon} alt="" className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="font-mono text-xs">{a.icon}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {CONDITION_LABELS[a.condition.type] ?? a.condition.type}: {a.condition.count}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{a.points}</td>
                    <td className="px-4 py-3">
                      <ActiveBadge isActive={a.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                      <button
                        onClick={() => {
                          setSuccess(null)
                          setForm({ item: a })
                        }}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        disabled={setActive.isPending}
                        onClick={() => {
                          setSuccess(null)
                          if (a.is_active) setDeactivating(a)
                          else
                            setActive.mutate(
                              { id: a.id, isActive: true },
                              { onSuccess: () => setSuccess(`Logro "${a.name}" activado.`) },
                            )
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                      >
                        {a.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={state.setPage} />}
      </div>
    </div>
  )
}
