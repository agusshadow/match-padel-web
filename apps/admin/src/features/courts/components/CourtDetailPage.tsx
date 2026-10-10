import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Notice, PageHeader, StatusBadge, formatMoney } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { SURFACE_LABELS } from '../lib/time'
import { useClubCourts } from '../hooks/useCourts'
import { ExceptionsPanel } from './ExceptionsPanel'
import { PreviewTab } from './PreviewTab'
import { PricesTab } from './PricesTab'
import { ScheduleTab } from './ScheduleTab'

const TABS = [
  { key: 'schedule', label: 'Horario semanal' },
  { key: 'prices', label: 'Precios' },
  { key: 'exceptions', label: 'Excepciones' },
  { key: 'preview', label: 'Vista previa' },
] as const
type TabKey = (typeof TABS)[number]['key']

export function CourtDetailPage() {
  const club = useCurrentClub()
  const { courtId = '' } = useParams<{ courtId: string }>()
  const [params, setParams] = useSearchParams()
  const courts = useClubCourts(club.clubId)
  const court = courts.data?.find((c) => c.id === courtId)
  const tab: TabKey = TABS.find((t) => t.key === params.get('tab'))?.key ?? 'schedule'
  // The whole Courts area is behind RequireManagerRole (owner, admin, superadmin), the roles the API lets write.
  const editable = true

  if (courts.isLoading) return <p className="text-sm text-gray-400">Cargando cancha...</p>
  if (courts.isError) return <Notice>{getErrorMessage(courts.error)}</Notice>
  if (!court) {
    return (
      <div className="space-y-3">
        <Notice>No encontramos esa cancha en este club.</Notice>
        <Link to={`/${club.clubId}/courts`} className="text-sm text-green-700 underline">
          Volver a canchas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link to={`/${club.clubId}/courts`} className="text-green-700 hover:underline">
          Canchas
        </Link>
      </div>
      <PageHeader
        title={court.name}
        subtitle={`${SURFACE_LABELS[court.surface]}${court.is_indoor ? ' · Techada' : ''} · Precio base ${formatMoney(court.price_per_hour)} / hora`}
        actions={<StatusBadge label={court.is_active ? 'Activa' : 'Inactiva'} tone={court.is_active ? 'green' : 'gray'} />}
      />
      {!court.is_active && (
        <Notice tone="warning">Esta cancha está inactiva: los jugadores no la ven aunque tenga horario cargado.</Notice>
      )}

      <div role="tablist" className="flex gap-1 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => setParams(t.key === 'schedule' ? {} : { tab: t.key }, { replace: true })}
            className={`px-4 py-2 text-sm font-medium -mb-px border-b-2 ${
              tab === t.key
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'schedule' && <ScheduleTab clubId={club.clubId} courtId={court.id} editable={editable} />}
        {tab === 'prices' && <PricesTab clubId={club.clubId} courtId={court.id} editable={editable} />}
        {tab === 'exceptions' && (
          <ExceptionsPanel clubId={club.clubId} courts={courts.data ?? []} courtId={court.id} editable={editable} />
        )}
        {tab === 'preview' && <PreviewTab clubId={club.clubId} courtId={court.id} />}
      </div>
    </div>
  )
}
