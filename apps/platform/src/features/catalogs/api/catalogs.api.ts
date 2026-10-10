import type { ApiResponse, CatalogAsset, Paginated } from '@match-padel/types'
import { api } from '@/lib/axios'

export type CatalogEntity = 'achievements' | 'challenges' | 'cosmetics'

export interface CatalogListQuery {
  search: string
  /** `''` = all. */
  active: '' | 'true' | 'false'
  page: number
  limit: number
  /** Equality filters the API supports per entity (`cadence`, `action_type`, `type`); `''` is dropped. */
  filters?: Record<string, string>
}

const base = (entity: CatalogEntity) => `/platform/catalogs/${entity}`

export const catalogsApi = {
  list: <Row>(entity: CatalogEntity, q: CatalogListQuery): Promise<Paginated<Row>> =>
    api
      .get<ApiResponse<Row[]>>(base(entity), {
        params: {
          search: q.search || undefined,
          is_active: q.active || undefined,
          page: q.page,
          limit: q.limit,
          ...Object.fromEntries(Object.entries(q.filters ?? {}).filter(([, v]) => v !== '')),
        },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page: q.page, limit: q.limit, totalPages: 1 },
      })),

  get: <Detail>(entity: CatalogEntity, id: string): Promise<Detail> =>
    api.get<ApiResponse<Detail>>(`${base(entity)}/${id}`).then((r) => r.data.data),

  create: <Detail, Body>(entity: CatalogEntity, body: Body): Promise<Detail> =>
    api.post<ApiResponse<Detail>>(base(entity), body).then((r) => r.data.data),

  update: <Detail, Body>(entity: CatalogEntity, id: string, body: Body): Promise<Detail> =>
    api.patch<ApiResponse<Detail>>(`${base(entity)}/${id}`, body).then((r) => r.data.data),

  setActive: <Detail>(entity: CatalogEntity, id: string, isActive: boolean): Promise<Detail> =>
    api
      .post<ApiResponse<Detail>>(`${base(entity)}/${id}/${isActive ? 'activate' : 'deactivate'}`)
      .then((r) => r.data.data),

  /** `POST /platform/catalogs/assets` (multipart, field `file`). */
  uploadAsset: (file: File): Promise<CatalogAsset> => {
    const form = new FormData()
    form.append('file', file)
    return api
      .post<ApiResponse<CatalogAsset>>('/platform/catalogs/assets', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },
}
