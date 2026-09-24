import { useAuthStore } from '@/features/auth/store/authStore'

export function HomePage() {
  const { user, signOut } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎾</span>
          <span className="font-bold text-gray-900">Match Padel</span>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Salir
        </button>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            ¡Bienvenido{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
          </h2>
          <p className="text-sm text-gray-500">Encontrá tu próximo partido de pádel</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: '🏆', label: 'Partidos', desc: 'Buscar partidos' },
            { icon: '📅', label: 'Reservas', desc: 'Mis reservas' },
            { icon: '👥', label: 'Jugadores', desc: 'Buscar jugadores' },
            { icon: '🏟️', label: 'Clubes', desc: 'Ver clubes' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-gray-200 p-4 cursor-pointer hover:border-blue-300 transition-colors"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-medium text-gray-900 text-sm">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
