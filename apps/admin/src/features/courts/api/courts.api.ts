import type {
  ApiResponse,
  ClubAdminCourt,
  ClubAdminCourtCreate,
  ClubAdminCourtUpdate,
  ClubAdminCourtUpdateResult,
  CourtPreview,
  CourtPriceRules,
  CourtPriceRulesReplace,
  CourtSchedule,
  CourtScheduleReplace,
  ScheduleException,
  ScheduleExceptionCreate,
  ScheduleExceptionCreateResult,
} from '@match-padel/types'
import { api } from '@/lib/axios'

const base = (clubId: string) => `/club-admin/${clubId}`

export const courtsApi = {
  list: (clubId: string) =>
    api.get<ApiResponse<ClubAdminCourt[]>>(`${base(clubId)}/courts`).then((r) => r.data.data),

  create: (clubId: string, body: ClubAdminCourtCreate) =>
    api.post<ApiResponse<ClubAdminCourt>>(`${base(clubId)}/courts`, body).then((r) => r.data.data),

  update: (clubId: string, id: string, body: ClubAdminCourtUpdate) =>
    api
      .patch<ApiResponse<ClubAdminCourtUpdateResult>>(`${base(clubId)}/courts/${id}`, body)
      .then((r) => r.data.data),

  getSchedule: (clubId: string, courtId: string) =>
    api.get<ApiResponse<CourtSchedule>>(`${base(clubId)}/courts/${courtId}/schedule`).then((r) => r.data.data),

  replaceSchedule: (clubId: string, courtId: string, body: CourtScheduleReplace) =>
    api
      .put<ApiResponse<CourtSchedule>>(`${base(clubId)}/courts/${courtId}/schedule`, body)
      .then((r) => r.data.data),

  getPriceRules: (clubId: string, courtId: string) =>
    api
      .get<ApiResponse<CourtPriceRules>>(`${base(clubId)}/courts/${courtId}/price-rules`)
      .then((r) => r.data.data),

  replacePriceRules: (clubId: string, courtId: string, body: CourtPriceRulesReplace) =>
    api
      .put<ApiResponse<CourtPriceRules>>(`${base(clubId)}/courts/${courtId}/price-rules`, body)
      .then((r) => r.data.data),

  preview: (clubId: string, courtId: string, date: string) =>
    api
      .get<ApiResponse<CourtPreview>>(`${base(clubId)}/courts/${courtId}/preview`, { params: { date } })
      .then((r) => r.data.data),

  listExceptions: (clubId: string, params: { court_id?: string; from?: string; to?: string }) =>
    api
      .get<ApiResponse<ScheduleException[]>>(`${base(clubId)}/schedule-exceptions`, { params })
      .then((r) => r.data.data),

  createException: (clubId: string, body: ScheduleExceptionCreate) =>
    api
      .post<ApiResponse<ScheduleExceptionCreateResult>>(`${base(clubId)}/schedule-exceptions`, body)
      .then((r) => r.data.data),

  deleteException: (clubId: string, id: string) =>
    api.delete<ApiResponse<{ id: string }>>(`${base(clubId)}/schedule-exceptions/${id}`).then((r) => r.data.data),
}
