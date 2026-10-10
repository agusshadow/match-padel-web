import { Navigate, useLocation } from 'react-router-dom'
import { useAccess } from '@/features/auth'
import { usePanelStore } from '@/store/panel.store'
import { canLinkMercadoPago } from '@/shared/permissions'

/**
 * `/mercadopago` (no club id): where the API sends the browser when the OAuth `state` was unknown. Goes to the
 * Mercado Pago page of the last club used (when the user can link it), else the first club they can link,
 * else the first club, keeping the `?status=&reason=` query so the banner explains what happened.
 */
export function MercadoPagoReturnRedirect() {
  const { search } = useLocation()
  const { data: access } = useAccess(true)
  const lastClubId = usePanelStore((s) => s.lastClubId)
  if (!access) return null

  const linkable = access.clubs.filter((c) => canLinkMercadoPago(c.role))
  const target =
    linkable.find((c) => c.clubId === lastClubId) ?? linkable[0] ?? access.clubs.find((c) => c.clubId === lastClubId) ?? access.clubs[0]
  if (!target) return <Navigate to="/" replace />
  return <Navigate to={`/${target.clubId}/mercadopago${search}`} replace />
}
