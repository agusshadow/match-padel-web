import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  in_progress: 'En curso',
  completed: 'Finalizado',
  cancelled: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}

export function TournamentsAdminPage() {
  const { data: tournaments, isLoading } = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          id, name, format, status, max_teams, start_date, created_at,
          creator:users!tournaments_created_by_fkey(username, full_name),
          club:clubs(name, city),
          tournament_teams(id)
        `)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((t: any) => ({
        ...t,
        teams_count: t.tournament_teams?.length ?? 0,
        tournament_teams: undefined,
      }))
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Torneos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tournaments?.length ?? 0} torneos registrados</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando torneos...</div>
        ) : !tournaments?.length ? (
          <div className="p-12 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500 text-sm">No hay torneos aún</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Torneo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Club</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Formato</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Equipos</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Inicio</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tournaments.map((t: any) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.creator?.full_name ?? t.creator?.username}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden md:table-cell">
                    {t.club ? `${t.club.name}, ${t.club.city}` : '—'}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {t.format === 'round_robin' ? 'Round Robin' : 'Eliminación'}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {t.teams_count}/{t.max_teams}
                  </td>
                  <td className="px-5 py-4 text-gray-500 hidden lg:table-cell">
                    {new Date(t.start_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[t.status]}`}>
                      {STATUS_LABELS[t.status] ?? t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
