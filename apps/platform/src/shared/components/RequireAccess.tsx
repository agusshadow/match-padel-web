import { Navigate, Outlet } from 'react-router-dom'
import { NO_ACCESS_MESSAGE, hasPlatformAccess, useAccess, useSession, useSignOut } from '@/features/auth'
import { getErrorStatus } from '@/lib/errors'
import { FullScreenMessage } from './FullScreenMessage'

/** Requires a session and a platform role (superadmin or reviewer); otherwise explains why. */
export function RequireAccess() {
  const { session, loading } = useSession()
  const access = useAccess(!!session)
  const signOut = useSignOut()

  if (loading || (session && access.isLoading)) {
    return <FullScreenMessage>Cargando...</FullScreenMessage>
  }
  if (!session) return <Navigate to="/login" replace />

  const denied = access.isError
    ? getErrorStatus(access.error) === 403
    : !!access.data && !hasPlatformAccess(access.data)

  if (access.isError || denied) {
    return (
      <FullScreenMessage>
        <p>{denied ? NO_ACCESS_MESSAGE : 'No pudimos verificar tus permisos. Intentá de nuevo.'}</p>
        <div className="flex gap-2 justify-center">
          {!denied && (
            <button
              onClick={() => access.refetch()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Reintentar
            </button>
          )}
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
