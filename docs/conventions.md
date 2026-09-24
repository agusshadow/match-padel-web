# Convenciones — match-padel-web

## Nomenclatura

| Elemento               | Convención       | Ejemplo                              |
|------------------------|------------------|--------------------------------------|
| Archivos de componente | PascalCase       | `ReservationCard.tsx`                |
| Archivos de hook       | camelCase        | `useReservations.ts`                 |
| Archivos de store      | camelCase        | `reservationStore.ts`                |
| Archivos de api        | camelCase        | `reservationsApi.ts`                 |
| Archivos de utils      | camelCase        | `formatDate.ts`                      |
| Componentes React      | PascalCase       | `function ReservationCard()`         |
| Hooks custom           | camelCase, `use` | `function useReservations()`         |
| Stores Zustand         | camelCase, `use` | `const useReservationStore = create` |
| Variables / funciones  | camelCase        | `const reservationDate`              |
| Constantes             | UPPER_SNAKE      | `MAX_PLAYERS_PER_MATCH = 4`          |
| Props interfaces       | PascalCase       | `interface ReservationCardProps`     |
| Query keys             | array literal    | `['reservations', clubId]`           |

---

## Estructura de una feature

Toda funcionalidad nueva vive en `src/features/<nombre>/`. La estructura es obligatoria:

```
features/reservations/
├── api/
│   └── reservationsApi.ts      → Funciones que llaman a la API
├── components/
│   ├── ReservationCard.tsx
│   ├── ReservationList.tsx
│   └── CreateReservationForm.tsx
├── hooks/
│   └── useReservations.ts      → useQuery / useMutation de esta feature
├── store/                      → Solo si hay estado de UI complejo
│   └── reservationStore.ts
└── index.ts                    → ÚNICO punto de exportación pública
```

### `index.ts` — el barrel

Todo lo que la feature exporta al resto de la app:

```ts
// features/reservations/index.ts
export { ReservationCard } from './components/ReservationCard'
export { ReservationList } from './components/ReservationList'
export { useReservations } from './hooks/useReservations'
export type { Reservation } from './api/reservationsApi'
```

Lo que NO está en `index.ts` es **privado** a la feature.

---

## Tipos TypeScript

### Regla absoluta: nunca declarar interfaces de entidades a mano

```ts
// ❌ PROHIBIDO
interface Reservation {
  id: string
  court_id: string
  user_id: string
  start_time: string
}

// ✅ CORRECTO: importar desde el paquete generado
import type { Database } from '@match-padel/types/supabase'
type Reservation = Database['public']['Tables']['reservations']['Row']

// ✅ CORRECTO: para respuestas de la API REST
import type { ReservationResponse } from '@match-padel/types/api'
```

### Props de componentes

Las props SÍ se declaran manualmente (no son entidades de DB):

```ts
interface ReservationCardProps {
  reservation: Reservation
  onCancel?: (id: string) => void
  isLoading?: boolean
}

export function ReservationCard({ reservation, onCancel, isLoading }: ReservationCardProps) {
```

---

## React Query — patrones

### useQuery para lectura

```ts
// features/reservations/hooks/useReservations.ts
import { useQuery } from '@tanstack/react-query'
import { getReservations } from '../api/reservationsApi'

export function useReservations(clubId: string) {
  return useQuery({
    queryKey: ['reservations', clubId],
    queryFn: () => getReservations(clubId),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
```

### useMutation para escritura

```ts
export function useCancelReservation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(reservationId),
    onSuccess: (_, reservationId) => {
      // Refrescar la lista después de cancelar
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
```

### Query keys — convenio

```ts
// Siempre array, del más general al más específico
['reservations']                    // lista general
['reservations', clubId]            // lista filtrada por club
['reservations', clubId, 'active']  // sublista con estado
['reservation', reservationId]      // entidad individual
```

---

## Componentes

### Siempre desde `@match-padel/ui`

```ts
// ✅ CORRECTO
import { Button, Card, Input } from '@match-padel/ui'

// ❌ PROHIBIDO: nunca importar desde shadcn directamente en apps/
import { Button } from '@/components/ui/button'
```

### Componentes de feature vs. componentes globales

```ts
// Componente de feature: solo lo usa esa feature
// apps/app/src/features/reservations/components/ReservationCard.tsx

// Componente global: lo usan múltiples features
// apps/app/src/components/EmptyState.tsx
// apps/app/src/components/LoadingSpinner.tsx
// apps/app/src/components/PageHeader.tsx
```

### Patrón de loading / error en componentes

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

## Formularios

Siempre React Hook Form + Zod:

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
      {/* campos */}
    </form>
  )
}
```

---

## Internacionalización (i18n)

**Siempre** usar `t()` para textos visibles al usuario. Nunca strings hardcodeados en español o inglés en JSX.

```tsx
import { useTranslation } from 'react-i18next'

export function ReservationCard() {
  const { t } = useTranslation('reservations')

  return <h2>{t('card.title')}</h2>
}
```

Archivos de traducción en `src/locales/`:

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

## Axios — patrones

El cliente Axios ya tiene configurado el interceptor de auth y el unwrapping de `response.data.data`. Las funciones de `api/` solo consumen el resultado:

```ts
// features/reservations/api/reservationsApi.ts
import { api } from '@/lib/axios'

// La respuesta ya está unwrapped por el interceptor
export async function getReservations(clubId: string): Promise<Reservation[]> {
  return api.get(`/clubs/${clubId}/reservations`)
}

export async function cancelReservation(reservationId: string): Promise<void> {
  return api.delete(`/reservations/${reservationId}`)
}
```

---

## Gestión de errores

Los errores de red/API los maneja React Query automáticamente. Para mostrarlos en UI:

```tsx
const { error } = useReservations(clubId)

// error.message viene del envelope del backend: error.message
if (error) return <ErrorMessage message={error.message} />
```

Para errores de formulario, Zod los muestra via React Hook Form:

```tsx
{errors.date && <p className="text-destructive text-sm">{errors.date.message}</p>}
```

---

## Routing

```ts
// apps/app: React Router con lazy loading por feature
const Reservations = lazy(() => import('@/features/reservations'))
const Matches = lazy(() => import('@/features/matches'))

// apps/admin: misma estructura, pero con /:clubId en rutas de club
<Route path="/clubs/:clubId/reservations" element={<AdminReservations />} />
```

---

## Importaciones — orden convencional

```ts
// 1. React y librerías externas
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Paquetes internos del monorepo
import { Button, Card } from '@match-padel/ui'
import type { Database } from '@match-padel/types/supabase'

// 3. Features (solo via barrel)
import { useReservations } from '@/features/reservations'

// 4. Componentes globales
import { LoadingSpinner } from '@/components/LoadingSpinner'

// 5. Lib / utils
import { formatDate } from '@/lib/formatDate'
import { api } from '@/lib/axios'
```

---

## CSS / Tailwind

- Clases Tailwind directas en JSX (no CSS modules, no styled-components)
- Usar `cn()` de `@match-padel/ui` para clases condicionales
- Los colores vienen de CSS variables del design system (`bg-primary`, `text-destructive`, etc.)
- No hardcodear colores: nunca `bg-blue-500`, siempre `bg-primary`

```tsx
import { cn } from '@match-padel/ui'

<div className={cn(
  "flex items-center gap-2 rounded-lg p-4",
  isActive && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```
