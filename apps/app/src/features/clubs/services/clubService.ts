import { api } from '../../../lib/axios'

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
}

export interface ClubAvailabilityCourt {
  court_id: string
  name: string
  surface: string
  is_indoor: boolean
  price_per_hour: number
}

export interface ClubAvailabilitySlot {
  start_time: string
  end_time: string
  min_price: number
  courts: ClubAvailabilityCourt[]
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

  getClubAvailability: async (clubId: string, date: string): Promise<ClubAvailabilitySlot[]> => {
    const res = await api.get(`/clubs/${clubId}/availability`, { params: { date } })
    return res.data.data
  },
}
