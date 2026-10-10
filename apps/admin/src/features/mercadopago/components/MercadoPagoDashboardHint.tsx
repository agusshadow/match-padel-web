import { Link } from 'react-router-dom'
import { Notice } from '@match-padel/ui'
import { useCurrentClub } from '@/shared/club-context'
import { isClubLive } from '@/shared/permissions'
import { useMercadoPagoAccount } from '../hooks/useMercadoPago'

/**
 * Warning for the owner of an approved club whose Mercado Pago link is missing or unusable. Does not call the
 * endpoint for any other role. Any failure of the status request (e.g. not configured) shows nothing.
 */
export function MercadoPagoDashboardHint() {
  const club = useCurrentClub()
  const applies = club.role === 'owner' && isClubLive(club.status)
  const { data } = useMercadoPagoAccount(club.clubId, applies)

  if (!applies || !data) return null
  const status = data.status
  if (status !== null && status !== 'expired' && status !== 'revoked' && status !== 'error') return null

  const text =
    status === null
      ? 'Todavía no vinculaste la cuenta de Mercado Pago del club: no puede cobrar a través de la app hasta que lo hagas.'
      : status === 'error'
        ? 'No pudimos renovar la vinculación con Mercado Pago. Volvé a vincular la cuenta para no perder los cobros.'
        : `La vinculación con Mercado Pago está ${status === 'expired' ? 'vencida' : 'revocada'}: el club no puede cobrar a través de la app hasta que la vincule de nuevo.`

  return (
    <Notice tone="warning" className="flex flex-wrap items-center justify-between gap-2">
      <span>{text}</span>
      <Link to={`/${club.clubId}/mercadopago`} className="font-semibold underline">
        Ir a Mercado Pago
      </Link>
    </Notice>
  )
}
