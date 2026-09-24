# Cómo implementar — match-padel-web

Guía paso a paso para agregar funcionalidad nueva sin romper el patrón existente.

---

## Agregar una nueva feature

### Paso 1: Crear la estructura de carpetas

```bash
mkdir -p src/features/<nombre>/{api,components,hooks,store}
touch src/features/<nombre>/index.ts
```

Ejemplo: feature `tournaments` en `apps/app`:

```bash
mkdir -p src/features/tournaments/{api,components,hooks}
touch src/features/tournaments/index.ts
```

### Paso 2: Definir los tipos (importar, no declarar)

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

### Paso 3: Crear los hooks de React Query

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

### Paso 4: Crear los componentes

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

### Paso 5: Exportar desde el barrel

```ts
// src/features/tournaments/index.ts
export { TournamentCard } from './components/TournamentCard'
export { TournamentList } from './components/TournamentList'
export { useTournaments, useJoinTournament } from './hooks/useTournaments'
```

### Paso 6: Agregar la ruta

```tsx
// src/router.tsx (o donde esté el router)
import { lazy } from 'react'
const TournamentsPage = lazy(() => import('@/pages/TournamentsPage'))

<Route path="/tournaments" element={<TournamentsPage />} />
```

### Paso 7: Agregar traducciones

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

## Agregar un componente a `packages/ui`

### Paso 1: Agregar el componente (patrón shadcn/ui)

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

### Paso 2: Exportar desde `packages/ui/src/index.ts`

```ts
export { Badge } from './components/Badge'
```

### Paso 3: Usar en cualquier app

```ts
import { Badge } from '@match-padel/ui'
```

---

## Agregar un componente global en una app

Si el componente NO es reutilizable entre `app` y `admin`, va en la propia app:

```tsx
// apps/app/src/components/BottomNav.tsx
// apps/admin/src/components/SidebarNav.tsx
```

---

## Agregar tiempo real (Socket.io)

### Paso 1: Crear un hook de socket para la feature

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
      // Invalidar query para que React Query refetch
      queryClient.invalidateQueries({ queryKey: ['match', matchId] })
    })

    return () => {
      socket.emit('leave', room)
      socket.off('match:update')
    }
  }, [matchId, queryClient])
}
```

### Paso 2: Usar el hook en el componente

```tsx
export function MatchDetail({ matchId }: Props) {
  useMatchSocket(matchId) // se suscribe al entrar, se desuscribe al salir

  const { data: match } = useMatch(matchId)
  // ...
}
```

---

## Agregar tiempo real con Supabase (SOLO `court_reservations`)

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

**No usar Supabase Realtime para ninguna otra tabla.**

---

## Agregar estado de UI con Zustand

Solo cuando React Query no alcanza (estado de UI que no viene del servidor):

```ts
// src/features/<nombre>/store/<nombre>Store.ts
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

## Agregar una ruta protegida

```tsx
// src/components/PrivateRoute.tsx (ya existe)
// Uso:
<Route path="/reservations" element={
  <PrivateRoute>
    <ReservationsPage />
  </PrivateRoute>
} />

// Para admin, con verificación de rol en club:
<Route path="/clubs/:clubId/staff" element={
  <RequireClubRole roles={['owner', 'admin']}>
    <StaffPage />
  </RequireClubRole>
} />
```

---

## Agregar una página

Las páginas son componentes simples que componen features. No tienen lógica propia.

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

## Actualizar tipos de DB

Cuando cambia el schema de Supabase:

```bash
# En la raíz del monorepo
pnpm supabase:types

# Que ejecuta:
supabase gen types typescript --project-id <PROJECT_ID> > packages/types/src/supabase.ts
```

Los tipos se actualizan solos y cualquier componente que los usa recibe TypeScript errors si el schema cambió incompatiblemente.

---

## Checklist antes de hacer PR

- [ ] La feature tiene su `index.ts` con todas las exportaciones
- [ ] No hay imports directos de internals de otras features
- [ ] Los tipos de entidades de DB se importan desde `@match-padel/types`
- [ ] Los textos visibles usan `t()` de i18n
- [ ] Los componentes UI vienen de `@match-padel/ui`
- [ ] No hay `console.log` en el código
- [ ] Los query keys siguen la convención de arrays
- [ ] El estado del servidor está en React Query, no en Zustand
