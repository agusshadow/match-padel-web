import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Notice } from '@match-padel/ui'
import { useAccess, useRefreshAccess, useSession, useSignOut } from '@/features/auth'
import { CLUB_ROLE_LABELS } from '@/shared/permissions'
import { useAcceptInvitation, useInvitationPreview } from '../hooks/useInvitation'
import { classifyInvitationError, maskEmail, type AcceptFailure } from '../lib/errors'
import {
  clearPendingInvitation,
  readPendingInvitation,
  savePendingInvitation,
  type PendingInvitation,
} from '@/lib/pending-invitation'

const primaryButton =
  'w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm text-center block'
const secondaryButton =
  'w-full py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm text-center block'

function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-app.svg" alt="Match Padel" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">{children}</div>
      </div>
    </div>
  )
}

function InvalidState({ message }: { message: string }) {
  return (
    <Shell title="Invitación no válida">
      <Notice>{message}</Notice>
      <Link to="/" className={secondaryButton}>
        Ir al panel
      </Link>
    </Shell>
  )
}

/**
 * Public page opened from the invitation email (`/invite?token=&club=`). The token is moved to
 * `sessionStorage` and removed from the address bar right away, so it does not stay in the history
 * or leak through the login / register URLs; it is never logged.
 */
export function InvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { session, loading: sessionLoading } = useSession()
  const access = useAccess(!!session)
  const refreshAccess = useRefreshAccess()
  const signOut = useSignOut()
  const accept = useAcceptInvitation()
  const [failure, setFailure] = useState<AcceptFailure | null>(null)

  const [invitation] = useState<PendingInvitation | null>(() => {
    const fromUrl = searchParams.get('token')
    if (fromUrl) {
      const fresh: PendingInvitation = { token: fromUrl, clubId: searchParams.get('club') }
      savePendingInvitation(fresh)
      return fresh
    }
    return readPendingInvitation()
  })
  const token = invitation?.token ?? null

  // Take the token out of the URL (and the browser history) as soon as it is in storage.
  useEffect(() => {
    if (searchParams.has('token') || searchParams.has('club')) navigate('/invite', { replace: true })
  }, [navigate, searchParams])

  const preview = useInvitationPreview(token)
  const previewFailure = preview.isError ? classifyInvitationError(preview.error) : null
  const info = preview.data

  // Remember what is being joined so login / register can say it; forget the token once it is useless.
  useEffect(() => {
    if (!invitation || !info) return
    if (info.expired) {
      clearPendingInvitation()
      return
    }
    savePendingInvitation({
      ...invitation,
      context: { clubName: info.club_name, role: info.role, emailHint: info.email_hint },
    })
  }, [invitation, info])
  useEffect(() => {
    if (previewFailure?.kind === 'invalid') clearPendingInvitation()
  }, [previewFailure?.kind])

  if (!token) {
    return (
      <InvalidState message="El enlace de la invitación está incompleto. Abrilo de nuevo desde el email o pedile al dueño del club que te envíe otra invitación." />
    )
  }
  if (preview.isLoading || sessionLoading) {
    return (
      <Shell title="Invitación al club">
        <p className="text-sm text-gray-500 text-center">Cargando invitación...</p>
      </Shell>
    )
  }
  if (previewFailure?.kind === 'invalid') return <InvalidState message={previewFailure.message} />
  if (preview.isError || !info) {
    return (
      <Shell title="Invitación al club">
        <Notice>{previewFailure?.message ?? 'No pudimos cargar la invitación.'}</Notice>
        <button onClick={() => preview.refetch()} className={primaryButton}>
          Reintentar
        </button>
      </Shell>
    )
  }
  if (info.expired || failure?.kind === 'expired') {
    return (
      <Shell title="Invitación vencida">
        <Notice tone="warning">
          La invitación a <strong>{info.club_name}</strong> venció. Pedile al dueño del club que te la reenvíe: vas a
          recibir un email nuevo con un enlace que funciona.
        </Notice>
        <Link to="/" className={secondaryButton}>
          Ir al panel
        </Link>
      </Shell>
    )
  }
  if (failure?.kind === 'invalid') return <InvalidState message={failure.message} />

  const roleLabel = CLUB_ROLE_LABELS[info.role]
  const userEmail = access.data?.user.email ?? null
  // The preview only reveals a masked address, but the same mask of a different email can never match.
  const wrongAccount = !!userEmail && maskEmail(userEmail.toLowerCase()) !== info.email_hint.toLowerCase()
  const mismatch = wrongAccount || failure?.kind === 'email_mismatch'

  const onAccept = () => {
    setFailure(null)
    accept.mutate(token, {
      onSuccess: async ({ clubId }) => {
        clearPendingInvitation()
        // The new membership must be in the access list before the club route resolves.
        await refreshAccess().catch(() => undefined)
        navigate(`/${clubId}`, { replace: true })
      },
      onError: (error) => setFailure(classifyInvitationError(error)),
    })
  }

  const useOtherAccount = async () => {
    await signOut()
    setFailure(null)
    accept.reset()
  }

  const confirmEmail = async () => {
    // The register page resumes the code step for an existing unconfirmed account.
    await signOut()
    navigate(`/register?verify=${encodeURIComponent(userEmail ?? '')}`, { replace: true })
  }

  return (
    <Shell title="Invitación al club">
      <div className="text-center space-y-1">
        <p className="text-base text-gray-900">
          Te invitaron a <strong>{info.club_name}</strong> como <strong>{roleLabel}</strong>
        </p>
        <p className="text-sm text-gray-500">
          La invitación es para <span className="font-mono">{info.email_hint}</span>
        </p>
      </div>

      {!session ? (
        <>
          <p className="text-sm text-gray-600 text-center">
            Iniciá sesión o creá tu cuenta con ese mismo email para aceptarla.
          </p>
          <div className="space-y-2">
            <Link to="/login" className={primaryButton}>
              Iniciar sesión
            </Link>
            <Link to="/register" className={secondaryButton}>
              Crear cuenta
            </Link>
          </div>
        </>
      ) : access.isLoading ? (
        <p className="text-sm text-gray-500 text-center">Verificando tu cuenta...</p>
      ) : (
        <>
          {userEmail && (
            <p className="text-sm text-gray-600 text-center">
              Vas a aceptar con la cuenta <strong>{userEmail}</strong>.
            </p>
          )}
          {mismatch && (
            <Notice tone="warning">
              Esta invitación es para <strong>{info.email_hint}</strong> y estás con otra cuenta. Cerrá sesión e
              ingresá con la dirección invitada.
            </Notice>
          )}
          {failure && failure.kind !== 'email_mismatch' && <Notice>{failure.message}</Notice>}
          <div className="space-y-2">
            {mismatch ? (
              <button onClick={useOtherAccount} className={primaryButton}>
                Cerrar sesión y usar otra cuenta
              </button>
            ) : failure?.kind === 'email_not_confirmed' ? (
              <button onClick={confirmEmail} className={primaryButton}>
                Confirmar mi email
              </button>
            ) : (
              <button onClick={onAccept} disabled={accept.isPending} className={primaryButton}>
                {accept.isPending ? 'Aceptando...' : 'Aceptar invitación'}
              </button>
            )}
            {!mismatch && (
              <button onClick={useOtherAccount} disabled={accept.isPending} className={secondaryButton}>
                Usar otra cuenta
              </button>
            )}
          </div>
        </>
      )}
    </Shell>
  )
}
