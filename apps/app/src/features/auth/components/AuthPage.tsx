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
  full_name: z.string().min(2, 'Ingresá tu nombre completo'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y _'),
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
  const handleRegister = registerForm.handleSubmit((data) => register.mutate(data))

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <span className="text-3xl">🎾</span>
          </div>
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
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.fullName')}
              </label>
              <input
                {...registerForm.register('full_name')}
                type="text"
                autoComplete="name"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="Juan Pérez"
              />
              {registerForm.formState.errors.full_name && (
                <p className="text-destructive text-xs mt-1">{registerForm.formState.errors.full_name.message}</p>
              )}
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
