# Conventions — match-padel-web

## Naming

| Element                | Convention       | Example                              |
|------------------------|------------------|--------------------------------------|
| Component files        | PascalCase       | `ReservationCard.tsx`                |
| Hook files             | camelCase        | `useReservations.ts`                 |
| Store files            | camelCase (`auth.store.ts` also exists) | `reservationStore.ts`  |
| API files              | `<entity>.api.ts` | `reservations.api.ts`               |
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
│   └── reservations.api.ts     → Functions that call the API
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
export type { Reservation } from './api/reservations.api'
```

Anything NOT in `index.ts` is **private** to the feature.

> Today most features name the API layer `services/` (`<entity>Service.ts`), only `auth` has an `index.ts`, and `apps/admin` has flat page files per feature. Follow the structure above for new code; see 'Real state vs. target' in CLAUDE.md and [screens.md](./screens.md).

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

// ✅ CORRECT: import from the generated package (only the `.` entry point exists)
import type { Tables } from '@match-padel/types'
type Reservation = Tables<'court_reservations'>

// ✅ CORRECT: for REST API responses (envelope types exist today)
import type { ApiResponse } from '@match-padel/types'

// Per-endpoint types such as `ReservationResponse` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
// (packages/types/src/api.ts is hand-written today and only has ApiResponse / ApiError)
```

Today the apps import these types through relative paths (`../../../../packages/types/src/supabase`) and some services declare their own interfaces (`Club`, `Court`, `Tournament`, ...). Do not copy either pattern.

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
import { getReservations } from '../api/reservations.api'

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

> `packages/ui` has `Avatar`, `Badge`, `BottomNav`, `Button`, `Card`, `EmptyState`, `Input`, `Modal` and `Spinner`, but `packages/ui/src/index.ts` only exports `cn` today: exporting them from the barrel (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). Until then the pages use plain Tailwind elements.

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
// apps/app/src/components/PageHeader.tsx
```

Cross-app pieces (`EmptyState`, `Spinner`, ...) belong in `packages/ui`. The `src/components/` folder does not exist yet in either app (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md); app-level pieces live today in `src/shared/components/` (`ProtectedRoute.tsx` in apps/app) and `src/shared/layouts/`.

### Loading / error pattern in components

```tsx
export function ReservationList({ clubId }: Props) {
  const { data, isLoading, error } = useReservations(clubId)

  if (isLoading) return <Spinner />
  if (error) return <ErrorMessage message={error.message} />
  if (!data?.length) return <EmptyState title={t('reservations.noUpcoming')} />

  return (
    <div className="flex flex-col gap-3">
      {data.map((r) => (
        <ReservationCard key={r.id} reservation={r} />
      ))}
    </div>
  )
}
```

`Spinner` and `EmptyState` (props `icon`, `title`, `description`, `action`) exist in `packages/ui`; `ErrorMessage` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md).

---

## Forms

Always React Hook Form + Zod (`AuthPage` in `apps/app` is the only form using it today):

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

> **Current state:** two i18n setups coexist in `apps/app`. `src/i18n.ts` (Spanish only, flat keys such as `'auth.login'`) is the one actually loaded, because `main.tsx` imports `./i18n` and that resolves to the file before the `i18n/` folder. `src/i18n/index.ts` with `locales/es.json` and `en.json` (nested keys, English included) is the target layout described below but is **not loaded yet**. Until they are consolidated, add each new key to `src/i18n.ts` and mirror it in the JSON files, so the later migration is mechanical.

```tsx
import { useTranslation } from 'react-i18next'

export function ReservationCard() {
  const { t } = useTranslation()

  return <h2>{t('reservations.card.title')}</h2>
}
```

i18n is only set up in `apps/app`. Translation files live in `src/i18n/locales/es.json` and `en.json`, in a single default namespace with one top-level key per domain (`auth`, `common`, `home`, `reservations`, `matches`, `clubs`, `profile`, `nav`):

```json
// src/i18n/locales/es.json
{
  "reservations": {
    "card": {
      "title": "Reserva de cancha",
      "cancel": "Cancelar reserva"
    }
  }
}
```

There are no per-domain namespaces or files: use `useTranslation()` without arguments and `t('reservations.card.title')`. Spanish is the base and fallback language.

> Two i18n setups coexist in `apps/app`: `src/i18n/index.ts` (loads the two JSON files) and a stale `src/i18n.ts` (Spanish only, flat keys). `main.tsx` imports `./i18n`, and a file takes precedence over a directory index in Vite/TypeScript resolution, so the stale `src/i18n.ts` is most likely the one that runs today. See 'Real state vs. target' in CLAUDE.md.

---

## Axios — patterns

The shared instance is `api`, exported from each app's `src/lib/axios.ts`. Both apps have the auth (Bearer token) request interceptor; `apps/app` also has a 401 handler that refreshes the session. The target is that the response interceptor unwraps `response.data.data` and throws `response.data.error` on failure (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md).

**Until the interceptor is added, the instance returns the raw Axios response**, and every existing service unwraps it itself (`api.get(...).then((r) => r.data.data)`). Follow that pattern in new code; do not change the interceptor as a side effect of another task.

Target shape of an `api/` function (once the interceptor unwraps):

```ts
// features/reservations/api/reservations.api.ts
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

// target: error.message comes from the backend envelope (interceptor throws response.data.error);
// today it is the raw AxiosError message
if (error) return <ErrorMessage message={error.message} />
```

For form errors, Zod displays them via React Hook Form:

```tsx
{errors.date && <p className="text-destructive text-sm">{errors.date.message}</p>}
```

---

## Routing

Routes are declared in each app's `src/App.tsx` (React Router v6; there is no `router.tsx`). Today the page components are imported eagerly, with no `lazy()`/`Suspense`:

```tsx
// apps/app/src/App.tsx (real)
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/reservations" element={<ReservationsPage />} />
  </Route>
  <Route path="/reservations/new" element={<NewReservationPage />} />
</Route>
```

```ts
// Target — not implemented yet: lazy loading per feature
const Reservations = lazy(() => import('@/features/reservations'))
const Matches = lazy(() => import('@/features/matches'))

// Target — not implemented yet: apps/admin with /:clubId in club routes
<Route path="/clubs/:clubId/reservations" element={<AdminReservations />} />
```

See [screens.md](./screens.md) for the full list of routes.

---

## Imports — conventional order

```ts
// 1. React and external libraries
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal monorepo packages
import { Button, Card } from '@match-padel/ui'
import type { Tables } from '@match-padel/types'

// 3. Features (only via barrel)
import { useReservations } from '@/features/reservations'

// 4. Global components
import { PageHeader } from '@/components/PageHeader'

// 5. Lib / utils
import { formatDate } from '@/lib/formatDate'
import { api } from '@/lib/axios'
```

---

## CSS / Tailwind

- Tailwind classes directly in JSX (no CSS modules, no styled-components)
- Use `cn()` from `@match-padel/ui` for conditional classes
- Colors come from the design system's CSS variables (`bg-primary`, `text-destructive`, etc.)
- Do not hardcode colors: never `bg-blue-500`, always `bg-primary` (`apps/admin` still uses hardcoded `gray`/`green`/`red` classes today; do not copy that)

```tsx
import { cn } from '@match-padel/ui'

<div className={cn(
  "flex items-center gap-2 rounded-lg p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```
