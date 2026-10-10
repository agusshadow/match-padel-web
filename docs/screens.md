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
| `/matches/new` | `NewMatchPage` (3-step wizard: club → day/time slot → court, then match type + 1/4 payment summary — same club/slot/court pattern as `/reservations/new`, kept as its own local Zustand store instead of sharing `reservationStore` across features) | protected | `matches` (uses `clubs`) | `GET /clubs`, `GET /clubs/:id/availability?date=`, `POST /matches` (now takes `court_id`/`start_time`/`end_time`; returns `{ match, payment }` — redirects to `payment.init_point`/`sandbox_init_point` instead of the match) |
| `/matches/join` | `JoinMatchPage` | protected | `matches` | `POST /matches/join/:lobbyUrl` (returns a checkout link, not the match — redirects to `init_point`/`sandbox_init_point`) |
| `/matches/:id` | `MatchDetailPage` — card #58: either team (re)submits its claimed result via `PUT /matches/:id/score`; confirms automatically once both teams agree, no separate accept step anymore. Card #59: renders `MatchChat` (polls every 5s while open, no realtime transport) for participants only | protected | `matches` | `GET /matches/:id`, `PUT /matches/:id/score`, `DELETE /matches/:id`, `GET/POST /matches/:id/chat` |
| `/profile/edit` | `EditProfilePage` | protected | `profile` | `PUT /users/me`, `POST /users/me/avatar` |
| `/profile/achievements` | `AchievementsPage` | protected | `achievements` | `GET /achievements`, `GET /achievements/me` |
| `/profile/challenges` | `ChallengesPage` (card #62) — grouped by cadence (daily/weekly/monthly/one-time), progress bar per challenge | protected | `challenges` | `GET /challenges/me` |
| `/marketplace` | `MarketplacePage` (card #63) — cosmetics catalog grouped by type, buy with currency or equip an owned item; "Comprar monedas" redirects to MercadoPago checkout for the currency pack | protected | `marketplace` | `GET /marketplace/cosmetics`, `GET /marketplace/cosmetics/me`, `GET /marketplace/equipped`, `GET /marketplace/balance`, `POST /marketplace/cosmetics/:id/purchase`, `POST /marketplace/cosmetics/:id/equip`, `POST /marketplace/currency/purchase` |
| `/profile/elo-history` | `EloHistoryPage` | protected | `profile` | `GET /users/me/elo-history` |
| `/profile/leaderboard` | `LeaderboardPage` (card #60) — players ranked by ELO, paginated, taps through to `/players/:username` | protected | `profile` | `GET /users/leaderboard` |
| `/players/:username` | `PublicProfilePage` (card #60) — avatar, name, ELO; uses the previously-unused `usePublicProfile` hook | protected | `profile` | `GET /users/:username` |
| `/reservations/new` | `NewReservationPage` (3-step wizard: club → day/time slot → court → confirm; time is chosen before the court, not after — see Trello card #47). Reads `?clubId=` — if present, the club is preselected and step 1 is skipped (arriving from `/clubs/:id`'s "Reservar cancha") | protected | `reservations` (uses `clubs`) | `GET /clubs`, `GET /clubs/:id` (when `?clubId=` is present), `GET /clubs/:id/availability?date=` (combined slot availability across the club's courts, with per-court pricing), `POST /reservations` |
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

Routes are declared in `apps/admin/src/App.tsx`. Sign-in uses `supabase.auth.signInWithPassword` (auth only); right after, `GET /me/access` is fetched and the user is rejected with a clear message when they have no club membership and are not superadmin. `RequireAccess` (`src/shared/components/RequireAccess.tsx`) runs that check on every load. `ClubLayout` (`src/shared/layouts/ClubLayout.tsx`) resolves `/:clubId` against the clubs returned by `/me/access` (unknown club: redirect to `/`), shows the club selector and builds the sidebar by role. The last club used is remembered in `localStorage` (`match-padel-club-panel`).

Every API path is relative to `VITE_API_URL`; `:clubId` is the club in the URL.

| Path | Page component | Access | Feature folder | API endpoints called |
|------|----------------|--------|----------------|----------------------|
| `/login` | `LoginPage` | public (redirects to `/` when a session exists) | `auth` | Supabase `signInWithPassword`, then `GET /me/access` |
| `/` | `ClubRedirect` | any club member or superadmin | — | `GET /me/access` (redirects to the last club used, or the first one, `/:clubId/dashboard`) |
| `/:clubId/dashboard` | `DashboardPage` | any role | `dashboard` | `GET /club-admin/:clubId/summary` |
| `/:clubId/reservations` | `ReservationsPage` (status filter, paginated; confirm / complete / cancel) | any role (reception included) | `reservations` | `GET /club-admin/:clubId/reservations?status=&page=&limit=`, `PATCH /club-admin/:clubId/reservations/:id` |
| `/:clubId/matches` | `MatchesPage` (paginated) | owner, admin, superadmin (reception is redirected to the dashboard and the sidebar hides it) | `matches` | `GET /club-admin/:clubId/matches?page=&limit=` |
| `/:clubId/tournaments` | `TournamentsPage` (paginated) | owner, admin, superadmin (same as matches) | `tournaments` | `GET /club-admin/:clubId/tournaments?page=&limit=` |
| `/:clubId/club` | `ClubPage` (view and edit club data; read-only for reception) | any role; edit for owner, admin, superadmin | `club` | `GET /club-admin/:clubId`, `PATCH /club-admin/:clubId` |
| `*` | redirect to `/` (or to the dashboard inside a club) | — | — | — |

The API's error handler answers `{ error, message }`; `lib/errors.ts` shows `message`. People are shown with `personName()` from `@match-padel/ui` (first + last name, falling back to username).

Role labels shown in the UI: `owner` = Dueño, `admin` = Administrador, `staff` = Recepción, `superadmin` = Superadmin (`src/shared/permissions.ts`). Server-side permissions are the source of truth; the route guards and hidden actions are only a convenience.

### Features in `apps/admin`

| Feature | `api/` | `components/` | `hooks/` | `index.ts` |
|---------|:------:|:-------------:|:--------:|:----------:|
| `auth` | yes | yes (`LoginPage`) | yes (`useAuth.ts`: session, access, sign in/out) | yes |
| `dashboard` | yes | yes | yes | yes |
| `reservations` | yes | yes | yes | yes |
| `matches` | yes | yes | yes | yes |
| `tournaments` | yes | yes | yes | yes |
| `club` | yes | yes | yes | yes |

App-level code: `src/shared/` (`layouts/ClubLayout.tsx`, `components/RequireAccess|RequireManagerRole|ClubRedirect`, `club-context.tsx`, `permissions.ts`), `src/lib/` (`axios.ts`, `supabase.ts` — auth only, `query-client.ts`, `errors.ts`) and `src/store/panel.store.ts` (persisted last club, sidebar open state). Supabase from the browser: only auth (`signInWithPassword`, `getSession`, `onAuthStateChange`, `signOut`). The access list (`GET /me/access`) lives in React Query, not in a store.

---

## `apps/platform` — platform panel

New in card #66 (Admin F0): the panel for the platform team (superadmin and reviewers). Vite dev server on port 5174. Same tooling and structure as `apps/admin`; it shares `@match-padel/ui` panel components (`LoginForm`, `PageHeader`, `StatCard`, `StatusBadge`, `Pagination`, `Notice`) and the response types in `@match-padel/types` (`src/api.ts`).

Sign-in uses Supabase auth, then `GET /me/access`; the user is rejected with a message unless `platformRole` is `superadmin` or `reviewer`. A reviewer only sees `/requests`; any other route redirects there (`RequireSuperadmin`). Role labels: `superadmin` = Superadmin, `reviewer` = Revisor.

| Path | Page component | Access | Feature folder | API endpoints called |
|------|----------------|--------|----------------|----------------------|
| `/login` | `LoginPage` | public | `auth` | Supabase `signInWithPassword`, then `GET /me/access` |
| `/` | `HomeRedirect` | platform staff | — | `GET /me/access` (superadmin to `/dashboard`, reviewer to `/requests`) |
| `/dashboard` | `DashboardPage` (counters + recent reservations) | superadmin | `dashboard` | `GET /platform/summary` |
| `/clubs` | `ClubsPage` (search, create dialog, activate/deactivate) | superadmin | `clubs` | `GET /platform/clubs`, `POST /platform/clubs`, `PATCH /platform/clubs/:id/active` |
| `/users` | `UsersPage` (search, paginated) | superadmin | `users` | `GET /platform/users?search=&page=&limit=` |
| `/audit-log` | `AuditLogPage` (filter by club and by actor user id, paginated) | superadmin | `audit-log` | `GET /platform/audit-log?clubId=&actorId=&page=&limit=`; `GET /platform/clubs` for the club filter |
| `/requests` | `RequestsPage` — placeholder "Solicitudes (próximamente)"; the applications inbox arrives with F1 | superadmin, reviewer | `requests` | None |
| `*` | redirect to `/` | — | — | — |

Supabase from the browser in `apps/platform`: only auth.

---

## Known gaps

Only things verifiable by reading the code. They are deviations from the target (see 'Real state vs. target' in CLAUDE.md); do not fix them as a side effect of another task.

- **Unused code in `apps/app`**: `features/auth/services/authService.ts` (nothing imports it), `useMyProfile` and `usePublicProfile` (and `profileService.getMe`, `getUserByUsername`), `useClubById`, `useMe` (only re-exported from the auth barrel), and `src/index.css` (not imported).
- **`@match-padel/ui` and `@match-padel/types` are not imported by `apps/app`**: it imports types by relative path (`../../../../packages/types/src/supabase`) and uses plain Tailwind markup. `apps/admin` and `apps/platform` do import both packages (`packages/ui` exports `cn` and the panel components).
- **Axios does not unwrap `response.data.data`**: every service unwraps by itself; some return the raw envelope (`clubService.getClubes`, `reservationService.getMyReservations`, `tournamentService.list`, `withdrawTeam`). Neither app throws `response.data.error`. The two panels' `lib/axios.ts` do not unwrap either; their API files do `.then((r) => r.data.data)`.
- **Direct imports between features and into `components/`**: `HomePage` imports from `reservations/components`, `reservations/hooks` and `matches/hooks`; `MatchDetailPage`, `ProfilePage`, `EditProfilePage` and `TournamentDetailPage` import `features/auth/store/auth.store`; `reservationStore.ts` imports from `clubs/services`. `App.tsx` imports every page by its component path.
- **Local interfaces for API entities**: `services/*.ts` declare `Club`, `Court`, `Tournament`, `TimeSlot`, `PaginatedResponse`, etc. by hand.
- **Panel styling**: `apps/admin` and `apps/platform` use plain Tailwind `gray`/`green` classes (and the shared panel components in `packages/ui/src/components/panel`) instead of the design tokens; neither app imports `packages/ui/src/globals.css`.
- **Dark mode**: `apps/app/index.html` has no `dark` class and nothing toggles it, although the pages use `dark:` variants.
- **Lint and tests**: `npm run lint` runs `eslint src --ext .ts,.tsx`, but there is no ESLint config or dependency; there is no test framework or test file.
