import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useVerifyEmail, useResendVerificationCode } from '../hooks/useAuth'

const verifyEmailSchema = z.object({
  // Supabase's email OTP length is a project-level setting (currently 8
  // digits, not the more common 6) — validate loosely rather than hardcode it.
  code: z
    .string()
    .min(6, 'Código incompleto')
    .max(10, 'Código inválido')
    .regex(/^\d+$/, 'Solo números'),
})

type VerifyEmailForm = z.infer<typeof verifyEmailSchema>

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')
  const verify = useVerifyEmail()
  const resend = useResendVerificationCode()
  const [resendState, setResendState] = useState<'idle' | 'sent'>('idle')

  const form = useForm<VerifyEmailForm>({ resolver: zodResolver(verifyEmailSchema) })

  // Reached directly (no email in the URL) — nothing to verify, back to /auth.
  if (!email) {
    return <Navigate to="/auth" replace />
  }

  const handleSubmit = form.handleSubmit((data) => verify.mutate({ email, code: data.code }))

  const handleResend = () => {
    setResendState('idle')
    resend.mutate(email, { onSuccess: () => setResendState('sent') })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo-app.svg" alt="Match Padel" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">{t('auth.verifyEmailTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('auth.verifyEmailBody', { email })}
          </p>
        </div>

        {verify.error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">
            {(verify.error as any)?.message ?? t('common.error')}
          </div>
        )}

        {resend.isError && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">
            {(resend.error as any)?.message ?? t('common.error')}
          </div>
        )}

        {resendState === 'sent' && !resend.isError && (
          <div className="bg-primary/10 text-primary text-sm rounded-lg px-4 py-3 mb-4">
            {t('auth.codeResent')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('auth.verificationCode')}
            </label>
            <input
              {...form.register('code')}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={10}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm text-center tracking-[0.3em] text-lg"
              placeholder="00000000"
            />
            {form.formState.errors.code && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.code.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
          >
            {verify.isPending ? t('common.loading') : t('auth.verify')}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resend.isPending}
            className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
          >
            {resend.isPending ? t('common.loading') : t('auth.resendCode')}
          </button>
        </form>
      </div>
    </div>
  )
}
