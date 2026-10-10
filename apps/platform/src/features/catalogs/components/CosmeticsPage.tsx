import { useState } from 'react'
import type { CatalogCosmetic, CatalogCosmeticDetail } from '@match-padel/types'
import { Notice, PageHeader, Pagination } from '@match-padel/ui'
import { COSMETIC_TYPES, COSMETIC_TYPE_LABELS } from '../constants'
import { useCatalogPage } from '../hooks/useCatalogPage'
import { useCatalogList, useCatalogSetActive } from '../hooks/useCatalogs'
import { catalogErrorMessage } from '../lib/errors'
import { ActiveBadge, CatalogToolbar, selectClass } from './CatalogUi'
import { CosmeticFormDialog } from './CosmeticFormDialog'
import { DeactivateCosmetic } from './DeactivateItem'

export function CosmeticsPage() {
  const state = useCatalogPage(['type'])
  const { data, isLoading, error } = useCatalogList<CatalogCosmetic>('cosmetics', state.query)
  const setActive = useCatalogSetActive<CatalogCosmeticDetail>('cosmetics')
  const [form, setForm] = useState<{ item?: CatalogCosmetic } | null>(null)
  const [deactivating, setDeactivating] = useState<CatalogCosmetic | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const items = data?.items ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cosméticos"
        subtitle={`${data?.meta.total ?? 0} cosméticos en el catálogo`}
        actions={
          <button
            onClick={() => {
              setSuccess(null)
              setForm({})
            }}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nuevo cosmético
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
          value={state.filters.type}
          onChange={(e) => state.setFilter('type', e.target.value)}
          aria-label="Filtrar por tipo"
          className={selectClass}
        >
          <option value="">Todos los tipos</option>
          {COSMETIC_TYPES.map((t) => (
            <option key={t} value={t}>
              {COSMETIC_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </CatalogToolbar>

      {!!error && <Notice>{catalogErrorMessage(error)}</Notice>}
      {!!setActive.error && !deactivating && <Notice>{catalogErrorMessage(setActive.error)}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}

      {form && <CosmeticFormDialog item={form.item} onClose={() => setForm(null)} onSaved={(m) => setSuccess(m)} />}
      {deactivating && (
        <DeactivateCosmetic item={deactivating} onClose={() => setDeactivating(null)} onDone={(m) => setSuccess(m)} />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron cosméticos</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cosmético</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img src={c.image_url} alt="" className="w-10 h-10 object-contain rounded bg-gray-50 border border-gray-100" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{c.code}</p>
                      <p className="text-xs text-gray-500 mt-0.5 max-w-xs truncate">{c.description}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{COSMETIC_TYPE_LABELS[c.type]}</td>
                    <td className="px-4 py-3 text-gray-600">{c.price_currency === 0 ? 'Gratis' : `${c.price_currency} monedas`}</td>
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
                              { onSuccess: () => setSuccess(`Cosmético "${c.name}" activado.`) },
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
