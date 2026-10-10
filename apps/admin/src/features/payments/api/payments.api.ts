import type { ApiResponse, PaymentRow, PaymentsPage, PaymentTotals } from '@match-padel/types'
import { api } from '@/lib/axios'

export interface PaymentsQuery {
  /** `YYYY-MM-DD`, empty for no bound. A date-only `to` includes that whole day (club-local). */
  from: string
  to: string
  page: number
  limit: number
}

type PaymentsEnvelope = ApiResponse<PaymentRow[]> & { meta?: { totals?: PaymentTotals } }

export const paymentsApi = {
  /** `GET /club-admin/:clubId/payments` (owner; superadmin passes): the club's payments with fee, net and `meta.totals`. */
  list: (clubId: string, { from, to, page, limit }: PaymentsQuery): Promise<PaymentsPage> =>
    api
      .get<PaymentsEnvelope>(`/club-admin/${clubId}/payments`, {
        params: { from: from || undefined, to: to || undefined, page, limit },
      })
      .then((r) => ({
        items: r.data.data,
        meta: r.data.meta ?? { total: r.data.data.length, page, limit, totalPages: 1 },
        totals: r.data.meta?.totals ?? { gross: 0, fee: 0, net: 0 },
      })),
}
