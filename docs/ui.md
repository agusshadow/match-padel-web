# Sistema de UI — match-padel-web

## Stack de UI

- **shadcn/ui**: Componentes copiados en `packages/ui/src/components/` (código propio, no deps)
- **Tailwind CSS**: Utilidades de estilo, con configuración base en `packages/config/tailwind.base.js`
- **CSS Custom Properties**: Tokens de color del design system de Match Padel

---

## Paleta de colores

Match Padel usa **azul como color primario** sobre **blanco/gris muy claro**.

### Tokens CSS (en `packages/ui/src/globals.css`)

```css
:root {
  /* Fondos */
  --background: 0 0% 100%;           /* blanco */
  --foreground: 222 47% 11%;         /* casi negro */
  
  /* Primary — Azul Match Padel */
  --primary: 213 94% 38%;            /* #0B5ED7 — azul principal */
  --primary-foreground: 0 0% 100%;   /* texto sobre primary */
  
  /* Secondary — Azul claro / acento */
  --secondary: 213 100% 96%;         /* #EBF4FF — fondo azul suave */
  --secondary-foreground: 213 94% 28%;

  /* Muted — grises para texto secundario */
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  /* Accent — hover states */
  --accent: 213 100% 93%;
  --accent-foreground: 213 94% 28%;

  /* Destructive — rojo para errores */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* Bordes y cards */
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 213 94% 38%;               /* mismo que primary para focus rings */

  /* Cards */
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;

  /* Popover */
  --popover: 0 0% 100%;
  --popover-foreground: 222 47% 11%;

  /* Radius */
  --radius: 0.5rem;
}

.dark {
  --background: 222 47% 8%;
  --foreground: 210 40% 98%;
  --primary: 213 87% 55%;            /* azul más brillante en dark mode */
  --primary-foreground: 222 47% 8%;
  --secondary: 217 33% 17%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --accent: 217 33% 17%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
  --ring: 213 87% 55%;
  --card: 222 47% 11%;
  --card-foreground: 210 40% 98%;
  --popover: 222 47% 11%;
  --popover-foreground: 210 40% 98%;
}
```

### Cómo actualizar el azul primario

Si el usuario final provee el hex exacto del azul de la marca, convertirlo a HSL y reemplazar `--primary`:

```
Hex: #1A6BE8  →  HSL: 213 78% 51%  →  --primary: 213 78% 51%;
```

Herramienta: https://www.colorhexa.com/ o cualquier conversor hex-to-hsl.

---

## Uso de colores en Tailwind

**Siempre** usar los tokens semánticos, nunca colores hardcodeados:

```tsx
// ✅ Correcto — usa el token
<div className="bg-primary text-primary-foreground" />
<p className="text-muted-foreground" />
<div className="border border-border rounded-[--radius]" />

// ❌ Prohibido — hardcodeado
<div className="bg-blue-600 text-white" />
<p className="text-gray-500" />
```

---

## Componentes disponibles en `@match-padel/ui`

Lista base de componentes shadcn/ui configurados:

| Componente      | Uso principal                                |
|-----------------|----------------------------------------------|
| `Button`        | Acciones primarias, secundarias, destructivas |
| `Card`          | Contenedores de contenido                    |
| `Input`         | Campos de texto                              |
| `Label`         | Labels para formularios                      |
| `Select`        | Dropdowns                                    |
| `Dialog`        | Modales                                      |
| `Sheet`         | Drawer desde el lado (bottom sheet en móvil) |
| `Tabs`          | Navegación por pestañas                      |
| `Badge`         | Etiquetas de estado                          |
| `Avatar`        | Foto de perfil                               |
| `Skeleton`      | Loading states                               |
| `Toast`         | Notificaciones efímeras                      |
| `Separator`     | Líneas divisoras                             |
| `ScrollArea`    | Contenedores con scroll custom               |
| `DropdownMenu`  | Menús contextuales                           |
| `Form`          | Wrapper para React Hook Form                 |
| `Table`         | Tablas de datos (admin principalmente)       |
| `Calendar`      | Selector de fechas                           |
| `Popover`       | Tooltips y contenido flotante                |

---

## Agregar un componente nuevo a `packages/ui`

### Opción A: Copiar de shadcn/ui CLI (recomendado)

En la raíz del monorepo, el CLI de shadcn/ui está configurado para escribir en `packages/ui`:

```bash
# Desde la raíz del monorepo
pnpm --filter @match-padel/ui dlx shadcn-ui@latest add <nombre-componente>
```

El componente se copia en `packages/ui/src/components/<Nombre>.tsx` y se puede editar libremente.

### Opción B: Crear manualmente

1. Crear `packages/ui/src/components/<Nombre>.tsx` siguiendo el patrón de los existentes
2. Exportar desde `packages/ui/src/index.ts`
3. Usar `cn()` para clases condicionales y tokens CSS para colores

---

## Dark mode

- `apps/app`: **dark mode por defecto** (móvil, experiencia tipo app nativa)
- `apps/admin`: **light mode por defecto** (desktop, dashboard de gestión)

### Configuración en HTML

```html
<!-- apps/app/index.html -->
<html class="dark">

<!-- apps/admin/index.html -->
<html>
```

### Toggle de tema (apps/app)

```tsx
// src/components/ThemeToggle.tsx
import { useTheme } from '@/lib/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
```

---

## Layout móvil (apps/app)

```
┌─────────────────────┐
│  Header (sticky)    │  h-14, bg-background, border-b
├─────────────────────┤
│                     │
│   Contenido main    │  flex-1, overflow-y-auto, pb-20
│                     │
├─────────────────────┤
│  Bottom Nav         │  h-16, bg-background, border-t, fixed bottom-0
└─────────────────────┘
```

```tsx
// Layout base de apps/app
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header className="sticky top-0 z-50" />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />
    </div>
  )
}
```

---

## Layout admin (apps/admin)

```
┌────────┬──────────────────────────┐
│        │  Topbar                  │
│        ├──────────────────────────┤
│Sidebar │                          │
│        │   Contenido principal    │
│        │                          │
└────────┴──────────────────────────┘
```

```tsx
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useAdminSidebarStore()

  return (
    <div className="flex h-screen">
      <Sidebar collapsed={isCollapsed} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## Bottom Sheet (apps/app)

Para la tienda y otras pantallas que necesitan un drawer desde abajo:

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@match-padel/ui'

<Sheet>
  <SheetTrigger asChild>
    <Button>Abrir tienda</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
    <StoreContent />
  </SheetContent>
</Sheet>
```

---

## Loading states

Usar `Skeleton` de `@match-padel/ui` para loading states, nunca spinners genéricos en toda la página:

```tsx
// Loading state de una card
export function ReservationCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </Card>
  )
}
```

---

## Iconos

Usar `lucide-react` (viene incluido con shadcn/ui):

```tsx
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react'

<Calendar className="h-4 w-4 text-muted-foreground" />
```

Tamaños estándar:
- `h-3 w-3` — micro, en badges
- `h-4 w-4` — inline en texto
- `h-5 w-5` — en botones
- `h-6 w-6` — standalone icons
- `h-8 w-8` — títulos

---

## Tipografía

Font por defecto: **Inter** (Google Fonts)

```html
<!-- index.html de cada app -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

```css
/* En tailwind.config.ts */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```
