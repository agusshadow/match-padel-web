import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const MATCH_STATUS: Record<string, string> = {
  waiting: 'Esperando',
  in_progress: 'En juego',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

const MATCH_STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export function MatchesAdminPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: async () => {
      const { data } = await supabase
        .from('matches')
        .select(`
          id, type, status, is_ranked, lobby_url, created_at,
          score_team1, score_team2,
          creator:users!matches_created_by_fkey(full_name, username),
          club:clubs(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)
      return data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partidos</h1>
        <p className="text-sm text-gray-500 mt-1">Últimos 50 partidos</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin partidos aún</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Creador</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Score</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{m.creator?.full_name ?? 'Sin nombre'}</p>
                      <p className="text-xs text-gray-400">@{m.creator?.username}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        m.is_ranked ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {m.is_ranked ? 'Rankeado' : 'Amistoso'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${MATCH_STATUS_COLORS[m.status]}`}>
                        {MATCH_STATUS[m.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {m.score_team1?.length > 0
                        ? `${m.score_team1.join('-')} vs ${m.score_team2.join('-')}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(m.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
