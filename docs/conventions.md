# Conventions — match-padel-web

## Naming

| Element                | Convention       | Example                              |
|------------------------|------------------|--------------------------------------|
| Component files        | PascalCase       | `ReservationCard.tsx`                |
| Hook files             | camelCase        | `useReservations.ts`                 |
| Store files            | camelCase        | `reservationStore.ts`                |
| API files              | camelCase        | `reservationsApi.ts`                 |
| Utils files            | camelCase        | `formatDate.ts`                      |
| React components       | PascalCase       | `function ReservationCard()`         |
| Custom hooks           | camelCase, `use` | `function useReservations()`         |
| Zustand stores         | camelCase, `use` | `const useReservationStore = create` |
| Variables / functions  | camelCase        | `const reservationDate`              |
| Constants              | UPPER_SNAKE      | `MAX_PLAYERS_PER_MATCH = 4`          |
| Props interfaces       | PascalCase       | `interface ReservationCardProps`     |
| Query keys             | array literal    | `['reservations', clubId]`           |

---

## Feature structure

Every new piece of functionality lives in `src/features/<name>/`. The structure is mandatory:

```
features/reservations/
├── api/
│   └── reservationsApi.ts      → Functions that call the API
├── components/
│   ├── ReservationCard.tsx
│   ├── ReservationList.tsx
│   └── CreateReservationForm.tsx
├── hooks/
│   └── useReservations.ts      → useQuery / useMutation for this feature
├── store/                      → Only if there is complex UI state
│   └── reservationStore.ts
└── index.ts                    → ONLY public export point
```

### `index.ts` — the barrel

Everything the feature exports to the rest of the app:

```ts
// features/reservations/index.ts
export { ReservationCard } from './components/ReservationCard'
export { ReservationList } from './components/ReservationList'
export { useReservations } from './hooks/useReservations'
export type { Reservation } from './api/reservationsApi'
```

Anything NOT in `index.ts` is **private** to the feature.

---

## TypeScript types

### Absolute rule: never declare entity interfaces by hand

```ts
// ❌ FORBIDDEN
interface Reservation {
  id: string
  court_id: string
  user_id: string
  start_time: string
}

// ✅ CORRECT: import from the generated package
import type { Database } from '@match-padel/types/supabase'
type Reservation = Database['public']['Tables']['reservations']['Row']

// ✅ CORRECT: for REST API responses
import type { ReservationResponse } from '@match-padel/types/api'
```

### Component props

Props ARE declared manually (they are not DB entities):

```ts
interface ReservationCardProps {
  reservation: Reservation
  onCancel?: (id: string) => void
  isLoading?: boolean
}

export function ReservationCard({ reservation, onCancel, isLoading }: ReservationCardProps) {
```

---

## React Query — patterns

### useQuery for reads

```ts
// features/reservations/hooks/useReservations.ts
import { useQuery } from '@tanstack/react-query'
import { getReservations } from '../api/reservationsApi'

export function useReservations(clubId: string) {
  return useQuery({
    queryKey: ['reservations', clubId],
    queryFn: () => getReservations(clubId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
```

### useMutation for writes

```ts
export function useCancelReservation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(reservationId),
    onSuccess: (_, reservationId) => {
      // Refresh the list after cancelling
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
```

### Query keys — convention

```ts
// Always an array, from most general to most specific
['reservations']                    // general list
['reservations', clubId]            // list filtered by club
['reservations', clubId, 'active']  // sublist with status
['reservation', reservationId]      // single entity
```

---

## Components

### Always from `@match-padel/ui`

```ts
// ✅ CORRECT
import { Button, Card, Input } from '@match-padel/ui'

// ❌ FORBIDDEN: never import from shadcn directly in apps/
import { Button } from '@/components/ui/button'
```

### Feature components vs. global components

```ts
// Feature component: only used by that feature
// apps/app/src/features/reservations/components/ReservationCard.tsx

// Global component: used by multiple features
// apps/app/src/components/EmptyState.tsx
// apps/app/src/components/LoadingSpinner.tsx
// apps/app/src/components/PageHeader.tsx
```

### Loading / error pattern in components

```tsx
export function ReservationList({ clubId }: Props) {
  const { data, isLoading, error } = useReservations(clubId)

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error.message} />
  if (!data?.length) return <EmptyState message="No hay reservas" />

  return (
    <div className="flex flex-col gap-3">
      {data.map((r) => (
        <ReservationCard key={r.id} reservation={r} />
      ))}
    </div>
  )
}
```

---

## Forms

Always React Hook Form + Zod:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  court_id: z.string().uuid('Cancha inválida'),
  date: z.string().min(1, 'La fecha es requerida'),
  players: z.number().min(2).max(4),
})

type FormData = z.infer<typeof schema>

export function CreateReservationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const mutation = useCreateReservation()

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      {/* fields */}
    </form>
  )
}
```

---

## Internationalization (i18n)

**Always** use `t()` for user-visible text. Never hardcoded strings in Spanish or English in JSX.

```tsx
import { useTranslation } from 'react-i18next'

export function ReservationCard() {
  const { t } = useTranslation('reservations')

  return <h2>{t('card.title')}</h2>
}
```

Translation files in `src/locales/`:

```json
// locales/es/reservations.json
{
  "card": {
    "title": "Reserva de cancha",
    "cancel": "Cancelar reserva"
  }
}
```

---

## Axios — patterns

The Axios client already has the auth interceptor and the `response.data.data` unwrapping configured. The `api/` functions just consume the result:

```ts
// features/reservations/api/reservationsApi.ts
import { api } from '@/lib/axios'

// The response is already unwrapped by the interceptor
export async function getReservations(clubId: string): Promise<Reservation[]> {
  return api.get(`/clubs/${clubId}/reservations`)
}

export async function cancelReservation(reservationId: string): Promise<void> {
  return api.delete(`/reservations/${reservationId}`)
}
```

---

## Error handling

Network/API errors are handled by React Query automatically. To show them in the UI:

```tsx
const { error } = useReservations(clubId)

// error.message comes from the backend envelope: error.message
if (error) return <ErrorMessage message={error.message} />
```

For form errors, Zod displays them via React Hook Form:

```tsx
{errors.date && <p className="text-destructive text-sm">{errors.date.message}</p>}
```

---

## Routing

```ts
// apps/app: React Router with lazy loading per feature
const Reservations = lazy(() => import('@/features/reservations'))
const Matches = lazy(() => import('@/features/matches'))

// apps/admin: same structure, but with /:clubId in club routes
<Route path="/clubs/:clubId/reservations" element={<AdminReservations />} />
```

---

## Imports — conventional order

```ts
// 1. React and external libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal monorepo packages
import { Button, Card } from '@match-padel/ui'
import type { Database } from '@match-padel/types/supabase'

// 3. Features (only via barrel)
import { useReservations } from '@/features/reservations'

// 4. Global components
import { LoadingSpinner } from '@/components/LoadingSpinner'

// 5. Lib / utils
import { formatDate } from '@/lib/formatDate'
import { api } from '@/lib/axios'
```

---

## CSS / Tailwind

- Tailwind classes directly in JSX (no CSS modules, no styled-components)
- Use `cn()` from `@match-padel/ui` for conditional classes
- Colors come from the design system's CSS variables (`bg-primary`, `text-destructive`, etc.)
- Do not hardcode colors: never `bg-blue-500`, always `bg-primary`

```tsx
import { cn } from '@match-padel/ui'

<div className={cn(
  "flex items-center gap-2 rounded-lg p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```
