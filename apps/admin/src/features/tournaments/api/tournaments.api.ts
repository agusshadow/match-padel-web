import type {
  ApiResponse,
  ClubAdminTournament,
  ClubTournament,
  ClubTournamentCancelResult,
  ClubTournamentCreate,
  ClubTournamentDetail,
  ClubTournamentStandings,
  ClubTournamentStart,
  ClubTournamentStartResult,
  ClubTournamentUpdate,
  Paginated,
  TournamentResultInput,
  TournamentResultOutcome,
  TournamentStatus,
} from '@match-padel/types'
import { api } from '@/lib/axios'

const base = (clubId: string) => `/club-admin/${clubId}/tournaments`

export const tournamentsApi = {
  /** `GET /club-admin/:clubId/tournaments?status=&page=&limit=` (owner, administrator, superadmin). */
  list: (
    clubId: string,
    params: { page: number; limit: number; status?: TournamentStatus },
  ): Promise<Paginated<ClubAdminTournament>> =>
    api.get<ApiResponse<ClubAdminTournament[]>>(base(clubId), { params }).then((r) => ({
      items: r.data.data,
      meta: r.data.meta ?? { total: r.data.data.length, page: params.page, limit: params.limit, totalPages: 1 },
    })),

  get: (clubId: string, id: string) =>
    api.get<ApiResponse<ClubTournamentDetail>>(`${base(clubId)}/${id}`).then((r) => r.data.data),

  create: (clubId: string, body: ClubTournamentCreate) =>
    api.post<ApiResponse<ClubTournament>>(base(clubId), body).then((r) => r.data.data),

  update: (clubId: string, id: string, body: ClubTournamentUpdate) =>
    api.patch<ApiResponse<ClubTournament>>(`${base(clubId)}/${id}`, body).then((r) => r.data.data),

  /** `draft` to `open`; 409 `CLUB_PAYMENTS_NOT_ENABLED` when the fee cannot be collected. */
  publish: (clubId: string, id: string) =>
    api.post<ApiResponse<ClubTournament>>(`${base(clubId)}/${id}/publish`).then((r) => r.data.data),

  /** Refunds every approved registration at 100% and notifies the players. */
  cancel: (clubId: string, id: string, reason?: string) =>
    api
      .post<ApiResponse<ClubTournamentCancelResult>>(`${base(clubId)}/${id}/cancel`, reason ? { reason } : {})
      .then((r) => r.data.data),

  /** `open` to `in_progress`: frees unpaid registrations and generates the fixture. */
  start: (clubId: string, id: string, body: ClubTournamentStart) =>
    api.post<ApiResponse<ClubTournamentStartResult>>(`${base(clubId)}/${id}/start`, body).then((r) => r.data.data),

  standings: (clubId: string, id: string) =>
    api.get<ApiResponse<ClubTournamentStandings>>(`${base(clubId)}/${id}/standings`).then((r) => r.data.data),

  /** First result or a correction; 409 `RESULT_LOCKED` when the winner cannot change any more. */
  recordResult: (clubId: string, id: string, matchId: string, body: TournamentResultInput) =>
    api
      .patch<ApiResponse<TournamentResultOutcome>>(`${base(clubId)}/${id}/matches/${matchId}/result`, body)
      .then((r) => r.data.data),
}
