import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentClub } from '../club-context'
import { canManageClub } from '../permissions'

/** Hides matches/tournaments and the application from reception: redirects to the dashboard. */
export function RequireManagerRole() {
  const club = useCurrentClub()
  if (!canManageClub(club.role)) return <Navigate to={`/${club.clubId}/dashboard`} replace />
  return <Outlet />
}
