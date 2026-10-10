import { useState, type ReactNode } from 'react'
import { Notice } from './Notice'

export interface LoginFormProps {
  title: string
  subtitle: string
  logoSrc?: string
  /** Rendered under the form (e.g. a link to the registration page). */
  footer?: ReactNode
  /** Resolve on success; throw (or reject) with an Error to show its message. */
  onSubmit: (credentials: { email: string; password: string }) => Promise<void>
}

/** Email + password sign-in card shared by the club and platform panels. */
export function LoginForm({ title, subtitle, logoSrc = '/logo-app.svg', footer, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await onSubmit({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoSrc} alt="Match Padel" className="w-14 h-14 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>

        {error && <Notice className="mb-4">{error}</Notice>}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
              placeholder="admin@ejemplo.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
          >
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </button>
        </form>
        {footer && <div className="mt-4 text-center text-sm text-gray-600">{footer}</div>}
      </div>
    </div>
  )
}
