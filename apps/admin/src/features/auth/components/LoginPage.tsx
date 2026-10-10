import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { LoginForm } from '@match-padel/ui'
import { useSession, useSignIn } from '../hooks/useAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const signIn = useSignIn()
  const { session, loading } = useSession()
  // While signing in, the session appears before the access check ends; do not redirect yet
  // or a denial message would never be shown.
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session && !submitting) return <Navigate to="/" replace />

  return (
    <LoginForm
      title="Match Padel"
      subtitle="Panel del club"
      onSubmit={async (credentials) => {
        setSubmitting(true)
        try {
          await signIn(credentials)
          navigate('/', { replace: true })
        } finally {
          setSubmitting(false)
        }
      }}
    />
  )
}
