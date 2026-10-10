import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { ClubsPage } from '@/features/clubs'
import { UsersPage } from '@/features/users'
import { AuditLogPage } from '@/features/audit-log'
import { AchievementsPage, ChallengesPage, CosmeticsPage } from '@/features/catalogs'
import { ApplicationDetailPage, RequestsPage } from '@/features/requests'
import { RequireAccess } from '@/shared/components/RequireAccess'
import { RequireSuperadmin } from '@/shared/components/RequireSuperadmin'
import { HomeRedirect } from '@/shared/components/HomeRedirect'
import { PlatformLayout } from '@/shared/layouts/PlatformLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAccess />}>
          <Route element={<PlatformLayout />}>
            <Route index element={<HomeRedirect />} />
            <Route element={<RequireSuperadmin />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="audit-log" element={<AuditLogPage />} />
              <Route path="catalogs" element={<Navigate to="/catalogs/achievements" replace />} />
              <Route path="catalogs/achievements" element={<AchievementsPage />} />
              <Route path="catalogs/challenges" element={<ChallengesPage />} />
              <Route path="catalogs/cosmetics" element={<CosmeticsPage />} />
            </Route>
            <Route path="requests" element={<RequestsPage />} />
            <Route path="requests/:clubId" element={<ApplicationDetailPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
