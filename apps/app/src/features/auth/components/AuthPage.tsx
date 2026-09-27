import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useLogin, useRegister } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

const registerSchema = loginSchema.extend({
  first_name: z.string().min(2, 'Ingresá tu nombre'),
  last_name: z.string().min(2, 'Ingresá tu apellido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y _'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Elegí tu nivel de juego' }),
  }),
  preferred_hand: z.enum(['drive', 'backhand'], {
    errorMap: () => ({ message: 'Elegí tu lado preferido' }),
  }),
  phone: z.union([z.string().min(6, 'Mínimo 6 caracteres').max(20), z.literal('')]).optional(),
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export function AuthPage() {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const login = useLogin()
  const register = useRegister()

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const isLoading = login.isPending || register.isPending
  const error = login.error || register.error

  const handleLogin = loginForm.handleSubmit((data) => login.mutate(data))
  const handleRegister = registerForm.handleSubmit((data) =>
    register.mutate({ ...data, phone: data.phone || undefined })
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo-app.svg" alt="Match Padel" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Match Padel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Iniciá sesión para continuar' : 'Creá tu cuenta gratis'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-lg p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('auth.register')}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">
            {(error as any)?.response?.data?.message ?? t('common.error')}
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.email')}
              </label>
              <input
                {...loginForm.register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="vos@ejemplo.com"
              />
              {loginForm.formState.errors.email && (
                <p className="text-destructive text-xs mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.password')}
              </label>
              <input
                {...loginForm.register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="••••••••"
              />
              {loginForm.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('auth.firstName')}
                </label>
                <input
                  {...registerForm.register('first_name')}
                  type="text"
                  autoComplete="given-name"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder="Juan"
                />
                {registerForm.formState.errors.first_name && (
                  <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {t('auth.lastName')}
                </label>
                <input
                  {...registerForm.register('last_name')}
                  type="text"
                  autoComplete="family-name"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  placeholder="Pérez"
                />
                {registerForm.formState.errors.last_name && (
                  <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.username')}
              </label>
              <input
                {...registerForm.register('username')}
                type="text"
                autoComplete="username"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="juan_padel"
              />
              {registerForm.formState.errors.username && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.email')}
              </label>
              <input
                {...registerForm.register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="vos@ejemplo.com"
              />
              {registerForm.formState.errors.email && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.password')}
              </label>
              <input
                {...registerForm.register('password')}
                type="password"
                autoComplete="new-password"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="••••••••"
              />
              {registerForm.formState.errors.password && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.skillLevel')}
              </label>
              <div className="flex bg-muted rounded-lg p-1">
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => registerForm.setValue('skill_level', level, { shouldValidate: true })}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                      registerForm.watch('skill_level') === level
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(`auth.skill${level.charAt(0).toUpperCase()}${level.slice(1)}`)}
                  </button>
                ))}
              </div>
              {registerForm.formState.errors.skill_level && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.skill_level.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.preferredHand')}
              </label>
              <div className="flex bg-muted rounded-lg p-1">
                {(['drive', 'backhand'] as const).map((hand) => (
                  <button
                    key={hand}
                    type="button"
                    onClick={() => registerForm.setValue('preferred_hand', hand, { shouldValidate: true })}
                    className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                      registerForm.watch('preferred_hand') === hand
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t(hand === 'drive' ? 'auth.handDrive' : 'auth.handBackhand')}
                  </button>
                ))}
              </div>
              {registerForm.formState.errors.preferred_hand && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.preferred_hand.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.phone')}
              </label>
              <input
                {...registerForm.register('phone')}
                type="tel"
                autoComplete="tel"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="+54 9 11 1234-5678"
              />
              {registerForm.formState.errors.phone && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.phone.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? t('common.loading') : t('auth.register')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
