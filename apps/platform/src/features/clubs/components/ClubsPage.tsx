import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ClubStatus, PlatformClub } from '@match-padel/types'
import { Notice, PageHeader, Pagination, StatusBadge, formatDate } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { NoteDialog } from '@/shared/components/NoteDialog'
import { getLifecycleErrorMessage, isConflictError } from '@/lib/errors'
import { ACTION_COPY, CLUB_STATUSES, CLUB_STATUS_LABELS, CLUB_STATUS_TONES } from '@/shared/permissions'
import { useClubLifecycle, useClubs, useDebouncedValue, useSetClubActive } from '../hooks/useClubs'
import { formatPercent } from '../lib/charging'
import { ClubChargingBadges } from './ClubChargingBadges'
import { ClubChargingDialog } from './ClubChargingDialog'
import { CreateClubDialog } from './CreateClubDialog'

const PAGE_SIZE = 20

export function ClubsPage() {
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [status, setStatus] = useState<ClubStatus | ''>('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search.trim())
  const { data, isLoading, error } = useClubs({ search: debouncedSearch, status, page, limit: PAGE_SIZE })
  const setActive = useSetClubActive()
  const lifecycle = useClubLifecycle()
  const [pendingAction, setPendingAction] = useState<{ club: PlatformClub; action: 'suspend' | 'unsuspend' } | null>(
    null,
  )
  const [success, setSuccess] = useState<string | null>(null)
  const [chargingClubId, setChargingClubId] = useState<string | null>(null)

  const closeDialog = () => {
    setPendingAction(null)
    lifecycle.reset()
  }

  const confirmLifecycle = (text: string | undefined) => {
    if (!pendingAction) return
    const { club, action } = pendingAction
    lifecycle.mutate(
      { action, id: club.id, text },
      {
        onSuccess: () => {
          setPendingAction(null)
          setSuccess(`${club.name}: ${ACTION_COPY[action].success}`)
        },
        onError: (err) => {
          if (isConflictError(err)) setPendingAction(null)
        },
      },
    )
  }

  const clubs = data?.items ?? []
  const chargingClub = clubs.find((c) => c.id === chargingClubId) ?? null

  const toggle = (id: string, name: string, isActive: boolean) => {
    if (isActive && !window.confirm(`¿Desactivar "${name}"? Los jugadores dejarán de verlo en la app.`)) return
    setActive.mutate({ id, isActive: !isActive })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clubes"
        subtitle={`${data?.meta.total ?? 0} clubes${status ? ` en estado ${CLUB_STATUS_LABELS[status].toLowerCase()}` : ' en la plataforma'}`}
        actions={
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            + Nuevo club
          </button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          placeholder="Buscar club o ciudad..."
          aria-label="Buscar club"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ClubStatus | '')
            setPage(1)
          }}
          aria-label="Filtrar por estado"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Todos los estados</option>
          {CLUB_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CLUB_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <Notice>{getErrorMessage(error)}</Notice>}
      {setActive.error && <Notice>{getErrorMessage(setActive.error)}</Notice>}
      {success && <Notice tone="success">{success}</Notice>}
      {!!lifecycle.error && !pendingAction && <Notice>{getLifecycleErrorMessage(lifecycle.error)}</Notice>}

      {chargingClub && <ClubChargingDialog club={chargingClub} onClose={() => setChargingClubId(null)} />}
      {showForm && <CreateClubDialog onClose={() => setShowForm(false)} />}
      {pendingAction && (
        <NoteDialog
          title={`${ACTION_COPY[pendingAction.action].title}: ${pendingAction.club.name}`}
          description={ACTION_COPY[pendingAction.action].description}
          fieldLabel={ACTION_COPY[pendingAction.action].field}
          required={ACTION_COPY[pendingAction.action].required}
          confirmLabel={ACTION_COPY[pendingAction.action].confirm}
          tone={ACTION_COPY[pendingAction.action].tone}
          isPending={lifecycle.isPending}
          error={lifecycle.error ? getLifecycleErrorMessage(lifecycle.error) : null}
          onConfirm={confirmLifecycle}
          onClose={closeDialog}
        />
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Cargando...</div>
        ) : clubs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No se encontraron clubes</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Club</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ciudad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Alta</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Solicitud</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Visibilidad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Cobros</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clubs.map((club) => (
                  <tr key={club.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{club.name}</p>
                      <p className="text-xs text-gray-400">{club.address}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{club.city}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(club.created_at, true)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={CLUB_STATUS_LABELS[club.status]} tone={CLUB_STATUS_TONES[club.status]} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={club.is_active ? 'Activo' : 'Inactivo'}
                        tone={club.is_active ? 'green' : 'gray'}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900">
                        Comisión <span className="font-semibold">{formatPercent(club.commission_percent)}</span>
                      </p>
                      <ClubChargingBadges club={club} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-3">
                      <button
                        type="button"
                        onClick={() => setChargingClubId(club.id)}
                        className="text-xs text-green-700 hover:underline"
                      >
                        Cobros
                      </button>
                      <Link to={`/requests/${club.id}`} className="text-xs text-green-700 hover:underline">
                        Ver solicitud
                      </Link>
                      {(club.status === 'approved' || club.status === 'suspended') && (
                        <button
                          onClick={() => {
                            setSuccess(null)
                            lifecycle.reset()
                            setPendingAction({ club, action: club.status === 'approved' ? 'suspend' : 'unsuspend' })
                          }}
                          className={`text-xs underline ${
                            club.status === 'approved' ? 'text-red-600 hover:text-red-700' : 'text-green-700 hover:text-green-800'
                          }`}
                        >
                          {club.status === 'approved' ? 'Suspender' : 'Reactivar'}
                        </button>
                      )}
                      <button
                        disabled={setActive.isPending}
                        onClick={() => toggle(club.id, club.name, club.is_active)}
                        className="text-xs text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                      >
                        {club.is_active ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onChange={setPage} />}
      </div>
    </div>
  )
}
