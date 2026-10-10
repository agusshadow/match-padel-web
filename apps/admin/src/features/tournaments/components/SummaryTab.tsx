import { useState } from 'react'
import { Link } from 'react-router-dom'
import type {
  ClubTournamentCancelResult,
  ClubTournamentDetail,
  ClubTournamentStartResult,
  TournamentSeeding,
} from '@match-padel/types'
import { Notice, formatMoney } from '@match-padel/ui'
import { Dialog } from '@/shared/components/Dialog'
import { useCurrentClub } from '@/shared/club-context'
import { canLinkMercadoPago } from '@/shared/permissions'
import { formatDayLong, clubParts, formatClubTime } from '@/lib/club-time'
import {
  useCancelTournament,
  usePublishTournament,
  useStartTournament,
} from '../hooks/useClubTournaments'
import { FORMAT_INFO, tournamentErrorCode, tournamentErrorMessage } from '../lib/labels'
import { minTeamsToStart } from '../lib/bracket'
import type { LastAction } from './TournamentDetailPage'
import { Card, dangerButton, inputClass, primaryButton, secondaryButton } from './ui'

const when = (iso: string | null) => (iso ? `${formatDayLong(clubParts(iso).date)}, ${formatClubTime(iso)}` : '—')

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{children}</dd>
    </div>
  )
}

function MpError({ error }: { error: unknown }) {
  const club = useCurrentClub()
  return (
    <Notice>
      {tournamentErrorMessage(error)}
      {tournamentErrorCode(error) === 'CLUB_PAYMENTS_NOT_ENABLED' &&
        (canLinkMercadoPago(club.role) ? (
          <>
            {' '}
            <Link to={`/${club.clubId}/mercadopago`} className="underline font-medium">
              Ir a Mercado Pago
            </Link>
          </>
        ) : (
          ' Pedile al dueño del club que vincule Mercado Pago.'
        ))}
    </Notice>
  )
}

export function SummaryTab({
  tournament: t,
  lastAction,
  onAction,
  onGo,
}: {
  tournament: ClubTournamentDetail
  lastAction: LastAction
  onAction: (a: LastAction) => void
  onGo: (tab: 'teams' | 'fixture') => void
}) {
  const club = useCurrentClub()
  const [dialog, setDialog] = useState<'publish' | 'cancel' | 'start' | null>(null)
  const publish = usePublishTournament(club.clubId, t.id)
  const base = `/${club.clubId}/tournaments/${t.id}`
  const americano = t.format === 'americano'
  const unit = americano ? 'jugadores' : 'parejas'
  const factor = americano ? 2 : 1
  const canCancel = t.status === 'draft' || t.status === 'open' || t.status === 'in_progress'

  return (
    <div className="space-y-5">
      {lastAction?.kind === 'published' && (
        <Notice tone="success">Torneo publicado: ya lo ven los jugadores y pueden inscribirse.</Notice>
      )}
      {lastAction?.kind === 'started' && (
        <Notice tone="success">
          Torneo iniciado con {lastAction.result.fixture.teams} {americano ? 'inscripciones' : 'parejas'}: se generaron{' '}
          {lastAction.result.fixture.matches} partidos
          {lastAction.result.fixture.byes > 0 ? `, ${lastAction.result.fixture.byes} con bye` : ''}, con siembra por{' '}
          {lastAction.result.fixture.seeding === 'elo' ? 'ELO' : 'orden de inscripción'}.{' '}
          <button type="button" className="underline font-medium" onClick={() => onGo('fixture')}>
            Ver fixture
          </button>
        </Notice>
      )}
      {lastAction?.kind === 'cancelled' && <CancelSummary result={lastAction.result} />}
      {t.status === 'cancelled' && (
        <Notice tone="warning">
          Torneo cancelado{t.cancelled_at ? ` el ${when(t.cancelled_at)}` : ''}
          {t.cancel_reason ? `: ${t.cancel_reason}` : ''}.
        </Notice>
      )}

      {(t.status === 'draft' || t.status === 'open' || t.status === 'in_progress') && (
        <Card title="Acciones">
          <div className="flex flex-wrap gap-3">
            {t.status === 'draft' && (
              <button type="button" className={primaryButton} onClick={() => setDialog('publish')}>
                Publicar
              </button>
            )}
            {t.status === 'open' && (
              <button type="button" className={primaryButton} onClick={() => setDialog('start')}>
                Iniciar torneo
              </button>
            )}
            {(t.status === 'draft' || t.status === 'open') && (
              <Link to={`${base}/edit`} className={secondaryButton}>
                Editar
              </Link>
            )}
            {canCancel && (
              <button type="button" className={dangerButton} onClick={() => setDialog('cancel')}>
                Cancelar torneo
              </button>
            )}
          </div>
          {t.status === 'draft' && (
            <p className="text-xs text-gray-500 mt-3">
              Es un borrador: los jugadores no lo ven hasta que lo publiques.
              {t.entry_fee > 0 && ' Para publicarlo con inscripción paga el club tiene que poder cobrar online.'}
            </p>
          )}
          {t.status === 'open' && (
            <p className="text-xs text-gray-500 mt-3">
              Cuando termine la inscripción, iniciá el torneo para generar el fixture. Hacen falta al menos{' '}
              {minTeamsToStart(t.format)} {americano ? 'inscripciones (4 jugadores)' : 'parejas confirmadas'}.
            </p>
          )}
        </Card>
      )}
      {publish.isError && <MpError error={publish.error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Datos" className="lg:col-span-2">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Fact label="Formato">{FORMAT_INFO[t.format].label}</Fact>
            <Fact label="Categoría">{t.category ?? '—'}</Fact>
            <Fact label="Nivel (ELO)">
              {t.min_elo === null && t.max_elo === null
                ? 'Sin límites'
                : `${t.min_elo ?? 'sin mínimo'} a ${t.max_elo ?? 'sin máximo'}`}
            </Fact>
            <Fact label="Cupo">
              {t.max_teams * factor} {unit}
            </Fact>
            <Fact label="Inscripción por pareja">{t.entry_fee > 0 ? formatMoney(t.entry_fee) : 'Gratis'}</Fact>
            <Fact label="Premio total">{t.prize_pool > 0 ? formatMoney(t.prize_pool) : '—'}</Fact>
            <Fact label="Inicio">{when(t.start_date)}</Fact>
            <Fact label="Fin">{when(t.end_date)}</Fact>
            <Fact label="Cierre de inscripción">{when(t.registration_deadline)}</Fact>
            {t.started_at && <Fact label="Iniciado">{when(t.started_at)}</Fact>}
            {t.completed_at && <Fact label="Finalizado">{when(t.completed_at)}</Fact>}
          </dl>
          {t.description && <p className="text-sm text-gray-600 mt-4 whitespace-pre-line">{t.description}</p>}
          {typeof t.rules.notes === 'string' && t.rules.notes !== '' && (
            <div className="mt-4">
              <p className="text-xs text-gray-500">Reglamento</p>
              <p className="text-sm text-gray-700 whitespace-pre-line">{t.rules.notes}</p>
            </div>
          )}
        </Card>

        <div className="space-y-5">
          <Card title="Inscripciones">
            <p className="text-3xl font-bold text-gray-900">
              {t.counts.teams_confirmed}
              <span className="text-base font-medium text-gray-500"> / {t.max_teams} confirmadas</span>
            </p>
            {t.counts.teams_pending_payment > 0 && (
              <p className="text-sm text-yellow-700 mt-1">{t.counts.teams_pending_payment} con pago pendiente</p>
            )}
            <button type="button" className="text-sm text-green-700 underline mt-3" onClick={() => onGo('teams')}>
              Ver inscripciones
            </button>
          </Card>
          {t.entry_fee > 0 && (
            <Card title="Cobros de inscripción">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Pagos aprobados</dt><dd>{t.payments_summary.approved}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Cobrado</dt><dd>{formatMoney(t.payments_summary.gross)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Comisión</dt><dd>{formatMoney(t.payments_summary.fee)}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Devuelto</dt><dd>{formatMoney(t.payments_summary.refunded)}</dd></div>
              </dl>
              {t.payments_summary.refunds_pending > 0 && (
                <Notice tone="warning" className="mt-3">
                  {t.payments_summary.refunds_pending} devolución(es) pendiente(s): no se pudieron completar y quedan a
                  gestionar.
                </Notice>
              )}
            </Card>
          )}
          {t.counts.matches_total > 0 && (
            <Card title="Partidos">
              <p className="text-sm text-gray-700">
                {t.counts.matches_completed} de {t.counts.matches_total} resueltos
              </p>
            </Card>
          )}
        </div>
      </div>

      {dialog === 'publish' && (
        <PublishDialog
          tournament={t}
          onClose={() => setDialog(null)}
          onDone={() => {
            setDialog(null)
            onAction({ kind: 'published' })
          }}
          mutation={publish}
        />
      )}
      {dialog === 'cancel' && (
        <CancelDialog
          tournament={t}
          onClose={() => setDialog(null)}
          onDone={(result) => {
            setDialog(null)
            onAction({ kind: 'cancelled', result })
          }}
        />
      )}
      {dialog === 'start' && (
        <StartDialog
          tournament={t}
          onClose={() => setDialog(null)}
          onDone={(result) => {
            setDialog(null)
            onAction({ kind: 'started', result })
          }}
        />
      )}
    </div>
  )
}

function PublishDialog({
  tournament: t,
  mutation,
  onClose,
  onDone,
}: {
  tournament: ClubTournamentDetail
  mutation: ReturnType<typeof usePublishTournament>
  onClose: () => void
  onDone: () => void
}) {
  return (
    <Dialog title="Publicar torneo" onClose={onClose} busy={mutation.isPending}>
      <p className="text-sm text-gray-700">
        <strong>{t.name}</strong> pasa a estar abierto: los jugadores lo ven y pueden inscribirse
        {t.entry_fee > 0 ? `, pagando ${formatMoney(t.entry_fee)} por pareja con Mercado Pago` : ''}. Después de
        publicado seguís pudiendo editarlo, pero el formato, el cupo, la inscripción y el nivel se bloquean cuando
        hay inscriptos.
      </p>
      {mutation.isError && <MpError error={mutation.error} />}
      <div className="flex justify-end gap-3">
        <button type="button" className={secondaryButton} onClick={onClose} disabled={mutation.isPending}>
          Volver
        </button>
        <button
          type="button"
          className={primaryButton}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate(undefined, { onSuccess: onDone })}
        >
          {mutation.isPending ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </Dialog>
  )
}

function CancelDialog({
  tournament: t,
  onClose,
  onDone,
}: {
  tournament: ClubTournamentDetail
  onClose: () => void
  onDone: (r: ClubTournamentCancelResult) => void
}) {
  const club = useCurrentClub()
  const cancel = useCancelTournament(club.clubId, t.id)
  const [reason, setReason] = useState('')
  const registered = t.counts.teams_confirmed + t.counts.teams_pending_payment
  return (
    <Dialog title="Cancelar torneo" onClose={onClose} busy={cancel.isPending}>
      <p className="text-sm text-gray-700">
        Vas a cancelar <strong>{t.name}</strong>. No se puede deshacer.
      </p>
      <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
        <li>
          Se devuelve el <strong>100%</strong> de cada inscripción paga ({t.payments_summary.approved} pago
          {t.payments_summary.approved === 1 ? '' : 's'} aprobado{t.payments_summary.approved === 1 ? '' : 's'}),
          sin importar la política de cancelación del club.
        </li>
        <li>
          Se avisa a todos los jugadores inscriptos ({registered} inscripci{registered === 1 ? 'ón' : 'ones'}) y los
          pagos pendientes se anulan.
        </li>
        {t.status === 'in_progress' && <li>Los partidos y resultados ya cargados quedan como están.</li>}
      </ul>
      <div>
        <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
          Motivo (opcional, lo ven los jugadores)
        </label>
        <input
          id="cancel-reason"
          maxLength={300}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className={inputClass}
        />
      </div>
      {cancel.isError && <Notice>{tournamentErrorMessage(cancel.error)}</Notice>}
      <div className="flex justify-end gap-3">
        <button type="button" className={secondaryButton} onClick={onClose} disabled={cancel.isPending}>
          Volver
        </button>
        <button
          type="button"
          className={dangerButton}
          disabled={cancel.isPending}
          onClick={() => cancel.mutate(reason.trim() || undefined, { onSuccess: onDone })}
        >
          {cancel.isPending ? 'Cancelando y devolviendo...' : 'Cancelar torneo'}
        </button>
      </div>
    </Dialog>
  )
}
function CancelSummary({ result }: { result: ClubTournamentCancelResult }) {
  const { refund } = result
  const failed = refund.failed.length
  return (
    <Notice tone={failed > 0 ? 'warning' : 'success'}>
      <p className="font-medium">Torneo cancelado.</p>
      <ul className="list-disc pl-5 mt-1 space-y-0.5">
        <li>Se avisó a {result.notified_players} jugador(es).</li>
        <li>
          Pagos a devolver: {refund.payments}. Devueltos: {refund.refunded} ({formatMoney(refund.amount_refunded)}).
        </li>
        {failed > 0 && (
          <li>
            <strong>{failed} devolución(es) no se pudieron completar</strong> (quedan pendientes y los dueños del club
            reciben un aviso). Suele pasar si la cuenta de Mercado Pago está vencida, revocada o sin saldo: revisá la
            vinculación; el torneo ya quedó cancelado.
          </li>
        )}
      </ul>
    </Notice>
  )
}

function StartDialog({
  tournament: t,
  onClose,
  onDone,
}: {
  tournament: ClubTournamentDetail
  onClose: () => void
  onDone: (r: ClubTournamentStartResult) => void
}) {
  const club = useCurrentClub()
  const start = useStartTournament(club.clubId, t.id)
  const [seeding, setSeeding] = useState<TournamentSeeding>('elo')
  const [rounds, setRounds] = useState('')
  const americano = t.format === 'americano'
  const minimum = minTeamsToStart(t.format)
  const confirmed = t.counts.teams_confirmed
  const enough = confirmed >= minimum
  const roundsValid = rounds === '' || (/^\d+$/.test(rounds) && Number(rounds) >= 1 && Number(rounds) <= 63)

  return (
    <Dialog title="Iniciar torneo" onClose={onClose} busy={start.isPending}>
      <p className="text-sm text-gray-700">
        Se cierra la inscripción y se genera el fixture con las <strong>{confirmed}</strong> inscripciones
        confirmadas (mínimo {minimum}). Después no se pueden agregar ni quitar inscripciones.
      </p>
      {t.counts.teams_pending_payment > 0 && (
        <Notice tone="warning">
          Hay {t.counts.teams_pending_payment} inscripción(es) con pago pendiente: al iniciar se liberan y quedan
          afuera. Si pagan después, el pago se devuelve.
        </Notice>
      )}
      {!enough && (
        <Notice>
          Todavía no alcanza: hay {confirmed} confirmada(s) y hacen falta {minimum}.
        </Notice>
      )}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-gray-700">Cómo se ordenan los cabezas de serie</legend>
        {(
          [
            ['elo', 'Por ELO', 'La pareja con mayor ELO combinado es la cabeza de serie 1.'],
            ['registration', 'Por orden de inscripción', 'Quien se anotó primero es cabeza de serie 1.'],
          ] as const
        ).map(([value, label, hint]) => (
          <label key={value} className="flex items-start gap-2 text-sm cursor-pointer">
            <input type="radio" name="seeding" checked={seeding === value} onChange={() => setSeeding(value)} className="mt-1" />
            <span>
              <span className="font-medium text-gray-900">{label}</span>
              <span className="block text-xs text-gray-500">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {americano && (
        <div>
          <label htmlFor="start-rounds" className="block text-sm font-medium text-gray-700 mb-1">
            Rondas a jugar (opcional)
          </label>
          <input
            id="start-rounds"
            inputMode="numeric"
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
            placeholder={
              typeof t.rules.americano_rounds === 'number'
                ? `${t.rules.americano_rounds} (del torneo)`
                : 'Rotación completa'
            }
            className={`${inputClass} max-w-[10rem]`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Vacío: todos son compañeros de todos una vez. Menos rondas, un torneo más corto.
          </p>
          {!roundsValid && <p role="alert" className="text-xs text-red-600 mt-1">Un entero de 1 a 63.</p>}
        </div>
      )}
      {start.isError && <Notice>{tournamentErrorMessage(start.error)}</Notice>}
      <div className="flex justify-end gap-3">
        <button type="button" className={secondaryButton} onClick={onClose} disabled={start.isPending}>
          Volver
        </button>
        <button
          type="button"
          className={primaryButton}
          disabled={start.isPending || !enough || !roundsValid}
          onClick={() =>
            start.mutate(
              { seeding, ...(americano && rounds !== '' ? { americano_rounds: Number(rounds) } : {}) },
              { onSuccess: onDone },
            )
          }
        >
          {start.isPending ? 'Generando fixture...' : 'Iniciar y generar fixture'}
        </button>
      </div>
    </Dialog>
  )
}
