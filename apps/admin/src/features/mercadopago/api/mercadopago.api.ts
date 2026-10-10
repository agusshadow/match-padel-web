import type { ApiResponse, ClubMpAccount, ClubMpConnect, ClubMpDisconnect } from '@match-padel/types'
import { api } from '@/lib/axios'

const base = (clubId: string) => `/club-admin/${clubId}/mercadopago`

export const mercadoPagoApi = {
  getAccount: (clubId: string) => api.get<ApiResponse<ClubMpAccount>>(base(clubId)).then((r) => r.data.data),

  connect: (clubId: string) =>
    api.post<ApiResponse<ClubMpConnect>>(`${base(clubId)}/connect`).then((r) => r.data.data),

  disconnect: (clubId: string) => api.delete<ApiResponse<ClubMpDisconnect>>(base(clubId)).then((r) => r.data.data),
}
