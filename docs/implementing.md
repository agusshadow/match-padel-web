# How to implement — match-padel-web

Step-by-step guide to add new functionality without breaking the existing pattern. The examples show the target structure; for what actually exists today (routes, endpoints, features per app) see [screens.md](./screens.md). Several example features (`tournaments`, `Badge`) already exist in some form and are used here only as illustrations.

---

## Add a new feature

### Step 1: Create the folder structure

```bash
mkdir -p src/features/<name>/{api,components,hooks,store}
touch src/features/<name>/index.ts
```

Example: `tournaments` feature in `apps/app` (a `tournaments` feature already exists there with `services/`, `hooks/` and `components/`; the example shows the target layout):

```bash
mkdir -p src/features/tournaments/{api,components,hooks}
touch src/features/tournaments/index.ts
```

### Step 2: Define the types (import, don't declare)

```ts
// src/features/tournaments/api/tournaments.api.ts
import type { Tables } from '@match-padel/types'
import { api } from '@/lib/axios'

type Tournament = Tables<'tournaments'>

export async function getTournaments(clubId: string): Promise<Tournament[]> {
  return api.get(`/clubs/${clubId}/tournaments`)
}

export async function joinTournament(tournamentId: string): Promise<void> {
  return api.post(`/tournaments/${tournamentId}/join`)
}
```

The snippet assumes the Axios interceptor unwraps `response.data.data` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). Until then, unwrap in the function like the existing services do (`api.get(...).then((r) => r.data.data)`). The endpoint paths above are illustrative; the real ones the app calls are listed in [screens.md](./screens.md).

### Step 3: Create the React Query hooks

```ts
// src/features/tournaments/hooks/useTournaments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTournaments, joinTournament } from '../api/tournaments.api'

export function useTournaments(clubId: string) {
  return useQuery({
    queryKey: ['tournaments', clubId],
    queryFn: () => getTournaments(clubId),
  })
}

export function useJoinTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: joinTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] })
    },
  })
}
```

### Step 4: Create the components

```tsx
// src/features/tournaments/components/TournamentCard.tsx
import { Card, CardHeader, CardTitle, Button } from '@match-padel/ui'
import { useTranslation } from 'react-i18next'
import { useJoinTournament } from '../hooks/useTournaments'
import type { Tables } from '@match-padel/types'

type Tournament = Tables<'tournaments'>

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const { t } = useTranslation()
  const join = useJoinTournament()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tournament.name}</CardTitle>
      </CardHeader>
      <Button
        onClick={() => join.mutate(tournament.id)}
        disabled={join.isPending}
      >
        {join.isPending ? t('tournaments.joining') : t('tournaments.join')}
      </Button>
    </Card>
  )
}
```

`Card`, `CardHeader`, `CardTitle` and `Button` exist in `packages/ui`, but the package entry point only exports `cn` today, so this import works only after the components are exported from `packages/ui/src/index.ts` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md).

### Step 5: Export from the barrel

```ts
// src/features/tournaments/index.ts
export { TournamentCard } from './components/TournamentCard'
export { TournamentList } from './components/TournamentList'
export { useTournaments, useJoinTournament } from './hooks/useTournaments'
```

### Step 6: Add the route

Routes live in the app's `src/App.tsx` (there is no `router.tsx` and no `src/pages/` folder; page components live in `features/<name>/components/<Name>Page.tsx`). Add the `<Route>` inside the `ProtectedRoute` layout route, and inside `AppLayout` if the page shows the bottom nav:

```tsx
// apps/app/src/App.tsx
import { TournamentsPage } from './features/tournaments/components/TournamentsPage'

<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/tournaments" element={<TournamentsPage />} />
  </Route>
</Route>
```

Once features have their barrels, import the page from `@/features/tournaments` instead, and lazy-load it with `lazy()` (target — not implemented yet; today all pages are imported eagerly).

### Step 7: Add translations

Add a top-level key per domain to **both** `src/i18n/locales/es.json` and `src/i18n/locales/en.json` (`apps/app` only; single default namespace, no per-domain files):

```json
// src/i18n/locales/es.json
{
  "tournaments": {
    "join": "Unirse",
    "joining": "Uniéndose...",
    "card": {
      "spots": "{{count}} lugares disponibles"
    }
  }
}
```

See the note on the duplicated `src/i18n.ts` / `src/i18n/index.ts` in [conventions.md](./conventions.md) before assuming the JSON files are the ones loaded.

---

## Add a component to `packages/ui`

### Step 1: Add the component (shadcn/ui pattern)

Illustrative: a `Badge` already exists in `packages/ui/src/components/Badge.tsx` (variants `default`, `success`, `warning`, `destructive`, `outline`). Existing components are hand-written with Tailwind and `cn()`; there is no shadcn CLI setup (no `components.json`) and no Radix dependency yet.

```tsx
// packages/ui/src/components/Badge.tsx
import { cn } from '../lib/utils'

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  className?: string
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variant === 'default' && "bg-primary text-primary-foreground",
      variant === 'secondary' && "bg-secondary text-secondary-foreground",
      variant === 'destructive' && "bg-destructive text-destructive-foreground",
      variant === 'outline' && "border border-input",
      className
    )}>
      {children}
    </span>
  )
}
```

### Step 2: Export from `packages/ui/src/index.ts`

```ts
export { Badge } from './components/Badge'
```

`packages/ui/src/index.ts` currently only has `export { cn } from './lib/utils'`: none of the existing components (`Avatar`, `Badge`, `BottomNav`, `Button`, `Card`, `EmptyState`, `Input`, `Modal`, `Spinner`) is exported yet (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md).

### Step 3: Use it in any app

```ts
import { Badge } from '@match-padel/ui'
```

If the component needs a new dependency, add it to the UI package: `npm install <pkg> -w @match-padel/ui`. Both apps' Tailwind configs already scan `../../packages/ui/src/**/*.{ts,tsx}`.

---

## Add a global component in an app

If the component is NOT reusable between `app` and `admin`, it goes in the app itself:

```tsx
// apps/app/src/components/BottomNav.tsx     (target location: src/components/ does not exist yet)
// apps/admin/src/components/SidebarNav.tsx  (target location)
```

Today the bottom nav and the notification bell are inline in `apps/app/src/shared/layouts/AppLayout.tsx`, and the sidebar is inline in `apps/admin/src/shared/layouts/AdminLayout.tsx`. (`packages/ui` also has an unused `BottomNav`.)

---

## Add realtime (Socket.io)

> (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). `socket.io-client` is declared in `apps/app/package.json` (not in admin), but there is no `src/lib/socket.ts` and no socket code. Create `src/lib/socket.ts` first (using `VITE_SOCKET_URL`).

### Step 1: Create a socket hook for the feature

```ts
// src/features/matches/hooks/useMatchSocket.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '@/lib/socket'

export function useMatchSocket(matchId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const room = `match:${matchId}`
    socket.emit('join', room)

    socket.on('match:update', (data) => {
      // Invalidate the query so React Query refetches
      queryClient.invalidateQueries({ queryKey: ['match', matchId] })
    })

    return () => {
      socket.emit('leave', room)
      socket.off('match:update')
    }
  }, [matchId, queryClient])
}
```

### Step 2: Use the hook in the component

```tsx
export function MatchDetail({ matchId }: Props) {
  useMatchSocket(matchId) // subscribes on mount, unsubscribes on unmount

  const { data: match } = useMatch(matchId)
  // ...
}
```

---

## Add realtime with Supabase (ONLY `court_reservations`)

> (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). No `supabase.channel()` usage exists yet; `supabase` is exported from `src/lib/supabase.ts` in both apps.

```ts
// src/features/reservations/hooks/useCourtAvailability.ts
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useCourtAvailability(courtId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`court:${courtId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'court_reservations',
        filter: `court_id=eq.${courtId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['court-availability', courtId] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [courtId, queryClient])
}
```

**Do not use Supabase Realtime for any other table.**

---

## Add UI state with Zustand

Only when React Query is not enough (UI state that does not come from the server):

```ts
// src/features/<name>/store/<name>Store.ts
import { create } from 'zustand'

interface TournamentUIState {
  selectedBracketRound: number
  setSelectedRound: (round: number) => void
  isFullscreen: boolean
  toggleFullscreen: () => void
}

export const useTournamentUIStore = create<TournamentUIState>((set) => ({
  selectedBracketRound: 1,
  setSelectedRound: (round) => set({ selectedBracketRound: round }),
  isFullscreen: false,
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
}))
```

---

## Add a protected route

```tsx
// apps/app/src/shared/components/ProtectedRoute.tsx (already exists; layout route that renders <Outlet />)
// Usage: nest the routes inside it
<Route element={<ProtectedRoute />}>
  <Route path="/reservations" element={<ReservationsPage />} />
</Route>

// apps/admin: ProtectedRoute is a wrapper function defined inline in src/App.tsx
// and only checks that the user is logged in:
<Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route path="reservations" element={<ReservationsPage />} />
</Route>

// Target — not implemented yet: admin with club role check
<Route path="/clubs/:clubId/staff" element={
  <RequireClubRole roles={['owner', 'admin']}>
    <StaffPage />
  </RequireClubRole>
} />
```

---

## Add a page

Pages are simple components that compose features. They have no logic of their own. Today pages live in `features/<name>/components/<Name>Page.tsx` (there is no `src/pages/` folder); `PageHeader` and `TournamentList` below (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md).

```tsx
// apps/app/src/pages/TournamentsPage.tsx
import { TournamentList } from '@/features/tournaments'
import { PageHeader } from '@/components/PageHeader'
import { useTranslation } from 'react-i18next'

export default function TournamentsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageHeader title={t('tournaments.page.title')} />
      <TournamentList />
    </div>
  )
}
```

---

## Update DB types

When the Supabase schema changes:

```bash
# At the monorepo root (needs the Supabase CLI installed and SUPABASE_PROJECT_ID set)
npm run supabase:types

# Which runs:
supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > packages/types/src/supabase.ts
```

Types update automatically, and any component that uses them gets TypeScript errors if the schema changed in an incompatible way.

---

## Add a dependency

The package manager is npm (workspaces). Install into the workspace that uses it, never with `pnpm`:

```bash
npm install <pkg> -w @match-padel/app
npm install <pkg> -w @match-padel/admin
npm install <pkg> -w @match-padel/ui
```

Note that `lucide-react` is declared only in `packages/ui`, although `apps/app` imports it (it resolves through npm's hoisting).

---

## Checklist before opening a PR

- [ ] The feature has its `index.ts` with all exports
- [ ] There are no direct imports of other features' internals
- [ ] DB entity types are imported from `@match-padel/types`
- [ ] Visible text uses `t()` from i18n
- [ ] UI components come from `@match-padel/ui`
- [ ] There are no `console.log` calls in the code
- [ ] Query keys follow the array convention
- [ ] Server state lives in React Query, not in Zustand
