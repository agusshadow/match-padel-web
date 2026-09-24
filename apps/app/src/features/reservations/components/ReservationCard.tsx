import { CalendarDays, Clock, MapPin, Loader2, CreditCard } from 'lucide-react'
import { useState } from 'react'
import type { Reservation } from '../services/reservationService'
import { useCancelReservation, useCreatePaymentPreference } from '../hooks/useReservations'

interface ReservationCardProps {
  reservation: Reservation
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  confirmed: {
    label: 'Confirmada',
    className:
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  completed: {
    label: 'Completada',
    className:
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
} as const

const DAYS_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MONTHS_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = DAYS_ES[d.getDay()]
  const date = d.getDate()
  const month = MONTHS_ES[d.getMonth()]
  const year = d.getFullYear()
  return `${day} ${date} ${month} ${year}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function isCancellable(reservation: Reservation): boolean {
  const isFuture = new Date(reservation.start_time) > new Date()
  return (
    isFuture &&
    (reservation.status === 'pending' || reservation.status === 'confirmed')
  )
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const cancelMutation = useCancelReservation()
  const payMutation = useCreatePaymentPreference()
  const [payError, setPayError] = useState<string | null>(null)
  const status =
    STATUS_CONFIG[reservation.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.pending
  const court = reservation.court
  const club = court?.club

  const handleCancel = () => {
    if (!confirm('¿Cancelar esta reserva?')) return
    cancelMutation.mutate(reservation.id)
  }

  const handlePay = () => {
    setPayError(null)
    payMutation.mutate(reservation.id, {
      onSuccess: (data) => {
        // Redirect to MercadoPago checkout
        const url = import.meta.env.PROD ? data.init_point : data.sandbox_init_point
        window.location.href = url
      },
      onError: () => {
        setPayError('No se pudo iniciar el pago. Intenta de nuevo.')
      },
    })
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Header: Club + Status badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {club?.logo_url ? (
            <img
              src={club.logo_url}
              alt={club.name}
              className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">🏟️</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {club?.name ?? 'Club'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {court?.name ?? 'Cancha'}
              {court?.surface ? ` · ${court.surface === 'indoor' ? 'Cubierta' : court.surface === 'outdoor' ? 'Descubierta' : 'Panorámica'}` : ''}
            </p>
          </div>
        </div>
        <span
          className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays size={14} className="flex-shrink-0" />
          <span className="capitalize">{formatDate(reservation.start_time)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock size={14} className="flex-shrink-0" />
          <span>
            {formatTime(reservation.start_time)} – {formatTime(reservation.end_time)}
          </span>
        </div>
        {club?.address && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin size={14} className="flex-shrink-0" />
            <span className="truncate">
              {club.address}, {club.city}
            </span>
          </div>
        )}
      </div>

      {/* Footer: Price + Action buttons */}
      <div className="flex items-center justify-between pt-1 border-t border-border">
        <span className="font-semibold text-foreground">
          ${reservation.total_price.toLocaleString('es-AR')}
        </span>

        <div className="flex items-center gap-2">
          {/* Pay button — only for pending reservations */}
          {reservation.status === 'pending' && (
            <button
              onClick={handlePay}
              disabled={payMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {payMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <CreditCard size={12} />
              )}
              Pagar
            </button>
          )}

          {isCancellable(reservation) && (
            <button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {cancelMutation.isPending && (
                <Loader2 size={12} className="animate-spin" />
              )}
              Cancelar
            </button>
          )}
        </div>
      </div>

      {(cancelMutation.isError || payError) && (
        <p className="text-xs text-destructive">
          {payError ??
            (cancelMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Error al procesar'}
        </p>
      )}
    </div>
  )
}
