import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentClub } from '../club-context'
import { canLinkMercadoPago } from '../permissions'

/** Owner-only screens (Mercado Pago account): administrators and reception are redirected to the dashboard. */
export function RequireOwnerRole() {
  const club = useCurrentClub()
  if (!canLinkMercadoPago(club.role)) return <Navigate to={`/${club.clubId}/dashboard`} replace />
  return <Outlet />
}
