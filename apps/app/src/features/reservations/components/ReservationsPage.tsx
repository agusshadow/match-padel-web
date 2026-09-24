import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMyReservations } from '../hooks/useReservations'
import { ReservationCard } from './ReservationCard'

type Tab = 'upcoming' | 'past'

export function ReservationsPage() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<Tab>('upcoming')

  // Fetch all non-cancelled reservations; we'll filter client-side for upcoming/past
  const { data, isLoading, isError, refetch } = useMyReservations({ limit: 50 })

  const now = new Date()
  const reservations = data?.data ?? []

  const upcoming = reservations.filter(
    (r) =>
      new Date(r.start_time) >= now &&
      (r.status === 'pending' || r.status === 'confirmed'),
  )

  const past = reservations.filter(
    (r) =>
      new Date(r.start_time) < now ||
      r.status === 'cancelled' ||
      r.status === 'completed',
  )

  const displayed = activeTab === 'upcoming' ? upcoming : past

  return (
    <div className="p-4 space-y-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">{t('reservations.title')}</h1>
        <Link
          to="/reservations/new"
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <CalendarPlus size={16} />
          {t('reservations.book')}
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Próximas {upcoming.length > 0 && `(${upcoming.length})`}
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'past'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Historial
        </button>
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 size={32} className="animate-spin text-primary" />
        </div>
      )}

      {isError && (
        <div className="bg-destructive/10 text-destructive rounded-xl p-6 text-center">
          <p className="font-semibold mb-2">No se pudo cargar tus reservas</p>
          <button
            onClick={() => refetch()}
            className="text-sm font-medium underline"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {!isLoading && !isError && displayed.length === 0 && (
        <div className="bg-card border border-border rounded-xl p-8 text-center mt-4">
          <div className="text-4xl mb-3">📅</div>
          {activeTab === 'upcoming' ? (
            <>
              <p className="font-semibold text-foreground">Sin reservas próximas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Reservá una cancha en tu club favorito.
              </p>
              <Link
                to="/reservations/new"
                className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t('reservations.book')}
              </Link>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">Sin historial de reservas</p>
              <p className="text-sm text-muted-foreground mt-1">
                Tus reservas pasadas aparecerán aquí.
              </p>
            </>
          )}
        </div>
      )}

      {!isLoading && !isError && displayed.length > 0 && (
        <div className="space-y-3">
          {displayed.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  )
}
