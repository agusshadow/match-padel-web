# UI System — match-padel-web

## UI Stack

- **shadcn/ui**: Components copied into `packages/ui/src/components/` (owned code, no deps)
- **Tailwind CSS**: Styling utilities, with base configuration in `packages/config/tailwind.base.js`
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

Base list of configured shadcn/ui components:

| Component       | Main use                                     |
|-----------------|----------------------------------------------|
| `Button`        | Primary, secondary, destructive actions      |
| `Card`          | Content containers                           |
| `Input`         | Text fields                                  |
| `Label`         | Form labels                                  |
| `Select`        | Dropdowns                                    |
| `Dialog`        | Modals                                       |
| `Sheet`         | Side drawer (bottom sheet on mobile)         |
| `Tabs`          | Tabbed navigation                            |
| `Badge`         | Status labels                                |
| `Avatar`        | Profile picture                              |
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

At the monorepo root, the shadcn/ui CLI is configured to write into `packages/ui`:

```bash
# From the monorepo root
pnpm --filter @match-padel/ui dlx shadcn-ui@latest add <component-name>
```

The component is copied into `packages/ui/src/components/<Name>.tsx` and can be edited freely.

### Option B: Create manually

1. Create `packages/ui/src/components/<Name>.tsx` following the pattern of the existing ones
2. Export from `packages/ui/src/index.ts`
3. Use `cn()` for conditional classes and CSS tokens for colors

---

## Dark mode

- `apps/app`: **dark mode by default** (mobile, native-app-like experience)
- `apps/admin`: **light mode by default** (desktop, management dashboard)

### HTML setup

```html
<!-- apps/app/index.html -->
<html class="dark">

<!-- apps/admin/index.html -->
<html>
```

### Theme toggle (apps/app)

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
│  Header (sticky)    │  h-14, bg-background, border-b
├─────────────────────┤
│                     │
│    Main content     │  flex-1, overflow-y-auto, pb-20
│                     │
├─────────────────────┤
│  Bottom Nav         │  h-16, bg-background, border-t, fixed bottom-0
└─────────────────────┘
```

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

For the store and other screens that need a drawer from the bottom:

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

Use `Skeleton` from `@match-padel/ui` for loading states, never generic full-page spinners:

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

Use `lucide-react` (included with shadcn/ui):

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
<!-- index.html of each app -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
```

```css
/* In tailwind.config.ts */
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
}
```
