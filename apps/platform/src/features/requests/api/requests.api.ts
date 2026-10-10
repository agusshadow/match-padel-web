import type {
  ApiResponse,
  ApplicationDetail,
  ApplicationListRow,
  ApplicationStatusFilter,
  ClubAdminClub,
  Paginated,
} from '@match-padel/types'
import { api } from '@/lib/axios'
import type { LifecycleAction } from '@/shared/permissions'

export interface RequestsQuery {
  status: ApplicationStatusFilter
  search: string
  page: number
  limit: number
}

/** Where each action lives and the name of its text field in the body (card #68). */
const ACTION_ENDPOINTS: Record<LifecycleAction, { path: (id: string) => string; field: 'note' | 'reason' }> = {
  approve: { path: (id) => `/platform/applications/${id}/approve`, field: 'note' },
  'request-changes': { path: (id) => `/platform/applications/${id}/request-changes`, field: 'note' },
  reject: { path: (id) => `/platform/applications/${id}/reject`, field: 'reason' },
  reopen: { path: (id) => `/platform/clubs/${id}/reopen`, field: 'note' },
  suspend: { path: (id) => `/platform/clubs/${id}/suspend`, field: 'reason' },
  unsuspend: { path: (id) => `/platform/clubs/${id}/unsuspend`, field: 'note' },
}

export const requestsApi = {
  /** `GET /platform/applications` (reviewers see only `pending` and `changes_requested`). */
  list: ({ status, search, page, limit }: RequestsQuery): Promise<Paginated<ApplicationListRow>> =>
    api
      .get<ApiResponse<ApplicationListRow[]>>('/platform/applications', {
        params: { status, search: search || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),

  /** `GET /platform/applications/:clubId` */
  detail: (clubId: string) =>
    api.get<ApiResponse<ApplicationDetail>>(`/platform/applications/${clubId}`).then((r) => r.data.data),

  /** Review and lifecycle actions. `text` is the note or reason; the body is `{}` when it is empty. */
  act: (action: LifecycleAction, clubId: string, text: string | undefined) => {
    const { path, field } = ACTION_ENDPOINTS[action]
    return api
      .post<ApiResponse<ClubAdminClub>>(path(clubId), text ? { [field]: text } : {})
      .then((r) => r.data.data)
  },
}
