import { useEffect, useId, useState } from 'react'
import type { CollectionMode, PlatformClubRow } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useClubCharging } from '../hooks/useClubs'
import {
  COLLECTION_MODES,
  COLLECTION_MODE_CONFIRMATION,
  COLLECTION_MODE_HINTS,
  COLLECTION_MODE_LABELS,
  formatPercent,
  parseCommission,
} from '../lib/charging'
import { ClubChargingBadges } from './ClubChargingBadges'

type Pending = { kind: 'commission'; value: number } | { kind: 'collection-mode'; value: CollectionMode }

interface Props {
  club: PlatformClubRow
  onClose: () => void
}

/** Superadmin panel of a club's charges: commission, collection mode and Mercado Pago link. */
export function ClubChargingDialog({ club, onClose }: Props) {
  const commissionId = useId()
  const modeId = useId()
  const charging = useClubCharging()
  const [commission, setCommission] = useState(String(club.commission_percent))
  const [mode, setMode] = useState<CollectionMode>(club.collection_mode)
  const [pending, setPending] = useState<Pending | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const parsed = parseCommission(commission)
  const commissionError = 'error' in parsed ? parsed.error : null
  const commissionChanged = !commissionError && 'value' in parsed && parsed.value !== club.commission_percent
  const modeChanged = mode !== club.collection_mode
  const blocked = club.collection_mode === 'club_account' && !club.mp_connected

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !charging.isPending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [charging.isPending, onClose])

  const confirm = () => {
    if (!pending) return
    const done = (message: string) => ({
      onSuccess: () => {
        setPending(null)
        setSuccess(message)
      },
      // Keep the confirmation open so the API error is shown next to the action.
    })
    setSuccess(null)
    if (pending.kind === 'commission') {
      charging.mutate(
        { kind: 'commission', id: club.id, body: { commission_percent: pending.value } },
        done(`Comisión actualizada a ${formatPercent(pending.value)}. Aplica a los cobros que se creen desde ahora.`),
      )
    } else {
      charging.mutate(
        { kind: 'collection-mode', id: club.id, body: { collection_mode: pending.value } },
        done(`Modo de cobro actualizado: ${COLLECTION_MODE_LABELS[pending.value]}.`),
      )
    }
  }

  const buttonBase = 'px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50'

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Cobros de ${club.name}`}
        className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Cobros: {club.name}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={charging.isPending}
            aria-label="Cerrar"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none disabled:opacity-40"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Comisión actual: <span className="font-semibold text-gray-900">{formatPercent(club.commission_percent)}</span>
            </p>
            <ClubChargingBadges club={club} />
          </div>

          {blocked && (
            <Notice tone="warning">
              El club cobra en su cuenta pero no tiene Mercado Pago vinculado (o el vínculo venció): las reservas y los
              partidos con precio están bloqueados para los jugadores hasta que lo vincule.
            </Notice>
          )}
          {success && <Notice tone="success">{success}</Notice>}

          {pending ? (
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900">
                {pending.kind === 'commission'
                  ? `Cambiar la comisión de ${formatPercent(club.commission_percent)} a ${formatPercent(pending.value)}`
                  : `Cambiar el modo de cobro a "${COLLECTION_MODE_LABELS[pending.value]}"`}
              </p>
              <p className="text-sm text-gray-600">
                {pending.kind === 'commission'
                  ? 'Aplica a los cobros que se creen desde ahora. Los pagos ya hechos conservan la comisión con la que se cobraron. Solo se cobra comisión en modo "Cuenta del club".'
                  : COLLECTION_MODE_CONFIRMATION[pending.value]}
              </p>
              {pending.kind === 'collection-mode' && pending.value === 'club_account' && !club.mp_connected && (
                <Notice tone="warning">
                  Este club todavía no vinculó Mercado Pago: al confirmar, sus reservas y partidos con precio quedan
                  bloqueados hasta que lo haga.
                </Notice>
              )}
              {charging.error && <Notice>{getErrorMessage(charging.error)}</Notice>}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={charging.isPending}
                  onClick={() => {
                    setPending(null)
                    charging.reset()
                  }}
                  className={`${buttonBase} flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50`}
                >
                  Volver
                </button>
                <button
                  type="button"
                  disabled={charging.isPending}
                  onClick={confirm}
                  className={`${buttonBase} flex-1 bg-green-600 text-white hover:bg-green-700`}
                >
                  {charging.isPending ? 'Guardando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <form
                noValidate
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (commissionChanged && 'value' in parsed) {
                    charging.reset()
                    setPending({ kind: 'commission', value: parsed.value })
                  }
                }}
              >
                <label htmlFor={commissionId} className="block text-sm font-medium text-gray-700">
                  Comisión (%)
                </label>
                <div className="flex gap-2">
                  <input
                    id={commissionId}
                    inputMode="decimal"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    aria-invalid={!!commissionError}
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    disabled={!commissionChanged}
                    className={`${buttonBase} bg-green-600 text-white hover:bg-green-700`}
                  >
                    Guardar comisión
                  </button>
                </div>
                <p className={`text-xs ${commissionError ? 'text-red-600' : 'text-gray-400'}`}>
                  {commissionError ?? 'Entre 0 y 100, hasta 2 decimales. Se descuenta de cada cobro en modo "Cuenta del club".'}
                </p>
              </form>

              <form
                className="space-y-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (modeChanged) {
                    charging.reset()
                    setPending({ kind: 'collection-mode', value: mode })
                  }
                }}
              >
                <label htmlFor={modeId} className="block text-sm font-medium text-gray-700">
                  Modo de cobro
                </label>
                <div className="flex gap-2">
                  <select
                    id={modeId}
                    value={mode}
                    onChange={(e) => setMode(e.target.value as CollectionMode)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {COLLECTION_MODES.map((m) => (
                      <option key={m} value={m}>
                        {COLLECTION_MODE_LABELS[m]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!modeChanged}
                    className={`${buttonBase} bg-green-600 text-white hover:bg-green-700`}
                  >
                    Cambiar modo
                  </button>
                </div>
                <p className="text-xs text-gray-400">{COLLECTION_MODE_HINTS[mode]}</p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
