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

/**
 * Error body of the API's error handler: `{ error: CODE, message, details? }`. There is no
 * `success` field. `details` is a list of `{ field, message }` for validation errors and an
 * object for some domain errors (e.g. `APPLICATION_INCOMPLETE`, see `ApplicationIncompleteDetails`).
 */
export interface ApiError {
  error: string
  message: string
  details?: unknown
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

export type ClubStatus = Enums<'club_status'>
export type ReservationStatus = Enums<'reservation_status'>
export type MatchStatus = Enums<'match_status'>
export type TournamentStatus = Enums<'tournament_status'>

/** `GET /me/access` */
export interface MeAccess {
  user: { id: string; email: string | null; first_name: string | null; last_name: string | null }
  platformRole: PlatformRole | null
  clubs: ClubAccess[]
}

export interface ClubAccess {
  clubId: string
  name: string
  slug: string
  isActive: boolean
  status: ClubStatus
  role: ClubRole
}

/** Person embedded in club-admin and platform rows. */
export type PersonRef = Pick<Tables<'users'>, 'id' | 'username' | 'first_name' | 'last_name'>

/** Row of `GET /club-admin/:clubId/reservations`, the PATCH result and the recent lists. */
export type ClubAdminReservation = Pick<
  Tables<'court_reservations'>,
  | 'id'
  | 'court_id'
  | 'user_id'
  | 'start_time'
  | 'end_time'
  | 'status'
  | 'total_price'
  | 'notes'
  | 'created_at'
  | 'updated_at'
> & {
  court: Pick<Tables<'courts'>, 'id' | 'name' | 'club_id'>
  user: PersonRef | null
}

/** `GET /club-admin/:clubId/summary` */
export interface ClubAdminSummary {
  courts: number
  reservations: { total: number; pending: number; today: number }
  matches: number
  recentReservations: ClubAdminReservation[]
}

/** Row of `GET /club-admin/:clubId/matches` */
export type ClubAdminMatch = Pick<
  Tables<'matches'>,
  'id' | 'type' | 'status' | 'is_ranked' | 'score_team1' | 'score_team2' | 'winner_team' | 'created_at'
> & {
  reservation: {
    start_time: string
    end_time: string
    court: Pick<Tables<'courts'>, 'id' | 'name'> | null
  } | null
  players: Array<{ team: number | null; user: PersonRef | null }>
}

/** Row of `GET /club-admin/:clubId/tournaments` */
export type ClubAdminTournament = Pick<
  Tables<'tournaments'>,
  | 'id'
  | 'name'
  | 'format'
  | 'status'
  | 'max_teams'
  | 'entry_fee'
  | 'prize_pool'
  | 'start_date'
  | 'end_date'
  | 'created_at'
> & { teams: Array<{ count: number }> }

/** `GET /club-admin/:clubId` (and the body returned by `PATCH`). */
export type ClubAdminClub = Pick<
  Tables<'clubs'>,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'address'
  | 'city'
  | 'phone'
  | 'email'
  | 'logo_url'
  | 'cover_url'
  | 'lat'
  | 'lng'
  | 'is_active'
  | 'status'
  | 'legal_name'
  | 'tax_id'
  | 'created_at'
  | 'updated_at'
> & { opening_hours: OpeningHours }

/** Weekly opening hours draft (`clubs.settings.opening_hours`). A day with no key or no interval is closed. */
export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type Weekday = (typeof WEEKDAYS)[number]
export interface OpeningInterval {
  /** `HH:MM` */
  open: string
  /** `HH:MM` or `24:00` */
  close: string
}
export type OpeningHours = Partial<Record<Weekday, OpeningInterval[]>>

/** Body of `PATCH /club-admin/:clubId` (at least one field). */
export type ClubAdminClubUpdate = Partial<
  Pick<
    Tables<'clubs'>,
    | 'name'
    | 'description'
    | 'address'
    | 'city'
    | 'phone'
    | 'email'
    | 'logo_url'
    | 'cover_url'
    | 'lat'
    | 'lng'
    | 'legal_name'
    | 'tax_id'
  >
> & { opening_hours?: OpeningHours }

/** Body of `POST /me/clubs` */
export interface MyClubCreate {
  name: string
  address: string
  city: string
}

export type CourtSurface = Enums<'court_surface'>

/** Row of `GET /club-admin/:clubId/courts` and the body returned by court create/update. */
export type ClubAdminCourt = Pick<
  Tables<'courts'>,
  'id' | 'club_id' | 'name' | 'surface' | 'is_indoor' | 'price_per_hour' | 'is_active' | 'created_at' | 'updated_at'
>

/** Body of `POST /club-admin/:clubId/courts` */
export interface ClubAdminCourtCreate {
  name: string
  surface: CourtSurface
  is_indoor?: boolean
  price_per_hour: number
  is_active?: boolean
}

/** Body of `PATCH /club-admin/:clubId/courts/:id` (at least one field). */
export type ClubAdminCourtUpdate = Partial<ClubAdminCourtCreate>

/** `warning` of a court PATCH that deactivates a court with upcoming pending/confirmed reservations. */
export interface CourtWarning {
  code: 'COURT_HAS_FUTURE_RESERVATIONS'
  future_reservations: number
}

/** Result of `PATCH /club-admin/:clubId/courts/:id`: the court plus an optional warning. */
export type ClubAdminCourtUpdateResult = ClubAdminCourt & { warning: CourtWarning | null }

// ---------------------------------------------------------------------------
// Schedules, exceptions, price rules and preview (card #70, Admin F2).
// `day_of_week` is 0 = Sunday ... 6 = Saturday; times are club-local `HH:MM` (`24:00` allowed as a close).
// ---------------------------------------------------------------------------

export type SlotMinutes = 30 | 60 | 90 | 120
export const SLOT_MINUTES_OPTIONS: readonly SlotMinutes[] = [30, 60, 90, 120]

/** One weekly interval of a court. */
export type CourtScheduleInterval = Pick<
  Tables<'court_schedules'>,
  'day_of_week' | 'open_time' | 'close_time'
> & { slot_minutes: SlotMinutes }

/** `GET`/`PUT /club-admin/:clubId/courts/:courtId/schedule`. `club` = inherited from the club's opening hours. */
export interface CourtSchedule {
  court_id: string
  source: 'court' | 'club' | 'none'
  intervals: CourtScheduleInterval[]
}

/** Body of `PUT .../courts/:courtId/schedule` (replaces the whole weekly schedule). */
export interface CourtScheduleReplace {
  intervals: CourtScheduleInterval[]
}

/** Row of `GET /club-admin/:clubId/schedule-exceptions` (`court_id` null = the whole club). */
export type ScheduleException = Pick<
  Tables<'court_schedule_exceptions'>,
  | 'id'
  | 'club_id'
  | 'court_id'
  | 'date'
  | 'closed'
  | 'open_time'
  | 'close_time'
  | 'slot_minutes'
  | 'reason'
  | 'created_by'
  | 'created_at'
>

/** Body of `POST /club-admin/:clubId/schedule-exceptions`. */
export interface ScheduleExceptionCreate {
  date: string
  /** Inclusive end of a range (max 92 days). */
  date_to?: string
  court_id?: string | null
  closed?: boolean
  open_time?: string
  close_time?: string
  slot_minutes?: SlotMinutes
  reason?: string | null
}

export interface ScheduleExceptionWarning {
  code: 'EXCEPTION_HAS_RESERVATIONS'
  affected_reservations: number
}

export interface ScheduleExceptionCreateResult {
  exceptions: ScheduleException[]
  warning: ScheduleExceptionWarning | null
}

/** Price rule as stored. */
export type PriceRule = Pick<
  Tables<'court_price_rules'>,
  'id' | 'name' | 'days_of_week' | 'start_time' | 'end_time' | 'price_per_hour' | 'priority' | 'is_active'
>

/** Rule in the body of `PUT .../price-rules` (no `id`; `priority` and `is_active` have defaults). */
export type PriceRuleInput = Omit<PriceRule, 'id'>

/** `GET`/`PUT /club-admin/:clubId/courts/:courtId/price-rules` */
export interface CourtPriceRules {
  court_id: string
  base_price_per_hour: number
  rules: PriceRule[]
}

export interface CourtPriceRulesReplace {
  rules: PriceRuleInput[]
}

/** Slot of `GET /club-admin/:clubId/courts/:courtId/preview`. `start`/`end` are club-local `HH:MM`. */
export interface CourtPreviewSlot {
  start_time: string
  end_time: string
  start: string
  end: string
  slot_minutes: number
  price_per_hour: number
  price: number
  rule_id: string | null
  rule_name: string | null
}

export interface CourtPreview {
  court_id: string
  date: string
  day_of_week: number
  source: 'court_exception' | 'club_exception' | 'court_schedule' | 'club_hours' | 'none'
  closed: boolean
  closed_reason: string | null
  base_price_per_hour: number
  slots: CourtPreviewSlot[]
}

// ---------------------------------------------------------------------------
// Public availability (players app). Prices come from the API: `price` is the total of the slot.
// ---------------------------------------------------------------------------

/** Item of `GET /courts/:courtId/slots?date=` */
export interface CourtSlot {
  start_time: string
  end_time: string
  available: boolean
  price_per_hour: number
  price: number
}

/** Court entry inside a slot of `GET /clubs/:clubId/availability?date=` */
export interface ClubAvailabilityCourt {
  court_id: string
  name: string
  surface: CourtSurface
  is_indoor: boolean
  /** Hourly rate applied at this slot (price rule, else the court's base price). */
  price_per_hour: number
  /** Total of the slot for this court. */
  price: number
}

/** Item of `GET /clubs/:clubId/availability?date=` */
export interface ClubAvailabilitySlot {
  start_time: string
  end_time: string
  /** Lowest hourly rate among the free courts. */
  min_price: number
  /** Lowest total of the slot among the free courts ("desde"). */
  min_total_price: number
  courts: ClubAvailabilityCourt[]
}

/** 409 codes of `POST /reservations` and `POST /matches` added by card #70. */
export type BookingScheduleErrorCode = 'OUTSIDE_SCHEDULE' | 'COURT_CLOSED'

export type ClubDocumentKind = 'tax_id' | 'company_registration' | 'id_document' | 'other'

/** Document of an application, with a signed URL that expires in 10 minutes (`url` can be null). */
export type ClubAdminDocument = Pick<
  Tables<'club_documents'>,
  'id' | 'file_name' | 'mime_type' | 'size_bytes' | 'uploaded_by' | 'created_at'
> & { kind: ClubDocumentKind; url: string | null }

export type OnboardingStepKey = 'club' | 'location' | 'contact' | 'courts' | 'schedule' | 'documents'

export interface OnboardingStep {
  key: OnboardingStepKey
  complete: boolean
  /** Field codes still missing, e.g. `name`, `coordinates`, `active_court_with_price`, `opening_hours`, `document`. */
  missing: string[]
}

/** Entry of the status history of a club (newest first). */
export interface ClubStatusHistoryEntry {
  id: string
  from_status: ClubStatus | null
  to_status: ClubStatus
  note: string | null
  created_at: string
  actor: Pick<Tables<'users'>, 'id' | 'first_name' | 'last_name'> | null
}

/** `GET /club-admin/:clubId/onboarding` */
export interface ClubOnboarding {
  status: ClubStatus
  steps: OnboardingStep[]
  canSubmit: boolean
  history: ClubStatusHistoryEntry[]
  documents: ClubAdminDocument[]
}

/** `details` of a `422 APPLICATION_INCOMPLETE` from `POST /club-admin/:clubId/submit`. */
export interface ApplicationIncompleteDetails {
  /** `<step>.<field>` codes, e.g. `club.tax_id`. */
  missing: string[]
  steps: OnboardingStep[]
}

/** `GET /club-admin/:clubId/documents/:id/url` and `GET /platform/clubs/:clubId/documents/:id/url` */
export interface DocumentUrl {
  url: string
  expiresIn: number
}

// ---------------------------------------------------------------------------
// Application review (card #68, Admin F1): `/platform/applications*` and the club lifecycle
// actions under `/platform/clubs/:clubId`.
// ---------------------------------------------------------------------------

/** `status` of `GET /platform/applications`: one club status, or `all`. */
export type ApplicationStatusFilter = ClubStatus | 'all'

/** Owner of an application (the first owner registered for the club). */
export type ApplicationOwner = Pick<Tables<'users'>, 'id' | 'first_name' | 'last_name'> & {
  email: string | null
}

/** Row of `GET /platform/applications`. `submitted_at` is the last transition to `pending`. */
export type ApplicationListRow = Pick<
  Tables<'clubs'>,
  'id' | 'name' | 'city' | 'legal_name' | 'tax_id' | 'status'
> & {
  owner: ApplicationOwner | null
  submitted_at: string | null
  documents_count: number
}

/** `GET /platform/applications/:clubId`. Each document carries a signed `url` valid `documents_expires_in` seconds. */
export interface ApplicationDetail {
  club: ClubAdminClub
  owner: ApplicationOwner | null
  courts: ClubAdminCourt[]
  documents: ClubAdminDocument[]
  history: ClubStatusHistoryEntry[]
  submitted_at: string | null
  documents_expires_in: number
}

/** `GET /platform/summary` */
export interface PlatformSummary {
  clubs: number
  courts: number
  reservations: number
  pendingReservations: number
  matches: number
  users: number
  recentReservations: PlatformReservation[]
}

export type PlatformReservation = Omit<ClubAdminReservation, 'court'> & {
  court: { id: string; name: string; club: { id: string; name: string } | null }
}

/** Row of `GET /platform/clubs`, and the result of `POST /platform/clubs` and `PATCH /platform/clubs/:id/active`. */
export type PlatformClub = Pick<
  Tables<'clubs'>,
  | 'id'
  | 'name'
  | 'slug'
  | 'description'
  | 'address'
  | 'city'
  | 'phone'
  | 'email'
  | 'logo_url'
  | 'is_active'
  | 'status'
  | 'legal_name'
  | 'tax_id'
  | 'created_at'
  | 'updated_at'
>

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
  'id' | 'username' | 'first_name' | 'last_name' | 'role' | 'is_active' | 'created_at'
> & { email: string | null }

/** Row of `GET /platform/audit-log` */
export interface AuditLogEntry {
  id: string
  actor_id: string | null
  club_id: string | null
  action: string
  entity: string | null
  entity_id: string | null
  metadata: Json | null
  created_at: string
  actor: PersonRef | null
  club: { id: string; name: string } | null
}
