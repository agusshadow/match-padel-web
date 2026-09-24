# match-padel-web

Monorepo de frontends para Match Padel.

## Apps

| App     | Descripción                        | URL                        |
|---------|------------------------------------|----------------------------|
| `app`   | PWA para usuarios finales (móvil)  | app.matchpadel.com         |
| `admin` | Panel de administración (desktop)  | admin.matchpadel.com       |

## Paquetes

| Paquete   | Descripción                            |
|-----------|----------------------------------------|
| `ui`      | Componentes shadcn/ui del design system |
| `types`   | Tipos TS auto-generados (DB + API)     |
| `config`  | Configs base de TS y Tailwind          |

## Setup

```bash
# Instalar dependencias
pnpm install

# Desarrollo (ambas apps en paralelo)
pnpm dev

# Build
pnpm build

# Typecheck
pnpm typecheck

# Actualizar tipos de DB
pnpm supabase:types
```

## Documentación

- [Arquitectura](./docs/architecture.md)
- [Convenciones](./docs/conventions.md)
- [Cómo implementar](./docs/implementing.md)
- [Sistema de UI](./docs/ui.md)
