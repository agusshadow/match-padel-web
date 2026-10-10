import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentClub } from '../club-context'
import { canManageClub, isClubLive } from '../permissions'
import { FullScreenMessage } from './FullScreenMessage'

/**
 * The dashboard, reservations and the rest of the panel only exist for approved clubs (a superadmin can
 * open any). Owners and administrators of a club that is not approved are sent to its application.
 */
export function RequireApprovedClub() {
  const club = useCurrentClub()
  if (isClubLive(club.status) || club.role === 'superadmin') return <Outlet />
  if (canManageClub(club.role)) return <Navigate to={`/${club.clubId}/onboarding`} replace />
  return (
    <FullScreenMessage>
      <p>Este club todavía no está habilitado. Cuando el dueño complete la solicitud y sea aprobada vas a poder usar el panel.</p>
    </FullScreenMessage>
  )
}
