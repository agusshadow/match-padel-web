import type { ApiResponse, ClubAdminReservation, Paginated, ReservationStatus } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface ReservationsQuery {
  status?: ReservationStatus
  page: number
  limit: number
}

export const reservationsApi = {
  list: (clubId: string, { status, page, limit }: ReservationsQuery): Promise<Paginated<ClubAdminReservation>> =>
    api
      .get<ApiResponse<ClubAdminReservation[]>>(`/club-admin/${clubId}/reservations`, {
        params: { status, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
      })),

  updateStatus: (clubId: string, id: string, status: Exclude<ReservationStatus, 'pending'>) =>
    api
      .patch<ApiResponse<ClubAdminReservation>>(`/club-admin/${clubId}/reservations/${id}`, { status })
      .then((r) => r.data.data),
}
