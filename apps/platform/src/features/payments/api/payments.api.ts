import type { ApiResponse, PaymentRow, PaymentsPage, PaymentTotals } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface PaymentsQuery {
  /** Club filter (uuid), empty for every club. */
  clubId: string
  /** `YYYY-MM-DD`, empty for no bound. A date-only `to` includes that whole day. */
  from: string
  to: string
  page: number
  limit: number
}

type PaymentsEnvelope = ApiResponse<PaymentRow[]> & { meta?: { totals?: PaymentTotals } }

export const paymentsApi = {
  /** `GET /platform/payments` (superadmin): rows, pagination and `meta.totals` of the approved payments of the filter. */
  list: ({ clubId, from, to, page, limit }: PaymentsQuery): Promise<PaymentsPage> =>
    api
      .get<PaymentsEnvelope>('/platform/payments', {
        params: { clubId: clubId || undefined, from: from || undefined, to: to || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
        totals: r.data.meta?.totals ?? { gross: 0, fee: 0, net: 0 },
      })),

  // Fills the club filter.
  listClubs: () =>
    api
      .get<ApiResponse<Array<{ id: string; name: string }>>>('/platform/clubs', { params: { limit: 100 } })
      .then((r) => r.data.data),
}
