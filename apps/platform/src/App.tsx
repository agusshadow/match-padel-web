import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { ClubsPage } from '@/features/clubs'
import { UsersPage } from '@/features/users'
import { AuditLogPage } from '@/features/audit-log'
import { RequestsPage } from '@/features/requests'
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
            </Route>
            <Route path="requests" element={<RequestsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
