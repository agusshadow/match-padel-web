import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import type { ClubMpAccount } from '@match-padel/types'
import { Notice, PageHeader, StatusBadge, formatDate, formatDateTime } from '@match-padel/ui'
import { useCurrentClub } from '@/shared/club-context'
import { Dialog } from '@/shared/components/Dialog'
import { useConnectMercadoPago, useDisconnectMercadoPago, useMercadoPagoAccount, mercadoPagoKey } from '../hooks/useMercadoPago'
import {
  ACCOUNT_STATUS_LABELS,
  ACCOUNT_STATUS_TONES,
  CALLBACK_GENERIC_ERROR,
  CALLBACK_REASON_MESSAGES,
  NOT_CONFIGURED_MESSAGE,
  isCallbackReason,
  isNotConfigured,
  mercadoPagoErrorMessage,
} from '../lib/messages'

type Feedback = { tone: 'success' | 'error'; text: string }

/** Banner for the `?status=&reason=` the API puts in the URL when the browser comes back from Mercado Pago. */
function feedbackFromQuery(params: URLSearchParams): Feedback | null {
  const status = params.get('status')
  if (status === 'connected') {
    return { tone: 'success', text: 'Listo: la cuenta de Mercado Pago del club quedó vinculada.' }
  }
  if (status === 'error') {
    const reason = params.get('reason')
    return { tone: 'error', text: isCallbackReason(reason) ? CALLBACK_REASON_MESSAGES[reason] : CALLBACK_GENERIC_ERROR }
  }
  return null
}

function describeAccount(account: ClubMpAccount): string {
  const status = account.status
  if (status === null) {
    return 'Todavía no vinculaste una cuenta de Mercado Pago. Hasta que lo hagas, el club no puede cobrar a través de la app.'
  }
  switch (status) {
    case 'connected':
      return 'La cuenta está vinculada y el club puede cobrar a través de la app. La vinculación se renueva sola antes de vencer.'
    case 'expiring':
      return 'La vinculación está por vencer. Se intenta renovar sola; si no se logra, te avisamos por email. Podés volver a vincular la cuenta ahora para evitar cortes.'
    case 'error':
      return 'No pudimos renovar la vinculación. Sigue vigente hasta la fecha de vencimiento: volvé a vincular la cuenta antes para no perder los cobros.'
    case 'expired':
      return 'La vinculación venció. El club no puede cobrar a través de la app hasta que vuelva a vincular la cuenta.'
    case 'revoked':
      return 'La vinculación fue revocada. El club no puede cobrar a través de la app hasta que vuelva a vincular la cuenta.'
  }
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{children}</dd>
    </div>
  )
}

function DisconnectDialog({ clubId, onClose, onDone }: { clubId: string; onClose: () => void; onDone: () => void }) {
  const disconnect = useDisconnectMercadoPago(clubId)

  return (
    <Dialog title="Desconectar Mercado Pago" onClose={onClose} busy={disconnect.isPending}>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          disconnect.mutate(undefined, {
            onSuccess: () => {
              onDone()
              onClose()
            },
          })
        }}
      >
        {disconnect.isError && <Notice>{mercadoPagoErrorMessage(disconnect.error)}</Notice>}
        <p className="text-sm text-gray-600">
          Si desconectás la cuenta, el club <strong>no va a poder cobrar a través de la app</strong> hasta que la
          vincule de nuevo. Tu cuenta de Mercado Pago no se cierra, y la autorización sigue figurando en ella hasta que la quites desde tu cuenta de Mercado Pago.
        </p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={disconnect.isPending}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={disconnect.isPending}
            className="px-4 py-2 text-white text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {disconnect.isPending ? 'Desconectando...' : 'Desconectar'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}

/** Mercado Pago account of the club (`/:clubId/mercadopago`): owner only. */
export function MercadoPagoPage() {
  const club = useCurrentClub()
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  // Read once: the query is removed from the URL right after.
  const [feedback, setFeedback] = useState<Feedback | null>(() => feedbackFromQuery(params))
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const account = useMercadoPagoAccount(club.clubId)
  const connect = useConnectMercadoPago(club.clubId)

  useEffect(() => {
    if (!params.has('status') && !params.has('reason')) return
    // Returning from Mercado Pago: show fresh data, then keep the URL clean.
    queryClient.invalidateQueries({ queryKey: mercadoPagoKey(club.clubId) })
    setParams({}, { replace: true })
    // Runs for the initial query only; the banner state was already captured.
  }, [])

  const startLink = () => {
    setFeedback(null)
    connect.mutate(undefined, {
      onSuccess: ({ authorization_url }) => {
        let target: URL | null = null
        try {
          target = new URL(authorization_url)
        } catch {
          target = null
        }
        if (!target || target.protocol !== 'https:') {
          setFeedback({ tone: 'error', text: CALLBACK_GENERIC_ERROR })
          return
        }
        setRedirecting(true)
        window.location.assign(target.toString())
      },
      onError: (error) => setFeedback({ tone: 'error', text: mercadoPagoErrorMessage(error) }),
    })
  }

  const data = account.data
  const unavailable = account.isError && isNotConfigured(account.error)
  const key = data?.status ?? 'none'
  const linked = data?.status != null
  const busy = connect.isPending || redirecting

  return (
    <div className="space-y-6">
      <PageHeader title="Mercado Pago" subtitle={club.name} />

      {feedback && <Notice tone={feedback.tone}>{feedback.text}</Notice>}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-2 text-sm text-gray-600">
        <p>
          Vinculá la cuenta de Mercado Pago del club para que los pagos de reservas y partidos hechos a través de la app
          lleguen directamente a ella.
        </p>
        <p>
          Match Padel retiene una comisión por cada cobro realizado a través de la app, además de lo que descuenta
          Mercado Pago. La vinculación se autoriza en el sitio de Mercado Pago: nunca vemos tu contraseña.
        </p>
      </div>

      {account.isLoading && <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-40" />}

      {unavailable && <Notice tone="info">{NOT_CONFIGURED_MESSAGE}</Notice>}

      {account.isError && !unavailable && (
        <div className="space-y-3">
          <Notice>{mercadoPagoErrorMessage(account.error)}</Notice>
          <button
            type="button"
            onClick={() => account.refetch()}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Reintentar
          </button>
        </div>
      )}

      {data && (
        <section className="bg-white rounded-xl border border-gray-200" aria-label="Estado de la vinculación">
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-gray-900">Estado de la vinculación</h2>
            <StatusBadge label={ACCOUNT_STATUS_LABELS[key]} tone={ACCOUNT_STATUS_TONES[key]} />
            {linked && data.live_mode !== null && (
              <StatusBadge
                label={data.live_mode ? 'Modo producción' : 'Modo prueba'}
                tone={data.live_mode ? 'blue' : 'purple'}
              />
            )}
          </div>

          <div className="p-5 space-y-5">
            <p className="text-sm text-gray-700">{describeAccount(data)}</p>

            {linked && (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.expires_at && (
                  <Detail label="Vence el">
                    {formatDate(data.expires_at, true)}
                    {data.days_left !== null && data.status !== 'expired' && data.status !== 'revoked' && (
                      <span className="text-gray-500">
                        {' '}
                        ({data.days_left === 0 ? 'hoy' : `en ${data.days_left} ${data.days_left === 1 ? 'día' : 'días'}`})
                      </span>
                    )}
                  </Detail>
                )}
                <Detail label="Última renovación">
                  {data.last_refresh_at ? formatDateTime(data.last_refresh_at) : 'Todavía no se renovó'}
                </Detail>
                {data.mp_user_id && <Detail label="Cuenta de Mercado Pago">{data.mp_user_id}</Detail>}
                {data.last_error && (
                  <Detail label="Último error">
                    <span className="text-red-700 break-words">{data.last_error}</span>
                  </Detail>
                )}
              </dl>
            )}

            {!unavailable && (
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={startLink}
                  disabled={busy}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {busy ? 'Redirigiendo a Mercado Pago...' : linked ? 'Volver a vincular' : 'Conectar Mercado Pago'}
                </button>
                {linked && (
                  <button
                    type="button"
                    onClick={() => setConfirmingDisconnect(true)}
                    disabled={busy}
                    className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    Desconectar
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {confirmingDisconnect && (
        <DisconnectDialog
          clubId={club.clubId}
          onClose={() => setConfirmingDisconnect(false)}
          onDone={() =>
            setFeedback({
              tone: 'success',
              text: 'Desconectaste la cuenta de Mercado Pago. El club no puede cobrar a través de la app hasta que la vincule de nuevo.',
            })
          }
        />
      )}
    </div>
  )
}
