import type { ReactNode } from 'react'
import { CalendarDays, CalendarCheck, Hourglass, LandPlot, Swords } from 'lucide-react'
import { Notice, PageHeader, StatCard, StatusBadge, formatDateTime, formatMoney, personName } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_TONES } from '@/shared/permissions'
import { useClubSummary } from '../hooks/useClubSummary'

/** `notices` is a slot for banners the composition root adds (e.g. the owner's Mercado Pago hint). */
export function DashboardPage({ notices }: { notices?: ReactNode }) {
  const club = useCurrentClub()
  const { data, isLoading, error } = useClubSummary(club.clubId)

  return (
    <div className="space-y-6">
      <PageHeader title="Resumen" subtitle={club.name} />

      {notices}

      {error && <Notice>{getErrorMessage(error)}</Notice>}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Canchas" value={data.courts} icon={LandPlot} tone="green" />
            <StatCard label="Reservas" value={data.reservations.total} icon={CalendarDays} tone="orange" />
            <StatCard label="Pendientes" value={data.reservations.pending} icon={Hourglass} tone="red" />
            <StatCard label="Hoy" value={data.reservations.today} icon={CalendarCheck} tone="blue" />
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
          {data?.recentReservations.map((r) => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {personName(r.user, 'Jugador')}
                </p>
                <p className="text-xs text-gray-500">
                  {r.court.name} · {formatDateTime(r.start_time)}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-semibold text-gray-900">{formatMoney(r.total_price)}</p>
                <StatusBadge label={RESERVATION_STATUS_LABELS[r.status]} tone={RESERVATION_STATUS_TONES[r.status]} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
