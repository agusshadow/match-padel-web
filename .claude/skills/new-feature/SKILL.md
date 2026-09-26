---
name: new-feature
description: Recipe to create a new feature in match-padel-web (apps/app or apps/admin) with the correct structure, data layer, routes and i18n.
---

# Create a new feature

Full reference: `docs/implementing.md` ("Add a new feature") and `docs/conventions.md`. This skill is the operational summary.

1. Confirm which app it belongs to (`apps/app` or `apps/admin`) and that the feature does not already exist in `src/features/`.
2. Create `src/features/<name>/` following the convention of **that app**:
   - `app`: `api/` or `services/` (Axios calls), `components/`, `hooks/` (React Query), `store/` (Zustand, UI state only), `index.ts`.
   - `admin`: one folder per feature holding its pages; keep the existing flat style.
3. Data layer: functions using the instance from `src/lib/axios.ts` (never `fetch`), hooks with TanStack Query, types from `@match-padel/types`.
4. Forms with React Hook Form + Zod.
5. Cover the loading, empty, error and success states.
6. Register the route in `src/App.tsx` (protected if applicable).
7. `apps/app`: add every text to `src/i18n/locales/es.json` and `en.json` and use them with `t('key')`.
8. Export the public surface from the feature's `index.ts`.
9. Run `npm run typecheck`.

Rules: base components from `@match-padel/ui`, no `any`, no importing between features through internal paths.
