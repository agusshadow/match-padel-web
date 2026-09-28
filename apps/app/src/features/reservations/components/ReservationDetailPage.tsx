import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useReservationById } from '../hooks/useReservations'
import { ReservationCard } from './ReservationCard'

// Card #34 (R25): the real reservation detail screen. Previously "Ver reserva" on
// PaymentResultPage linked back to the same /reservations/:id route (which MercadoPago's
// back_urls also point to), so it just re-rendered the payment-result screen instead of
// showing the actual reservation. This page reuses that same route param but renders the
// reservation's real, live data — reused as ReservationCard rather than duplicating its
// status/date formatting.
export function ReservationDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: reservation, isLoading, error } = useReservationById(id ?? '')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t('reservations.notFound')}</p>
        <button onClick={() => navigate('/reservations')} className="text-primary font-medium">
          {t('reservations.title')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('reservations.detail')}</h1>
      </div>

      <div className="flex-1 p-4">
        <ReservationCard reservation={reservation} />
      </div>
    </div>
  )
}
