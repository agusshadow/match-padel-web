import { Navigate, Outlet } from 'react-router-dom'
import { useAccess } from '@/features/auth'

/** Reviewers only get the requests inbox; everything else needs superadmin. */
export function RequireSuperadmin() {
  const { data: access } = useAccess(true)
  if (access?.platformRole !== 'superadmin') return <Navigate to="/requests" replace />
  return <Outlet />
}
