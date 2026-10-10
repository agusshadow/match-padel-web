import { api } from '../../../lib/axios'
import type {
  ClubAvailabilityCourt,
  ClubAvailabilitySlot,
  PaymentsAvailabilityMeta,
  RefundPolicyValues,
  WithPaymentsMeta,
} from '../../../../../../packages/types/src/api'

// Availability shapes come from the API contract (`price` is the slot's total, computed by the server).
export type { ClubAvailabilityCourt, ClubAvailabilitySlot, RefundPolicyValues, WithPaymentsMeta }

export interface Club {
  id: string
  name: string
  slug: string
  address: string
  city: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  email: string | null
  phone: string | null
  lat: number | null
  lng: number | null
  is_active: boolean
  created_at: string
  courts_count: number
}

export interface Court {
  id: string
  name: string
  surface: string
  is_indoor: boolean
  price_per_hour: number
  is_active: boolean
}

export interface ClubWithCourts extends Omit<Club, 'courts_count'> {
  courts: Court[]
  /** Card #76: the club's effective refund policy (shown before paying). */
  refund_policy?: RefundPolicyValues
}

export interface GetClubsParams {
  city?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export const clubService = {
  getClubes: async (params?: GetClubsParams): Promise<PaginatedResponse<Club>> => {
    const res = await api.get('/clubs', { params })
    return res.data
  },

  getClubById: async (id: string): Promise<ClubWithCourts> => {
    const res = await api.get(`/clubs/${id}`)
    return res.data.data
  },

  getClubCourts: async (clubId: string): Promise<Court[]> => {
    const res = await api.get(`/clubs/${clubId}/courts`)
    return res.data.data
  },

  // The slots stay in `data` (like every other service); `meta.payments_enabled` (card #75) and
  // `meta.refund_policy` (card #76) are read beside them. A response without the payments flag
  // (older API) is treated as enabled.
  getClubAvailability: async (
    clubId: string,
    date: string,
  ): Promise<WithPaymentsMeta<ClubAvailabilitySlot[]>> => {
    const res = await api.get<{ data: ClubAvailabilitySlot[]; meta?: Partial<PaymentsAvailabilityMeta> }>(
      `/clubs/${clubId}/availability`,
      { params: { date } },
    )
    return {
      items: res.data.data,
      payments_enabled: res.data.meta?.payments_enabled ?? true,
      refund_policy: res.data.meta?.refund_policy ?? null,
    }
  },
}
