# Architecture — match-padel-web

> What exists today (routes, endpoints, features per app, known gaps): [screens.md](./screens.md). This document describes the target architecture; items marked "target" are not implemented yet (see 'Real state vs. target' in CLAUDE.md).

## Overview

**Turborepo** monorepo containing two React applications and three shared packages.

```
match-padel-web/
├── apps/
│   ├── app/          → PWA for end users (mobile-first)
│   └── admin/        → Admin panel for clubs and the platform (desktop-first)
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

### `apps/admin` — Admin panel

**Audience**: Club owners and staff, platform super-admin  
**Target device**: Desktop  
**Hosting**: Vercel (subdomain or separate path)

Main features:
- Court and schedule management (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Club reservation management (list + status change exist today)
- Tournaments: creation, bracket, results — only a read-only list exists today; creation, bracket and results (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Staff management (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Finance: revenue, MP payments (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- Statistics dashboard (basic counters exist today)
- Club settings (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)

Also existing today: clubs list with activate/deactivate and create, users list, matches list.

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
├── store/                  → Global Zustand stores (apps/admin: `auth.store.ts`)
└── i18n/                   → i18next setup + `locales/es.json`, `locales/en.json` (apps/app only)
```

Today most features use `services/` instead of `api/`, and only `auth` has an `index.ts`; `apps/admin` has flat page files per feature (see 'Real state vs. target' in CLAUDE.md and [screens.md](./screens.md)). The global `src/components/` folder does not exist yet in either app.

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
const useAdminSidebarStore = create<SidebarState>(...) // target — not implemented yet (admin has only auth.store.ts)
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
- `apps/admin`: `LoginPage` calls `supabase.auth.signInWithPassword` directly and then reads `users.role` from Supabase; only `club_staff` and `super_admin` are allowed in. The user is kept in the persisted store `src/store/auth.store.ts` (key `match-padel-admin-auth`)

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

## Multi-tenancy in admin

> Multi-tenancy in the admin is (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). Today the admin has 6 flat routes (`/dashboard`, `/clubs`, `/reservations`, `/users`, `/matches`, `/tournaments`), no `/:clubId`, no `/platform/*` and no role guard beyond being logged in.

All admin routes that belong to a club include `/:clubId/` in the URL.

```
/clubs/:clubId/reservations
/clubs/:clubId/courts
/clubs/:clubId/staff
/clubs/:clubId/tournaments
```

The `requireClubAccess` guard (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md) checks in `localStorage` or Zustand that the user has a valid role in that `clubId`.

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

**Build order**: `packages/config` → `packages/types` → `packages/ui` → `apps/app` + `apps/admin`. The packages have no `build` script (they are consumed as TypeScript source), so today `^build` is effectively a no-op and only the apps run `vite build`.

### Commands (npm workspaces)

The package manager is **npm** (there is a `package-lock.json`; the root `package.json` sets `packageManager: npm@10.0.0`).

```bash
npm install                                # install everything (root)
npm run dev                                # turbo dev: both apps
npm run build                              # turbo build
npm run typecheck                          # turbo typecheck
npm run lint                               # turbo lint (no ESLint config yet, see above)
npm run dev -w @match-padel/app            # a single app
npm run dev -w @match-padel/admin
npm install <pkg> -w @match-padel/app      # add a dependency to one workspace
npm run supabase:types                     # regenerate packages/types/src/supabase.ts
```

Automated tests (Vitest + React Testing Library) (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). There is no `test` script.

---

## Environment variables

Each app has its own `.env.local`. The `VITE_` prefix is required for Vite to expose them to the client.

```env
# Shared by both apps
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=       # must include /api/v1, e.g. https://match-padel-api-dev.onrender.com/api/v1

# apps/app only (listed in apps/app/.env.example, but no code reads them yet — target)
VITE_SOCKET_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_VAPID_KEY=

# apps/admin only
VITE_ADMIN_SECRET=  # target — not implemented yet; not in .env.example and not read by any code
```

Each app has an `.env.example` to copy into `.env.local` (git-ignored). `apps/app/src/lib/axios.ts` falls back to `http://localhost:3001/api/v1` when `VITE_API_URL` is unset; `apps/admin` has no fallback. Note that the `VITE_API_URL` value in both `.env.example` files does not include `/api/v1`.

---

## Deploy

| App     | Vercel project       | Trigger                          | URL                                                      |
|---------|----------------------|-----------------------------------|----------------------------------------------------------|
| app     | `match-padel-app`    | automatic, via GitHub integration | `match-padel-app.vercel.app` (prod, from `main`); `match-padel-app-git-develop-agusshadows-projects.vercel.app` (from `develop`)     |
| admin   | `match-padel-admin`  | automatic, via GitHub integration | `match-padel-admin.vercel.app` (prod, from `main`); `match-padel-admin-git-develop-agusshadows-projects.vercel.app` (from `develop`) |

Every push to `main` or `develop` deploys automatically, and every PR gets its own preview per app (a temporary `<project>-git-<branch>-agusshadows-projects.vercel.app` URL, linked from the Vercel bot's comment on the PR and from the PR's status checks). Each app has a `vercel.json` with an SPA rewrite to `/index.html`. See 'Branches, environments and hard rules' in CLAUDE.md.

### Environments and Vercel variables

| Build | `VITE_API_URL` | Supabase |
|-------|----------------|----------|
| `main` (Production) | `https://match-padel-api.onrender.com/api/v1` | `match-padel` (`ebdnlrwzhthqflsbdzvu`) |
| `develop` (Preview, variables scoped to the branch) | `https://match-padel-api-dev.onrender.com/api/v1` | `match-padel-dev` (`vrnonxpxksaruvsvbplt`) |
| Any other branch / PR preview (Preview variables with no branch scope) | `https://match-padel-api-dev.onrender.com/api/v1` | `match-padel-dev` (`vrnonxpxksaruvsvbplt`) |

Production builds use the Production-only `VITE_API_URL` plus the two Supabase variables scoped to "Production and Development" (production Supabase). Preview builds never see those Supabase variables: those two Supabase variables were scoped down on 03/10/2026, and the unscoped Preview set was added, on both Vercel projects. Variables live in Vercel (Project Settings > Environment Variables); a change only applies to the next build.
