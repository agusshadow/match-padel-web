import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../auth/store/auth.store'
import { useMyReservations } from '../../reservations/hooks/useReservations'
import { ReservationCard } from '../../reservations/components/ReservationCard'
import { useMyMatches } from '../../matches/hooks/useMatches'

const STATUS_LABEL: Record<string, string> = {
  waiting: 'Esperando',
  in_progress: 'En curso',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  waiting: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  in_progress: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  completed: 'bg-muted text-muted-foreground',
  cancelled: 'bg-red-500/10 text-red-500',
}

export function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()

  const { data: reservationsData } = useMyReservations({ limit: 3 })
  const { data: myMatches } = useMyMatches()

  const now = new Date()
  const upcomingReservations = (reservationsData?.data ?? []).filter(
    (r) =>
      new Date(r.start_time) >= now &&
      (r.status === 'pending' || r.status === 'confirmed'),
  )

  const recentMatches = (myMatches ?? []).slice(0, 3)

  return (
    <div className="p-4 space-y-6 pb-6">
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
        <Link
          to="/tournaments"
          className="flex flex-col items-center justify-center gap-2 p-4 bg-card border border-border text-foreground rounded-2xl font-semibold text-sm hover:bg-accent transition-colors"
        >
          <span className="text-xl">🏆</span>
          Torneos
        </Link>
        <Link
          to="/matches/join"
          className="flex flex-col items-center justify-center gap-2 p-4 bg-card border border-border text-foreground rounded-2xl font-semibold text-sm hover:bg-accent transition-colors"
        >
          <span className="text-xl">🔗</span>
          Unirse
        </Link>
      </div>

      {/* Recent matches */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">{t('home.myMatches')}</h2>
          <Link to="/matches" className="text-xs text-primary font-medium">
            Ver todos →
          </Link>
        </div>
        {recentMatches.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-6 text-center">
            <p className="text-muted-foreground text-sm">Todavía no jugaste ningún partido.</p>
            <Link to="/matches/new" className="inline-block mt-3 text-sm font-medium text-primary">
              Crear partido →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentMatches.map((match: any) => (
              <Link
                key={match.id}
                to={`/matches/${match.id}`}
                className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:bg-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {match.type} · {match.match_players?.length ?? 0}/4 jugadores
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(match.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[match.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {STATUS_LABEL[match.status] ?? match.status}
                </span>
              </Link>
            ))}
          </div>
        )}
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
