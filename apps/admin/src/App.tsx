import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, RegisterPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { CalendarPage } from '@/features/calendar'
import { ReservationsPage } from '@/features/reservations'
import { MatchesPage } from '@/features/matches'
import { TournamentsPage } from '@/features/tournaments'
import { ClubPage } from '@/features/club'
import { CourtsPage, CourtDetailPage, ClubExceptionsPage } from '@/features/courts'
import { OnboardingPage } from '@/features/onboarding'
import { TeamPage } from '@/features/team'
import { InvitePage } from '@/features/invitations'
import { MercadoPagoPage, MercadoPagoReturnRedirect, MercadoPagoDashboardHint } from '@/features/mercadopago'
import { PaymentsPage } from '@/features/payments'
import { RefundPolicyPage } from '@/features/refund-policy'
import { RequireAccess } from '@/shared/components/RequireAccess'
import { RequireManagerRole } from '@/shared/components/RequireManagerRole'
import { RequireOwnerRole } from '@/shared/components/RequireOwnerRole'
import { RequireApprovedClub } from '@/shared/components/RequireApprovedClub'
import { ClubRedirect } from '@/shared/components/ClubRedirect'
import { ClubIndexRedirect } from '@/shared/components/ClubIndexRedirect'
import { MyClubsRoute, NewClubRoute } from '@/shared/components/MyClubsRoute'
import { ClubLayout } from '@/shared/layouts/ClubLayout'
import { PlainLayout } from '@/shared/layouts/PlainLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invite" element={<InvitePage />} />
        <Route element={<RequireAccess />}>
          <Route index element={<ClubRedirect />} />
          <Route element={<PlainLayout />}>
            <Route path="clubs" element={<MyClubsRoute />} />
            <Route path="new-club" element={<NewClubRoute />} />
          </Route>
          <Route path="mercadopago" element={<MercadoPagoReturnRedirect />} />
          <Route path=":clubId" element={<ClubLayout />}>
            <Route index element={<ClubIndexRedirect />} />
            <Route element={<RequireManagerRole />}>
              <Route path="onboarding" element={<OnboardingPage />} />
            </Route>
            <Route element={<RequireApprovedClub />}>
              <Route path="dashboard" element={<DashboardPage notices={<MercadoPagoDashboardHint />} />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route element={<RequireManagerRole />}>
                <Route path="matches" element={<MatchesPage />} />
                <Route path="tournaments" element={<TournamentsPage />} />
                <Route path="courts" element={<CourtsPage />} />
                <Route path="courts/exceptions" element={<ClubExceptionsPage />} />
                <Route path="courts/:courtId" element={<CourtDetailPage />} />
                <Route path="team" element={<TeamPage />} />
              </Route>
              <Route element={<RequireOwnerRole />}>
                <Route path="mercadopago" element={<MercadoPagoPage />} />
                <Route path="payments" element={<PaymentsPage />} />
              </Route>
              <Route path="refund-policy" element={<RefundPolicyPage />} />
              <Route path="club" element={<ClubPage />} />
            </Route>
            <Route path="*" element={<ClubIndexRedirect />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
