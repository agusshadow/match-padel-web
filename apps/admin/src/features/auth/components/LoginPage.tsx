import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { LoginForm } from '@match-padel/ui'
import { postAuthPath, usePendingInvitation } from '@/lib/pending-invitation'
import { EmailNotConfirmedError, useSession, useSignIn } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const { session, loading } = useSession()
  // Someone who came from an invitation email goes back to it once signed in.
  const invitation = usePendingInvitation()
  // While signing in, the session appears before the access check ends; do not redirect yet
  // or an error message would never be shown.
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && !submitting) return <Navigate to={postAuthPath()} replace />

  return (
    <LoginForm
      title="Match Padel"
      subtitle={
        invitation?.context
          ? `Iniciá sesión para unirte a ${invitation.context.clubName}`
          : 'Panel del club'
      }
      footer={
        invitation ? (
          <p>
            ¿Todavía no tenés cuenta?{' '}
            <Link to="/register" className="font-medium text-green-700 hover:underline">
              Creá una para aceptar la invitación
            </Link>
          </p>
        ) : (
          <p>
            ¿Todavía no tenés cuenta?{' '}
            <Link to="/register" className="font-medium text-green-700 hover:underline">
              Registrá tu club
            </Link>
          </p>
        )
      }
      onSubmit={async (credentials) => {
        setSubmitting(true)
        try {
          await signIn(credentials)
          navigate(postAuthPath(), { replace: true })
        } catch (err) {
          if (err instanceof EmailNotConfirmedError) {
            // The account exists but was never confirmed: finish with the emailed code.
            navigate(`/register?verify=${encodeURIComponent(err.email)}`, { replace: true })
            return
          }
          throw err
        } finally {
          setSubmitting(false)
        }
      }}
    />
  )
}
