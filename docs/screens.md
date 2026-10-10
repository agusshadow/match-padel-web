# Screens — match-padel-web

Inventory of what exists in the code today, read from `apps/*/src/App.tsx` and the feature folders. This is a snapshot of the **real state**; the target rules live in [architecture.md](./architecture.md), [conventions.md](./conventions.md) and CLAUDE.md ('Real state vs. target'). Update this file when routes or endpoints change.

All API paths below are relative to `VITE_API_URL` (which includes `/api/v1`). All feature paths are relative to `apps/<app>/src/features/`.

---

## `apps/app` — player PWA

Routes are declared in `apps/app/src/App.tsx`. Protected routes are nested in `ProtectedRoute` (`src/shared/components/ProtectedRoute.tsx`), which runs `useAuthInit()`, redirects to `/auth` when not authenticated, redirects to `/complete-profile` when `isProfileIncomplete(user)` (e.g. a first-time Google sign-in that never went through the registration form), and redirects to `/onboarding` when authenticated but `user.onboarding_completed_at` is falsy (except when already on `/onboarding` or `/complete-profile`). Routes marked "bottom nav" also render inside `AppLayout` (`src/shared/layouts/AppLayout.tsx`).

| Path | Page component | Access | Feature folder | API endpoints called |
|------|----------------|--------|----------------|----------------------|
| `/auth` | `AuthPage` | public (redirects to `/` if already authenticated) | `auth` | `POST /auth/login`, `POST /auth/register`; also offers "Continuar con Google" via `supabase.auth.signInWithOAuth` directly (not through the API) |
| `/verify-email` | `VerifyEmailPage` | public (redirects to `/` if already authenticated); reads `?email=` from the URL, redirects to `/auth` if missing | `auth` | None — confirms directly against Supabase with `supabase.auth.verifyOtp({ type: 'signup' })` (anon key), then `GET /auth/me` once confirmed. `POST /auth/register` sends users here instead of returning a session; `POST /auth/login` also redirects here on a `403 EMAIL_NOT_CONFIRMED` response |
| `/complete-profile` | `CompleteProfilePage` | protected | `auth` | `PUT /users/me` |
| `/` | `HomePage` | protected, bottom nav | `home` | `GET /reservations` (limit 3), `GET /matches` |
| `/matches` | `MatchesPage` | protected, bottom nav | `matches` | `GET /matches` |
| `/clubs` | `ClubesPage` (map/list toggle, map is the default view) | protected, bottom nav | `clubs` | `GET /clubs`. Map uses Leaflet + OpenStreetMap tiles (grayscale-filtered for a more minimalist look; no API key). Requests the browser's geolocation (`useUserLocation`) to center the map and sort the list by distance — falls back to the first club with coordinates (then Buenos Aires) if denied/unavailable, never blocks on it past the browser's own timeout. Markers only for clubs with `lat`/`lng` set. Tapping a club (marker popup or list row) navigates to `/clubs/:id` |
| `/reservations` | `ReservationsPage` | protected, bottom nav | `reservations` | `GET /reservations` (limit 50); from `ReservationCard`: `DELETE /reservations/:id`, `POST /payments/preference` |
| `/tournaments` | `TournamentsPage` | protected, bottom nav | `tournaments` | `GET /tournaments` |
| `/profile` | `ProfilePage` | protected, bottom nav | `profile` | `GET /users/me/stats`, `POST /auth/logout` |
| `/onboarding` | `OnboardingPage` | protected | `onboarding` | `PUT /users/me` |
| `/matches/new` | `NewMatchPage` (3-step wizard: club → day/time slot → court, then match type + 1/4 payment summary — same club/slot/court pattern as `/reservations/new`, kept as its own local Zustand store instead of sharing `reservationStore` across features) | protected | `matches` (uses `clubs`) | `GET /clubs`, `GET /clubs/:id/availability?date=`, `POST /matches` (now takes `court_id`/`start_time`/`end_time` of a whole slot; the court price shown is the slot's `price`, the 1/4 share is `price / 4`; same 409 handling as reservations; returns `{ match, payment }` — redirects to `payment.init_point`/`sandbox_init_point` instead of the match) |
| `/matches/join` | `JoinMatchPage` | protected | `matches` | `POST /matches/join/:lobbyUrl` (returns a checkout link, not the match — redirects to `init_point`/`sandbox_init_point`) |
| `/matches/:id` | `MatchDetailPage` — card #58: either team (re)submits its claimed result via `PUT /matches/:id/score`; confirms automatically once both teams agree, no separate accept step anymore. Card #59: renders `MatchChat` (polls every 5s while open, no realtime transport) for participants only | protected | `matches` | `GET /matches/:id`, `PUT /matches/:id/score`, `DELETE /matches/:id`, `GET/POST /matches/:id/chat` |
| `/profile/edit` | `EditProfilePage` | protected | `profile` | `PUT /users/me`, `POST /users/me/avatar` |
| `/profile/achievements` | `AchievementsPage` | protected | `achievements` | `GET /achievements`, `GET /achievements/me` |
| `/profile/challenges` | `ChallengesPage` (card #62) — grouped by cadence (daily/weekly/monthly/one-time), progress bar per challenge | protected | `challenges` | `GET /challenges/me` |
| `/marketplace` | `MarketplacePage` (card #63) — cosmetics catalog grouped by type, buy with currency or equip an owned item; "Comprar monedas" redirects to MercadoPago checkout for the currency pack | protected | `marketplace` | `GET /marketplace/cosmetics`, `GET /marketplace/cosmetics/me`, `GET /marketplace/equipped`, `GET /marketplace/balance`, `POST /marketplace/cosmetics/:id/purchase`, `POST /marketplace/cosmetics/:id/equip`, `POST /marketplace/currency/purchase` |
| `/profile/elo-history` | `EloHistoryPage` | protected | `profile` | `GET /users/me/elo-history` |
| `/profile/leaderboard` | `LeaderboardPage` (card #60) — players ranked by ELO, paginated, taps through to `/players/:username` | protected | `profile` | `GET /users/leaderboard` |
| `/players/:username` | `PublicProfilePage` (card #60) — avatar, name, ELO; uses the previously-unused `usePublicProfile` hook | protected | `profile` | `GET /users/:username` |
| `/reservations/new` | `NewReservationPage` (3-step wizard: club → day/time slot → court → confirm; time is chosen before the court, not after — see Trello card #47). Reads `?clubId=` — if present, the club is preselected and step 1 is skipped (arriving from `/clubs/:id`'s "Reservar cancha") | protected | `reservations` (uses `clubs`) | `GET /clubs`, `GET /clubs/:id` (when `?clubId=` is present), `GET /clubs/:id/availability?date=` (combined slot availability across the club's courts: slots come from each court's schedule; each court entry has `price_per_hour` and `price` = the slot's total, and the slot has `min_total_price` for the "desde" label), `POST /reservations` (always one whole slot, `start_time`/`end_time` taken from the chosen slot; the summary shows the court's `price` for that slot, never rate x duration). 409 `OUTSIDE_SCHEDULE` / `COURT_CLOSED` show a translated message (`reservations.errors.*`, `src/lib/booking-errors.ts`) and refresh the availability |
| `/clubs/:id` | `ClubDetailPage` | protected | `clubs` | `GET /clubs/:id` (cover photo, name, description, address, courts). "Reservar cancha" navigates to `/reservations/new?clubId=:id` |
| `/reservations/:id` | `PaymentResultPage` (reads `?payment=success\|failure\|pending`, MercadoPago's `back_urls` target) — its shown state now comes from the reservation's real status (`GET /reservations/:id`), falling back to the URL param only while that loads | protected | `reservations` | `GET /reservations/:id` (invalidates the reservations queries) |
| `/reservations/:id/detail` | `ReservationDetailPage` (renders `ReservationCard` with the full reservation) — real reservation detail screen; `PaymentResultPage`'s "Ver reserva" links here instead of back to itself | protected | `reservations` | `GET /reservations/:id` |
| `/notifications` | `NotificationsPage` | protected | `notifications` | `GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all` |
| `/tournaments/new` | `CreateTournamentPage` | protected | `tournaments` | `POST /tournaments` |
| `/tournaments/:id` | `TournamentDetailPage` | protected | `tournaments` | `GET /tournaments/:id`, `POST /tournaments/:id/teams`, `DELETE /tournaments/:id/teams/me`, `POST /tournaments/:id/start` |
| `*` | redirect to `/` | — | — | — |

Other calls that are not tied to a route: the notification bell in `AppLayout` polls `GET /notifications/unread-count` every 60 s; `useAuthInit` calls `GET /auth/me` on load; `useMarkAsRead`/`useMarkAllAsRead` live in `features/notifications/hooks/useNotifications.ts` (which calls `api` directly, with no service/api file).

Supabase from the browser in `apps/app`: only auth (`getSession`, `setSession`, `refreshSession`, `signOut`, `onAuthStateChange`). No table queries and no `supabase.channel()`.

### Features in `apps/app`

| Feature | `api/` | `services/` | `components/` | `hooks/` | `store/` | `index.ts` |
|---------|:------:|:-----------:|:-------------:|:--------:|:--------:|:----------:|
| `auth` | yes (`auth.api.ts`) | yes (`authService.ts`, unused) | yes (`AuthPage`) | yes (`useAuth.ts`) | yes (`auth.store.ts`, `authStore.ts`) | yes |
| `clubs` | no | yes (`clubService.ts`) | no | yes (`useClubes.ts`) | no | no |
| `home` | no | no | yes (`HomePage`) | no | no | no |
| `matches` | no | yes (`matchService.ts`) | yes (5 files) | yes (`useMatches.ts`) | no | no |
| `notifications` | no | no (axios inside the hooks) | yes (`NotificationsPage`) | yes (`useNotifications.ts`) | no | no |
| `onboarding` | yes (`onboarding.api.ts`) | no | yes (`OnboardingPage`) | yes (`useOnboarding.ts`) | no | yes |
| `profile` | no | yes (`profileService.ts`) | yes (2 files) | yes (`useProfile.ts`) | no | no |
| `reservations` | no | yes (`reservationService.ts`) | yes (4 files) | yes (`useReservations.ts`) | yes (`reservationStore.ts`, booking wizard) | no |
| `tournaments` | no | yes (`tournamentService.ts`) | yes (3 files) | yes (`useTournaments.ts`) | no | no |

Other app-level code: `src/shared/` (`ProtectedRoute`, `AppLayout`), `src/lib/ (`axios.ts`, `supabase.ts`, `query-client.ts`), `src/i18n/` and `src/i18n.ts`.

---

## `apps/admin` — club panel

Rebuilt in card #66 (Admin F0). The directory keeps the name `apps/admin` (and the Vercel project `match-padel-admin` keeps pointing at it) but the app is now the **club panel**: club owner, administrators and reception. Platform-wide screens (all clubs, all users) moved to `apps/platform`.

Routes are declared in `apps/admin/src/App.tsx`. Sign-in uses `supabase.auth.signInWithPassword` (auth only), followed by `GET /me/access`. Any signed-in user may enter: one with no clubs lands on `/new-club` ("Empezá la solicitud de tu club"). `RequireAccess` (`src/shared/components/RequireAccess.tsx`) loads the access list on every load. `ClubLayout` (`src/shared/layouts/ClubLayout.tsx`) resolves `/:clubId` against the clubs returned by `/me/access` (unknown club: redirect to `/`), shows the club selector (with each club's status) and builds the sidebar by role and status. The last club used is remembered in `localStorage` (`match-padel-club-panel`).

**Club status gates the panel** (card #67, Admin F1): `/` and `/:clubId` open the dashboard of an `approved` club and the application (`/:clubId/onboarding`) of any other. The dashboard, reservations, matches, tournaments and club-data screens only exist for `approved` clubs (`RequireApprovedClub`); a superadmin can open any. Reception never sees the application.

Every API path is relative to `VITE_API_URL`; `:clubId` is the club in the URL.

| Path | Page component | Access | Feature folder | API endpoints called |
|------|----------------|--------|----------------|----------------------|
| `/login` | `LoginPage` (link to `/register`; an unconfirmed account is sent to `/register?verify=<email>`) | public (redirects to `/` when a session exists) | `auth` | Supabase `signInWithPassword`, then `GET /me/access` |
| `/register` | `RegisterPage`: step 1 account (names, username, email, phone, password), step 2 email code | public (redirects to `/` when a session exists) | `auth` | `POST /auth/register` (no session yet, no skill/hand); then, directly against Supabase, `verifyOtp({ type: 'signup' })` (opens the session) and `resend({ type: 'signup' })`; then `GET /me/access` |
| `/` | `ClubRedirect` | signed in | — | `GET /me/access`: last club used, else first approved, else first; no clubs: `/new-club` |
| `/clubs` | `MyClubsPage` (club selector: every club with status badge and role, "Agregar otro club") | signed in | `my-clubs` | `GET /me/access` |
| `/new-club` | `NewClubPage` ("Empezá la solicitud de tu club": name, address, city), continues on `/:clubId/onboarding` | signed in | `my-clubs` | `POST /me/clubs` (201, or 200 for an identical draft) |
| `/:clubId/onboarding` | `OnboardingPage`: wizard with steps club, location, contact, courts, schedule, documents and review/submit (`?step=`); per-step completeness, status banner, history timeline. Editable in `draft`, `changes_requested` (and `approved`); read-only in `pending`, `rejected`, `suspended` | owner, admin, superadmin (reception is redirected to the dashboard); submit: owner, superadmin | `onboarding` | `GET /club-admin/:clubId/onboarding` (status, steps with `missing`, `canSubmit`, `history`, `documents`), `GET` / `PATCH /club-admin/:clubId` (club, location, contact, `opening_hours`), `GET` / `POST` / `PATCH /:id` / `DELETE /:id /club-admin/:clubId/courts`, `POST` (multipart `file` + `kind`) / `DELETE /:id` / `GET /:id/url /club-admin/:clubId/documents`, `POST /club-admin/:clubId/submit` (422 `APPLICATION_INCOMPLETE` lists `details.missing`). The courts and schedule steps keep the draft model (court base price, club `opening_hours`) and point to the Courts area (`/:clubId/courts`) for per-court schedules and price bands once the club is approved |
| `/:clubId/dashboard` | `DashboardPage` | any role, club `approved` | `dashboard` | `GET /club-admin/:clubId/summary` |
| `/:clubId/reservations` | `ReservationsPage` (status filter, paginated; confirm / complete / cancel) | any role (reception included), club `approved` | `reservations` | `GET /club-admin/:clubId/reservations?status=&page=&limit=`, `PATCH /club-admin/:clubId/reservations/:id` |
| `/:clubId/matches` | `MatchesPage` (paginated) | owner, admin, superadmin (reception is redirected to the dashboard and the sidebar hides it), club `approved` | `matches` | `GET /club-admin/:clubId/matches?page=&limit=` |
| `/:clubId/tournaments` | `TournamentsPage` (paginated) | owner, admin, superadmin (same as matches), club `approved` | `tournaments` | `GET /club-admin/:clubId/tournaments?page=&limit=` |
| `/:clubId/courts` | `CourtsPage` (card #70): courts of the club with status; create / edit (name, surface, indoor, base price per hour, active) and activate / deactivate. Deactivating a court with upcoming reservations shows the API `warning` (`COURT_HAS_FUTURE_RESERVATIONS`, nothing is cancelled). Link to "Excepciones del club" | owner, admin, superadmin (reception: redirected to the dashboard and no sidebar entry, because `GET /courts` is owner/admin only), club `approved` | `courts` | `GET` / `POST /club-admin/:clubId/courts`, `PATCH /club-admin/:clubId/courts/:id` (result carries `warning`) |
| `/:clubId/courts/:courtId` | `CourtDetailPage` with four tabs (`?tab=schedule\|prices\|exceptions\|preview`). **Horario semanal**: per day several intervals (open, close, `24:00` allowed, slot 30/60/90/120), copy a day to other days, client validation mirroring the API (open < close, at least one whole slot per interval, no overlaps), shows whether the court inherits the club hours (`source: club`). **Precios**: price bands (name, days, start/end, price per hour, priority, active), base price fallback, client overlap hints and the same-priority tie check. **Excepciones**: closures / special hours of the club and of this court, by date or date range, with reason; shows the `EXCEPTION_HAS_RESERVATIONS` warning. **Vista previa**: date picker, effective slots with price and the applied band, closed state with reason | same as above | `courts` | `GET` / `PUT /club-admin/:clubId/courts/:courtId/schedule`, `GET` / `PUT /club-admin/:clubId/courts/:courtId/price-rules`, `GET /club-admin/:clubId/courts/:courtId/preview?date=`, `GET` / `POST /club-admin/:clubId/schedule-exceptions`, `DELETE /club-admin/:clubId/schedule-exceptions/:id` |
| `/:clubId/courts/exceptions` | `ClubExceptionsPage` ("Excepciones del club"): the same exceptions panel with a scope selector (whole club or one court) | same as above | `courts` | `GET` / `POST /club-admin/:clubId/schedule-exceptions`, `DELETE .../:id`, `GET /club-admin/:clubId/courts` |
| `/:clubId/club` | `ClubPage` (view and edit club data; read-only for reception) | any role, club `approved`; edit for owner, admin, superadmin | `club` | `GET /club-admin/:clubId`, `PATCH /club-admin/:clubId` |
| `*` | redirect to `/` (or to the club's home inside a club) | — | — | — |

Errors come from the API as `{ error: CODE, message, details? }` (no `success` field); `lib/errors.ts` exposes `getErrorMessage`, `getErrorStatus`, `getErrorCode`, `getErrorDetails` and `getErrorProblems` (the individual problems of a 400: `details.errors` strings or `{ field, message }` entries). People are shown with `personName()` from `@match-padel/ui` (first + last name, falling back to username).

Role labels shown in the UI: `owner` = Dueño, `admin` = Administrador, `staff` = Recepción, `superadmin` = Superadmin. Club status labels: `draft` = Borrador, `pending` = En revisión, `changes_requested` = Correcciones solicitadas, `approved` = Aprobado, `rejected` = Rechazado, `suspended` = Suspendido (`src/shared/permissions.ts`). Server-side permissions are the source of truth; the route guards and hidden actions are only a convenience.

### Features in `apps/admin`

| Feature | `api/` | `components/` | `hooks/` | `index.ts` |
|---------|:------:|:-------------:|:--------:|:----------:|
| `auth` | yes | yes (`LoginPage`, `RegisterPage`) | yes (`useAuth.ts`: session, access, sign in/out, register, verify email) | yes |
| `my-clubs` | yes | yes (`MyClubsPage`, `NewClubPage`) | yes | yes |
| `onboarding` | yes | yes (wizard steps, status banner, history timeline) | yes | yes |
| `dashboard` | yes | yes | yes | yes |
| `reservations` | yes | yes | yes | yes |
| `matches` | yes | yes | yes | yes |
| `tournaments` | yes | yes | yes | yes |
| `club` | yes | yes | yes | yes |
| `courts` | yes | yes (`CourtsPage`, `CourtDetailPage`, `ClubExceptionsPage`, schedule / prices / exceptions / preview tabs) | yes (`useCourts.ts`) | yes |

App-level code: `src/shared/` (`layouts/ClubLayout.tsx` and `PlainLayout.tsx`, `components/RequireAccess|RequireManagerRole|RequireApprovedClub|ClubRedirect|ClubIndexRedirect|MyClubsRoute|ClubStatusBadge`, `club-context.tsx`, `permissions.ts`), `src/lib/` (`axios.ts`, `supabase.ts` — auth only, `query-client.ts`, `errors.ts`) and `src/store/panel.store.ts` (persisted last club, sidebar open state). Supabase from the browser: only auth (`signInWithPassword`, `verifyOtp`, `resend`, `getSession`, `onAuthStateChange`, `signOut`; registration itself goes through `POST /auth/register`, never `signUp`). The access list (`GET /me/access`) lives in React Query, not in a store.

---

## `apps/platform` — platform panel

New in card #66 (Admin F0): the panel for the platform team (superadmin and reviewers). Vite dev server on port 5174. Same tooling and structure as `apps/admin`; it shares `@match-padel/ui` panel components (`LoginForm`, `PageHeader`, `StatCard`, `StatusBadge`, `Pagination`, `Notice`) and the response types in `@match-padel/types` (`src/api.ts`).

Sign-in uses Supabase auth, then `GET /me/access`; the user is rejected with a message unless `platformRole` is `superadmin` or `reviewer`. A reviewer only sees `/requests` and `/requests/:clubId` (the API only exposes `pending` and `changes_requested` applications to reviewers); any other route redirects there (`RequireSuperadmin`), and the sidebar only lists "Solicitudes" for them. The sidebar badge next to "Solicitudes" is the number of `pending` applications (`GET /platform/applications?status=pending&limit=1`, `meta.total`, refreshed every 60 s). Role labels: `superadmin` = Superadmin, `reviewer` = Revisor.

| Path | Page component | Access | Feature folder | API endpoints called |
|------|----------------|--------|----------------|----------------------|
| `/login` | `LoginPage` | public | `auth` | Supabase `signInWithPassword`, then `GET /me/access` |
| `/` | `HomeRedirect` | platform staff | — | `GET /me/access` (superadmin to `/dashboard`, reviewer to `/requests`) |
| `/dashboard` | `DashboardPage` (counters + recent reservations) | superadmin | `dashboard` | `GET /platform/summary` |
| `/clubs` | `ClubsPage` (server-side search, status filter, paginated; application-status and visibility columns; create dialog, activate/deactivate; per row "Ver solicitud", and Suspender (approved) / Reactivar (suspended) with a confirmation dialog) | superadmin | `clubs` | `GET /platform/clubs?search=&status=&page=&limit=`, `POST /platform/clubs`, `PATCH /platform/clubs/:id/active`, `POST /platform/clubs/:id/suspend` (`reason` 5..2000), `POST /platform/clubs/:id/unsuspend` (`note?`) |
| `/users` | `UsersPage` (search, paginated) | superadmin | `users` | `GET /platform/users?search=&page=&limit=` |
| `/audit-log` | `AuditLogPage` (filter by club and by actor user id, paginated) | superadmin | `audit-log` | `GET /platform/audit-log?clubId=&actorId=&page=&limit=`; `GET /platform/clubs?limit=100` for the club filter |
| `/requests` | `RequestsPage` — applications inbox (card #68): one tab per status (default En revisión; superadmin also Aprobadas, Rechazadas, Suspendidas, Borrador and Todas; reviewer only En revisión and Correcciones solicitadas), search by club, city, legal name or tax id, paginated. Columns: club, city, owner (name and email), legal name and tax id, status, submitted at, documents count. Oldest pending first. Shows a success flash after a review that took the reviewer out of the club's scope | superadmin, reviewer | `requests` | `GET /platform/applications?status=&search=&page=&limit=` |
| `/requests/:clubId` | `ApplicationDetailPage` — club data (all onboarding fields), owner, opening hours (read per weekday), courts with prices, documents (opened through the signed `url` of the payload; the query refreshes itself before the 10-minute expiry and a click refetches when the URL is missing or about to expire), status history with notes and actors. Actions, each behind a confirmation dialog (`NoteDialog`, note 5..2000 chars): Aprobar (note optional), Pedir correcciones (note required), Rechazar (reason required) while `pending` (reviewer or superadmin); Superadmin only: Reabrir (`rejected`), Suspender (`approved`, reason required), Reactivar (`suspended`). A 409 (status changed meanwhile) closes the dialog, refreshes the data and shows a clear message; after an action a reviewer who can no longer see the club goes back to the inbox | superadmin, reviewer (reviewer: 404 message for clubs outside pending / changes requested) | `requests` | `GET /platform/applications/:clubId`, `POST /platform/applications/:clubId/approve` (`note?`), `.../request-changes` (`note`), `.../reject` (`reason`), `POST /platform/clubs/:clubId/reopen` (`note?`), `.../suspend` (`reason`), `.../unsuspend` (`note?`) |
| `*` | redirect to `/` | — | — | — |

Errors: `lib/errors.ts` exposes `getErrorMessage`, `getErrorStatus`, `getErrorCode`, `getErrorDetails`, `isConflictError` and `getLifecycleErrorMessage`; they accept both `{ error: CODE, message }` and `{ success: false, error: { code, message } }`. Shared pieces: `src/shared/components/NoteDialog.tsx` (confirmation dialog with the 5..2000 note rule) and `src/shared/permissions.ts` (`availableActions(role, status)`, `ACTION_COPY`, status labels).

Supabase from the browser in `apps/platform`: only auth.

---

## Known gaps

Only things verifiable by reading the code. They are deviations from the target (see 'Real state vs. target' in CLAUDE.md); do not fix them as a side effect of another task.

- **Unused code in `apps/app`**: `features/auth/services/authService.ts` (nothing imports it), `useMyProfile` and `usePublicProfile` (and `profileService.getMe`, `getUserByUsername`), `useClubById`, `useMe` (only re-exported from the auth barrel), and `src/index.css` (not imported).
- **`@match-padel/ui` and `@match-padel/types` are not imported by `apps/app`**: it imports types by relative path (`../../../../packages/types/src/supabase`) and uses plain Tailwind markup. `apps/admin` and `apps/platform` do import both packages (`packages/ui` exports `cn` and the panel components).
- **Axios does not unwrap `response.data.data`**: every service unwraps by itself; some return the raw envelope (`clubService.getClubes`, `reservationService.getMyReservations`, `tournamentService.list`, `withdrawTeam`). Neither app throws `response.data.error`. The two panels' `lib/axios.ts` do not unwrap either; their API files do `.then((r) => r.data.data)`.
- **Direct imports between features and into `components/`**: `HomePage` imports from `reservations/components`, `reservations/hooks` and `matches/hooks`; `MatchDetailPage`, `ProfilePage`, `EditProfilePage` and `TournamentDetailPage` import `features/auth/store/auth.store`; `reservationStore.ts` imports from `clubs/services`. `App.tsx` imports every page by its component path.
- **Local interfaces for API entities**: `services/*.ts` declare `Club`, `Court`, `Tournament`, `TimeSlot`, `PaginatedResponse`, etc. by hand.
- **Club panel file upload**: documents go as `multipart/form-data` through the Axios instance (default `Content-Type` is JSON; the upload overrides it).
- **Panel styling**: `apps/admin` and `apps/platform` use plain Tailwind `gray`/`green` classes (and the shared panel components in `packages/ui/src/components/panel`) instead of the design tokens; neither app imports `packages/ui/src/globals.css`.
- **Dark mode**: `apps/app/index.html` has no `dark` class and nothing toggles it, although the pages use `dark:` variants.
- **Lint and tests**: `npm run lint` runs `eslint src --ext .ts,.tsx`, but there is no ESLint config or dependency; there is no test framework or test file.
