import { NavLink, Navigate, Outlet } from 'react-router-dom'
import { LayoutDashboard, Building2, Users, ScrollText, Inbox, LogOut, Menu, Trophy, Target, Sparkles } from 'lucide-react'
import { StatusBadge } from '@match-padel/ui'
import { useAccess, useSignOut } from '@/features/auth'
import { usePendingApplicationsCount } from '@/features/requests'
import { usePanelStore } from '@/store/panel.store'
import { PLATFORM_ROLE_LABELS } from '../permissions'

export function PlatformLayout() {
  const { data: access } = useAccess(true)
  const signOut = useSignOut()
  const { data: pendingCount } = usePendingApplicationsCount(!!access?.platformRole)
  const sidebarOpen = usePanelStore((s) => s.sidebarOpen)
  const setSidebarOpen = usePanelStore((s) => s.setSidebarOpen)

  if (!access?.platformRole) return <Navigate to="/login" replace />
  const isSuperadmin = access.platformRole === 'superadmin'

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Resumen', show: isSuperadmin },
    { to: '/clubs', icon: Building2, label: 'Clubes', show: isSuperadmin },
    { to: '/users', icon: Users, label: 'Usuarios', show: isSuperadmin },
    { to: '/audit-log', icon: ScrollText, label: 'Auditoría', show: isSuperadmin },
    { to: '/requests', icon: Inbox, label: 'Solicitudes', show: true },
  ].filter((item) => item.show)

  const catalogItems = [
    { to: '/catalogs/achievements', icon: Trophy, label: 'Logros' },
    { to: '/catalogs/challenges', icon: Target, label: 'Desafíos' },
    { to: '/catalogs/cosmetics', icon: Sparkles, label: 'Cosméticos' },
  ]
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? 'flex' : 'hidden'
        } md:flex fixed md:static inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 flex-col`}
      >
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/logo-app.svg" alt="Match Padel" className="w-7 h-7" />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-tight">Match Padel</p>
              <p className="text-xs text-gray-400">Plataforma</p>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4">
          <StatusBadge label={PLATFORM_ROLE_LABELS[access.platformRole]} tone="purple" />
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.label}</span>
              {item.to === '/requests' && pendingCount ? (
                <span
                  aria-label={`${pendingCount} solicitudes en revisión`}
                  className="min-w-[1.25rem] px-1.5 py-0.5 text-center text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"
                >
                  {pendingCount}
                </span>
              ) : null}
            </NavLink>
          ))}

          {isSuperadmin && (
            <div className="pt-4" role="group" aria-labelledby="nav-catalogs">
              <p id="nav-catalogs" className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Catálogos
              </p>
              <div className="space-y-1">
                {catalogItems.map((item) => (
                  <NavLink key={item.to} to={item.to} onClick={() => setSidebarOpen(false)} className={linkClass}>
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <p className="px-3 text-xs text-gray-400 truncate">{access.user.email}</p>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Abrir menú">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">Plataforma</span>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
