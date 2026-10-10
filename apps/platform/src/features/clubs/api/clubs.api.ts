import type {
  ApiResponse,
  ClubAdminClub,
  ClubChargingSummary,
  ClubCollectionModeUpdate,
  ClubCommissionUpdate,
  ClubStatus,
  Paginated,
  PlatformClub,
  PlatformClubCreate,
  PlatformClubRow,
} from '@match-padel/types'
import { api } from '@/lib/axios'

export interface ClubsQuery {
  search: string
  status: ClubStatus | ''
  page: number
  limit: number
}

export const clubsApi = {
  list: ({ search, status, page, limit }: ClubsQuery): Promise<Paginated<PlatformClubRow>> =>
    api
      .get<ApiResponse<PlatformClubRow[]>>('/platform/clubs', {
        params: { search: search || undefined, status: status || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),

  create: (body: PlatformClubCreate) =>
    api.post<ApiResponse<PlatformClub>>('/platform/clubs', body).then((r) => r.data.data),

  setActive: (id: string, isActive: boolean) =>
    api
      .patch<ApiResponse<PlatformClub>>(`/platform/clubs/${id}/active`, { isActive })
      .then((r) => r.data.data),

  /** `POST /platform/clubs/:id/suspend` (superadmin, `reason` 5..2000 chars). */
  suspend: (id: string, reason: string) =>
    api.post<ApiResponse<ClubAdminClub>>(`/platform/clubs/${id}/suspend`, { reason }).then((r) => r.data.data),

  /** `POST /platform/clubs/:id/unsuspend` (superadmin, optional `note`). */
  unsuspend: (id: string, note?: string) =>
    api
      .post<ApiResponse<ClubAdminClub>>(`/platform/clubs/${id}/unsuspend`, note ? { note } : {})
      .then((r) => r.data.data),

  /** `PATCH /platform/clubs/:id/commission` (superadmin; 0..100, up to 2 decimals). Applies to charges created from then on. */
  setCommission: (id: string, body: ClubCommissionUpdate) =>
    api.patch<ApiResponse<ClubChargingSummary>>(`/platform/clubs/${id}/commission`, body).then((r) => r.data.data),

  /** `PATCH /platform/clubs/:id/collection-mode` (superadmin). */
  setCollectionMode: (id: string, body: ClubCollectionModeUpdate) =>
    api
      .patch<ApiResponse<ClubChargingSummary>>(`/platform/clubs/${id}/collection-mode`, body)
      .then((r) => r.data.data),
}
