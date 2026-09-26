# CLAUDE.md — match-padel-web

This file is your working contract. Read it completely before touching any file.

## What this project is
A Turborepo monorepo containing two React applications:
- `apps/app` — PWA for players (B2C, mobile-first, dark mode by default)
- `apps/admin` — Admin panel for club staff (B2B, desktop-first)

They share code through internal packages.

## Stack
- **Monorepo**: Turborepo + npm workspaces (the real package manager is npm; there is a `package-lock.json`)
- **Framework**: React 18 + TypeScript + Vite 5 (Tailwind 3, Zustand 4)
- **Styles**: Tailwind CSS + shadcn/ui (from `packages/ui`)
- **Server state**: TanStack React Query v5
- **Global UI state**: Zustand
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios with interceptors (target: unwrap `response.data.data`; today each service does `.then(r => r.data.data)` itself)
- **Auth**: Supabase JS (auth only — login/register/JWT)
- **Realtime DB**: `supabase.channel()` ONLY on `court_reservations`
- **Realtime API**: Socket.io-client (chat, ELO ready, staff notifications)
- **i18n**: i18next + react-i18next (only in `apps/app`, Spanish base)
- **PWA**: vite-plugin-pwa + Workbox (only in `apps/app`)
- **Tests**: Vitest + React Testing Library (target; not configured yet, see "Real state vs. target")

## Monorepo structure

```
match-padel-web/
├── apps/
│   ├── app/          ← players PWA (mobile-first, dark mode)
│   └── admin/        ← B2B panel (desktop-first)
├── packages/
│   ├── ui/           ← shadcn/ui + color tokens (shared)
│   ├── types/        ← generated types (Supabase + Swagger)
│   └── config/       ← base tsconfig, eslint, tailwind configs
├── turbo.json
└── package.json
```

## Feature-Sliced Design — the most important rule

Every feature has this mandatory internal structure:

```
features/<name>/
├── api/          ← Axios promises (<entity>.api.ts)
├── components/   ← React components (PascalCase.tsx)
├── hooks/        ← custom hooks and React Query (useSomething.ts)
├── store/        ← Zustand slice for ephemeral UI state
└── index.ts      ← barrel file — the ONLY entry point
```

### Import rule — NEVER break it

```typescript
// ✅ CORRECT — import from the barrel
import { MatchCard, useMatches } from '@/features/matches'

// ❌ WRONG — import straight from the component
import { MatchCard } from '@/features/matches/components/MatchCard'
```

Each feature's `index.ts` is the only entry point. Anything not exported from `index.ts` is private to the feature.

## Types — critical rule

**Hand-declaring interfaces for DB or API entities is FORBIDDEN.**

- Supabase types → `packages/types/src/supabase.ts` (generated)
- API types → `packages/types/src/api.ts` (generated from Swagger)

If you need a new API type, first check that it does not already exist in `packages/types`.

## UI components

All base components (Button, Input, Dialog, etc.) come from `packages/ui`.
Import: `import { Button } from '@match-padel/ui'`

Never install shadcn/ui directly in `apps/app` or `apps/admin`. Everything goes through `packages/ui`.

Color tokens live in `packages/ui/src/globals.css`. The app's primary blue is `--primary`.

## Axios instance

In each app's `src/lib/axios.ts`:
- Base URL: `VITE_API_URL`, which **must include `/api/v1`** (e.g. `https://match-padel-api-dev.onrender.com/api/v1`); the apps do not append it themselves
- Request interceptor: adds `Authorization: Bearer <supabase_jwt>`
- Response interceptor (target): reads `response.data.data` on success, throws an error with `response.data.error` on failure. Today neither app's interceptor unwraps, so services do `.then(r => r.data.data)`; keep that pattern until the interceptor changes

**Never** use `fetch` directly. Always Axios through the configured instance.

## Supabase Realtime — scoped

`supabase.channel()` ONLY for the `court_reservations` table (live court availability).

For everything else (chat, ELO ready, payments) use Socket.io against the API.

## Environment variables (Vite)

The `VITE_` prefix is mandatory for Vite to expose them to the browser.
- `VITE_API_URL` — API base URL
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` — anon key (subject to RLS, never the service_role)

## Path aliases

Configured in each app's `tsconfig.json` and `vite.config.ts`:
- `@/*` → `src/*` (a single alias per app; `@/features/...` and `@/lib/...` work through that rule)

For the monorepo's internal packages:
- `@match-padel/ui` → `packages/ui`
- `@match-padel/types` → `packages/types`

## apps/app — specific rules

- **Mobile-first**: all CSS starts at mobile and uses breakpoints for desktop
- **Dark mode by default**: `dark` class on `<html>`, the user can switch to light
- **Navbar**: fixed at the bottom, thumb-friendly
- **i18n**: every UI string goes through `t('key')`, never hardcoded in Spanish
- **PWA**: the Service Worker caches the bundle and the user's reservations for offline use
- **Dynamic lobby**: `/app/matches/:id` visually mutates according to `match.status` WITHOUT changing the URL
- **Bottom Sheet in the store**: do not navigate to `/store/:id`, open a Drawer from `@match-padel/ui`

## apps/admin — specific rules

- **Desktop-first**: dense Excel-like grids, not mobile-first
- **Conditional sidebar**: built from `club_staff.role`; `super_admin` sees `/platform/*`
- **Multi-tenant**: every club route has `/:clubId/` in the URL
- **Zustand**: keep the sidebar state (open/closed) and the active selection in a global store
- **Route guards**: verify `club_staff.role` before rendering; redirect if there is no access

## What you must NOT do

- ❌ Import straight into `features/<name>/components/X` — only via `features/<name>`
- ❌ Hand-declare entity types — only from `@match-padel/types`
- ❌ Install shadcn/ui in apps/ directly — only from `@match-padel/ui`
- ❌ Use `fetch` — always Axios with the configured instance
- ❌ `supabase.channel()` on tables other than `court_reservations`
- ❌ Hardcoded Spanish UI strings in `apps/app` — use i18n
- ❌ Use `any` in TypeScript
- ❌ Import between features directly — if feature A needs something from feature B, extract it into a global component or a package

## Real state vs. target

This document describes the **target architecture**. The existing code does not always meet it. For new code follow the target; do not copy the deviations in the right-hand column, and do not "fix them along the way" unless the plan asks for it (they are cleaned up in separate tasks).

| Topic | Target (this document) | Reality today |
|---|---|---|
| Feature structure | `api/`, `components/`, `hooks/`, `store/`, `index.ts` | 6 features use `services/` and only 1 uses `api/`; only `auth` has an `index.ts` (1 of 10) |
| Imports | Always through the feature's `index.ts` | There are 15 direct imports into `features/*/components` |
| Types | From `@match-padel/types` | No file imports the package alias; the few places that use the types import `packages/types/src/*` by long relative paths. `packages/types` has `supabase.ts` and a hand-written 20-line `api.ts` |
| Base components | `@match-padel/ui` | Nothing imports it, and `packages/ui/src/index.ts` exports only `cn`, so no component is importable yet (9 components exist in `packages/ui/src/components`) |
| i18n in `apps/app` | Every text through `t('key')` | Only 5 of 21 `.tsx` files use `useTranslation` |
| Admin | `/:clubId/...` routes, `/platform/*`, sidebar by `club_staff` role | 6 flat routes (`/dashboard`, `/clubs`, `/reservations`, `/users`, `/matches`, `/tournaments`), no per-route role guards (the login rejects users whose `users.role` is not `club_staff`/`super_admin`); login only, no registration |
| HTTP | Axios only, all data through the API | No `fetch(` calls. But `apps/admin` bypasses the API: it queries and writes Supabase tables directly, and its `lib/axios.ts` is unused |
| Tests | Vitest + RTL, 50% in `src/features/` | No framework and no tests |
| Lint | ESLint | The `lint` script exists, but I found no ESLint configuration: it probably fails |
| Duplicates in `apps/app` | — | `auth.store.ts` (canonical, 10 imports) and `authStore.ts` (unused). Two i18n setups: `i18n.ts` (Spanish only, flat keys) is the one **loaded** (`main.tsx` imports `./i18n`, which resolves to the file first); `i18n/index.ts` + `locales/{es,en}.json` is the target but is not loaded. New keys go in `i18n.ts` and are mirrored in the JSON |

## Agent workflow

Requirements come in through a Claude session. The main session **orchestrates**; the subagents in `.claude/agents/` execute. The `/implement <requirement>` command (`.claude/skills/implement/`) triggers the full flow:

0. Check the API contract (if it is missing, the `match-padel-api` PR goes first)
1. `planner` → plan
2. **Checkpoint: the user approves the plan** (nothing is coded before that)
3. `frontend-dev` → implementation
4. `tester` → tests
5. `reviewer` → review (max. 2 rounds of fixes)
6. `pr-agent` → branch, commits and PR against `develop`

| Agent | Responsibility |
|---|---|
| `planner` | Web-side plan. Read-only |
| `frontend-dev` | Code in `apps/app` and `apps/admin` |
| `tester` | Tests. Does not modify production code |
| `reviewer` | Diff review. Does not modify code |
| `pr-agent` | Git and `gh`: branches, commits, PR |

Supporting skills: `new-feature`, `pr-format`, `release`.

## Branches, environments and hard rules

- `main` is **production** (Vercel projects `match-padel-app` and `match-padel-admin`, pointing at the production API and Supabase). `develop` is the working branch, which points at the dev API and dev Supabase through Preview environment variables.
- The Vercel projects are **not connected to GitHub yet**: dev deploys are manual and published at the fixed aliases `match-padel-app-dev.vercel.app` and `match-padel-admin-dev.vercel.app` (`vercel alias set`). Once they are connected, every PR will get a preview.
- **`main` and `develop` accept no direct commits or pushes.** Everything goes through a pull request. GitHub branch protection is not available for private repos on the free plan, so it is enforced locally: (1) a Claude Code hook (`.claude/hooks/guard-protected-branches.py`, registered in `.claude/settings.json`) that blocks agents, in every session on this repo; (2) git hooks in `.githooks/` for the human, enabled once per clone with `git config core.hooksPath .githooks`. Only the human may override the git hooks in an emergency (`ALLOW_PROTECTED_BRANCH=1`); agents must never bypass them.
- **Day-to-day:** feature branch from `develop` → PR against `develop` → merged with **squash** by the human.
- **Release** (`/release` skill): when `develop` has accumulated several commits, a `release/vX.Y.Z` branch is cut from `develop` with all of them plus **one** extra commit, `chore: version bump`, that only raises the version. It is merged into `main` with a **merge commit** (to keep traceability), then `main` is merged back into `develop` (PR, **merge commit**) so both branches are level again.
- Never enable "automatically delete head branches" on the repository: the release flow uses `develop` and `main` as PR heads.
- Commits and PRs in **English**, conventional commits. See the `pr-format` skill. No screenshots in PRs.
- **Never** touch production from an agent session. Never put secret keys in the bundle: only public `VITE_` variables (anon key, never `service_role`).
- If the change depends on the API, the `match-padel-api` PR is merged first and this one references it under "Related PR".

## Documentation map

- `docs/screens.md` — what exists today: routes per app, owning features, endpoints each screen calls, known gaps. **Read it before planning.**
- `docs/architecture.md`, `docs/conventions.md`, `docs/implementing.md`, `docs/ui.md` — target architecture and how-tos. Anything not built yet is marked "target — not implemented yet".
- `docs/screens.md` "Known gaps" lists verified deviations, including bugs found during the audit.

## Keeping documentation current

Documentation is part of the definition of done. In the **same PR** as the code:

- Added, changed or removed a route, screen or the endpoints a screen calls → update `docs/screens.md`.
- Fixed or introduced a deviation from the target architecture → update the "Real state vs. target" table above.
- Added an environment variable → update both `.env.example` files.
- Added an i18n key in `apps/app` → see "Real state vs. target" (keys go in `i18n.ts` and are mirrored in the JSON files).
- Described something that is not built yet → mark it "target — not implemented yet".

`frontend-dev` makes the update, `reviewer` checks it, and the PR checklist has an item for it.
