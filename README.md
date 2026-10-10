# match-padel-web

Monorepo (Turborepo + npm workspaces) with the three frontends for Match Padel. They talk to [`match-padel-api`](https://github.com/agusshadow/match-padel-api).

## Apps

| App | Description | Production | `develop` branch |
|---|---|---|---|
| `apps/app` | Player PWA (mobile-first) | https://match-padel-app.vercel.app | https://match-padel-app-git-develop-agusshadows-projects.vercel.app |
| `apps/admin` | Club panel: owner, administrators, reception (desktop-first; the directory name is kept for the Vercel project) | https://match-padel-admin.vercel.app | https://match-padel-admin-git-develop-agusshadows-projects.vercel.app |
| `apps/platform` | Platform panel: superadmin and reviewers (desktop-first, dev port 5174) | not deployed yet (Vercel project to be created, root `apps/platform`) | not deployed yet |

**Vercel is connected to GitHub**: every push to `main` or `develop` deploys automatically, and every PR gets its own preview per app (linked from the Vercel bot's comment on the PR).

## Packages

| Package | Description |
|---|---|
| `packages/ui` | shadcn-style components (9 exist, not exported yet) and the panel components shared by `apps/admin` and `apps/platform` (exported) |
| `packages/types` | TypeScript types: generated Supabase types and the hand-written `api.ts` (envelope and panel response types) |
| `packages/config` | Base TypeScript and Tailwind configs |

## Setup

```bash
npm install
cp apps/app/.env.example apps/app/.env.local      # and the same for apps/admin and apps/platform
npm run dev            # all apps in parallel
```

| Script | What it does |
|---|---|
| `npm run dev` | Run all apps (Turborepo) |
| `npm run build` | Build everything |
| `npm run typecheck` | Type-check everything |
| `npm run supabase:types` | Regenerate `packages/types/src/supabase.ts` (needs the Supabase CLI and `SUPABASE_PROJECT_ID`; use the **dev** project, `vrnonxpxksaruvsvbplt`, where a migration lands first) |

There is no test framework yet, and `npm run lint` has no ESLint configuration to run (see "Real state vs. target" in `CLAUDE.md`).

## Working on this repo

- `main` and `develop` accept **no direct commits or pushes**. Work on a branch from `develop` and open a pull request against it (squash merge). Releases go through a `release/vX.Y.Z` branch (merge commit). Details in `CLAUDE.md`.
- Enable the local git hooks once per clone: `git config core.hooksPath .githooks`.
- With Claude Code, use `/implement <requirement>` for a change (plan, your approval, code, tests, review, PR) and `/release` to cut a release. Agents and skills live in `.claude/`.
- If a change needs new API endpoints, the `match-padel-api` PR is merged first.
- Commits and PRs are written in English, using conventional commits.

## Documentation

Everything under `docs/` is written for humans and agents alike, in English.

- [`CLAUDE.md`](./CLAUDE.md) — working contract: stack, architecture rules, real state vs. target, workflow.
- [`docs/screens.md`](./docs/screens.md) — routes, screens and endpoints used, as they exist today.
- [`docs/architecture.md`](./docs/architecture.md), [`docs/conventions.md`](./docs/conventions.md), [`docs/implementing.md`](./docs/implementing.md), [`docs/ui.md`](./docs/ui.md) — target architecture and how-tos.
