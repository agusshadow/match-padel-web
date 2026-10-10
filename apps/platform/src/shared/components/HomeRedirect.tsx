import { Navigate } from 'react-router-dom'
import { useAccess } from '@/features/auth'

export function HomeRedirect() {
  const { data: access } = useAccess(true)
  if (!access) return null
  return <Navigate to={access.platformRole === 'superadmin' ? '/dashboard' : '/requests'} replace />
}
