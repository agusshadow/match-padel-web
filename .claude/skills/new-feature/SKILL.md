---
name: new-feature
description: Recipe to create a new feature in match-padel-web (apps/app or apps/admin) with the correct structure, data layer, routes and i18n.
---

# Crear una feature nueva

Fuente completa: `docs/implementing.md` ("Agregar una nueva feature") y `docs/conventions.md`. Este skill es el resumen operativo.

1. Confirmá en qué app va (`apps/app` o `apps/admin`) y que la feature no existe ya en `src/features/`.
2. Creá `src/features/<nombre>/` siguiendo la convención de **esa app**:
   - `app`: `api/` o `services/` (llamadas Axios), `components/`, `hooks/` (React Query), `store/` (Zustand, solo estado de UI), `index.ts`.
   - `admin`: carpeta por feature con sus páginas; mantené el estilo plano existente.
3. Capa de datos: funciones que usan la instancia de `src/lib/axios.ts` (nunca `fetch`), hooks con TanStack Query, tipos desde `@match-padel/types`.
4. Formularios con React Hook Form + Zod.
5. Cubrí los estados de carga, vacío, error y éxito.
6. Registrá la ruta en `src/App.tsx` (protegida si corresponde).
7. `apps/app`: agregá todos los textos a `src/i18n/locales/es.json` y `en.json` y usalos con `t('key')`.
8. Exportá lo público desde `index.ts` de la feature.
9. Corré `npm run typecheck`.

Reglas: componentes base desde `@match-padel/ui`, sin `any`, sin importar entre features por rutas internas.
