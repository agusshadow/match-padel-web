# Architecture — match-padel-web

## Overview

**Turborepo** monorepo containing two React applications and three shared packages.

```
match-padel-web/
├── apps/
│   ├── app/          → PWA for end users (mobile-first)
│   └── admin/        → Admin panel for clubs and the platform (desktop-first)
├── packages/
│   ├── ui/           → Shared shadcn/ui components
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
- Search and book courts
- Create and join matches
- View and manage tournaments
- Gamification (ELO, achievements, ranking)
- Points store
- Push notifications (Firebase)
- Real-time chat (Socket.io)

### `apps/admin` — Admin panel

**Audience**: Club owners and staff, platform super-admin  
**Target device**: Desktop  
**Hosting**: Vercel (subdomain or separate path)

Main features:
- Court and schedule management
- Club reservation management
- Tournaments: creation, bracket, results
- Staff management
- Finance: revenue, MP payments
- Statistics dashboard
- Club settings

---

## Shared packages

### `packages/ui`

Contains the **shadcn/ui** components already configured with the Match Padel design system.

- `src/components/` — Components copied from shadcn/ui (Button, Card, Input, Dialog, etc.)
- `src/lib/utils.ts` — `cn()` helper
- `tailwind.config.ts` — Tailwind configuration with Match Padel color tokens

**Critical rule**: Apps do NOT install shadcn/ui directly. Every new component is added here.

### `packages/types`

Automatically generated TypeScript types. **Never edited by hand.**

- `src/supabase.ts` — Generated with `supabase gen types typescript`
- `src/api.ts` — Generated from the backend's OpenAPI spec

```ts
// Usage in any app or package:
import type { Database } from '@match-padel/types/supabase'
import type { ReservationResponse } from '@match-padel/types/api'
```

### `packages/config`

Reusable configurations:

- `tsconfig.base.json` — TypeScript base for all apps and packages
- `tailwind.base.js` — Base Tailwind configuration (extended by apps and `packages/ui`)

---

## Feature-Sliced Design (FSD)

Each app organizes its code into **features**. This pattern is mandatory.

```
src/
├── features/
│   └── <name>/
│       ├── api/            → HTTP or Supabase calls (useQuery, useMutation)
│       ├── components/     → React components for this feature
│       ├── hooks/          → Custom hooks for this feature
│       ├── store/          → Zustand store (only if there is complex state)
│       └── index.ts        → Barrel: everything this feature exports
├── components/             → Reusable global components
├── lib/                    → Clients (axios, supabase, socket), helpers
└── locales/                → i18n files (es.json, en.json)
```

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
    api/ function (axios or supabase-js)
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
const useAdminSidebarStore = create<SidebarState>(...)

// ❌ Incorrect: server data in Zustand
const useReservationsStore = create(... // No, this belongs in React Query
```

---

## Real-time

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

1. Supabase Auth manages sessions (JWT)
2. `supabase.auth.getSession()` returns the token
3. The token is injected into the `Authorization: Bearer <token>` header of every API request via an Axios interceptor
4. The API verifies the token with Supabase `service_role`

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

All admin routes that belong to a club include `/:clubId/` in the URL.

```
/clubs/:clubId/reservations
/clubs/:clubId/courts
/clubs/:clubId/staff
/clubs/:clubId/tournaments
```

The `requireClubAccess` guard checks in `localStorage` or Zustand that the user has a valid role in that `clubId`.

---

## Build and Turborepo pipeline

```json
// turbo.json (simplified)
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // packages before apps
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

**Build order**: `packages/config` → `packages/types` → `packages/ui` → `apps/app` + `apps/admin`

---

## Environment variables

Each app has its own `.env.local`. The `VITE_` prefix is required for Vite to expose them to the client.

```env
# Shared by both apps
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=

# apps/app only
VITE_FIREBASE_API_KEY=
VITE_SOCKET_URL=

# apps/admin only
VITE_ADMIN_SECRET=  # Only if an extra protected route is used
```

---

## Deploy

| App     | Host   | Trigger              | URL                          |
|---------|--------|----------------------|------------------------------|
| app     | Vercel | push to `main`       | `app.matchpadel.com`         |
| admin   | Vercel | push to `main`       | `admin.matchpadel.com`       |
