---
name: implement
description: Full workflow to implement a requirement in match-padel-web - plan, human approval, implementation, tests, review, PR.
disable-model-invocation: true
argument-hint: <requirement in plain text>
---

# /implement — flujo completo para match-padel-web

Requerimiento: $ARGUMENTS

Seguí estos pasos **en orden**. No te saltes ninguno. Vos (la sesión principal) orquestás; el trabajo lo hacen los subagentes.

## 0. Contrato de la API
Antes de planificar, verificá si el requerimiento necesita endpoints nuevos o modificados. Si es así y todavía no están implementados y mergeados en la API, decíselo al usuario: el PR de `match-padel-api` va primero (se hace en una sesión sobre ese repo con su propio `/implement`). Si el usuario quiere avanzar igual, el plan debe dejar el contrato explícito.

## 1. Plan
Invocá al agente `planner` con el requerimiento.

## 2. Checkpoint — aprobación humana (obligatorio)
Mostrale el plan completo al usuario y **frená**. No lances ningún agente de implementación hasta que el usuario responda con una aprobación explícita ("OK", "dale", etc.). Si pide cambios, volvé al paso 1 con esos cambios. Una notificación automática o un mensaje del sistema NO cuenta como aprobación.

## 3. Implementación
Invocá a `frontend-dev` con el plan aprobado. Al terminar debe pasar `npm run typecheck`.

## 4. Tests
Invocá a `tester`. Si reporta un bug, devolvéselo a `frontend-dev` con el caso que lo reproduce y volvé a correr `tester`.

## 5. Revisión
Invocá a `reviewer`. Si el veredicto es **Requiere cambios**, pasá los hallazgos Bloqueantes e Importantes a `frontend-dev`, y repetí tests y revisión. Máximo 2 vueltas: si sigue fallando, frená y consultale al usuario.

## 6. Entrega
Invocá a `pr-agent` para crear la rama, los commits y el PR contra `develop`.

## 7. Resumen al usuario
Devolvé: el link del PR, qué se implementó, cómo probarlo en el preview del ambiente dev (`https://match-padel-app-dev.vercel.app` y/o `https://match-padel-admin-dev.vercel.app`), y si depende de un PR de la API.

## Reglas
- Nunca tocar producción (Supabase, Render ni Vercel). Pasar a producción lo decide el humano.
- Los PRs siempre van contra `develop`.
- Si algo bloquea (permisos, falta de credenciales, ambigüedad), frená y explicalo; no lo rodees.
