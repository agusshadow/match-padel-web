import { Navigate, Outlet } from 'react-router-dom'
import { useAccess, useSession, useSignOut } from '@/features/auth'
import { FullScreenMessage } from './FullScreenMessage'

/** Requires a session and the access list; any signed-in user passes (no clubs means "start an application"). */
export function RequireAccess() {
  const { session, loading } = useSession()
  const access = useAccess(!!session)
  const signOut = useSignOut()

  if (loading || (session && access.isLoading)) {
    return <FullScreenMessage>Cargando...</FullScreenMessage>
  }
  if (!session) return <Navigate to="/login" replace />

  if (access.isError) {
    return (
      <FullScreenMessage>
        <p>No pudimos verificar tus permisos. Intentá de nuevo.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => access.refetch()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
          >
            Reintentar
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Cerrar sesión
          </button>
        </div>
      </FullScreenMessage>
    )
  }

  return <Outlet />
}
