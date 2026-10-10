import { Building2, CalendarDays, Hourglass, LandPlot, Swords, Users } from 'lucide-react'
import {
  Notice,
  PageHeader,
  StatCard,
  StatusBadge,
  formatDateTime,
  formatMoney,
  personName,
  type StatusTone,
} from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { usePlatformSummary } from '../hooks/usePlatformSummary'

const STATUS: Record<string, { label: string; tone: StatusTone }> = {
  pending: { label: 'Pendiente', tone: 'yellow' },
  confirmed: { label: 'Confirmada', tone: 'green' },
  cancelled: { label: 'Cancelada', tone: 'red' },
  completed: { label: 'Completada', tone: 'gray' },
}

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
            <StatCard label="Canchas" value={data.courts} icon={LandPlot} tone="green" />
            <StatCard label="Usuarios" value={data.users} icon={Users} tone="purple" />
            <StatCard label="Reservas" value={data.reservations} icon={CalendarDays} tone="orange" />
            <StatCard label="Pendientes" value={data.pendingReservations} icon={Hourglass} tone="red" />
            <StatCard label="Partidos" value={data.matches} icon={Swords} tone="yellow" />
          </div>
        )
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimas reservas</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data?.recentReservations.length === 0 && (
            <p className="px-5 py-8 text-sm text-gray-400 text-center">Sin reservas aún</p>
          )}
          {data?.recentReservations.map((r) => {
            const status = STATUS[r.status] ?? { label: r.status, tone: 'gray' as const }
            return (
              <div key={r.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{personName(r.user, 'Jugador')}</p>
                  <p className="text-xs text-gray-500">
                    {r.court.club?.name} · {r.court.name} · {formatDateTime(r.start_time)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-semibold text-gray-900">{formatMoney(r.total_price)}</p>
                  <StatusBadge label={status.label} tone={status.tone} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
