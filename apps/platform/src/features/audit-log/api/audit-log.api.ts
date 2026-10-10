import type { ApiResponse, AuditLogEntry, Paginated } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface AuditLogQuery {
  clubId: string
  actorId: string
  page: number
  limit: number
}

export const auditLogApi = {
  list: ({ clubId, actorId, page, limit }: AuditLogQuery): Promise<Paginated<AuditLogEntry>> =>
    api
      .get<ApiResponse<AuditLogEntry[]>>('/platform/audit-log', {
        params: { clubId: clubId || undefined, actorId: actorId || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),

  // Used to fill the club filter.
  listClubs: () =>
    api
      .get<ApiResponse<Array<{ id: string; name: string }>>>('/platform/clubs', { params: { limit: 100 } })
      .then((r) => r.data.data),
}
