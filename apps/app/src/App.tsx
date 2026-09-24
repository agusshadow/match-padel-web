import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './features/auth/store/auth.store'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { AuthPage } from './features/auth/components/AuthPage'
import { HomePage } from './features/home/components/HomePage'
import { MatchesPage } from './features/matches/components/MatchesPage'
import { MatchDetailPage } from './features/matches/components/MatchDetailPage'
import { NewMatchPage } from './features/matches/components/NewMatchPage'
import { JoinMatchPage } from './features/matches/components/JoinMatchPage'
import { ReservationsPage } from './features/reservations/components/ReservationsPage'
import { NewReservationPage } from './features/reservations/components/NewReservationPage'
import { ProfilePage } from './features/profile/components/ProfilePage'
import { EditProfilePage } from './features/profile/components/EditProfilePage'
import { NotificationsPage } from './features/notifications/components/NotificationsPage'
import { TournamentsPage } from './features/tournaments/components/TournamentsPage'
import { TournamentDetailPage } from './features/tournaments/components/TournamentDetailPage'
import { CreateTournamentPage } from './features/tournaments/components/CreateTournamentPage'
import { PaymentResultPage } from './features/reservations/components/PaymentResultPage'
import { AppLayout } from './shared/layouts/AppLayout'

export function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />}
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        {/* Pages with bottom nav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Full-screen pages (no bottom nav) */}
        <Route path="/matches/new" element={<NewMatchPage />} />
        <Route path="/matches/join" element={<JoinMatchPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/reservations/new" element={<NewReservationPage />} />
        <Route path="/reservations/:id" element={<PaymentResultPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/tournaments/new" element={<CreateTournamentPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
