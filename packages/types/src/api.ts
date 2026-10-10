import type { Enums, Json, Tables } from './supabase'

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

/** A paginated list as the API clients return it: the rows plus the response `meta`. */
export interface Paginated<T> {
  items: T[]
  meta: NonNullable<ApiResponse['meta']>
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Array<{ field: string; message: string }>
  }
}

// ---------------------------------------------------------------------------
// Club panel and platform panel (card #66, Admin F0)
//
// Hand-written because these endpoints are not in the generated Swagger yet.
// Entity rows are derived from the generated Supabase types (`Tables`/`Enums`),
// never declared field by field. Only the envelope shapes below are ours.
// ---------------------------------------------------------------------------

export type PlatformRole = 'superadmin' | 'reviewer'
export type ClubRole = 'owner' | 'admin' | 'staff' | 'superadmin'

export type ReservationStatus = Enums<'reservation_status'>
export type MatchStatus = Enums<'match_status'>
export type TournamentStatus = Enums<'tournament_status'>

/** `GET /me/access` */
export interface MeAccess {
  user: { id: string; email: string; first_name: string | null; last_name: string | null }
  platformRole: PlatformRole | null
  clubs: ClubAccess[]
}

export interface ClubAccess {
  clubId: string
  name: string
  slug: string
  isActive: boolean
  role: ClubRole
}

type PersonRef = Pick<Tables<'users'>, 'id' | 'full_name' | 'username'>

/** Row of `GET /club-admin/:clubId/reservations` and of the summary's recent list. */
export type ClubAdminReservation = Pick<
  Tables<'court_reservations'>,
  'id' | 'start_time' | 'end_time' | 'status' | 'total_price' | 'notes' | 'created_at'
> & {
  user: PersonRef | null
  court: Pick<Tables<'courts'>, 'id' | 'name'> | null
}

/** `GET /club-admin/:clubId/summary` */
export interface ClubAdminSummary {
  courts: number
  reservations: number
  pendingReservations: number
  todayReservations: number
  matches: number
  recentReservations: ClubAdminReservation[]
}

/** Row of `GET /club-admin/:clubId/matches` */
export type ClubAdminMatch = Pick<
  Tables<'matches'>,
  'id' | 'type' | 'status' | 'lobby_url' | 'created_at' | 'score_team1' | 'score_team2'
> & { creator: PersonRef | null }

/** Row of `GET /club-admin/:clubId/tournaments` */
export type ClubAdminTournament = Pick<
  Tables<'tournaments'>,
  'id' | 'name' | 'format' | 'status' | 'max_teams' | 'start_date' | 'created_at'
> & { creator: PersonRef | null; teamsCount?: number }

/** `GET /club-admin/:clubId` (and the body returned by `PATCH`). */
export type ClubAdminClub = Tables<'clubs'>

/** Body of `PATCH /club-admin/:clubId` */
export type ClubAdminClubUpdate = Partial<
  Pick<
    Tables<'clubs'>,
    'name' | 'description' | 'address' | 'city' | 'phone' | 'email' | 'logo_url' | 'cover_url' | 'lat' | 'lng'
  >
>

/** `GET /platform/summary` */
export interface PlatformSummary {
  clubs: number
  activeClubs: number
  courts: number
  users: number
  reservations: number
  pendingReservations: number
  matches: number
}

/** Row of `GET /platform/clubs` */
export type PlatformClub = Pick<
  Tables<'clubs'>,
  'id' | 'name' | 'slug' | 'address' | 'city' | 'is_active' | 'created_at'
> & { courtsCount?: number }

/** Body of `POST /platform/clubs` */
export interface PlatformClubCreate {
  name: string
  slug: string
  address: string
  city: string
  description?: string
  phone?: string
  email?: string
  ownerUserId?: string
}

/** Row of `GET /platform/users` */
export type PlatformUser = Pick<
  Tables<'users'>,
  'id' | 'full_name' | 'username' | 'elo' | 'role' | 'is_active' | 'created_at'
> & { email?: string | null }

/** Row of `GET /platform/audit-log` */
export interface AuditLogEntry {
  id: string
  created_at: string
  action: string
  entity_type: string | null
  entity_id: string | null
  club_id: string | null
  actor_id: string | null
  actor: PersonRef | null
  club: { id: string; name: string } | null
  metadata: Json | null
}
