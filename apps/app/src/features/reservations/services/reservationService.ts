import { api } from '../../../lib/axios'
import type { Tables } from '../../../../../packages/types/src/supabase'

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

export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
}

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

  getAvailableSlots: async (courtId: string, date: string): Promise<TimeSlot[]> => {
    const res = await api.get(`/courts/${courtId}/slots`, { params: { date } })
    return res.data.data
  },

  createReservation: async (payload: CreateReservationPayload): Promise<Reservation> => {
    const res = await api.post('/reservations', payload)
    return res.data.data
  },

  cancelReservation: async (id: string): Promise<Reservation> => {
    const res = await api.delete(`/reservations/${id}`)
    return res.data.data
  },
}
