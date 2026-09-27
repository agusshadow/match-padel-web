import { Outlet, NavLink, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Home, Swords, CalendarDays, User, Bell, Trophy } from 'lucide-react'
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications'

const navItems = [
  { to: '/', icon: Home, label: 'nav.home', end: true },
  { to: '/matches', icon: Swords, label: 'nav.matches' },
  { to: '/reservations', icon: CalendarDays, label: 'nav.reservations' },
  { to: '/tournaments', icon: Trophy, label: 'nav.tournaments' },
  { to: '/profile', icon: User, label: 'nav.profile' },
]

function NotificationBell() {
  const { data } = useUnreadCount()
  const count = data?.count ?? 0

  return (
    <Link to="/notifications" className="relative p-2">
      <Bell size={22} strokeWidth={1.75} className="text-muted-foreground" />
      {count > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

export function AppLayout() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Top bar with notification bell */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 h-12 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold text-foreground">
          <img src="/logo-app.svg" alt="" className="w-5 h-5" />
          Match Padel
        </span>
        <NotificationBell />
      </div>

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
