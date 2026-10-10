import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { WEEKDAYS, type ApplicationDetail } from '@match-padel/types'
import { Notice, PageHeader, StatusBadge, formatDateTime, formatMoney, personName } from '@match-padel/ui'
import { useAccess } from '@/features/auth'
import { NoteDialog } from '@/shared/components/NoteDialog'
import { getErrorMessage, getErrorStatus, getLifecycleErrorMessage, isConflictError } from '@/lib/errors'
import {
  ACTION_COPY,
  CLUB_STATUS_LABELS,
  CLUB_STATUS_TONES,
  availableActions,
  canSeeStatus,
  type LifecycleAction,
} from '@/shared/permissions'
import { SURFACE_LABELS, WEEKDAY_LABELS } from '../constants'
import { useApplication, useApplicationAction } from '../hooks/useRequests'
import { ApplicationDocuments } from './ApplicationDocuments'
import { ApplicationHistory } from './ApplicationHistory'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 break-words">{children ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </section>
  )
}

function ClubData({ detail }: { detail: ApplicationDetail }) {
  const { club, owner } = detail
  return (
    <Section title="Datos del club">
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field label="Nombre">{club.name}</Field>
        <Field label="Razón social">{club.legal_name}</Field>
        <Field label="CUIT / identificación fiscal">{club.tax_id}</Field>
        <Field label="Slug">{club.slug}</Field>
        <Field label="Dirección">{club.address}</Field>
        <Field label="Ciudad">{club.city}</Field>
        <Field label="Coordenadas">
          {club.lat !== null && club.lng !== null ? `${club.lat}, ${club.lng}` : null}
        </Field>
        <Field label="Visibilidad">{club.is_active ? 'Activo' : 'Inactivo'}</Field>
        <Field label="Teléfono">{club.phone}</Field>
        <Field label="Email de contacto">{club.email}</Field>
        <div className="sm:col-span-2">
          <Field label="Descripción">
            {club.description ? <span className="whitespace-pre-line">{club.description}</span> : null}
          </Field>
        </div>
        <Field label="Dueño">{owner ? personName(owner) : null}</Field>
        <Field label="Email del dueño">{owner?.email}</Field>
        <Field label="Creada">{formatDateTime(club.created_at)}</Field>
        <Field label="Última modificación">{formatDateTime(club.updated_at)}</Field>
      </dl>
    </Section>
  )
}

function OpeningHours({ hours }: { hours: ApplicationDetail['club']['opening_hours'] }) {
  return (
    <Section title="Horarios de apertura">
      <ul className="divide-y divide-gray-100">
        {WEEKDAYS.map((day) => {
          const intervals = hours[day] ?? []
          return (
            <li key={day} className="py-2 flex gap-4 text-sm">
              <span className="w-28 font-medium text-gray-800">{WEEKDAY_LABELS[day]}</span>
              {intervals.length === 0 ? (
                <span className="text-gray-400">Cerrado</span>
              ) : (
                <span className="text-gray-700">{intervals.map((i) => `${i.open} a ${i.close}`).join(' · ')}</span>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function Courts({ courts }: { courts: ApplicationDetail['courts'] }) {
  return (
    <Section title={`Canchas (${courts.length})`}>
      {courts.length === 0 ? (
        <p className="text-sm text-gray-400">El club no cargó canchas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-2 font-medium text-gray-600">Cancha</th>
                <th className="text-left py-2 font-medium text-gray-600">Superficie</th>
                <th className="text-left py-2 font-medium text-gray-600">Techada</th>
                <th className="text-right py-2 font-medium text-gray-600">Precio por hora</th>
                <th className="text-left py-2 pl-4 font-medium text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courts.map((court) => (
                <tr key={court.id}>
                  <td className="py-2 text-gray-900">{court.name}</td>
                  <td className="py-2 text-gray-600">{SURFACE_LABELS[court.surface]}</td>
                  <td className="py-2 text-gray-600">{court.is_indoor ? 'Sí' : 'No'}</td>
                  <td className="py-2 text-right text-gray-900">{formatMoney(court.price_per_hour)}</td>
                  <td className="py-2 pl-4">
                    <StatusBadge label={court.is_active ? 'Activa' : 'Inactiva'} tone={court.is_active ? 'green' : 'gray'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}

/** Application detail: everything the reviewer needs, plus the review and lifecycle actions. */
export function ApplicationDetailPage() {
  const { clubId } = useParams<{ clubId: string }>()
  const navigate = useNavigate()
  const { data: access } = useAccess(true)
  const role = access?.platformRole ?? null
  const { data, isLoading, error, refetch, dataUpdatedAt } = useApplication(clubId)
  const run = useApplicationAction()
  const [action, setAction] = useState<LifecycleAction | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const closeDialog = () => {
    setAction(null)
    run.reset()
  }

  const confirm = (text: string | undefined) => {
    if (!action || !clubId || !role) return
    const copy = ACTION_COPY[action]
    run.mutate(
      { action, clubId, text },
      {
        onSuccess: (club) => {
          setAction(null)
          if (canSeeStatus(role, club.status)) {
            setSuccess(copy.success)
          } else {
            // A reviewer can no longer open the club (approved, rejected): back to the inbox.
            navigate('/requests', { replace: true, state: { flash: `${data?.club.name ?? 'Club'}: ${copy.success}` } })
          }
        },
        // 409: the status changed meanwhile. The data is already refreshing; show the message on the page.
        onError: (err) => {
          if (isConflictError(err)) setAction(null)
        },
      },
    )
  }

  const back = (
    <Link to="/requests" className="text-sm text-gray-500 hover:text-gray-700">
      ← Volver a solicitudes
    </Link>
  )

  if (isLoading) return <div className="p-8 text-center text-gray-400">Cargando...</div>

  if (error || !data) {
    const status = getErrorStatus(error)
    return (
      <div className="space-y-4">
        {back}
        <Notice>
          {status === 404
            ? 'No encontramos esta solicitud, o ya no está disponible para tu rol.'
            : getErrorMessage(error)}
        </Notice>
        {status !== 404 && (
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700"
          >
            Reintentar
          </button>
        )}
      </div>
    )
  }

  const { club } = data
  const actions = role ? availableActions(role, club.status) : []

  return (
    <div className="space-y-6">
      {back}
      <PageHeader
        title={club.name}
        subtitle={
          data.submitted_at ? `Enviada el ${formatDateTime(data.submitted_at)}` : 'Todavía no fue enviada a revisión'
        }
        actions={<StatusBadge label={CLUB_STATUS_LABELS[club.status]} tone={CLUB_STATUS_TONES[club.status]} />}
      />

      {success && <Notice tone="success">{success}</Notice>}
      {!!run.error && !action && <Notice>{getLifecycleErrorMessage(run.error)}</Notice>}

      {actions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {actions.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setSuccess(null)
                run.reset()
                setAction(a)
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                a === 'approve' || a === 'unsuspend' || a === 'reopen'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : a === 'request-changes'
                    ? 'border border-orange-300 text-orange-700 hover:bg-orange-50'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
              }`}
            >
              {ACTION_COPY[a].label}
            </button>
          ))}
        </div>
      )}

      <ClubData detail={data} />
      <OpeningHours hours={club.opening_hours} />
      <Courts courts={data.courts} />
      <ApplicationDocuments
        documents={data.documents}
        expiresIn={data.documents_expires_in}
        fetchedAt={dataUpdatedAt}
        refetch={() => refetch().then((r) => ({ data: r.data }))}
      />
      <ApplicationHistory history={data.history} />

      {action && (
        <NoteDialog
          title={ACTION_COPY[action].title}
          description={ACTION_COPY[action].description}
          fieldLabel={ACTION_COPY[action].field}
          required={ACTION_COPY[action].required}
          confirmLabel={ACTION_COPY[action].confirm}
          tone={ACTION_COPY[action].tone}
          isPending={run.isPending}
          error={run.error ? getLifecycleErrorMessage(run.error) : null}
          onConfirm={confirm}
          onClose={closeDialog}
        />
      )}
    </div>
  )
}
