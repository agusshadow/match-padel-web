import type {
  ApiResponse,
  ClubAdminClub,
  ClubAdminClubUpdate,
  ClubAdminCourt,
  ClubAdminCourtCreate,
  ClubAdminCourtUpdate,
  ClubAdminDocument,
  ClubDocumentKind,
  ClubOnboarding,
  DocumentUrl,
} from '@match-padel/types'
import { api } from '@/lib/axios'

const base = (clubId: string) => `/club-admin/${clubId}`

export const onboardingApi = {
  getOnboarding: (clubId: string) =>
    api.get<ApiResponse<ClubOnboarding>>(`${base(clubId)}/onboarding`).then((r) => r.data.data),

  getClub: (clubId: string) => api.get<ApiResponse<ClubAdminClub>>(base(clubId)).then((r) => r.data.data),

  updateClub: (clubId: string, body: ClubAdminClubUpdate) =>
    api.patch<ApiResponse<ClubAdminClub>>(base(clubId), body).then((r) => r.data.data),

  submit: (clubId: string) =>
    api.post<ApiResponse<ClubAdminClub>>(`${base(clubId)}/submit`).then((r) => r.data.data),

  listCourts: (clubId: string) =>
    api.get<ApiResponse<ClubAdminCourt[]>>(`${base(clubId)}/courts`).then((r) => r.data.data),

  createCourt: (clubId: string, body: ClubAdminCourtCreate) =>
    api.post<ApiResponse<ClubAdminCourt>>(`${base(clubId)}/courts`, body).then((r) => r.data.data),

  updateCourt: (clubId: string, id: string, body: ClubAdminCourtUpdate) =>
    api.patch<ApiResponse<ClubAdminCourt>>(`${base(clubId)}/courts/${id}`, body).then((r) => r.data.data),

  deleteCourt: (clubId: string, id: string) =>
    api.delete<ApiResponse<{ id: string }>>(`${base(clubId)}/courts/${id}`).then((r) => r.data.data),

  /** Multipart upload: field `file` plus `kind`. */
  uploadDocument: (clubId: string, file: File, kind: ClubDocumentKind) => {
    const form = new FormData()
    form.append('file', file)
    form.append('kind', kind)
    return api
      .post<ApiResponse<ClubAdminDocument>>(`${base(clubId)}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data)
  },

  deleteDocument: (clubId: string, id: string) =>
    api.delete<ApiResponse<{ id: string }>>(`${base(clubId)}/documents/${id}`).then((r) => r.data.data),

  /** Fresh signed URL (valid 10 minutes). */
  getDocumentUrl: (clubId: string, id: string) =>
    api.get<ApiResponse<DocumentUrl>>(`${base(clubId)}/documents/${id}/url`).then((r) => r.data.data),
}
