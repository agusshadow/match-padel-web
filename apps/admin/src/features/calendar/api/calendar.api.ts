import type {
  ApiResponse,
  ClubAdminReservation,
  ClubCalendar,
  CourtBlock,
  CourtBlocksCreate,
  ReservationCancelResult,
  ReservationMove,
  ReservationStatus,
} from '@match-padel/types'
import { api } from '@/lib/axios'

const base = (clubId: string) => `/club-admin/${clubId}`

export interface CalendarQuery {
  /** ISO instant, inclusive. */
  from: string
  /** ISO instant, exclusive; at most 14 days after `from`. */
  to: string
  courtId?: string
}

export const calendarApi = {
  get: (clubId: string, { from, to, courtId }: CalendarQuery) =>
    api
      .get<ApiResponse<ClubCalendar>>(`${base(clubId)}/calendar`, { params: { from, to, courtId } })
      .then((r) => r.data.data),

  move: (clubId: string, id: string, body: ReservationMove) =>
    api
      .patch<ApiResponse<ClubAdminReservation>>(`${base(clubId)}/reservations/${id}/move`, body)
      .then((r) => r.data.data),

  cancel: (clubId: string, id: string, reason?: string) =>
    api
      .post<ApiResponse<ReservationCancelResult>>(`${base(clubId)}/reservations/${id}/cancel`, {
        ...(reason ? { reason } : {}),
      })
      .then((r) => r.data.data),

  /** Only for `confirmed` and `completed`; cancelling goes through `cancel`. */
  updateStatus: (clubId: string, id: string, status: Extract<ReservationStatus, 'confirmed' | 'completed'>) =>
    api
      .patch<ApiResponse<ClubAdminReservation>>(`${base(clubId)}/reservations/${id}`, { status })
      .then((r) => r.data.data),

  createBlocks: (clubId: string, body: CourtBlocksCreate) =>
    api.post<ApiResponse<{ blocks: CourtBlock[] }>>(`${base(clubId)}/blocks`, body).then((r) => r.data.data.blocks),

  deleteBlock: (clubId: string, id: string) =>
    api.delete<ApiResponse<{ id: string }>>(`${base(clubId)}/blocks/${id}`).then((r) => r.data.data),
}
