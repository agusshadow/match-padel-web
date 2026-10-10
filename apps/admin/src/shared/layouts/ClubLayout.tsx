import { useEffect } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { LayoutDashboard, CalendarDays, CalendarRange, Swords, Trophy, Building2, LandPlot, ClipboardList, Users, Layers, LogOut, Menu } from 'lucide-react'
import { Notice, StatusBadge } from '@match-padel/ui'
import { useAccess, useSignOut } from '@/features/auth'
import { usePanelStore } from '@/store/panel.store'
import { CurrentClubProvider } from '../club-context'
import { ClubStatusBadge } from '../components/ClubStatusBadge'
import { CLUB_ROLE_LABELS, CLUB_STATUS_LABELS, canManageClub, isClubLive } from '../permissions'

export function ClubLayout() {
  const { clubId } = useParams<{ clubId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { data: access } = useAccess(true)
  const signOut = useSignOut()
  const setLastClubId = usePanelStore((s) => s.setLastClubId)
  const sidebarOpen = usePanelStore((s) => s.sidebarOpen)
  const setSidebarOpen = usePanelStore((s) => s.setSidebarOpen)

  const club = access?.clubs.find((c) => c.clubId === clubId)

  useEffect(() => {
    if (club) setLastClubId(club.clubId)
  }, [club, setLastClubId])

  // Unknown club or no access to it: back to the root redirect.
  if (!access || !club) return <Navigate to="/" replace />

  const manager = canManageClub(club.role)
  const live = isClubLive(club.status)
  // Until the club is approved only its application is available (a superadmin can open anything).
  const full = live || club.role === 'superadmin'
  const navItems = [
    { to: 'onboarding', icon: ClipboardList, label: 'Solicitud', show: manager && !live },
    { to: 'dashboard', icon: LayoutDashboard, label: 'Resumen', show: full },
    { to: 'calendar', icon: CalendarRange, label: 'Calendario', show: full },
    { to: 'reservations', icon: CalendarDays, label: 'Reservas', show: full },
    { to: 'matches', icon: Swords, label: 'Partidos', show: full && manager },
    { to: 'tournaments', icon: Trophy, label: 'Torneos', show: full && manager },
    { to: 'courts', icon: LandPlot, label: 'Canchas', show: full && manager },
    { to: 'team', icon: Users, label: 'Equipo', show: full && manager },
    { to: 'club', icon: Building2, label: 'Club', show: full },
  ].filter((item) => item.show)

  const changeClub = (nextId: string) => {
    const next = access.clubs.find((c) => c.clubId === nextId)
    if (!next) return
    // Keep the section (/<oldClub>/reservations -> /<newClub>/reservations) when the new club is approved.
    const section = location.pathname.split('/')[2] ?? 'dashboard'
    const keep = isClubLive(next.status) && section !== 'onboarding' ? section : null
    navigate(keep ? `/${nextId}/${keep}` : `/${nextId}`)
  }

  return (
    <CurrentClubProvider value={club}>
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
                <p className="text-xs text-gray-400">Panel del club</p>
              </div>
            </div>
          </div>

          <div className="px-3 pt-4 space-y-2">
            <label htmlFor="club-select" className="block text-xs font-medium text-gray-500 px-1">
              Club
            </label>
            {access.clubs.length > 1 ? (
              <select
                id="club-select"
                value={club.clubId}
                onChange={(e) => changeClub(e.target.value)}
                className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {access.clubs.map((c) => (
                  <option key={c.clubId} value={c.clubId}>
                    {c.name} ({CLUB_STATUS_LABELS[c.status]})
                  </option>
                ))}
              </select>
            ) : (
              <p id="club-select" className="px-1 text-sm font-medium text-gray-900">
                {club.name}
              </p>
            )}
            <div className="px-1 flex flex-wrap gap-1">
              <StatusBadge label={CLUB_ROLE_LABELS[club.role]} tone="purple" />
              <ClubStatusBadge status={club.status} />
            </div>
            <div className="px-1 flex items-center gap-1 text-xs">
              <Layers className="w-3 h-3 text-gray-400" />
              <Link to="/clubs" className="text-green-700 hover:underline">
                Mis clubes
              </Link>
            </div>
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={`/${club.clubId}/${item.to}`}
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
                {item.label}
              </NavLink>
            ))}
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
            <span className="text-sm font-medium">{club.name}</span>
          </div>
          <div
            className={`mx-auto px-6 py-6 space-y-6 ${
              location.pathname.endsWith('/calendar') ? 'max-w-none' : 'max-w-6xl'
            }`}
          >
            {live && !club.isActive && (
              <Notice tone="info">Este club está desactivado: los jugadores no lo ven en la app.</Notice>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </CurrentClubProvider>
  )
}
