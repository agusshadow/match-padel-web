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

/**
 * `meta` of `GET /courts/:courtId/slots` and `GET /clubs/:clubId/availability` (card #75).
 * `payments_enabled` is `false` only when the club collects on its own Mercado Pago account and
 * has no usable link: paid reservations and matches then answer 409 `CLUB_PAYMENTS_NOT_ENABLED`.
 */
export interface PaymentsAvailabilityMeta {
  payments_enabled: boolean
  /** Card #76: the club's effective refund policy; `null` if the club cannot be resolved (slots). */
  refund_policy?: RefundPolicyValues | null
}

/** A list of slots together with the `meta.payments_enabled` flag. */
export interface WithPaymentsMeta<T> {
  items: T
  payments_enabled: boolean
  /** Card #76: the club's effective refund policy (`null` when the API did not send it). */
  refund_policy: RefundPolicyValues | null
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

/**
 * Row of `GET /platform/clubs` for a superadmin: the club plus its charging settings (card #75).
 * A reviewer never receives these fields (and cannot open the clubs list anyway).
 */
export type PlatformClubRow = PlatformClub & ClubChargingSettings

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

// ---------------------------------------------------------------------------
// Club calendar, move / cancel and blocks (card #71, Admin F2)
// ---------------------------------------------------------------------------

export type MatchType = Enums<'match_type'>

/** Row of `court_blocks` as `GET /calendar`, `GET /blocks` and `POST /blocks` return it. */
export type CourtBlock = Tables<'court_blocks'>

/** `unpaid`: nothing approved; `partial`: less than the total; `paid`; `refunded`: only refunded payments. */
export type CalendarPaymentStatus = 'unpaid' | 'partial' | 'paid' | 'refunded'

/** A contiguous open window of a court on one club-local day. `start`/`end` are club-local `HH:MM`, `*_time` are UTC instants. */
export interface CalendarOpenWindow {
  start_time: string
  end_time: string
  start: string
  end: string
  slot_minutes: SlotMinutes
}

export interface CalendarDay {
  /** Club-local `YYYY-MM-DD`. */
  date: string
  day_of_week: number
  closed: boolean
  closed_reason: string | null
  source: string
  open_hours: CalendarOpenWindow[]
}

export interface CalendarReservation {
  id: string
  status: Exclude<ReservationStatus, 'cancelled'>
  start_time: string
  end_time: string
  user: Pick<Tables<'users'>, 'id' | 'first_name' | 'last_name' | 'username'> | null
  total_price: number
  payment: { status: CalendarPaymentStatus; paid_amount: number }
  match: Pick<Tables<'matches'>, 'id' | 'type' | 'is_ranked' | 'status'> | null
  /** Confirmed players of the linked match; null for a plain reservation. */
  players_count: number | null
}

export interface CalendarCourt {
  court: Pick<Tables<'courts'>, 'id' | 'name' | 'surface' | 'is_indoor' | 'is_active'>
  days: CalendarDay[]
  reservations: CalendarReservation[]
  blocks: CourtBlock[]
}

/** `GET /club-admin/:clubId/calendar?from=&to=&courtId=` */
export interface ClubCalendar {
  from: string
  to: string
  timezone: string
  courts: CalendarCourt[]
}

/** Body of `PATCH /club-admin/:clubId/reservations/:id/move`. `court_id` omitted keeps the court. */
export interface ReservationMove {
  court_id?: string
  start_time: string
  end_time: string
}

/** `refund` of a club cancellation: payments seen, refunded, those MercadoPago rejected and the amount returned. */
export interface ReservationRefund {
  payments: number
  refunded: number
  failed: string[]
  amount_refunded: number
}

/** Result of `POST /club-admin/:clubId/reservations/:id/cancel` (and of `PATCH` with `cancelled`). */
export type ReservationCancelResult = ClubAdminReservation & {
  refund: ReservationRefund
  match: { id: string; status: MatchStatus } | null
}

/** Body of `POST /club-admin/:clubId/blocks`. */
export interface CourtBlocksCreate {
  court_ids: string[]
  start_time: string
  end_time: string
  reason?: string | null
}

/** One entry of `details.conflicts` of a 409 `BLOCK_CONFLICTS`. */
export type BlockConflict =
  | {
      type: 'reservation'
      id: string
      court_id: string
      start_time: string
      end_time: string
      status: ReservationStatus
      user: Pick<Tables<'users'>, 'id' | 'first_name' | 'last_name' | 'username'> | null
      match_id: string | null
    }
  | {
      type: 'block'
      id: string
      court_id: string
      start_time: string
      end_time: string
      reason: string | null
    }

/** Error codes of move, cancel and block creation the panel shows a specific message for. */
export type CalendarErrorCode =
  | 'CANNOT_MOVE'
  | 'COURT_INACTIVE'
  | 'OUTSIDE_SCHEDULE'
  | 'COURT_CLOSED'
  | 'COURT_BLOCKED'
  | 'SLOT_TAKEN'
  | 'CANNOT_CANCEL'
  | 'MATCH_COMPLETED'
  | 'BLOCK_CONFLICTS'

// ---------------------------------------------------------------------------
// Club team and invitations (card #72, Admin F2): `/club-admin/:clubId/team*`,
// `GET /invitations/preview` and `POST /me/invitations/accept`.
// ---------------------------------------------------------------------------

/** Roles an owner can hand out; `owner` is never invitable. */
export type InvitableRole = Exclude<Enums<'staff_role'>, 'owner'>

/** Member of `GET /club-admin/:clubId/team` (and the result of `PATCH .../team/members/:userId`). `email` comes from Supabase Auth. */
export type TeamMember = Pick<Tables<'users'>, 'first_name' | 'last_name' | 'username'> & {
  user_id: string
  email: string | null
  role: Enums<'staff_role'>
  /** When the person joined the club. */
  created_at: string
}

/** Open invitations are listed as `pending` or `expired`; revoke answers `revoked`; accepted ones are never listed. */
export type TeamInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export interface TeamInvitation {
  id: string
  email: string
  role: InvitableRole
  status: TeamInvitationStatus
  expires_at: string
  created_at: string
  invited_by: string | null
}

/** `GET /club-admin/:clubId/team` */
export interface ClubTeam {
  members: TeamMember[]
  invitations: TeamInvitation[]
}

/** `POST /club-admin/:clubId/team/invitations` and `.../invitations/:id/resend`. `email_sent` is false when the mail was not delivered. */
export type TeamInvitationSent = TeamInvitation & { email_sent: boolean }

/** Body of `POST /club-admin/:clubId/team/invitations`. */
export interface TeamInvitationCreate {
  email: string
  role: InvitableRole
}

/** `GET /invitations/preview?token=` (public). */
export interface InvitationPreview {
  club_name: string
  role: InvitableRole
  /** Masked address, e.g. `m***@gmail.com`. */
  email_hint: string
  expired: boolean
}

/** `POST /me/invitations/accept` */
export interface InvitationAccepted {
  clubId: string
  role: Enums<'staff_role'>
}

export type TeamErrorCode =
  | 'ALREADY_MEMBER'
  | 'INVITATION_ALREADY_PENDING'
  | 'INVITATION_LIMIT'
  | 'INVITATION_ALREADY_ACCEPTED'
  | 'INVITATION_REVOKED'
  | 'CANNOT_MODIFY_OWNER'
  | 'CANNOT_MODIFY_SELF'
  | 'INVITATION_INVALID'
  | 'INVITATION_EMAIL_MISMATCH'
  | 'EMAIL_NOT_CONFIRMED'
  | 'INVITATION_EXPIRED'

// ---------------------------------------------------------------------------
// Gamification catalogs (card #78, Admin F5): `/platform/catalogs/*` (superadmin)
// and the `cosmetic`/`equipped` shapes the player app reads.
// Rows come from the generated Supabase types; only `condition` is narrowed.
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_CONDITION_TYPES = ['matches_played', 'wins'] as const
export type AchievementConditionType = (typeof ACHIEVEMENT_CONDITION_TYPES)[number]
export interface AchievementCondition {
  type: AchievementConditionType
  count: number
}

export type ChallengeCadence = Enums<'challenge_cadence'>
export type ChallengeAction = Enums<'challenge_action'>
export type CosmeticType = Enums<'cosmetic_type'>

export type CatalogAchievement = Omit<Tables<'achievements'>, 'condition'> & { condition: AchievementCondition }
export type CatalogChallenge = Tables<'challenges'>
export type CatalogCosmetic = Tables<'cosmetics'>

/** `usage` of the single-item responses (`GET /catalogs/<entity>/:id`, create, patch, activate). */
export interface AchievementUsage {
  owners_count: number
}
export interface ChallengeUsage {
  assignments_count: number
  active_assignments_count: number
}
export interface CosmeticUsage {
  owners_count: number
}

export type CatalogAchievementDetail = CatalogAchievement & { usage: AchievementUsage }
export type CatalogChallengeDetail = CatalogChallenge & { usage: ChallengeUsage }
export type CatalogCosmeticDetail = CatalogCosmetic & { usage: CosmeticUsage }

/** Body of `POST /platform/catalogs/achievements`. */
export interface CatalogAchievementCreate {
  code: string
  name: string
  description: string
  icon: string
  points?: number
  condition: AchievementCondition
  is_active?: boolean
}
/** Body of `PATCH /platform/catalogs/achievements/:id` (at least one field; never `code` or `is_active`). */
export type CatalogAchievementUpdate = Partial<Omit<CatalogAchievementCreate, 'code' | 'is_active'>>

/** Body of `POST /platform/catalogs/challenges`. */
export interface CatalogChallengeCreate {
  code: string
  name: string
  description: string
  cadence: ChallengeCadence
  action_type: ChallengeAction
  target_count: number
  reward_xp?: number
  reward_currency?: number
  is_active?: boolean
}
export type CatalogChallengeUpdate = Partial<Omit<CatalogChallengeCreate, 'code' | 'is_active'>>

/** Body of `POST /platform/catalogs/cosmetics`. */
export interface CatalogCosmeticCreate {
  code: string
  name: string
  description: string
  type: CosmeticType
  image_url: string
  price_currency: number
  is_active?: boolean
}
export type CatalogCosmeticUpdate = Partial<Omit<CatalogCosmeticCreate, 'code' | 'is_active'>>

/** `POST /platform/catalogs/assets` */
export interface CatalogAsset {
  url: string
  path: string
  content_type: string
  size_bytes: number
}

/** `details` of a 409 `CATALOG_FIELD_LOCKED`. */
export interface CatalogFieldLockedDetails {
  fields: string[]
  usage: Record<string, number>
}

/** One entry of `details` of a 400 `VALIDATION_ERROR`. */
export interface ValidationErrorDetail {
  field: string
  message: string
}

export type CatalogErrorCode = 'CODE_ALREADY_EXISTS' | 'CATALOG_FIELD_LOCKED' | 'COSMETIC_INACTIVE'

/**
 * `GET /marketplace/equipped`: the three equipped ids plus, since card #78, the cosmetic itself per
 * slot (also when it was deactivated after being equipped), or `null`.
 */
export type EquippedCosmeticItem = Pick<
  Tables<'cosmetics'>,
  'id' | 'code' | 'name' | 'description' | 'type' | 'image_url' | 'price_currency'
>

// ---------------------------------------------------------------------------
// Club Mercado Pago account (card #74, Admin F3). Hand-written: not in Swagger.
// ---------------------------------------------------------------------------

/** Effective status of a club's Mercado Pago link (derived by the API on every read). */
export type MpAccountStatus = 'connected' | 'expiring' | 'expired' | 'revoked' | 'error'

/** `GET /club-admin/:clubId/mercadopago`. Not linked: `connected: false` and every other field `null`. Never tokens. */
export interface ClubMpAccount {
  connected: boolean
  status: MpAccountStatus | null
  mp_user_id: string | null
  expires_at: string | null
  days_left: number | null
  live_mode: boolean | null
  last_refresh_at: string | null
  last_error: string | null
}

/** `POST /club-admin/:clubId/mercadopago/connect`: where the browser goes to authorize. */
export interface ClubMpConnect {
  authorization_url: string
}

/** `DELETE /club-admin/:clubId/mercadopago` (idempotent). */
export interface ClubMpDisconnect {
  disconnected: true
  was_connected: boolean
}

/** `status` query param of the panel URL the API redirects the browser to after the OAuth callback. */
export type MpCallbackStatus = 'connected' | 'error'

/** `reason` query param when `status=error`. */
export type MpCallbackFailureReason =
  | 'access_denied'
  | 'invalid_request'
  | 'invalid_state'
  | 'state_expired'
  | 'state_used'
  | 'club_not_available'
  | 'not_owner'
  | 'exchange_failed'
  | 'storage_failed'

export type MpErrorCode = 'MP_NOT_CONFIGURED'

// ---------------------------------------------------------------------------
// Charges with a commission per club (card #75, Admin F3). Hand-written: not in Swagger.
// ---------------------------------------------------------------------------

/** Which Mercado Pago account collects a club's charges. */
export type CollectionMode = 'platform_account' | 'club_account'

/** Charging settings of a club, as the superadmin sees them in the platform panel. */
export interface ClubChargingSettings {
  /** 0..100, at most 2 decimals. Applies to charges created from then on. */
  commission_percent: number
  collection_mode: CollectionMode
  /** The club has a linked Mercado Pago account that is neither expired nor revoked. */
  mp_connected: boolean
}

/** Result of `PATCH /platform/clubs/:clubId/commission` and `.../collection-mode`. */
export type ClubChargingSummary = ClubChargingSettings & { id: string; name: string }

/** Body of `PATCH /platform/clubs/:clubId/commission`. */
export interface ClubCommissionUpdate {
  commission_percent: number
}

/** Body of `PATCH /platform/clubs/:clubId/collection-mode`. */
export interface ClubCollectionModeUpdate {
  collection_mode: CollectionMode
}

/** Where a payment was collected: the platform's account or the club's own. */
export type PaymentCollectedVia = 'platform' | 'club'

/**
 * Row of `GET /platform/payments` and `GET /club-admin/:clubId/payments`.
 * `commission_percent` is the rate frozen at charge time (`null` on rows written before card #75).
 */
export type PaymentRow = Pick<
  Tables<'payments'>,
  'id' | 'created_at' | 'status' | 'amount' | 'currency' | 'mp_payment_id' | 'reservation_id' | 'commission_percent'
> & {
  /** Never null: 0 for payments collected by the platform or written before card #75. */
  marketplace_fee: number
  /** Never null: amount minus fee, before Mercado Pago's own processing fee. */
  net_amount: number
  collected_via: PaymentCollectedVia
  seller_mp_user_id: string | null
  club: { id: string; name: string } | null
}

/** `meta.totals` of the payments listings: approved payments of the whole filter, not just the page. */
export interface PaymentTotals {
  gross: number
  fee: number
  net: number
}

/** Payments page as the API clients return it: the rows, the pagination and the totals. */
export interface PaymentsPage {
  items: PaymentRow[]
  meta: NonNullable<ApiResponse['meta']>
  totals: PaymentTotals
}

/** 409 code of `POST /reservations`, `POST /matches` and `POST /payments/preference` (card #75). */
export type ClubPaymentsErrorCode = 'CLUB_PAYMENTS_NOT_ENABLED'

// ---------------------------------------------------------------------------
// Refund policy per club within platform limits (card #76, Admin F3).
// Hand-written: not in Swagger. See match-padel-api `docs/refund-policy.md`.
// ---------------------------------------------------------------------------

/**
 * A club's refund policy: cancelling at least `hours_before_start` hours before the start refunds 100%;
 * cancelling later (but before the start) refunds `late_refund_percent` of what was paid, in money;
 * once the turn started nothing is refunded. This is what players see: `refund_policy` of the club
 * detail and of `meta` in the availability / slots responses (already clamped to the platform limits).
 */
export interface RefundPolicyValues {
  /** Integer, 0..720. */
  hours_before_start: number
  /** 0..100, at most 2 decimals. */
  late_refund_percent: number
}

/** Limits set by the platform: `hours_before_start <= max_hours_before_start`, `late_refund_percent >= min_late_refund_percent`. */
export interface RefundPolicyLimits {
  max_hours_before_start: number
  min_late_refund_percent: number
}

/** `GET` and `PUT /club-admin/:clubId/refund-policy`. */
export interface ClubRefundPolicy extends RefundPolicyValues {
  /** What applies to players today: the stored policy clamped to the current platform limits. */
  effective: RefundPolicyValues
  /** `true` when the stored policy is outside the platform limits (so `effective` differs from it). */
  clamped: boolean
  limits: RefundPolicyLimits
}

/** Body of `PUT /club-admin/:clubId/refund-policy`. */
export type ClubRefundPolicyUpdate = RefundPolicyValues

/** Field of a refund policy a platform limit can be violated on. */
export type RefundPolicyViolation = keyof RefundPolicyValues

/** `details` of the 409 `POLICY_BELOW_PLATFORM_MINIMUM` of `PUT /club-admin/:clubId/refund-policy`. */
export interface PolicyBelowMinimumDetails {
  limits: RefundPolicyLimits
  requested: RefundPolicyValues
  violations: RefundPolicyViolation[]
}

/** 409 code of `PUT /club-admin/:clubId/refund-policy`. */
export type RefundPolicyErrorCode = 'POLICY_BELOW_PLATFORM_MINIMUM'

/** `GET` and `PUT /platform/settings/refund-policy` (superadmin only). */
export interface PlatformRefundLimits extends RefundPolicyLimits {
  /** Clubs whose stored policy is outside these limits (their effective policy is clamped). */
  clubs_clamped: number
  /** `null` until the limits are edited for the first time. */
  updated_at: string | null
  updated_by: string | null
}

/** Body of `PUT /platform/settings/refund-policy`. */
export type PlatformRefundLimitsUpdate = RefundPolicyLimits

export type PlayerRefundStatus = 'refunded' | 'partial' | 'none' | 'pending'
export type PlayerRefundReason = 'before_cutoff' | 'late_window' | 'after_start'

/**
 * `refund` of `DELETE /matches/:id`, `DELETE /matches/:id/leave` and `DELETE /reservations/:id`
 * (`null` when nothing was paid). `pending`: owed but the club's Mercado Pago account could not pay
 * it yet; the cancellation went through.
 */
export interface PlayerRefundResult {
  status: PlayerRefundStatus
  reason: PlayerRefundReason
  percent: number
  amount_paid: number
  amount_refunded: number
  amount_pending: number
  refund_pending: boolean
  policy: RefundPolicyValues
}

/** `data` of `DELETE /matches/:id/leave`. `currencyCredited` is always 0 (kept for old clients). */
export interface MatchLeaveResult {
  refunded: boolean
  currencyCredited: number
  refund: PlayerRefundResult | null
}
