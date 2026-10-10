import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { ReservationsPage } from '@/features/reservations'
import { MatchesPage } from '@/features/matches'
import { TournamentsPage } from '@/features/tournaments'
import { ClubPage } from '@/features/club'
import { RequireAccess } from '@/shared/components/RequireAccess'
import { RequireManagerRole } from '@/shared/components/RequireManagerRole'
import { ClubRedirect } from '@/shared/components/ClubRedirect'
import { ClubLayout } from '@/shared/layouts/ClubLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAccess />}>
          <Route index element={<ClubRedirect />} />
          <Route path=":clubId" element={<ClubLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route element={<RequireManagerRole />}>
              <Route path="matches" element={<MatchesPage />} />
              <Route path="tournaments" element={<TournamentsPage />} />
            </Route>
            <Route path="club" element={<ClubPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
