import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ClubAdminReservation, ReservationStatus } from '@match-padel/types'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate, formatMoney, formatTime, personName } from '@match-padel/ui'
import { clubParts } from '@/lib/club-time'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { RESERVATION_STATUS_LABELS, RESERVATION_STATUS_TONES } from '@/shared/permissions'
import { useClubReservations, useUpdateReservationStatus } from '../hooks/useReservations'

const PAGE_SIZE = 20
const STATUSES: ReservationStatus[] = ['pending', 'confirmed', 'cancelled', 'completed']

type Transition = { label: string; status: Exclude<ReservationStatus, 'pending'>; danger?: boolean }

function transitionsFor(reservation: ClubAdminReservation): Transition[] {
  switch (reservation.status) {
    case 'pending':
      return [
        { label: 'Confirmar', status: 'confirmed' },
        { label: 'Cancelar', status: 'cancelled', danger: true },
      ]
    case 'confirmed':
      return [
        { label: 'Completar', status: 'completed' },
        { label: 'Cancelar', status: 'cancelled', danger: true },
      ]
    default:
      return []
  }
}

export function ReservationsPage() {
  const club = useCurrentClub()
  const [status, setStatus] = useState<ReservationStatus | undefined>(undefined)
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useClubReservations(club.clubId, { status, page, limit: PAGE_SIZE })
  const update = useUpdateReservationStatus(club.clubId)

  return (
    <div className="space-y-6">
      <PageHeader title="Reservas" subtitle={`${data?.meta.total ?? 0} reservas`} />

      <div className="flex gap-2 flex-wrap">
        {[undefined, ...STATUSES].map((s) => (
          <button
            key={s ?? 'all'}
            onClick={() => {
              setStatus(s)
              setPage(1)
            }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === s
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s ? RESERVATION_STATUS_LABELS[s] : 'Todas'}
          </button>
        ))}
      </div>

      {error && <Notice>{getErrorMessage(error)}</Notice>}
      {update.error && <Notice>{getErrorMessage(update.error)}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Sin reservas</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Jugador</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Cancha</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Precio</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.items.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{personName(r.user)}</p>
                        {r.user?.username && <p className="text-xs text-gray-400">@{r.user.username}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.court.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <p>{formatDate(r.start_time)}</p>
                        <p className="text-xs text-gray-400">
                          {formatTime(r.start_time)} - {formatTime(r.end_time)}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney(r.total_price)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={RESERVATION_STATUS_LABELS[r.status]}
                          tone={RESERVATION_STATUS_TONES[r.status]}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 justify-end items-center">
                          {r.status !== 'cancelled' && (
                            <Link
                              to={`/${club.clubId}/calendar?date=${clubParts(r.start_time).date}&reservation=${r.id}`}
                              className="text-xs px-2 py-1 rounded text-green-700 hover:underline"
                            >
                              Ver en calendario
                            </Link>
                          )}
                          {transitionsFor(r).map((t) => (
                            <button
                              key={t.status}
                              disabled={update.isPending}
                              onClick={() => update.mutate({ id: r.id, status: t.status })}
                              className={`text-xs px-2 py-1 rounded disabled:opacity-50 ${
                                t.danger
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data?.meta.page ?? page} totalPages={data?.meta.totalPages ?? 1} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
