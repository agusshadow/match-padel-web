import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../auth/store/auth.store'
import { useMyReservations } from '../../reservations/hooks/useReservations'
import { ReservationCard } from '../../reservations/components/ReservationCard'

export function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  // Fetch upcoming reservations for the home screen preview
  const { data: reservationsData } = useMyReservations({ limit: 3 })
  const now = new Date()
  const upcomingReservations = (reservationsData?.data ?? []).filter(
    (r) =>
      new Date(r.start_time) >= now &&
      (r.status === 'pending' || r.status === 'confirmed'),
  )

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="pt-2">
        <p className="text-sm text-muted-foreground">{t('home.welcome')},</p>
        <h1 className="text-2xl font-bold text-foreground">
          {user?.full_name ?? 'Jugador'} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          ELO: <span className="font-semibold text-primary">{user?.elo ?? 1000}</span>
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/matches"
          className="flex flex-col items-center justify-center gap-2 p-5 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm shadow-sm hover:bg-primary/90 transition-colors"
        >
          <span className="text-2xl">🎾</span>
          {t('home.findMatch')}
        </Link>
        <Link
          to="/reservations/new"
          className="flex flex-col items-center justify-center gap-2 p-5 bg-card border border-border text-foreground rounded-2xl font-semibold text-sm hover:bg-accent transition-colors"
        >
          <span className="text-2xl">📅</span>
          {t('home.bookCourt')}
        </Link>
      </div>

      {/* Recent matches placeholder */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">{t('home.myMatches')}</h2>
          <Link to="/matches" className="text-xs text-primary font-medium">
            Ver todos →
          </Link>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 text-center">
          <p className="text-muted-foreground text-sm">Todavía no jugaste ningún partido.</p>
          <Link to="/matches" className="inline-block mt-3 text-sm font-medium text-primary">
            Encontrar partido →
          </Link>
        </div>
      </section>

      {/* Upcoming reservations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">
            {t('home.upcomingReservations')}
          </h2>
          <Link to="/reservations" className="text-xs text-primary font-medium">
            Ver todas →
          </Link>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground text-sm">No tenés reservas próximas.</p>
            <Link
              to="/reservations/new"
              className="inline-block mt-3 text-sm font-medium text-primary"
            >
              Reservar cancha →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReservations.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
