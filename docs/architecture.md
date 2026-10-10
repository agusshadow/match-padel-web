# Architecture — match-padel-web

> What exists today (routes, endpoints, features per app, known gaps): [screens.md](./screens.md). This document describes the target architecture; items marked "target" are not implemented yet (see 'Real state vs. target' in CLAUDE.md).

## Overview

**Turborepo** monorepo containing three React applications and three shared packages.

```
match-padel-web/
├── apps/
│   ├── app/          → PWA for end users (mobile-first)
│   ├── admin/        → Club panel: owner, administrators, reception (desktop-first; directory name kept for the Vercel project)
│   └── platform/     → Platform panel: superadmin and reviewers (desktop-first)
├── packages/
│   ├── ui/           → Shared UI components + color tokens
│   ├── types/        → Auto-generated TypeScript types (never manual)
│   └── config/       → Base TS and Tailwind configurations
└── docs/
```

## Applications

### `apps/app` — User application

**Audience**: Padel players  
**Target device**: Mobile  
**Hosting**: Vercel  
**Mode**: Installable PWA

Main features:
- Sign-up/login (Supabase Auth)
- Search and book courts (with Mercado Pago payment preference)
- Create and join matches
- View and manage tournaments
- Gamification (ELO, achievements, ranking) — only the user's `elo` and basic stats are shown today; achievements and ranking are (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Points store (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Push notifications (Firebase) — today there are only in-app notifications, polled over the API; Firebase (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Real-time chat (Socket.io) (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)

Installable PWA setup today: `vite-plugin-pwa` in `apps/app/vite.config.ts` with `registerType: 'autoUpdate'` and a web manifest (name, `theme_color`, `display: 'standalone'`, `/icon-192.png`, `/icon-512.png` and `/icon-512-maskable.png`). The icons, `favicon.png` and `apple-touch-icon.png` live in `apps/app/public/`, generated from the brand logo in `agusshadow/match-padel-app-legacy`. There is no custom Workbox configuration: offline caching of the user's reservations (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md).

### The three apps

| App | Directory | Audience | Vercel project | Dev port | Talks to |
|---|---|---|---|---|---|
| Players | `apps/app` | players (mobile PWA) | `match-padel-app` | 5173 | API + Supabase auth |
| Club panel | `apps/admin` | club owner, administrators, reception | `match-padel-admin` | 5173 (Vite default) | API (`/me/access`, `/club-admin/:clubId/*`) + Supabase auth |
| Platform panel | `apps/platform` | superadmin, reviewers | `match-padel-platform` (target — to be created, root `apps/platform`) | 5174 | API (`/me/access`, `/platform/*`) + Supabase auth |

The club panel keeps the directory name `apps/admin` so the existing Vercel project (root directory `apps/admin`) keeps working; its product name is "Panel del club". Both panels read and write **only through the API**, which checks permissions per club and per role; Supabase JS is used for auth only. See [club-platform-scope.md](./club-platform-scope.md) for the full scope and phases.

### `apps/admin` — Club panel

**Audience**: club owner, administrators and reception  
**Target device**: Desktop  
**Hosting**: Vercel

Main features:
- Dashboard with the club's counters and latest reservations (exists)
- Reservation management: list, filter by status, confirm / complete / cancel (exists)
- Matches and tournaments of the club, read-only, hidden for reception (exists)
- Club data view/edit (exists; edit hidden for reception)
- Owner registration with email code, club selector with statuses, new application and the onboarding wizard with submit, history and read-only states (exists; card #67). Only `approved` clubs open the dashboard and the rest
- Courts area: courts CRUD, weekly schedule per court, price bands by day and hour, exceptions (club-wide or per court) and a preview of what players see (exists; card #70, owner/admin)
- Blocks, calendar, team, Mercado Pago account (target — not implemented yet; phase F3)
- Tournament creation, fixtures and results (target — not implemented yet; phase F4)

### `apps/platform` — Platform panel

**Audience**: platform superadmin and reviewers  
**Target device**: Desktop  
**Hosting**: Vercel (separate project, to be created)

Main features:
- Dashboard with platform counters (exists)
- Clubs: paginated list with search and status filter, create, activate/deactivate (exists)
- Users: search and paginated list (exists)
- Audit log with filters (exists)
- Applications inbox and review (exists; card #68): inbox by status with search and pagination (reviewers: pending and changes requested; superadmin: every status), application detail with club data, courts, documents (signed URLs) and status history, and the review actions (approve, request corrections, reject). Superadmin only: suspend / reactivate and reopen a rejected application
- Commissions, gamification catalogs, global parameters (target — not implemented yet; phases F3/F5)

---

## Shared packages

### `packages/ui`

Contains the shared UI components and the Match Padel design system tokens.

- `src/components/` — Components (today: `Avatar`, `Badge`, `BottomNav`, `Button`, `Card` (+ `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`), `EmptyState`, `Input`, `Modal`, `Spinner`; hand-written, styled with Tailwind + `cn()`). More shadcn/ui components (Dialog, Sheet, Select, Tabs, ...) (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- `src/lib/utils.ts` — `cn()` helper
- `src/globals.css` — Match Padel color tokens (`:root` and `.dark`)
- `src/index.ts` — package entry point. Today it only exports `cn`; the components above are not exported yet, so `import { Button } from '@match-padel/ui'` does not work until they are added to the barrel (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- `tailwind.config.ts` — extends `packages/config/tailwind.base.js`

**Critical rule**: Apps do NOT install shadcn/ui directly. Every new component is added here.

### `packages/types`

Automatically generated TypeScript types. **Never edited by hand.**

- `src/supabase.ts` — Generated with `supabase gen types typescript` (`npm run supabase:types`, needs `SUPABASE_PROJECT_ID`)
- `src/api.ts` — Generated from the backend's OpenAPI spec (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). Today it is a small hand-written file with the `ApiResponse<T>` and `ApiError` envelope types only
- `src/index.ts` — Barrel. Re-exports `Database`, `Tables`, `TablesInsert`, `TablesUpdate`, `Enums`, `Json`, `Constants` and `ApiResponse`, `ApiError`. The package only exposes the `.` entry point (no `/supabase` or `/api` subpaths)

```ts
// Usage in any app or package:
import type { Database, Tables, ApiResponse } from '@match-padel/types'

type Reservation = Tables<'court_reservations'>
```

Per-endpoint response types (e.g. `ReservationResponse`) (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). Today the apps import the types through relative paths (`../../../../packages/types/src/supabase`) instead of `@match-padel/types`; do not copy that.

### `packages/config`

Reusable configurations:

- `tsconfig.base.json` — TypeScript base for all apps and packages
- `tailwind.base.js` — Base Tailwind configuration (extended by apps and `packages/ui`; imported as `@match-padel/config/tailwind.base`)

An ESLint base configuration (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). The `lint` scripts run `eslint src --ext .ts,.tsx` but no ESLint config or dependency exists in the repo.

---

## Feature-Sliced Design (FSD)

Each app organizes its code into **features**. This pattern is mandatory.

```
src/
├── features/
│   └── <name>/
│       ├── api/            → Axios calls (plain promises named `<entity>.api.ts`; hooks wrap them)
│       ├── components/     → React components for this feature
│       ├── hooks/          → Custom hooks for this feature
│       ├── store/          → Zustand store (only if there is complex state)
│       └── index.ts        → Barrel: everything this feature exports
├── components/             → Reusable global components
├── lib/                    → Clients (axios, supabase, query-client; socket (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)), helpers
├── shared/                 → Today's home for app-level pieces: `layouts/` (AppLayout / AdminLayout) and, in apps/app, `components/ProtectedRoute.tsx`
├── store/                  → Global Zustand stores (apps/admin and apps/platform: `panel.store.ts`)
└── i18n/                   → i18next setup + `locales/es.json`, `locales/en.json` (apps/app only)
```

Today most features use `services/` instead of `api/`, and only `auth` has an `index.ts`; `apps/admin` and `apps/platform` follow the target structure (`api/`, `components/`, `hooks/`, `index.ts` per feature; see [screens.md](./screens.md)). The global `src/components/` folder does not exist yet in either app.

### FSD import rule

```ts
// ✅ CORRECT: import from the feature's barrel
import { ReservationCard, useReservations } from '@/features/reservations'

// ❌ FORBIDDEN: importing another feature's internals
import { ReservationCard } from '@/features/reservations/components/ReservationCard'
```

Each feature's `index.ts` is the **only public interface**. Anything not exported there is private.

---

## Data flow

```
Component
    ↓
    Feature hook (React Query's useQuery / useMutation)
    ↓
    api/ function (axios; supabase-js only for auth and the `court_reservations` realtime channel)
    ↓
    REST API / Supabase / Socket.io
```

### React Query as the source of truth for server state

- `useQuery` for data coming from the server
- `useMutation` for write operations
- `invalidateQueries` to refresh after mutations
- Automatic caching — do not duplicate state in Zustand

### Zustand only for UI state

```ts
// ✅ Correct: UI state that does not come from the server
const usePanelStore = create<PanelState>(...) // apps/admin: persisted last club + sidebar open state
// Real example today: useReservationStore (booking wizard selections) in apps/app

// ❌ Incorrect: server data in Zustand
const useReservationsStore = create(... // No, this belongs in React Query
```

---

## Real-time

> Real-time is (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). No `supabase.channel()` call and no Socket.io client code exist; `socket.io-client` is only declared as a dependency of `apps/app`.

### Supabase Realtime (exclusively for `court_reservations`)

```ts
// Only for this use case: court availability
supabase.channel('court_reservations')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'court_reservations' }, handler)
  .subscribe()
```

### Socket.io for everything else

| Event              | Room                  | Use                          |
|--------------------|-----------------------|------------------------------|
| `match:update`     | `match:{matchId}`     | Changes to an active match    |
| `chat:message`     | `match:{matchId}`     | Real-time chat                |
| `notification:new` | `user:{userId}`       | App push notifications        |
| `staff:notify`     | `club:{clubId}:staff` | Alerts for club staff         |
| `tournament:bracket` | `tournament:{id}`   | Bracket updates               |

---

## Authentication

1. Supabase Auth manages sessions (JWT); both apps create the client in `src/lib/supabase.ts` (`apps/app` with `persistSession`, `autoRefreshToken`, `detectSessionInUrl`)
2. `supabase.auth.getSession()` returns the token
3. The token is injected into the `Authorization: Bearer <token>` header of every API request via an Axios interceptor (both apps). `apps/app` also has a 401 response interceptor that refreshes the session and redirects to `/auth` if the refresh fails
4. The API verifies the token with Supabase `service_role`

How the login happens today differs per app:
- `apps/app`: `useLogin` / `useRegister` (`features/auth/hooks/useAuth.ts`) call the API (`POST /auth/login`, `POST /auth/register`), then sync the returned tokens with `supabase.auth.setSession(...)`. On load, `useAuthInit` (called by `ProtectedRoute`) reads `getSession()` and then `GET /auth/me`. The user is kept in the persisted Zustand store `auth.store.ts` (storage key `match-padel-auth`)
- `apps/admin` and `apps/platform`: `LoginPage` calls `supabase.auth.signInWithPassword` (auth only) and then `GET /me/access` through the API; access is denied with a message when the user has no club membership and is not superadmin (club panel), or has no `platformRole` (platform panel). The session comes from Supabase (`useSession`) and the access list lives in React Query (`['me-access']`); there is no persisted auth store. A `401` from the API signs the user out

```ts
// lib/axios.ts — global interceptor
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

---

## Multi-tenancy in the club panel

Every club route of `apps/admin` is prefixed with `/:clubId/`:

```
/:clubId/dashboard
/:clubId/reservations
/:clubId/matches        (owner, admin, superadmin)
/:clubId/tournaments    (owner, admin, superadmin)
/:clubId/club
```

`GET /me/access` returns the user's clubs and the role in each one (`owner`, `admin`, `staff`, or `superadmin` for every club when the user is a superadmin). `ClubLayout` validates the `:clubId` against that list, provides the current club and role through `useCurrentClub()`, and renders the club selector; `RequireManagerRole` hides matches and tournaments from reception. These guards are only a convenience: the API enforces permissions per club and per role. Club routes that arrive in later phases (courts, schedules, staff, ...) go under the same prefix. Platform-wide screens live in `apps/platform`, not under `/platform/*` of the club panel.

---

## Build and Turborepo pipeline

```json
// turbo.json (simplified; Turborepo 2 uses "tasks")
{
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],  // packages before apps
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": { "outputs": [] },
    "clean": { "cache": false }
  }
}
```

**Build order**: `packages/config` → `packages/types` → `packages/ui` → `apps/app` + `apps/admin` + `apps/platform`. The packages have no `build` script (they are consumed as TypeScript source), so today `^build` is effectively a no-op and only the apps run `vite build`.

### Commands (npm workspaces)

The package manager is **npm** (there is a `package-lock.json`; the root `package.json` sets `packageManager: npm@10.0.0`).

```bash
npm install                                # install everything (root)
npm run dev                                # turbo dev: all apps
npm run build                              # turbo build
npm run typecheck                          # turbo typecheck
npm run lint                               # turbo lint (no ESLint config yet, see above)
npm run dev -w @match-padel/app            # a single app
npm run dev -w @match-padel/admin         # club panel
npm run dev -w @match-padel/platform      # platform panel (port 5174)
npm install <pkg> -w @match-padel/app      # add a dependency to one workspace
npm run supabase:types                     # regenerate packages/types/src/supabase.ts
```

Automated tests (Vitest + React Testing Library) (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). There is no `test` script.

---

## Environment variables

Each app has its own `.env.local`. The `VITE_` prefix is required for Vite to expose them to the client.

```env
# Shared by all three apps
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=       # must include /api/v1, e.g. https://match-padel-api-dev.onrender.com/api/v1

# apps/app only (listed in apps/app/.env.example, but no code reads them yet — target)
VITE_SOCKET_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_VAPID_KEY=

```

Each app has an `.env.example` to copy into `.env.local` (git-ignored). `apps/app/src/lib/axios.ts` falls back to `http://localhost:3001/api/v1` when `VITE_API_URL` is unset; `apps/admin` and `apps/platform` have no fallback. The three `.env.example` files set `VITE_API_URL` with `/api/v1` already included, as the apps expect.

---

## Deploy

| App     | Vercel project       | Trigger                          | URL                                                      |
|---------|----------------------|-----------------------------------|----------------------------------------------------------|
| app     | `match-padel-app`    | automatic, via GitHub integration | `match-padel-app.vercel.app` (prod, from `main`); `match-padel-app-git-develop-agusshadows-projects.vercel.app` (from `develop`)     |
| admin (club panel) | `match-padel-admin`  | automatic, via GitHub integration | `match-padel-admin.vercel.app` (prod, from `main`); `match-padel-admin-git-develop-agusshadows-projects.vercel.app` (from `develop`) |
| platform | `match-padel-platform` (target — not created yet; root directory `apps/platform`, same `VITE_*` variables as the other projects) | automatic, via GitHub integration once created | to be assigned by Vercel |

Every push to `main` or `develop` deploys automatically, and every PR gets its own preview per app (a temporary `<project>-git-<branch>-agusshadows-projects.vercel.app` URL, linked from the Vercel bot's comment on the PR and from the PR's status checks). Each app has a `vercel.json` with an SPA rewrite to `/index.html`. See 'Branches, environments and hard rules' in CLAUDE.md.

### Environments and Vercel variables

| Build | `VITE_API_URL` | Supabase |
|-------|----------------|----------|
| `main` (Production) | `https://match-padel-api.onrender.com/api/v1` | `match-padel` (`ebdnlrwzhthqflsbdzvu`) |
| `develop` (Preview, variables scoped to the branch) | `https://match-padel-api-dev.onrender.com/api/v1` | `match-padel-dev` (`vrnonxpxksaruvsvbplt`) |
| Any other branch / PR preview (Preview variables with no branch scope) | `https://match-padel-api-dev.onrender.com/api/v1` | `match-padel-dev` (`vrnonxpxksaruvsvbplt`) |

Production builds use the Production-only `VITE_API_URL` plus the two Supabase variables scoped to "Production and Development" (production Supabase). Preview builds never see those Supabase variables: those two Supabase variables were scoped down on 03/10/2026, and the unscoped Preview set was added, on both Vercel projects. Variables live in Vercel (Project Settings > Environment Variables); a change only applies to the next build.


### Previewing a branch before merging to `develop`

**Frontend: automatic.** Every PR gets its own preview of each app at `<project>-git-<branch>-agusshadows-projects.vercel.app` (slashes in the branch name become dashes; very long names are shortened with a hash). The Vercel bot comments the exact links on the PR. Those previews use the dev API and the dev Supabase project, never production. Vercel may ask you to be signed in to the team to open them.

**What a preview cannot show:**
- The dev API (`match-padel-api-dev`) always runs the `develop` branch of `match-padel-api`. If the frontend change depends on an endpoint, field or migration that is not merged to `develop` yet, the preview calls an API that does not have it.
- The dev database is one, shared by every branch and every preview. A migration applied there for testing affects `develop` and every other preview.

**How to see backend changes before they reach `develop`:**
1. *Merge the API PR to `develop` first.* This is the normal flow (the API PR merges first and the web PR references it). It puts the change in dev before it is "approved", which is acceptable because dev is disposable.
2. *Point `match-padel-api-dev` at the API branch for a while* (Render > service > Settings > Branch). Good for a one-off check, but it replaces `develop` for everyone until you switch it back.
3. *Render service previews per PR* are off today. Whether the free plan allows them, and at what cost, has not been checked.
4. *Supabase branching* for the database is, as far as we know, a paid feature and has not been evaluated.

For this stage, option 1 is the practical one: a frontend preview per PR, with the backend merged to `develop` first.
