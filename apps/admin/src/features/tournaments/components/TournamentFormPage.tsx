import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ClubTournamentCreate, ClubTournamentDetail, ClubTournamentUpdate, TournamentFormat } from '@match-padel/types'
import { Notice, PageHeader } from '@match-padel/ui'
import { useCurrentClub } from '@/shared/club-context'
import { canLinkMercadoPago } from '@/shared/permissions'
import { useClubTournament, useCreateTournament, useUpdateTournament } from '../hooks/useClubTournaments'
import { FORMAT_INFO, tournamentErrorCode, tournamentErrorMessage } from '../lib/labels'
import { inputToIso, isoToInput } from '../lib/datetime'
import { Card, Field, inputClass, primaryButton, secondaryButton } from './ui'

const FORMATS = Object.keys(FORMAT_INFO) as TournamentFormat[]

const optionalInt = (max: number, label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d+$/.test(v) && Number(v) <= max), `${label}: un entero de 0 a ${max}`)

const money = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d+([.,]\d{1,2})?$/.test(v), `${label}: un monto con hasta 2 decimales`)
    .refine((v) => v === '' || Number(v.replace(',', '.')) <= 1_000_000, `${label}: máximo $1.000.000`)

const schema = z
  .object({
    name: z.string().trim().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
    description: z.string().trim().max(2000, 'Máximo 2000 caracteres'),
    format: z.enum(['round_robin', 'single_elimination', 'double_elimination', 'americano']),
    size: z.string().trim().regex(/^\d+$/, 'Ingresá un número entero'),
    category: z.string().trim().max(60, 'Máximo 60 caracteres'),
    min_elo: optionalInt(10000, 'ELO mínimo'),
    max_elo: optionalInt(10000, 'ELO máximo'),
    entry_fee: money('Inscripción'),
    prize_pool: money('Premio'),
    start_date: z.string().min(1, 'Indicá cuándo empieza'),
    end_date: z.string(),
    registration_deadline: z.string(),
    americano_rounds: optionalInt(63, 'Rondas'),
    notes: z.string().trim().max(4000, 'Máximo 4000 caracteres'),
  })
  .superRefine((v, ctx) => {
    const issue = (path: keyof typeof v, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
    const size = Number(v.size)
    if (v.format === 'americano') {
      if (size < 4 || size > 128) issue('size', 'Entre 4 y 128 jugadores')
      else if (size % 2 !== 0) issue('size', 'La cantidad de jugadores tiene que ser par')
    } else if (size < 2 || size > 64) {
      issue('size', 'Entre 2 y 64 parejas')
    }
    const start = inputToIso(v.start_date)
    if (v.start_date && !start) issue('start_date', 'Fecha inválida')
    const end = inputToIso(v.end_date)
    const deadline = inputToIso(v.registration_deadline)
    if (start && end && end < start) issue('end_date', 'No puede ser anterior al inicio')
    if (start && deadline && deadline > start) issue('registration_deadline', 'No puede ser posterior al inicio')
    if (v.min_elo !== '' && v.max_elo !== '' && Number(v.min_elo) > Number(v.max_elo)) {
      issue('min_elo', 'El mínimo no puede superar al máximo')
    }
  })

type FormValues = z.infer<typeof schema>

const toNumber = (v: string) => Number(v.replace(',', '.'))

function defaults(t: ClubTournamentDetail | undefined): FormValues {
  if (!t) {
    return {
      name: '',
      description: '',
      format: 'single_elimination',
      size: '16',
      category: '',
      min_elo: '',
      max_elo: '',
      entry_fee: '0',
      prize_pool: '0',
      start_date: '',
      end_date: '',
      registration_deadline: '',
      americano_rounds: '',
      notes: '',
    }
  }
  const rules = t.rules
  return {
    name: t.name,
    description: t.description ?? '',
    format: t.format,
    size: String(t.format === 'americano' ? (t.max_players ?? t.max_teams * 2) : t.max_teams),
    category: t.category ?? '',
    min_elo: t.min_elo === null ? '' : String(t.min_elo),
    max_elo: t.max_elo === null ? '' : String(t.max_elo),
    entry_fee: String(t.entry_fee),
    prize_pool: String(t.prize_pool),
    start_date: isoToInput(t.start_date),
    end_date: isoToInput(t.end_date),
    registration_deadline: isoToInput(t.registration_deadline),
    americano_rounds: typeof rules.americano_rounds === 'number' ? String(rules.americano_rounds) : '',
    notes: typeof rules.notes === 'string' ? rules.notes : '',
  }
}

/** Body for the API from the form: `rules` keeps every key the form does not own. */
function toBody(v: FormValues, previousRules: Record<string, unknown>): ClubTournamentCreate {
  const rules: Record<string, unknown> = { ...previousRules }
  delete rules.notes
  delete rules.americano_rounds
  if (v.notes) rules.notes = v.notes
  if (v.format === 'americano' && v.americano_rounds !== '') rules.americano_rounds = Number(v.americano_rounds)
  const size = Number(v.size)
  return {
    name: v.name,
    description: v.description === '' ? null : v.description,
    format: v.format,
    ...(v.format === 'americano' ? { max_players: size } : { max_teams: size }),
    category: v.category === '' ? null : v.category,
    min_elo: v.min_elo === '' ? null : Number(v.min_elo),
    max_elo: v.max_elo === '' ? null : Number(v.max_elo),
    entry_fee: v.entry_fee === '' ? 0 : toNumber(v.entry_fee),
    prize_pool: v.prize_pool === '' ? 0 : toNumber(v.prize_pool),
    rules: rules as ClubTournamentCreate['rules'],
    start_date: inputToIso(v.start_date) as string,
    end_date: inputToIso(v.end_date),
    registration_deadline: inputToIso(v.registration_deadline),
  }
}

/** Fields that changed: PATCH never re-sends what the API would refuse to change once there are registrations. */
function diff(next: ClubTournamentCreate, base: ClubTournamentCreate): ClubTournamentUpdate {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(next) as Array<keyof ClubTournamentCreate>) {
    if (JSON.stringify(next[key]) !== JSON.stringify(base[key])) out[key] = next[key]
  }
  if ('format' in out) {
    // Changing the format changes how the size is read: always send it.
    if (next.max_players !== undefined) out.max_players = next.max_players
    if (next.max_teams !== undefined) out.max_teams = next.max_teams
  }
  return out as ClubTournamentUpdate
}

export function TournamentFormPage() {
  const club = useCurrentClub()
  const navigate = useNavigate()
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const editing = !!tournamentId
  const detail = useClubTournament(club.clubId, tournamentId)

  if (editing && detail.isLoading) return <p className="text-sm text-gray-400">Cargando torneo...</p>
  if (editing && !detail.data) {
    return <Notice>{detail.error ? tournamentErrorMessage(detail.error) : 'No encontramos el torneo.'}</Notice>
  }
  if (detail.data && detail.data.status !== 'draft' && detail.data.status !== 'open') {
    return (
      <div className="space-y-4">
        <Notice tone="warning">
          Sólo se puede editar un torneo en borrador o abierto. Este torneo está {detail.data.status === 'cancelled' ? 'cancelado' : 'en curso o finalizado'}.
        </Notice>
        <Link to={`/${club.clubId}/tournaments/${detail.data.id}`} className="text-sm text-green-700 underline">
          Volver al torneo
        </Link>
      </div>
    )
  }
  return <TournamentForm key={detail.data?.id ?? 'new'} existing={detail.data} onDone={(id) => navigate(`/${club.clubId}/tournaments/${id}`)} />
}

function TournamentForm({ existing, onDone }: { existing: ClubTournamentDetail | undefined; onDone: (id: string) => void }) {
  const club = useCurrentClub()
  const create = useCreateTournament(club.clubId)
  const update = useUpdateTournament(club.clubId, existing?.id ?? '')
  const mutation = existing ? update : create

  const hasRegistrations = !!existing && existing.counts.teams_confirmed + existing.counts.teams_pending_payment > 0
  const initial = useMemo(() => defaults(existing), [existing])

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: initial })

  const format = watch('format')
  const fee = toNumber(watch('entry_fee') || '0')
  const americano = format === 'americano'
  const lockStructure = hasRegistrations

  const onSubmit = handleSubmit((values) => {
    const body = toBody(values, existing?.rules ?? {})
    if (!existing) {
      if (new Date(body.start_date).getTime() <= Date.now()) {
        setError('start_date', { message: 'La fecha de inicio tiene que ser futura' })
        return
      }
      create.mutate(body, { onSuccess: (t) => onDone(t.id) })
      return
    }
    const patch = diff(body, toBody(initial, existing.rules))
    if (Object.keys(patch).length === 0) {
      onDone(existing.id)
      return
    }
    update.mutate(patch, { onSuccess: (t) => onDone(t.id) })
  })

  const code = mutation.error ? tournamentErrorCode(mutation.error) : undefined
  const needsMp = code === 'CLUB_PAYMENTS_NOT_ENABLED'

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={existing ? 'Editar torneo' : 'Nuevo torneo'}
        subtitle={existing ? existing.name : 'Se crea como borrador: los jugadores lo ven recién cuando lo publicás.'}
      />

      {mutation.isError && (
        <Notice>
          {tournamentErrorMessage(mutation.error)}
          {needsMp && canLinkMercadoPago(club.role) && (
            <>
              {' '}
              <Link to={`/${club.clubId}/mercadopago`} className="underline font-medium">
                Ir a Mercado Pago
              </Link>
            </>
          )}
          {needsMp && !canLinkMercadoPago(club.role) && ' Pedile al dueño del club que vincule Mercado Pago.'}
        </Notice>
      )}
      {lockStructure && (
        <Notice tone="info">
          Ya hay inscripciones: el formato, el tamaño, la inscripción y los límites de nivel quedan bloqueados. Podés
          cambiar el resto.
        </Notice>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Card title="Datos generales">
          <div className="space-y-4">
            <Field label="Nombre" htmlFor="t-name" error={errors.name?.message}>
              <input id="t-name" className={inputClass} {...register('name')} />
            </Field>
            <Field label="Descripción" htmlFor="t-desc" error={errors.description?.message}>
              <textarea id="t-desc" rows={3} className={inputClass} {...register('description')} />
            </Field>
            <Field
              label="Categoría"
              htmlFor="t-cat"
              hint="Texto libre, por ejemplo 6ta, Mixto o Libre. Es sólo informativo."
              error={errors.category?.message}
            >
              <input id="t-cat" className={inputClass} {...register('category')} />
            </Field>
          </div>
        </Card>

        <Card title="Formato">
          <fieldset disabled={lockStructure} className="space-y-3">
            <legend className="sr-only">Formato del torneo</legend>
            {FORMATS.map((f) => (
              <label
                key={f}
                className={`block border rounded-lg p-3 cursor-pointer ${format === f ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'} ${lockStructure ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span className="flex items-center gap-2">
                  <input type="radio" value={f} {...register('format')} />
                  <span className="font-medium text-sm text-gray-900">{FORMAT_INFO[f].label}</span>
                  <span className="text-xs text-gray-500">— {FORMAT_INFO[f].summary}</span>
                </span>
                {format === f && <p className="text-xs text-gray-600 mt-2 ml-6">{FORMAT_INFO[f].detail}</p>}
              </label>
            ))}
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <Field
              label={americano ? 'Máximo de jugadores' : 'Máximo de parejas'}
              htmlFor="t-size"
              hint={
                americano
                  ? 'Cantidad par, de 4 a 128. Cada inscripción trae 2 jugadores.'
                  : 'De 2 a 64. Cada inscripción es una pareja.'
              }
              error={errors.size?.message}
            >
              <input id="t-size" inputMode="numeric" disabled={lockStructure} className={inputClass} {...register('size')} />
            </Field>
            {americano && (
              <Field
                label="Rondas a jugar (opcional)"
                htmlFor="t-rounds"
                hint="Vacío: se juega la rotación completa, donde todos son compañeros de todos."
                error={errors.americano_rounds?.message}
              >
                <input id="t-rounds" inputMode="numeric" className={inputClass} {...register('americano_rounds')} />
              </Field>
            )}
          </div>
        </Card>

        <Card title="Nivel y premios">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="ELO mínimo (opcional)"
              htmlFor="t-minelo"
              hint="Se controla en los dos jugadores de la pareja."
              error={errors.min_elo?.message}
            >
              <input id="t-minelo" inputMode="numeric" disabled={lockStructure} className={inputClass} {...register('min_elo')} />
            </Field>
            <Field label="ELO máximo (opcional)" htmlFor="t-maxelo" error={errors.max_elo?.message}>
              <input id="t-maxelo" inputMode="numeric" disabled={lockStructure} className={inputClass} {...register('max_elo')} />
            </Field>
            <Field
              label="Inscripción por pareja ($)"
              htmlFor="t-fee"
              hint="Un solo pago por inscripción, de quien anota a la pareja. 0 = gratis."
              error={errors.entry_fee?.message}
            >
              <input id="t-fee" inputMode="decimal" disabled={lockStructure} className={inputClass} {...register('entry_fee')} />
            </Field>
            <Field label="Premio total ($)" htmlFor="t-prize" error={errors.prize_pool?.message}>
              <input id="t-prize" inputMode="decimal" className={inputClass} {...register('prize_pool')} />
            </Field>
          </div>
          {fee > 0 && (
            <Notice tone="warning" className="mt-4">
              Una inscripción paga se cobra por Mercado Pago: para publicar el torneo el club tiene que poder cobrar
              online (cuenta de Mercado Pago vinculada si cobra en su propia cuenta).{' '}
              {canLinkMercadoPago(club.role) ? (
                <Link to={`/${club.clubId}/mercadopago`} className="underline font-medium">
                  Revisar Mercado Pago
                </Link>
              ) : (
                'Si no está vinculada, pedile al dueño del club que la vincule.'
              )}
            </Notice>
          )}
        </Card>

        <Card title="Fechas">
          <p className="text-xs text-gray-500 mb-3">Horario del club (Buenos Aires).</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Inicio" htmlFor="t-start" error={errors.start_date?.message}>
              <input id="t-start" type="datetime-local" className={inputClass} {...register('start_date')} />
            </Field>
            <Field label="Fin (opcional)" htmlFor="t-end" error={errors.end_date?.message}>
              <input id="t-end" type="datetime-local" className={inputClass} {...register('end_date')} />
            </Field>
            <Field
              label="Cierre de inscripción (opcional)"
              htmlFor="t-deadline"
              error={errors.registration_deadline?.message}
            >
              <input id="t-deadline" type="datetime-local" className={inputClass} {...register('registration_deadline')} />
            </Field>
          </div>
        </Card>

        <Card title="Reglamento">
          <Field label="Reglas y notas (opcional)" htmlFor="t-notes" error={errors.notes?.message}>
            <textarea id="t-notes" rows={4} className={inputClass} {...register('notes')} />
          </Field>
        </Card>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className={primaryButton}>
            {mutation.isPending ? 'Guardando...' : existing ? 'Guardar cambios' : 'Crear borrador'}
          </button>
          <Link
            to={existing ? `/${club.clubId}/tournaments/${existing.id}` : `/${club.clubId}/tournaments`}
            className={secondaryButton}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
