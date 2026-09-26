# UI System — match-padel-web

## UI Stack

- **shadcn/ui**: Components in `packages/ui/src/components/` (owned code). Today the 9 existing components are hand-written in the shadcn style (Tailwind + `cn()`, no Radix); the shadcn CLI is not configured (no `components.json`) (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)
- **Tailwind CSS** (v3): Styling utilities, with base configuration in `packages/config/tailwind.base.js` (each app and `packages/ui` extend it; the apps also scan `../../packages/ui/src`)
- **CSS Custom Properties**: Color tokens of the Match Padel design system

---

## Color palette

Match Padel uses **blue as the primary color** on **white/very light gray**.

### CSS tokens (in `packages/ui/src/globals.css`)

```css
:root {
  /* Backgrounds */
  --background: 0 0% 100%;           /* white */
  --foreground: 222 47% 11%;         /* almost black */
  
  /* Primary — Match Padel blue */
  --primary: 213 94% 38%;            /* #0B5ED7 — main blue */
  --primary-foreground: 0 0% 100%;   /* text on primary */
  
  /* Secondary — Light blue / accent */
  --secondary: 213 100% 96%;         /* #EBF4FF — soft blue background */
  --secondary-foreground: 213 94% 28%;

  /* Muted — grays for secondary text */
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;

  /* Accent — hover states */
  --accent: 213 100% 93%;
  --accent-foreground: 213 94% 28%;

  /* Destructive — red for errors */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* Borders and cards */
  --border: 214 32% 91%;
  --input: 214 32% 91%;
  --ring: 213 94% 38%;               /* same as primary for focus rings */

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
  --primary: 213 87% 55%;            /* brighter blue in dark mode */
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

The tokens above match `packages/ui/src/globals.css` (declared inside `@layer base`). Only `apps/app` loads that file (`main.tsx` imports `../../../packages/ui/src/globals.css`). `apps/admin` imports its own `src/index.css`, which has no tokens, so semantic classes such as `bg-primary` do not resolve to a color there today; the admin pages use hardcoded `gray`/`green` classes. `apps/app/src/index.css` (with a different, older token set) is not imported anywhere.

### How to update the primary blue

If the end user provides the exact hex of the brand blue, convert it to HSL and replace `--primary`:

```
Hex: #1A6BE8  →  HSL: 213 78% 51%  →  --primary: 213 78% 51%;
```

Tool: https://www.colorhexa.com/ or any hex-to-HSL converter.

---

## Using colors in Tailwind

**Always** use the semantic tokens, never hardcoded colors:

```tsx
// ✅ Correct — uses the token
<div className="bg-primary text-primary-foreground" />
<p className="text-muted-foreground" />
<div className="border border-border rounded-[--radius]" />

// ❌ Forbidden — hardcoded
<div className="bg-blue-600 text-white" />
<p className="text-gray-500" />
```

---

## Components available in `@match-padel/ui`

Components that exist today in `packages/ui/src/components/`:

| Component       | Main use                                     | Notes |
|-----------------|----------------------------------------------|-------|
| `Button`        | Primary, secondary, destructive actions      | variants `primary`, `secondary`, `ghost`, `destructive`; sizes `sm`, `md`, `lg`; `loading` prop |
| `Card`          | Content containers                           | also `CardHeader`, `CardTitle`, `CardContent`, `CardFooter` |
| `Input`         | Text fields                                  | |
| `Badge`         | Status labels                                | variants `default`, `success`, `warning`, `destructive`, `outline` |
| `Avatar`        | Profile picture                              | sizes `sm`, `md`, `lg` |
| `Modal`         | Centered modal                               | props `open`, `onClose`, `title` (closes on Escape) |
| `Spinner`       | Loading indicator                            | sizes `sm`, `md`, `lg` |
| `EmptyState`    | Empty lists                                  | props `icon`, `title`, `description`, `action` |
| `BottomNav`     | Bottom navigation                            | props `items`, `activeKey`, `onSelect`; not used by `AppLayout` (it has its own inline nav) |

`packages/ui/src/index.ts` only exports `cn` today, so none of these can be imported from `@match-padel/ui` yet: exporting them (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)

Base list of components planned for the design system (each one (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md)):

| Component       | Main use                                     |
|-----------------|----------------------------------------------|
| `Label`         | Form labels                                  |
| `Select`        | Dropdowns                                    |
| `Dialog`        | Modals                                       |
| `Sheet`         | Side drawer (bottom sheet on mobile)         |
| `Tabs`          | Tabbed navigation                            |
| `Skeleton`      | Loading states                               |
| `Toast`         | Ephemeral notifications                      |
| `Separator`     | Divider lines                                |
| `ScrollArea`    | Containers with custom scroll                |
| `DropdownMenu`  | Context menus                                |
| `Form`          | Wrapper for React Hook Form                  |
| `Table`         | Data tables (mainly admin)                   |
| `Calendar`      | Date picker                                  |
| `Popover`       | Tooltips and floating content                |

---

## Adding a new component to `packages/ui`

### Option A: Copy from the shadcn/ui CLI (recommended)

Target — not implemented yet (see 'Real state vs. target' in CLAUDE.md): `packages/ui` has no `components.json`, so the CLI is not configured to write into it. Once it is, the command from the monorepo root is:

```bash
# From the monorepo root
npx shadcn@latest add <component-name> --cwd packages/ui
```

The component is copied into `packages/ui/src/components/<Name>.tsx` and can be edited freely. Extra dependencies (e.g. Radix) go in with `npm install <pkg> -w @match-padel/ui`.

### Option B: Create manually

1. Create `packages/ui/src/components/<Name>.tsx` following the pattern of the existing ones
2. Export from `packages/ui/src/index.ts` (required: the barrel only exports `cn` today)
3. Use `cn()` for conditional classes and CSS tokens for colors

---

## Dark mode

- `apps/app`: **dark mode by default** (mobile, native-app-like experience)
- `apps/admin`: **light mode by default** (desktop, management dashboard)

> Dark mode by default and the toggle are (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). Today `apps/app/index.html` is `<html lang="es">` without the `dark` class, and nothing in the code toggles it, so the app renders in light mode (some pages already carry `dark:` variants). The `.dark` tokens exist in `packages/ui/src/globals.css`, and Tailwind is configured with `darkMode: ['class']`.

### HTML setup

```html
<!-- apps/app/index.html (target; today: <html lang="es">) -->
<html class="dark">

<!-- apps/admin/index.html -->
<html>
```

### Theme toggle (apps/app)

Target — not implemented yet: neither `ThemeToggle` nor `@/lib/useTheme` exists.

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

## Mobile layout (apps/app)

```
┌─────────────────────┐
│  Header (sticky)    │  h-12, bg-background/95, border-b
├─────────────────────┤
│                     │
│    Main content     │  flex-1, overflow-y-auto, pb-20
│                     │
├─────────────────────┤
│  Bottom Nav         │  h-16, bg-background, border-t, fixed bottom-0
└─────────────────────┘
```

Real implementation: `apps/app/src/shared/layouts/AppLayout.tsx` (top bar with the "Match Padel" brand and a notification bell with unread badge, `<Outlet />`, and a fixed bottom nav with 5 items: home, matches, reservations, tournaments, profile; labels through `t('nav.*')`). The snippet below is a simplified illustration.

```tsx
// Base layout of apps/app
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
│        │      Main content        │
│        │                          │
└────────┴──────────────────────────┘
```

Real implementation: `apps/admin/src/shared/layouts/AdminLayout.tsx` — a fixed-width sidebar (6 nav links, logout button) and an `<Outlet />`. There is no `Topbar`, no collapsible sidebar and no `useAdminSidebarStore` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md). The snippet below is the target.

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

For the store and other screens that need a drawer from the bottom. `Sheet` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md) (there is no store screen yet either); the only overlay in `packages/ui` today is `Modal`.

```tsx
import { Sheet, SheetContent, SheetTrigger } from '@match-padel/ui'

<Sheet>
  <SheetTrigger asChild>
    <Button>Open store</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
    <StoreContent />
  </SheetContent>
</Sheet>
```

---

## Loading states

Use `Skeleton` from `@match-padel/ui` for loading states, never generic full-page spinners (`Skeleton` (target — not implemented yet; see 'Real state vs. target' in CLAUDE.md); today the pages use ad-hoc spinners/text, and `packages/ui` has a `Spinner`):

```tsx
// Loading state of a card
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

## Icons

Use `lucide-react` (declared as a dependency of `packages/ui`; `apps/app` imports it too, relying on npm hoisting):

```tsx
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react'

<Calendar className="h-4 w-4 text-muted-foreground" />
```

Standard sizes:
- `h-3 w-3` — micro, in badges
- `h-4 w-4` — inline in text
- `h-5 w-5` — in buttons
- `h-6 w-6` — standalone icons
- `h-8 w-8` — headings

---

## Typography

Default font: **Inter** (Google Fonts)

```html
<!-- index.html of each app (target — not implemented yet: neither index.html loads Inter today) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

```js
// In packages/config/tailwind.base.js (already there, inherited by both apps)
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```

`apps/admin/src/index.css` additionally sets a system-font stack on `body`.
