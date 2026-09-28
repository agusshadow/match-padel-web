import { CalendarDays, Clock, MapPin, Loader2, CreditCard, Building2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Reservation } from '../services/reservationService'
import { useCancelReservation, useCreatePaymentPreference } from '../hooks/useReservations'

interface ReservationCardProps {
  reservation: Reservation
}

const STATUS_CLASSNAMES = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
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
  const { t } = useTranslation()
  const cancelMutation = useCancelReservation()
  const payMutation = useCreatePaymentPreference()
  const [payError, setPayError] = useState<string | null>(null)

  const STATUS_CONFIG = {
    pending: { label: t('reservations.status.pending'), className: STATUS_CLASSNAMES.pending },
    confirmed: { label: t('reservations.status.confirmed'), className: STATUS_CLASSNAMES.confirmed },
    cancelled: { label: t('reservations.status.cancelled'), className: STATUS_CLASSNAMES.cancelled },
    completed: { label: t('reservations.status.completed'), className: STATUS_CLASSNAMES.completed },
  } as const

  const status =
    STATUS_CONFIG[reservation.status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.pending
  const court = reservation.court
  const club = court?.club

  const surfaceLabel = (surface: string) =>
    surface === 'indoor'
      ? t('clubs.surface.indoor')
      : surface === 'outdoor'
        ? t('clubs.surface.outdoor')
        : t('clubs.surface.panoramic')

  const handleCancel = () => {
    if (!confirm(t('reservations.confirmCancel'))) return
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
        setPayError(t('reservations.paymentStartError'))
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
              <Building2 className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {club?.name ?? t('clubs.defaultName')}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {court?.name ?? t('reservations.defaultCourtName')}
              {court?.surface ? ` · ${surfaceLabel(court.surface)}` : ''}
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
              {t('reservations.pay')}
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
              {t('common.cancel')}
            </button>
          )}
        </div>
      </div>

      {(cancelMutation.isError || payError) && (
        <p className="text-xs text-destructive">
          {payError ??
            (cancelMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            t('reservations.processingError')}
        </p>
      )}
    </div>
  )
}
