import { useQuery } from '@tanstack/react-query'
import { Building2, LandPlot, Users, CalendarDays, Swords, Hourglass, type LucideIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Stats {
  totalClubs: number
  totalCourts: number
  totalReservations: number
  totalMatches: number
  totalUsers: number
  pendingReservations: number
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: LucideIcon; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-6 h-6" />
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [clubs, courts, reservations, matches, users, pending] = await Promise.all([
        supabase.from('clubs').select('*', { count: 'exact', head: true }),
        supabase.from('courts').select('*', { count: 'exact', head: true }),
        supabase.from('court_reservations').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('court_reservations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ])
      return {
        totalClubs: clubs.count ?? 0,
        totalCourts: courts.count ?? 0,
        totalReservations: reservations.count ?? 0,
        totalMatches: matches.count ?? 0,
        totalUsers: users.count ?? 0,
        pendingReservations: pending.count ?? 0,
      }
    },
  })

  const { data: recentReservations } = useQuery({
    queryKey: ['admin-recent-reservations'],
    queryFn: async () => {
      const { data } = await supabase
        .from('court_reservations')
        .select('id, start_time, end_time, status, total_price, user:users(full_name, username), court:courts(name, club:clubs(name))')
        .order('created_at', { ascending: false })
        .limit(5)
      return data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen general del sistema</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Clubes" value={stats?.totalClubs ?? 0} icon={Building2} color="bg-blue-100 text-blue-700" />
          <StatCard label="Canchas" value={stats?.totalCourts ?? 0} icon={LandPlot} color="bg-green-100 text-green-700" />
          <StatCard label="Usuarios" value={stats?.totalUsers ?? 0} icon={Users} color="bg-purple-100 text-purple-700" />
          <StatCard label="Reservas" value={stats?.totalReservations ?? 0} icon={CalendarDays} color="bg-orange-100 text-orange-700" />
          <StatCard label="Partidos" value={stats?.totalMatches ?? 0} icon={Swords} color="bg-yellow-100 text-yellow-700" />
          <StatCard label="Pendientes" value={stats?.pendingReservations ?? 0} icon={Hourglass} color="bg-red-100 text-red-700" />
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimas reservas</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentReservations?.length === 0 && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin reservas aún</p>
          )}
          {recentReservations?.map((r: any) => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {r.user?.full_name ?? r.user?.username ?? 'Usuario'}
                </p>
                <p className="text-xs text-gray-500">
                  {r.court?.club?.name} · {r.court?.name} ·{' '}
                  {new Date(r.start_time).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">${Number(r.total_price).toLocaleString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  r.status === 'confirmed' ? 'bg-green-100 text-green-700'
                  : r.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                  : r.status === 'cancelled' ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
                }`}>
                  {r.status === 'confirmed' ? 'Confirmada'
                   : r.status === 'pending' ? 'Pendiente'
                   : r.status === 'cancelled' ? 'Cancelada'
                   : 'Completada'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
