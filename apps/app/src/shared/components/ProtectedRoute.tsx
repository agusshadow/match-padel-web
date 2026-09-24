import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { useAuthInit } from '../../features/auth/hooks/useAuth'

export function ProtectedRoute() {
  useAuthInit()

  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}
