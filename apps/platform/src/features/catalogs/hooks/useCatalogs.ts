import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogsApi, type CatalogEntity, type CatalogListQuery } from '../api/catalogs.api'

const key = (entity: CatalogEntity) => ['platform', 'catalogs', entity] as const

export function useCatalogList<Row>(entity: CatalogEntity, query: CatalogListQuery) {
  return useQuery({
    queryKey: [...key(entity), 'list', query],
    queryFn: () => catalogsApi.list<Row>(entity, query),
    placeholderData: keepPreviousData,
  })
}

/** Single item with its `usage` counters. */
export function useCatalogDetail<Detail>(entity: CatalogEntity, id: string | undefined) {
  return useQuery({
    queryKey: [...key(entity), 'detail', id],
    queryFn: () => catalogsApi.get<Detail>(entity, id as string),
    enabled: !!id,
    staleTime: 0,
  })
}

/** Create (no `id`) or update (with `id`). Refreshes lists and the detail afterwards. */
export function useCatalogSave<Detail, Body>(entity: CatalogEntity) {
  const queryClient = useQueryClient()
  return useMutation<Detail, unknown, { id?: string; body: Body }>({
    mutationFn: ({ id, body }) =>
      id ? catalogsApi.update<Detail, Body>(entity, id, body) : catalogsApi.create<Detail, Body>(entity, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(entity) }),
    // A locked-field conflict means the usage changed under us: refresh it.
    onError: () => queryClient.invalidateQueries({ queryKey: [...key(entity), 'detail'] }),
  })
}

export function useCatalogSetActive<Detail>(entity: CatalogEntity) {
  const queryClient = useQueryClient()
  return useMutation<Detail, unknown, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) => catalogsApi.setActive<Detail>(entity, id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key(entity) }),
  })
}

export function useUploadCatalogAsset() {
  return useMutation({ mutationFn: (file: File) => catalogsApi.uploadAsset(file) })
}
