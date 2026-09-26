# CLAUDE.md — match-padel-web

Este archivo es tu contrato de trabajo. Léelo completo antes de tocar cualquier archivo.

## Qué es este proyecto
Monorepo con Turborepo que contiene dos aplicaciones React:
- `apps/app` — PWA para jugadores (B2C, mobile-first, dark mode por defecto)
- `apps/admin` — Panel de administración para staff de clubes (B2B, desktop-first)

Comparten código a través de packages internos.

## Stack
- **Monorepo**: Turborepo + npm workspaces (el gestor real es npm; hay `package-lock.json`)
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
- **Tests**: Vitest + React Testing Library (objetivo; todavía no configurado, ver "Estado real vs. objetivo")

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
- Base URL: `VITE_API_URL`, que **debe incluir `/api/v1`** (ej. `https://match-padel-api-dev.onrender.com/api/v1`); las apps no lo agregan solas
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
- `@/*` → `src/*` (un solo alias por app; `@/features/...`, `@/lib/...` funcionan por esa regla)

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

## Estado real vs. objetivo

Este documento describe la **arquitectura objetivo**. El código existente no siempre la cumple. Para código nuevo seguí el objetivo; no copies los desvíos de la columna derecha, y no los "arregles de paso" sin que el plan lo pida (se limpian en tareas aparte).

| Tema | Objetivo (este documento) | Realidad hoy |
|---|---|---|
| Estructura de feature | `api/`, `components/`, `hooks/`, `store/`, `index.ts` | 6 features usan `services/` y solo 1 usa `api/`; solo `auth` tiene `index.ts` (1 de 10) |
| Imports | Siempre por el `index.ts` de la feature | Hay 15 imports directos a `features/*/components` |
| Tipos | Desde `@match-padel/types` | Ningún archivo lo usa; `packages/types` existe (`supabase.ts`, `api.ts` de 20 líneas) |
| Componentes base | `@match-padel/ui` | Solo 2 archivos lo usan |
| i18n en `apps/app` | Todo texto por `t('key')` | Solo 5 de 21 archivos `.tsx` usan `useTranslation` |
| Admin | Rutas `/:clubId/...`, `/platform/*`, sidebar según rol de `club_staff` | 6 rutas planas (`/dashboard`, `/clubs`, `/reservations`, `/users`, `/matches`, `/tournaments`), sin guardas por rol; solo login, sin registro |
| HTTP | Solo Axios | Hay 2 usos de `fetch(` |
| Tests | Vitest + RTL, 50% en `src/features/` | Sin framework ni tests |
| Lint | ESLint | Existe el script `lint`, pero no encontré configuración de ESLint: probablemente falla |
| Gestor de paquetes | (el documento decía pnpm) | npm |
| Duplicados en `apps/app` | — | `auth.store.ts` (canónico, 10 imports) y `authStore.ts` (sin uso); `i18n.ts` y `i18n/index.ts` (`main.tsx` importa `./i18n`) |

## Flujo de trabajo con agentes

Los requerimientos entran por una sesión de Claude. La sesión principal **orquesta**; los subagentes de `.claude/agents/` ejecutan. El comando `/implement <requerimiento>` (`.claude/skills/implement/`) dispara el flujo completo:

0. Verificar el contrato de API (si falta, el PR de `match-padel-api` va primero)
1. `planner` → plan
2. **Checkpoint: el usuario aprueba el plan** (nada se codea antes)
3. `frontend-dev` → implementación
4. `tester` → tests
5. `reviewer` → revisión (máx. 2 vueltas de correcciones)
6. `pr-agent` → rama, commits y PR contra `develop`

| Agente | Responsabilidad |
|---|---|
| `planner` | Plan del lado web. Solo lectura |
| `frontend-dev` | Código de `apps/app` y `apps/admin` |
| `tester` | Tests. No modifica código de producción |
| `reviewer` | Revisión del diff. No modifica código |
| `pr-agent` | Git y `gh`: ramas, commits, PR |

Skills de apoyo: `new-feature`, `pr-format`.

## Ramas, ambientes y reglas duras

- `main` es **producción** (proyectos de Vercel `match-padel-app` y `match-padel-admin`, apuntando a la API y Supabase de producción). `develop` es la rama de trabajo, que apunta a la API dev y Supabase dev mediante variables de entorno de Preview.
- Los proyectos de Vercel **todavía no están conectados a GitHub**: los deploys de dev son manuales y se publican en los alias fijos `match-padel-app-dev.vercel.app` y `match-padel-admin-dev.vercel.app` (`vercel alias set`). Cuando se conecten, cada PR tendrá su preview.
- Todo PR va contra `develop` y se mergea con **squash**. `develop` → `main` usa **merge commit** y lo hace el humano.
- Commits y PRs en **inglés**, commits convencionales. Ver el skill `pr-format`. Sin capturas de pantalla en los PR.
- **Nunca** tocar producción desde una sesión de agentes. Nunca poner claves secretas en el bundle: solo variables `VITE_` públicas (anon key, nunca `service_role`).
- Si el cambio depende de la API, el PR de `match-padel-api` se mergea primero y este lo referencia en "Related PR".
