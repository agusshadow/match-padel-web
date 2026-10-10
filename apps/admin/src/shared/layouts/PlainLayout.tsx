import { Link, Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAccess, useSignOut } from '@/features/auth'

/** Layout of the screens that are not tied to one club (club list, new application). */
export function PlainLayout() {
  const { data: access } = useAccess(true)
  const signOut = useSignOut()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-app.svg" alt="Match Padel" className="w-7 h-7" />
            <span className="text-sm font-bold text-gray-900">Match Padel</span>
            <span className="text-xs text-gray-400">Panel del club</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs text-gray-400 truncate">{access?.user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <Outlet />
      </main>
    </div>
  )
}
