# Arquitectura — match-padel-web

## Visión general

Monorepo con **Turborepo** que contiene dos aplicaciones React y tres paquetes compartidos.

```
match-padel-web/
├── apps/
│   ├── app/          → PWA para usuarios finales (móvil-first)
│   └── admin/        → Panel de administración para clubs y plataforma (desktop-first)
├── packages/
│   ├── ui/           → Componentes shadcn/ui compartidos
│   ├── types/        → Tipos TypeScript auto-generados (nunca manuales)
│   └── config/       → Configuraciones base de TS y Tailwind
└── docs/
```

## Aplicaciones

### `apps/app` — Aplicación de usuarios

**Audiencia**: Jugadores de pádel  
**Dispositivo objetivo**: Móvil  
**Hosting**: Vercel  
**Modo**: PWA instalable

Funcionalidades principales:
- Registro/login (Supabase Auth)
- Buscar y reservar canchas
- Crear y unirse a partidos
- Ver y gestionar torneos
- Gamificación (ELO, logros, ranking)
- Tienda de puntos
- Notificaciones push (Firebase)
- Chat en tiempo real (Socket.io)

### `apps/admin` — Panel de administración

**Audiencia**: Dueños y staff de clubs, super-admin de plataforma  
**Dispositivo objetivo**: Desktop  
**Hosting**: Vercel (subdominio o path separado)

Funcionalidades principales:
- Gestión de canchas y horarios
- Gestión de reservas del club
- Torneos: creación, bracket, resultados
- Gestión de staff
- Finanzas: ingresos, pagos MP
- Dashboard de estadísticas
- Configuración del club

---

## Paquetes compartidos

### `packages/ui`

Contiene los componentes **shadcn/ui** ya configurados con el design system de Match Padel.

- `src/components/` — Componentes copiados de shadcn/ui (Button, Card, Input, Dialog, etc.)
- `src/lib/utils.ts` — `cn()` helper
- `tailwind.config.ts` — Configuración Tailwind con tokens de color de Match Padel

**Regla crítica**: Las apps NO instalan shadcn/ui directamente. Todo componente nuevo se agrega aquí.

### `packages/types`

Tipos TypeScript generados automáticamente. **Nunca se editan a mano.**

- `src/supabase.ts` — Generado con `supabase gen types typescript`
- `src/api.ts` — Generado desde el OpenAPI spec del backend

```ts
// Uso en cualquier app o paquete:
import type { Database } from '@match-padel/types/supabase'
import type { ReservationResponse } from '@match-padel/types/api'
```

### `packages/config`

Configuraciones reutilizables:

- `tsconfig.base.json` — Base de TypeScript para todas las apps y paquetes
- `tailwind.base.js` — Configuración base de Tailwind (extendida por apps y `packages/ui`)

---

## Feature-Sliced Design (FSD)

Cada app organiza su código en **features**. Este patrón es obligatorio.

```
src/
├── features/
│   └── <nombre>/
│       ├── api/            → Llamadas HTTP o Supabase (useQuery, useMutation)
│       ├── components/     → Componentes React de esta feature
│       ├── hooks/          → Hooks custom de esta feature
│       ├── store/          → Zustand store (solo si hay estado complejo)
│       └── index.ts        → Barrel: todo lo que exporta esta feature
├── components/             → Componentes globales reutilizables
├── lib/                    → Clientes (axios, supabase, socket), helpers
└── locales/                → Archivos i18n (es.json, en.json)
```

### Regla de importaciones FSD

```ts
// ✅ CORRECTO: importar desde el barrel de la feature
import { ReservationCard, useReservations } from '@/features/reservations'

// ❌ PROHIBIDO: importar internals de otra feature
import { ReservationCard } from '@/features/reservations/components/ReservationCard'
```

El `index.ts` de cada feature es la **única interfaz pública**. Todo lo que no esté exportado ahí es privado.

---

## Flujo de datos

```
Componente
    ↓
    Hook de feature (useQuery / useMutation de React Query)
    ↓
    Función de api/ (axios o supabase-js)
    ↓
    API REST / Supabase / Socket.io
```

### React Query como fuente de verdad del servidor

- `useQuery` para datos que vienen del servidor
- `useMutation` para operaciones de escritura
- `invalidateQueries` para refrescar después de mutaciones
- Caching automático — no duplicar estado en Zustand

### Zustand solo para estado de UI

```ts
// ✅ Correcto: estado de UI que no viene del servidor
const useAdminSidebarStore = create<SidebarState>(...)

// ❌ Incorrecto: datos del servidor en Zustand
const useReservationsStore = create(... // No, esto va en React Query
```

---

## Tiempo real

### Supabase Realtime (exclusivo para `court_reservations`)

```ts
// Solo para este caso de uso: disponibilidad de canchas
supabase.channel('court_reservations')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'court_reservations' }, handler)
  .subscribe()
```

### Socket.io para todo lo demás

| Evento             | Room                  | Uso                          |
|--------------------|-----------------------|------------------------------|
| `match:update`     | `match:{matchId}`     | Cambios en partido activo     |
| `chat:message`     | `match:{matchId}`     | Chat en tiempo real           |
| `notification:new` | `user:{userId}`       | Notificaciones push app       |
| `staff:notify`     | `club:{clubId}:staff` | Alertas para staff del club   |
| `tournament:bracket` | `tournament:{id}`   | Actualizaciones de bracket    |

---

## Autenticación

1. Supabase Auth gestiona sesiones (JWT)
2. `supabase.auth.getSession()` devuelve el token
3. El token se inyecta en el header `Authorization: Bearer <token>` de cada request a la API via interceptor de Axios
4. La API verifica el token con Supabase `service_role`

```ts
// lib/axios.ts — interceptor global
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})
```

---

## Multi-tenant en admin

Todas las rutas del admin que corresponden a un club incluyen `/:clubId/` en la URL.

```
/clubs/:clubId/reservations
/clubs/:clubId/courts
/clubs/:clubId/staff
/clubs/:clubId/tournaments
```

El guard `requireClubAccess` verifica en `localStorage` o Zustand que el usuario tiene rol válido en ese `clubId`.

---

## Build y pipeline Turborepo

```json
// turbo.json (simplificado)
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],  // paquetes antes que apps
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

**Orden de build**: `packages/config` → `packages/types` → `packages/ui` → `apps/app` + `apps/admin`

---

## Variables de entorno

Cada app tiene su propio `.env.local`. Prefijo `VITE_` para que Vite las exponga al cliente.

```env
# Compartido por ambas apps
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=

# Solo apps/app
VITE_FIREBASE_API_KEY=
VITE_SOCKET_URL=

# Solo apps/admin
VITE_ADMIN_SECRET=  # Solo si se usa alguna ruta protegida extra
```

---

## Deploy

| App     | Host   | Trigger              | URL                          |
|---------|--------|----------------------|------------------------------|
| app     | Vercel | push a `main`        | `app.matchpadel.com`         |
| admin   | Vercel | push a `main`        | `admin.matchpadel.com`       |
