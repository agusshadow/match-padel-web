import { useEffect } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PartyPopper, XCircle, Hourglass, ClipboardList } from 'lucide-react'
import { RESERVATIONS_KEY } from '../hooks/useReservations'

export function PaymentResultPage() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const queryClient = useQueryClient()
  const payment = params.get('payment') // 'success' | 'failure' | 'pending'

  useEffect(() => {
    // Invalidate reservations so the card reflects the new status
    queryClient.invalidateQueries({ queryKey: [RESERVATIONS_KEY] })
  }, [queryClient])

  const config = {
    success: {
      Icon: PartyPopper,
      title: '¡Pago exitoso!',
      desc: 'Tu reserva fue confirmada. ¡Nos vemos en la cancha!',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
    },
    failure: {
      Icon: XCircle,
      title: 'Pago rechazado',
      desc: 'No se pudo procesar el pago. Tu reserva quedó en estado pendiente. Podés intentarlo de nuevo.',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
    },
    pending: {
      Icon: Hourglass,
      title: 'Pago en proceso',
      desc: 'El pago está siendo procesado. Te notificaremos cuando se confirme.',
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
    },
  }[payment ?? 'pending'] ?? {
    Icon: ClipboardList,
    title: 'Estado de reserva',
    desc: 'Revisá el estado de tu reserva.',
    color: 'text-primary',
    bg: 'bg-primary/5',
    border: 'border-primary/20',
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className={`rounded-2xl border p-8 ${config.bg} ${config.border}`}>
          <config.Icon className={`w-12 h-12 mx-auto mb-4 ${config.color}`} />
          <h1 className={`text-xl font-bold mb-2 ${config.color}`}>
            {config.title}
          </h1>
          <p className="text-sm text-muted-foreground">{config.desc}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to={`/reservations/${id}`}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Ver reserva
          </Link>
          <Link
            to="/reservations"
            className="w-full py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-accent transition-colors"
          >
            Mis reservas
          </Link>
        </div>
      </div>
    </div>
  )
}
