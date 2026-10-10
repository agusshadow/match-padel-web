import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../../packages/types/src/supabase'
import type { CourtSlot, PaymentsAvailabilityMeta, PlayerRefundResult, WithPaymentsMeta } from '../../../../../../packages/types/src/api'

// Types for reservation with joins
export interface CourtInfo {
  id: string
  name: string
  surface: string
  is_indoor: boolean
  price_per_hour: number
  club: {
    id: string
    name: string
    address: string
    city: string
    logo_url: string | null
  }
}

export interface Reservation extends Tables<'court_reservations'> {
  court: CourtInfo
}

/** Slot of `GET /courts/:courtId/slots`: carries the hourly rate and the slot's total price. */
export type TimeSlot = CourtSlot

export interface CreateReservationPayload {
  court_id: string
  start_time: string
  end_time: string
  notes?: string
}

export interface GetReservationsParams {
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
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

export const reservationService = {
  getMyReservations: async (
    params?: GetReservationsParams,
  ): Promise<PaginatedResponse<Reservation>> => {
    const res = await api.get('/reservations', { params })
    return res.data
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const res = await api.get(`/reservations/${id}`)
    return res.data.data
  },

  // Slots in `data`, `meta.payments_enabled` (card #75) beside them; missing flag = enabled.
  getAvailableSlots: async (courtId: string, date: string): Promise<WithPaymentsMeta<TimeSlot[]>> => {
    const res = await api.get<{ data: TimeSlot[]; meta?: Partial<PaymentsAvailabilityMeta> }>(
      `/courts/${courtId}/slots`,
      { params: { date } },
    )
    return {
      items: res.data.data,
      payments_enabled: res.data.meta?.payments_enabled ?? true,
      refund_policy: res.data.meta?.refund_policy ?? null,
    }
  },

  createReservation: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const res = await api.post('/reservations', payload)
    return res.data.data
  },

  // Card #76: `refund` is what the club's policy returned (null when nothing was paid).
  cancelReservation: async (id: string): Promise<Reservation & { refund: PlayerRefundResult | null }> => {
    const res = await api.delete(`/reservations/${id}`)
    return res.data.data
  },

  createPaymentPreference: async (
    reservationId: string,
  ): Promise<{ preference_id: string; init_point: string; sandbox_init_point: string }> => {
    const res = await api.post('/payments/preference', { reservation_id: reservationId })
    return res.data.data
  },
}
