# How to implement — match-padel-web

Step-by-step guide to add new functionality without breaking the existing pattern.

---

## Add a new feature

### Step 1: Create the folder structure

```bash
mkdir -p src/features/<name>/{api,components,hooks,store}
touch src/features/<name>/index.ts
```

Example: `tournaments` feature in `apps/app`:

```bash
mkdir -p src/features/tournaments/{api,components,hooks}
touch src/features/tournaments/index.ts
```

### Step 2: Define the types (import, don't declare)

```ts
// src/features/tournaments/api/tournamentsApi.ts
import type { Database } from '@match-padel/types/supabase'
import { api } from '@/lib/axios'

type Tournament = Database['public']['Tables']['tournaments']['Row']

export async function getTournaments(clubId: string): Promise<Tournament[]> {
  return api.get(`/clubs/${clubId}/tournaments`)
}

export async function joinTournament(tournamentId: string): Promise<void> {
  return api.post(`/tournaments/${tournamentId}/join`)
}
```

### Step 3: Create the React Query hooks

```ts
// src/features/tournaments/hooks/useTournaments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTournaments, joinTournament } from '../api/tournamentsApi'

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
import type { Database } from '@match-padel/types/supabase'

type Tournament = Database['public']['Tables']['tournaments']['Row']

interface TournamentCardProps {
  tournament: Tournament
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const { t } = useTranslation('tournaments')
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
        {join.isPending ? t('joining') : t('join')}
      </Button>
    </Card>
  )
}
```

### Step 5: Export from the barrel

```ts
// src/features/tournaments/index.ts
export { TournamentCard } from './components/TournamentCard'
export { TournamentList } from './components/TournamentList'
export { useTournaments, useJoinTournament } from './hooks/useTournaments'
```

### Step 6: Add the route

```tsx
// src/router.tsx (or wherever the router lives)
import { lazy } from 'react'
const TournamentsPage = lazy(() => import('@/pages/TournamentsPage'))

<Route path="/tournaments" element={<TournamentsPage />} />
```

### Step 7: Add translations

```json
// src/locales/es/tournaments.json
{
  "join": "Unirse",
  "joining": "Uniéndose...",
  "card": {
    "spots": "{{count}} lugares disponibles"
  }
}
```

---

## Add a component to `packages/ui`

### Step 1: Add the component (shadcn/ui pattern)

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

### Step 3: Use it in any app

```ts
import { Badge } from '@match-padel/ui'
```

---

## Add a global component in an app

If the component is NOT reusable between `app` and `admin`, it goes in the app itself:

```tsx
// apps/app/src/components/BottomNav.tsx
// apps/admin/src/components/SidebarNav.tsx
```

---

## Add realtime (Socket.io)

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
// src/components/PrivateRoute.tsx (already exists)
// Usage:
<Route path="/reservations" element={
  <PrivateRoute>
    <ReservationsPage />
  </PrivateRoute>
} />

// For admin, with club role check:
<Route path="/clubs/:clubId/staff" element={
  <RequireClubRole roles={['owner', 'admin']}>
    <StaffPage />
  </RequireClubRole>
} />
```

---

## Add a page

Pages are simple components that compose features. They have no logic of their own.

```tsx
// apps/app/src/pages/TournamentsPage.tsx
import { TournamentList } from '@/features/tournaments'
import { PageHeader } from '@/components/PageHeader'
import { useTranslation } from 'react-i18next'

export default function TournamentsPage() {
  const { t } = useTranslation('tournaments')

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageHeader title={t('page.title')} />
      <TournamentList />
    </div>
  )
}
```

---

## Update DB types

When the Supabase schema changes:

```bash
# At the monorepo root
pnpm supabase:types

# Which runs:
supabase gen types typescript --project-id <PROJECT_ID> > packages/types/src/supabase.ts
```

Types update automatically, and any component that uses them gets TypeScript errors if the schema changed in an incompatible way.

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
