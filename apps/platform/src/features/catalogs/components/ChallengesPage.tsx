import { useState } from 'react'
import type { CatalogChallenge, CatalogChallengeDetail } from '@match-padel/types'
import { Notice, PageHeader, Pagination } from '@match-padel/ui'
import { ACTIONS, ACTION_LABELS, CADENCES, CADENCE_LABELS } from '../constants'
import { useCatalogPage } from '../hooks/useCatalogPage'
import { useCatalogList, useCatalogSetActive } from '../hooks/useCatalogs'
import { catalogErrorMessage } from '../lib/errors'
import { ActiveBadge, CatalogToolbar, selectClass } from './CatalogUi'
import { ChallengeFormDialog } from './ChallengeFormDialog'
import { DeactivateChallenge } from './DeactivateItem'

export function ChallengesPage() {
  const state = useCatalogPage(['cadence', 'action_type'])
  const { data, isLoading, error } = useCatalogList<CatalogChallenge>('challenges', state.query)
  const setActive = useCatalogSetActive<CatalogChallengeDetail>('challenges')
  const [form, setForm] = useState<{ item?: CatalogChallenge } | null>(null)
  const [deactivating, setDeactivating] = useState<CatalogChallenge | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Desafíos"
        subtitle={`${data?.meta.total ?? 0} desafíos en el catálogo`}
        actions={
          <button
            onClick={() => {
              setSuccess(null)
              setForm({})
            }}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nuevo desafío
          </button>
        }
      />

      <CatalogToolbar
        search={state.search}
        onSearch={state.setSearch}
        active={state.active}
        onActive={state.setActive}
        placeholder="Buscar por nombre, código o descripción..."
      >
        <select
          value={state.filters.cadence}
          onChange={(e) => state.setFilter('cadence', e.target.value)}
          aria-label="Filtrar por frecuencia"
          className={selectClass}
        >
          <option value="">Todas las frecuencias</option>
          {CADENCES.map((c) => (
            <option key={c} value={c}>
              {CADENCE_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={state.filters.action_type}
          onChange={(e) => state.setFilter('action_type', e.target.value)}
          aria-label="Filtrar por acción"
          className={selectClass}
        >
          <option value="">Todas las acciones</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>
              {ACTION_LABELS[a]}
            </option>
          ))}
        </select>
      </CatalogToolbar>

      {!!error && <Notice>{catalogErrorMessage(error)}</Notice>}
      {!!setActive.error && !deactivating && <Notice>{catalogErrorMessage(setActive.error)}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {form && <ChallengeFormDialog item={form.item} onClose={() => setForm(null)} onSaved={(m) => setSuccess(m)} />}
      {deactivating && (
        <DeactivateChallenge item={deactivating} onClose={() => setDeactivating(null)} onDone={(m) => setSuccess(m)} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron desafíos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Desafío</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Frecuencia</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Meta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Recompensa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{c.code}</p>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{c.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{CADENCE_LABELS[c.cadence]}</td>
                    <td className="px-4 py-3 text-gray-600">{ACTION_LABELS[c.action_type]}</td>
                    <td className="px-4 py-3 text-gray-600">{c.target_count}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.reward_xp} XP · {c.reward_currency} monedas
                    </td>
                    <td className="px-4 py-3">
                      <ActiveBadge isActive={c.is_active} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                      <button
                        onClick={() => {
                          setSuccess(null)
                          setForm({ item: c })
                        }}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        disabled={setActive.isPending}
                        onClick={() => {
                          setSuccess(null)
                          setActive.reset()
                          if (c.is_active) setDeactivating(c)
                          else
                            setActive.mutate(
                              { id: c.id, isActive: true },
                              { onSuccess: () => setSuccess(`Desafío "${c.name}" activado.`) },
                            )
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                      >
                        {c.is_active ? 'Desactivar' : 'Activar'}
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
