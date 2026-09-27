import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './features/auth/store/auth.store'
import { ProtectedRoute } from './shared/components/ProtectedRoute'
import { AuthPage } from './features/auth/components/AuthPage'
import { CompleteProfilePage } from './features/auth/components/CompleteProfilePage'
import { VerifyEmailPage } from './features/auth/components/VerifyEmailPage'
import { HomePage } from './features/home/components/HomePage'
import { MatchesPage } from './features/matches/components/MatchesPage'
import { MatchDetailPage } from './features/matches/components/MatchDetailPage'
import { NewMatchPage } from './features/matches/components/NewMatchPage'
import { JoinMatchPage } from './features/matches/components/JoinMatchPage'
import { ReservationsPage } from './features/reservations/components/ReservationsPage'
import { NewReservationPage } from './features/reservations/components/NewReservationPage'
import { ClubDetailPage } from './features/clubs/components/ClubDetailPage'
import { ClubesPage } from './features/clubs/components/ClubesPage'
import { ProfilePage } from './features/profile/components/ProfilePage'
import { EditProfilePage } from './features/profile/components/EditProfilePage'
import { NotificationsPage } from './features/notifications/components/NotificationsPage'
import { TournamentsPage } from './features/tournaments/components/TournamentsPage'
import { TournamentDetailPage } from './features/tournaments/components/TournamentDetailPage'
import { CreateTournamentPage } from './features/tournaments/components/CreateTournamentPage'
import { PaymentResultPage } from './features/reservations/components/PaymentResultPage'
import { OnboardingPage } from './features/onboarding'
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
      <Route
        path="/verify-email"
        element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyEmailPage />}
      />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        {/* Pages with bottom nav */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/clubs" element={<ClubesPage />} />
          <Route path="/reservations" element={<ReservationsPage />} />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Full-screen pages (no bottom nav) */}
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/matches/new" element={<NewMatchPage />} />
        <Route path="/matches/join" element={<JoinMatchPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/reservations/new" element={<NewReservationPage />} />
        <Route path="/clubs/:id" element={<ClubDetailPage />} />
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
