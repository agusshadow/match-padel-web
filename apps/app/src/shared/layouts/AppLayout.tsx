import { Outlet, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Swords, CalendarDays, User } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: 'nav.home', end: true },
  { to: '/matches', icon: Swords, label: 'nav.matches' },
  { to: '/reservations', icon: CalendarDays, label: 'nav.reservations' },
  { to: '/profile', icon: User, label: 'nav.profile' },
]

export function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Main content */}
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch h-16">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.75}
                    className={isActive ? 'text-primary' : ''}
                  />
                  <span className="text-[10px] leading-none">{t(label)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
