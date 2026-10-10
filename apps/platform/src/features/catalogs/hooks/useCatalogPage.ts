import { useEffect, useState } from 'react'
import { PAGE_SIZE } from '../constants'
import type { CatalogListQuery } from '../api/catalogs.api'

function useDebounced<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])
  return debounced
}

/** Search / active / page state shared by the three catalog pages. `filters` are entity-specific equality filters. */
export function useCatalogPage(filterKeys: string[] = []) {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<CatalogListQuery['active']>('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>(Object.fromEntries(filterKeys.map((k) => [k, ''])))
  const debounced = useDebounced(search.trim())

  const query: CatalogListQuery = { search: debounced, active, page, limit: PAGE_SIZE, filters }

  return {
    query,
    search,
    active,
    filters,
    setSearch: (v: string) => {
      setSearch(v)
      setPage(1)
    },
    setActive: (v: CatalogListQuery['active']) => {
      setActive(v)
      setPage(1)
    },
    setFilter: (key: string, value: string) => {
      setFilters((f) => ({ ...f, [key]: value }))
      setPage(1)
    },
    setPage,
  }
}
