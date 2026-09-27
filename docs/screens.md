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
| `/matches/new` | `NewMatchPage` | protected | `matches` | `POST /matches` |
| `/matches/join` | `JoinMatchPage` | protected | `matches` | `POST /matches/join/:lobbyUrl` |
| `/matches/:id` | `MatchDetailPage` | protected | `matches` | `GET /matches/:id`, `PUT /matches/:id/score`, `PUT /matches/:id/score/accept`, `DELETE /matches/:id` |
| `/profile/edit` | `EditProfilePage` | protected | `profile` | `PUT /users/me` |
| `/reservations/new` | `NewReservationPage` (3-step wizard: club → day/time slot → court → confirm; time is chosen before the court, not after — see Trello card #47). Reads `?clubId=` — if present, the club is preselected and step 1 is skipped (arriving from `/clubs/:id`'s "Reservar cancha") | protected | `reservations` (uses `clubs`) | `GET /clubs`, `GET /clubs/:id` (when `?clubId=` is present), `GET /clubs/:id/availability?date=` (combined slot availability across the club's courts, with per-court pricing), `POST /reservations` |
| `/clubs/:id` | `ClubDetailPage` | protected | `clubs` | `GET /clubs/:id` (cover photo, name, description, address, courts). "Reservar cancha" navigates to `/reservations/new?clubId=:id` |
| `/reservations/:id` | `PaymentResultPage` (reads `?payment=success\|failure\|pending`) | protected | `reservations` | none (invalidates the reservations queries) |
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

Other app-level code: `src/shared/` (`ProtectedRoute`, `AppLayout`), `src/lib/` (`axios.ts`, `supabase.ts`, `query-client.ts`), `src/i18n/` and `src/i18n.ts`.

---

## `apps/admin` — club/platform panel

Routes are declared in `apps/admin/src/App.tsx`. The `ProtectedRoute` is a function defined in that same file: it only checks the persisted `isAuthenticated` flag (`src/store/auth.store.ts`) and redirects to `/login`. There is no role guard after login (the check of `users.role` in `club_staff` / `super_admin` happens only inside `LoginPage`). `AdminLayout` (`src/shared/layouts/AdminLayout.tsx`) wraps all protected routes.

The admin does **not** call the REST API: `src/lib/axios.ts` exists but nothing imports it. Every page queries Supabase tables directly through `src/lib/supabase.ts` (with React Query for caching).

| Path | Page component | Access | Feature folder | Data source (Supabase tables) |
|------|----------------|--------|----------------|-------------------------------|
| `/login` | `LoginPage` | public | `auth` | `supabase.auth.signInWithPassword`; reads `users` (`id, full_name, role`) |
| `/` | redirect to `/dashboard` | protected | — | — |
| `/dashboard` | `DashboardPage` | protected | `dashboard` | counts on `clubs`, `courts`, `court_reservations`, `matches`, `users`; recent `court_reservations` |
| `/clubs` | `ClubsPage` | protected | `clubs` | read, insert and update (`is_active`) on `clubs` |
| `/reservations` | `ReservationsPage` | protected | `reservations` | read and update (`status`) on `court_reservations` |
| `/users` | `UsersPage` | protected | `users` | read on `users` |
| `/matches` | `MatchesAdminPage` | protected | `matches` | read on `matches` |
| `/tournaments` | `TournamentsAdminPage` | protected | `tournaments` | read on `tournaments` |
| `*` | redirect to `/dashboard` | — | — | — |

### Features in `apps/admin`

Every feature is a single page file placed directly in the feature folder; none has `api/`, `services/`, `components/`, `hooks/`, `store/` or `index.ts`.

| Feature | `api/` | `services/` | `components/` | `hooks/` | `store/` | `index.ts` | Files |
|---------|:------:|:-----------:|:-------------:|:--------:|:--------:|:----------:|-------|
| `auth` | no | no | no | no | no | no | `LoginPage.tsx` |
| `dashboard` | no | no | no | no | no | no | `DashboardPage.tsx` |
| `clubs` | no | no | no | no | no | no | `ClubsPage.tsx` |
| `reservations` | no | no | no | no | no | no | `ReservationsPage.tsx` |
| `users` | no | no | no | no | no | no | `UsersPage.tsx` |
| `matches` | no | no | no | no | no | no | `MatchesAdminPage.tsx` |
| `tournaments` | no | no | no | no | no | no | `TournamentsAdminPage.tsx` |

Global store: `src/store/auth.store.ts` (persisted user and `isAuthenticated`, key `match-padel-admin-auth`).

---

## Known gaps

Only things verifiable by reading the code. They are deviations from the target (see 'Real state vs. target' in CLAUDE.md); do not fix them as a side effect of another task.

- **`/reservations/:id` self-link**: `PaymentResultPage` is mounted on `/reservations/:id`, and its "Ver reserva" button links to `/reservations/${id}`, i.e. to the same page. There is no reservation detail page; `useReservationById` and `reservationService.getReservationById` (`GET /reservations/:id`) are defined but no component uses them.
- **Unused code in `apps/app`**: `features/auth/services/authService.ts` (nothing imports it), `features/auth/store/authStore.ts` (duplicate of `auth.store.ts`, nothing imports it), `useMyProfile` and `usePublicProfile` (and `profileService.getMe`, `getUserByUsername`), `useClubById`, `useMe` (only re-exported from the auth barrel), and `src/index.css` (not imported).
- **Duplicated i18n setup**: `src/i18n.ts` (Spanish only, flat keys) and `src/i18n/index.ts` (loads `locales/es.json` and `locales/en.json`); `main.tsx` imports `./i18n`.
- **Hardcoded Spanish in `apps/app`**: only 5 files use `useTranslation` (`AuthPage`, `HomePage`, `NewReservationPage`, `ReservationsPage`, `AppLayout`). The other pages and components (`MatchesPage`, `MatchDetailPage`, `NewMatchPage`, `JoinMatchPage`, `MatchCard`, `ProfilePage`, `EditProfilePage`, `NotificationsPage`, `TournamentsPage`, `TournamentDetailPage`, `CreateTournamentPage`, `PaymentResultPage`, `ReservationCard`) have hardcoded Spanish text, and `ReservationsPage` still has hardcoded strings ("Próximas", "Sin reservas próximas", ...). `apps/admin` is Spanish-only with no i18n (allowed by the target, which scopes i18n to `apps/app`).
- **`@match-padel/ui` and `@match-padel/types` are not imported by any app file**: the apps import types by relative path (`../../../../packages/types/src/supabase`) and use plain Tailwind markup, because `packages/ui/src/index.ts` only exports `cn`.
- **Axios does not unwrap `response.data.data`**: every service unwraps by itself; some return the raw envelope (`clubService.getClubes`, `reservationService.getMyReservations`, `tournamentService.list`, `withdrawTeam`). Neither app throws `response.data.error`. `apps/admin/src/lib/axios.ts` is unused.
- **Direct imports between features and into `components/`**: `HomePage` imports from `reservations/components`, `reservations/hooks` and `matches/hooks`; `MatchDetailPage`, `ProfilePage`, `EditProfilePage` and `TournamentDetailPage` import `features/auth/store/auth.store`; `reservationStore.ts` imports from `clubs/services`. `App.tsx` imports every page by its component path.
- **Local interfaces for API entities**: `services/*.ts` declare `Club`, `Court`, `Tournament`, `TimeSlot`, `PaginatedResponse`, etc. by hand.
- **Admin hits Supabase tables directly** (including `insert`/`update` on `clubs` and `court_reservations`) instead of the API; the target only allows Supabase for auth and the `court_reservations` realtime channel.
- **Admin styling**: `AdminLayout` and pages use hardcoded `gray`/`green`/`red` Tailwind classes instead of the shared design tokens; `apps/admin` does not import `packages/ui/src/globals.css`, so those tokens are not loaded there. `App.tsx` and `LoginPage` use `as any` and `catch (err: any)`.
- **Dark mode**: `apps/app/index.html` has no `dark` class and nothing toggles it, although the pages use `dark:` variants.
- **Lint and tests**: `npm run lint` runs `eslint src --ext .ts,.tsx`, but there is no ESLint config or dependency; there is no test framework or test file.
