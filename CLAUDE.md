# CLAUDE.md — match-padel-web

This file is your working contract. Read it completely before touching any file.

## What this project is
A Turborepo monorepo containing three React applications:
- `apps/app` — PWA for players (B2C, mobile-first, dark mode by default)
- `apps/admin` — Club panel for club owner, administrators and reception (B2B, desktop-first). The directory keeps the name `admin` because the existing Vercel project points at it
- `apps/platform` — Platform panel for superadmin and reviewers (B2B, desktop-first)

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
│   ├── admin/        ← club panel (desktop-first)
│   └── platform/     ← platform panel (desktop-first)
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

Never install shadcn/ui directly in `apps/app`, `apps/admin` or `apps/platform`. Everything goes through `packages/ui`.

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

## apps/admin (club panel) and apps/platform — specific rules

- **Desktop-first**: dense Excel-like grids, not mobile-first
- **Data only through the API**: Supabase JS is for auth (sign in/out, session, JWT) only; no `.from('table')`
- **Access comes from `GET /me/access`**: the user's clubs with role (`owner`/`admin`/`staff`/`superadmin`) and `platformRole` (`superadmin`/`reviewer`/`null`). The server enforces permissions; guards and hidden actions are UX only
- **`apps/admin` is multi-tenant**: every club route has `/:clubId/` in the URL; the sidebar is built from the role and the status of that club; reception (`staff`) does not see matches, tournaments, courts, the team, the application or club-data edit actions, and only cancels reservations (no confirm / complete); a club that is not `approved` only opens its application (`/:clubId/onboarding`)
- **`apps/platform`**: needs a non-null `platformRole`; reviewers only see the applications inbox and the detail of an application, where they review it (approve, ask for corrections, reject); suspend, reactivate and reopen are superadmin only
- **Zustand**: only ephemeral UI state (sidebar, last club); server data lives in React Query
- Shared panel components (`LoginForm`, `PageHeader`, `StatCard`, `StatusBadge`, `Pagination`, `Notice`) and `format*` helpers come from `@match-padel/ui`

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
| Types | From `@match-padel/types` | `apps/admin` and `apps/platform` import the package alias; in `apps/app` no file does; the few places that use the types import `packages/types/src/*` by long relative paths. `packages/types` has `supabase.ts` and a hand-written 20-line `api.ts` |
| Base components | `@match-padel/ui` | `packages/ui/src/index.ts` exports `cn`, `format*` helpers and the panel components (`components/panel`, used by `apps/admin` and `apps/platform`); the 9 shadcn-style components in `packages/ui/src/components` are still not exported and `apps/app` imports nothing from the package |
| i18n in `apps/app` | Every text through `t('key')` | Met — unified on `src/i18n/index.ts` + `locales/{es,en}.json` (card #32); every screen's UI text goes through `t('key')` |
| Admin | `/:clubId/...` routes in the club panel, a separate platform panel, sidebar by role | Met for F0 (card #66) and the web half of F1 (card #67): `apps/admin` is the club panel with `/:clubId/{dashboard,reservations,matches,tournaments,club}`, role-aware sidebar and guards from `GET /me/access`, owner registration (`/register`, email code), club selector with statuses (`/clubs`), new application (`/new-club`) and the onboarding wizard (`/:clubId/onboarding`); non-approved clubs only open their application. `apps/platform` has dashboard, clubs (status filter, suspend / reactivate), users, audit log and, since card #68, the applications inbox (`/requests`) and detail (`/requests/:clubId`) with the review actions (approve, ask for corrections, reject), the document viewer and the status history. Since card #70 (F2) the club panel also has the Courts area (`/:clubId/courts`, `/courts/:courtId`, `/courts/exceptions`; owner/admin): courts CRUD, weekly schedule per court (several intervals a day, 30/60/90/120 min slots), price bands by day and hour, exceptions (club-wide or per court) and a preview of what players see; `apps/app` shows the API-computed slot `price`/`min_total_price` and handles `OUTSIDE_SCHEDULE`/`COURT_CLOSED`. Since card #71 (F2) the club panel also has the calendar (`/:clubId/calendar`: day / week grid in the club timezone with reservations, ranked matches and blocks; move, cancel with refund summary, confirm / complete; blocks for owner/admin) and the sidebar entry "Calendario". Since card #72 (F2) the club has its team: `/:clubId/team` (owner manages, administrator reads, reception has no entry; members with change role / remove, invitations with resend / revoke, "Invitar persona") and the public `/invite?token=&club=` page that previews and accepts an invitation (signed out: login / register and back; the token is moved to `sessionStorage` and removed from the URL); reception no longer sees Confirmar / Completar in the reservations list (the API rejects them). MP account and tournament management are still missing (phases F3-F4). No registration in `apps/platform` (login only) |
| HTTP | Axios only, all data through the API | No `fetch(` calls. Both panels go through the API (`/club-admin/:clubId/*`, `/platform/*`, `/me/access`) with Supabase for auth only; their Axios interceptors do not unwrap `response.data.data` yet (each API file does `.then((r) => r.data.data)`) |
| Tests | Vitest + RTL, 50% in `src/features/` | No framework and no tests |
| Lint | ESLint | The `lint` script exists, but I found no ESLint configuration: it probably fails |
| Duplicates in `apps/app` | — | `auth.store.ts` is the only auth store now (`authStore.ts`, the unused duplicate, was removed — card #33). Two i18n setups: `i18n.ts` (Spanish only, flat keys) is the one **loaded** (`main.tsx` imports `./i18n`, which resolves to the file first); `i18n/index.ts` + `locales/{es,en}.json` is the target but is not loaded. New keys go in `i18n.ts` and are mirrored in the JSON |

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
| `frontend-dev` | Code in `apps/app`, `apps/admin` and `apps/platform` |
| `tester` | Tests. Does not modify production code |
| `reviewer` | Diff review. Does not modify code |
| `pr-agent` | Git and `gh`: branches, commits, PR |

Supporting skills: `new-feature`, `pr-format`, `release`, `trello-story`.

## Branches, environments and hard rules

- `main` is **production** (Vercel projects `match-padel-app` and `match-padel-admin`, plus `match-padel-platform` once it is created; pointing at the production API and Supabase). `develop` is the working branch, which points at the dev API (`https://match-padel-api-dev.onrender.com/api/v1`, Render `match-padel-api-dev`) and the dev Supabase project `match-padel-dev` (`vrnonxpxksaruvsvbplt`) through three Vercel Preview variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) **scoped to the `develop` branch**, set on both Vercel projects. The dev environment was rebuilt on 03/10/2026 (the previous dev Supabase project no longer exists). Changing those values only takes effect on the next build of `develop`. PR previews from other branches use a second set of Preview variables with no branch scope, set to the same dev values (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, all Preview-only). The old "All Environments" Supabase variables now cover only Production and Development, so no preview can reach production Supabase. Fixed on 03/10/2026 on both Vercel projects; before that, PR previews pointed at production Supabase and at a non-existent API URL (`match-padel-api-preview.vercel.app`).
- **Previewing a branch:** every PR gets a frontend preview that uses the dev API and dev Supabase. The dev API always runs `develop` and the dev database is shared, so backend changes must be merged to `develop` first to be seen in a preview; details and alternatives in `docs/architecture.md`, "Previewing a branch before merging to `develop`".
- **Vercel is connected to GitHub** (confirmed 2026-09-27): every PR gets an automatic preview per app, posted as a comment by the Vercel bot on the PR (with direct links) and as PR status checks. Pushing to `develop` also updates the fixed branch alias `match-padel-app-git-develop-agusshadows-projects.vercel.app` / `match-padel-admin-git-develop-agusshadows-projects.vercel.app` automatically — the old manual `vercel alias set` workflow is no longer needed.
- **`main` and `develop` accept no direct commits or pushes.** Everything goes through a pull request. GitHub branch protection is not available for private repos on the free plan, so it is enforced locally: (1) a Claude Code hook (`.claude/hooks/guard-protected-branches.py`, registered in `.claude/settings.json`) that blocks agents, in every session on this repo; (2) git hooks in `.githooks/` for the human, enabled once per clone with `git config core.hooksPath .githooks`. Only the human may override the git hooks in an emergency (`ALLOW_PROTECTED_BRANCH=1`); agents must never bypass them.
- **Day-to-day:** feature branch from `develop` → PR against `develop` → merged with **squash** by the human.
- **Release** (`/release` skill): when `develop` has accumulated several commits, a `release/vX.Y.Z` branch is cut from `develop` with all of them plus **one** extra commit, `chore: version bump`, that only raises the version. It is merged into `main` with a **merge commit** (to keep traceability), then `main` is merged back into `develop` (PR, **merge commit**) so both branches are level again.
- Never enable "automatically delete head branches" on the repository: the release flow uses `develop` and `main` as PR heads.
- Commits and PRs in **English**, conventional commits. See the `pr-format` skill, including the Screenshots rule for PRs touching `apps/app`/`apps/admin`/`apps/platform` (images live on the never-merged `assets` orphan branch, never on `develop`/`main`).
- **Never** touch production from an agent session. Never put secret keys in the bundle: only public `VITE_` variables (anon key, never `service_role`).
- If the change depends on the API, the `match-padel-api` PR is merged first and this one references it under "Related PR". If that API PR includes a database migration, it is applied to the dev project when the PR is merged and promoted to production **before** the release that ships this change is merged (the API repo's `release` skill lists the pending migrations). Regenerate `packages/types/src/supabase.ts` from the **dev** project (`SUPABASE_PROJECT_ID=vrnonxpxksaruvsvbplt`) once the migration is applied there, because dev is where the new schema exists first; the header of that generated file may still say the production project until it is regenerated.

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
