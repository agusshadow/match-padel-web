# CLAUDE.md — match-padel-web

Este archivo es tu contrato de trabajo. Léelo completo antes de tocar cualquier archivo.

## Qué es este proyecto
Monorepo con Turborepo que contiene dos aplicaciones React:
- `apps/app` — PWA para jugadores (B2C, mobile-first, dark mode por defecto)
- `apps/admin` — Panel de administración para staff de clubes (B2B, desktop-first)

Comparten código a través de packages internos.

## Stack
- **Monorepo**: Turborepo + pnpm workspaces
- **Framework**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS + shadcn/ui (desde `packages/ui`)
- **Estado servidor**: TanStack React Query v5
- **Estado UI global**: Zustand
- **Formularios**: React Hook Form + Zod
- **HTTP**: Axios con interceptors (base URL `/api/v1`, lee `response.data.data`)
- **Auth**: Supabase JS (solo auth — login/register/JWT)
- **Realtime DB**: `supabase.channel()` SOLO sobre `court_reservations`
- **Realtime API**: Socket.io-client (chat, ELO ready, notificaciones de staff)
- **i18n**: i18next + react-i18next (solo en `apps/app`, español base)
- **PWA**: vite-plugin-pwa + Workbox (solo en `apps/app`)
- **Tests**: Vitest + React Testing Library (cobertura mínima 50% en `src/features/`)

## Estructura del monorepo

```
match-padel-web/
├── apps/
│   ├── app/          ← PWA jugadores (mobile-first, dark mode)
│   └── admin/        ← Panel B2B (desktop-first)
├── packages/
│   ├── ui/           ← shadcn/ui + tokens de color (compartido)
│   ├── types/        ← tipos autogenerados (Supabase + Swagger)
│   └── config/       ← tsconfig, eslint, tailwind base configs
├── turbo.json
└── package.json
```

## Feature-Sliced Design — regla más importante

Cada feature tiene esta estructura interna obligatoria:

```
features/<nombre>/
├── api/          ← promesas Axios (<entidad>.api.ts)
├── components/   ← componentes React (PascalCase.tsx)
├── hooks/        ← custom hooks y React Query (useAlgo.ts)
├── store/        ← Zustand slice para estado UI efímero
└── index.ts      ← barrel file — ÚNICA puerta de entrada
```

### Regla de imports — NUNCA romper

```typescript
// ✅ CORRECTO — importar desde el barrel
import { MatchCard, useMatches } from '@/features/matches'

// ❌ INCORRECTO — importar directo al componente
import { MatchCard } from '@/features/matches/components/MatchCard'
```

El `index.ts` de cada feature es la única puerta de entrada. Todo lo que no se exporte desde `index.ts` es privado del feature.

## Tipos — regla crítica

**PROHIBIDO declarar interfaces a mano para entidades de la DB o la API.**

- Tipos de Supabase → `packages/types/src/supabase.ts` (autogenerado)
- Tipos de la API → `packages/types/src/api.ts` (autogenerado desde Swagger)

Si necesitás un tipo nuevo de la API, primero verificá que no exista en `packages/types`.

## Componentes UI

Todos los componentes base (Button, Input, Dialog, etc.) vienen de `packages/ui`.
Import: `import { Button } from '@match-padel/ui'`

Nunca instalar shadcn/ui directamente en `apps/app` o `apps/admin`. Todo pasa por `packages/ui`.

Los tokens de color están en `packages/ui/src/globals.css`. El azul primario de la app es `--primary`.

## Axios instance

En `src/lib/axios.ts` de cada app:
- Base URL: `VITE_API_URL` (env variable) + `/api/v1`
- Interceptor de request: agrega `Authorization: Bearer <supabase_jwt>`
- Interceptor de response: lee `response.data.data` en éxito, lanza error con `response.data.error` en fallo

**Nunca** usar `fetch` directamente. Siempre Axios a través de la instancia configurada.

## Supabase Realtime — acotado

`supabase.channel()` ÚNICAMENTE para la tabla `court_reservations` (disponibilidad de canchas en tiempo real).

Para todo lo demás (chat, ELO ready, pagos) usar Socket.io contra la API.

## Variables de entorno (Vite)

Prefijo `VITE_` obligatorio para que Vite las exponga al browser.
- `VITE_API_URL` — URL base de la API
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` — anon key (sujeta a RLS, no la service_role)

## Path aliases

Configurados en `tsconfig.json` y `vite.config.ts` de cada app:
- `@/features/*` → `src/features/*`
- `@/components/*` → `src/components/*`
- `@/lib/*` → `src/lib/*`

Para packages internos del monorepo:
- `@match-padel/ui` → `packages/ui`
- `@match-padel/types` → `packages/types`

## apps/app — reglas específicas

- **Mobile-first**: todo el CSS empieza en mobile, usa breakpoints para desktop
- **Dark mode por defecto**: clase `dark` en el `<html>`, el usuario puede cambiar a light
- **Navbar**: fixed en la parte inferior, thumb-friendly
- **i18n**: todos los strings de UI pasan por `t('key')`, nunca hardcodeados en español
- **PWA**: el Service Worker cachea el bundle y las reservas del usuario para offline
- **Lobby dinámico**: `/app/matches/:id` muta visualmente según `match.status` SIN cambiar URL
- **Bottom Sheet en tienda**: no navegar a `/store/:id`, abrir un Drawer desde `@match-padel/ui`

## apps/admin — reglas específicas

- **Desktop-first**: grillas densas tipo Excel, no mobile-first
- **Sidebar condicional**: se construye desde `club_staff.role`; el `super_admin` ve `/platform/*`
- **Multi-tenant**: todas las rutas de club tienen `/:clubId/` en la URL
- **Zustand**: mantener estado del sidebar (abierto/cerrado) y selección activa en store global
- **Guards de ruta**: verificar `club_staff.role` antes de renderizar; redirigir si no tiene acceso

## Lo que NO debes hacer

- ❌ Importar directo a `features/<nombre>/components/X` — solo via `features/<nombre>`
- ❌ Declarar tipos de entidades a mano — solo desde `@match-padel/types`
- ❌ Instalar shadcn/ui en apps/ directamente — solo desde `@match-padel/ui`
- ❌ Usar `fetch` — siempre Axios con la instancia configurada
- ❌ `supabase.channel()` en tablas que no sean `court_reservations`
- ❌ Strings de UI hardcodeados en español en `apps/app` — usar i18n
- ❌ Usar `any` en TypeScript
- ❌ Importar entre features directamente — si feature A necesita algo de feature B, extraerlo a un componente global o a un package
