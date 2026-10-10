import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Notice } from '@match-padel/ui'
import { postAuthPath, usePendingInvitation } from '@/lib/pending-invitation'
import { CLUB_ROLE_LABELS } from '@/shared/permissions'
import { getErrorCode, getErrorMessage, getErrorStatus } from '@/lib/errors'
import { useRegisterOwner, useResendCode, useSession, useVerifyEmail } from '../hooks/useAuth'

const registerSchema = z.object({
  first_name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60),
  last_name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60),
  username: z
    .string()
    .trim()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo minúsculas, números y _'),
  email: z.string().trim().email('Email inválido'),
  phone: z
    .string()
    .trim()
    .refine((v) => v === '' || (v.length >= 6 && v.length <= 20), { message: 'Entre 6 y 20 caracteres' }),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})
type RegisterForm = z.infer<typeof registerSchema>

// Supabase's email OTP length is a project setting (8 digits today); validate loosely like the players app.
const codeSchema = z.object({
  code: z.string().trim().min(6, 'Código incompleto').max(10, 'Código inválido').regex(/^\d+$/, 'Solo números'),
})
type CodeForm = z.infer<typeof codeSchema>

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

function registerErrorMessage(error: unknown): string {
  const status = getErrorStatus(error)
  if (getErrorCode(error) === 'USERNAME_TAKEN') return 'Ese nombre de usuario ya está en uso. Elegí otro.'
  if (status === 409) return 'Ya existe una cuenta con ese email. Iniciá sesión.'
  if (status === 429) return 'Demasiados intentos. Probá de nuevo en unos minutos.'
  return getErrorMessage(error, 'No pudimos crear tu cuenta. Intentá de nuevo.')
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { session, loading } = useSession()
  const invitation = usePendingInvitation()
  const joining = invitation?.context ?? null
  const registerOwner = useRegisterOwner()
  const verify = useVerifyEmail()
  const resend = useResendCode()
  // `?verify=<email>` resumes the code step for an account that was never confirmed (from the login page).
  const [email, setEmail] = useState<string | null>(searchParams.get('verify'))
  const [verified, setVerified] = useState(false)
  const [resent, setResent] = useState(false)

  const form = useForm<RegisterForm>({ resolver: zodResolver(registerSchema), defaultValues: { phone: '' } })
  const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) })

  if (!loading && session && !verified) return <Navigate to={postAuthPath()} replace />

  const submitRegistration = form.handleSubmit((values) => {
    registerOwner.mutate(
      { ...values, phone: values.phone === '' ? undefined : values.phone },
      { onSuccess: () => setEmail(values.email) },
    )
  })

  const submitCode = codeForm.handleSubmit(({ code }) => {
    if (!email) return
    verify.mutate(
      { email, code },
      {
        onSuccess: () => {
          setVerified(true)
          // No club yet: `/` sends the new owner to "start your application"; an invited person
          // goes back to the invitation to accept it.
          navigate(postAuthPath(), { replace: true })
        },
      },
    )
  })

  const field = (name: keyof RegisterForm, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`reg-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input id={`reg-${name}`} className={inputClass} {...form.register(name)} {...props} />
      {form.formState.errors[name] && (
        <p className="text-red-600 text-xs mt-1">{form.formState.errors[name]?.message}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo-app.svg" alt="Match Padel" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">
            {email ? 'Confirmá tu email' : invitation ? 'Creá tu cuenta' : 'Registrá tu club'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {email
              ? `Te enviamos un código a ${email}. Ingresalo para activar tu cuenta.`
              : joining
                ? `Para unirte a ${joining.clubName} como ${CLUB_ROLE_LABELS[joining.role]}. Usá el email al que llegó la invitación (${joining.emailHint}).`
                : invitation
                  ? 'Creá tu cuenta con el email al que llegó la invitación para unirte al club.'
                  : 'Creá tu cuenta de dueño para empezar la solicitud de alta de tu club.'}
          </p>
        </div>

        {!email ? (
          <form
            onSubmit={submitRegistration}
            noValidate
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            {registerOwner.isError && <Notice>{registerErrorMessage(registerOwner.error)}</Notice>}
            <div className="grid grid-cols-2 gap-3">
              {field('first_name', 'Nombre', { autoComplete: 'given-name' })}
              {field('last_name', 'Apellido', { autoComplete: 'family-name' })}
            </div>
            {field('username', 'Nombre de usuario', { autoComplete: 'username', placeholder: 'mi_club' })}
            {field('email', 'Email', { type: 'email', autoComplete: 'email' })}
            {field('phone', 'Teléfono (opcional)', { type: 'tel', autoComplete: 'tel' })}
            {field('password', 'Contraseña', { type: 'password', autoComplete: 'new-password' })}
            <button
              type="submit"
              disabled={registerOwner.isPending}
              className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {registerOwner.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        ) : (
          <form
            onSubmit={submitCode}
            noValidate
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            {verify.isError && <Notice>{getErrorMessage(verify.error)}</Notice>}
            {resend.isError && <Notice>{getErrorMessage(resend.error)}</Notice>}
            {resent && !resend.isError && <Notice tone="success">Te enviamos un código nuevo.</Notice>}
            <div>
              <label htmlFor="reg-code" className="block text-sm font-medium text-gray-700 mb-1">
                Código de verificación
              </label>
              <input
                id="reg-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={10}
                placeholder="00000000"
                className={`${inputClass} text-center text-lg tracking-[0.3em]`}
                {...codeForm.register('code')}
              />
              {codeForm.formState.errors.code && (
                <p className="text-red-600 text-xs mt-1">{codeForm.formState.errors.code.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={verify.isPending}
              className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {verify.isPending ? 'Verificando...' : 'Verificar y continuar'}
            </button>
            <button
              type="button"
              disabled={resend.isPending}
              onClick={() => {
                setResent(false)
                resend.mutate(email, { onSuccess: () => setResent(true) })
              }}
              className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
            >
              {resend.isPending ? 'Enviando...' : 'Reenviar código'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" className="font-medium text-green-700 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
