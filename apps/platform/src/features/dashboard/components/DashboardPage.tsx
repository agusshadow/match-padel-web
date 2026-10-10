import { Building2, CalendarDays, Hourglass, LandPlot, Swords, Users } from 'lucide-react'
import { Notice, PageHeader, StatCard } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { usePlatformSummary } from '../hooks/usePlatformSummary'

export function DashboardPage() {
  const { data, isLoading, error } = usePlatformSummary()

  return (
    <div className="space-y-6">
      <PageHeader title="Resumen" subtitle="Estado general de la plataforma" />
      {error && <Notice>{getErrorMessage(error)}</Notice>}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Clubes" value={data.clubs} icon={Building2} tone="blue" />
            <StatCard label="Clubes activos" value={data.activeClubs} icon={Building2} tone="green" />
            <StatCard label="Canchas" value={data.courts} icon={LandPlot} tone="green" />
            <StatCard label="Usuarios" value={data.users} icon={Users} tone="purple" />
            <StatCard label="Reservas" value={data.reservations} icon={CalendarDays} tone="orange" />
            <StatCard label="Pendientes" value={data.pendingReservations} icon={Hourglass} tone="red" />
            <StatCard label="Partidos" value={data.matches} icon={Swords} tone="yellow" />
          </div>
        )
      )}
    </div>
  )
}
