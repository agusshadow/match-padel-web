import { useState } from 'react'
import type { CalendarReservation, ReservationCancelResult } from '@match-padel/types'
import { Notice, formatMoney, personName } from '@match-padel/ui'
import { formatClubDateTime } from '@/lib/club-time'
import { calendarErrorMessage } from '../lib/errors'
import { useCancelReservation } from '../hooks/useCalendar'
import { Dialog } from '@/shared/components/Dialog'

const REASON_MAX = 300

export function CancelDialog({
  clubId,
  reservation,
  courtName,
  onClose,
}: {
  clubId: string
  reservation: CalendarReservation
  courtName: string
  onClose: () => void
}) {
  const cancel = useCancelReservation(clubId)
  const [reason, setReason] = useState('')
  const [result, setResult] = useState<ReservationCancelResult | null>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reason.trim()
    cancel.mutate({ id: reservation.id, reason: trimmed || undefined }, { onSuccess: setResult })
  }

  if (result) {
    const { refund } = result
    return (
      <Dialog title="Reserva cancelada" onClose={onClose}>
        <Notice tone="success">La reserva fue cancelada y se avisó al jugador.</Notice>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>
            Pagos aprobados: <strong>{refund.payments}</strong>
          </li>
          <li>
            Reembolsados: <strong>{refund.refunded}</strong> ({formatMoney(refund.amount_refunded)})
          </li>
          {result.match && <li>El partido vinculado también quedó cancelado.</li>}
        </ul>
        {refund.failed.length > 0 && (
          <Notice tone="warning">
            <p className="font-medium">
              {refund.failed.length === 1
                ? 'Un reembolso no se pudo procesar'
                : `${refund.failed.length} reembolsos no se pudieron procesar`}
            </p>
            <p className="mt-1">
              Mercado Pago rechazó la devolución. El pago sigue aprobado: tenés que resolverlo a mano con el
              jugador. Quedó registrado en la auditoría.
            </p>
            <p className="mt-1 text-xs break-all">Pagos: {refund.failed.join(', ')}</p>
          </Notice>
        )}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700"
          >
            Listo
          </button>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog title="Cancelar reserva" onClose={onClose} busy={cancel.isPending}>
      <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-gray-700">
          {personName(reservation.user)} · {courtName} · {formatClubDateTime(reservation.start_time)}
        </p>
        <Notice tone="warning">
          <ul className="list-disc pl-4 space-y-1">
            <li>Se le reembolsa al jugador el 100% de los pagos aprobados, sin importar cuánto falte.</li>
            {reservation.match && (
              <li>El partido vinculado se cancela y se avisa a todos los jugadores.</li>
            )}
            <li>No se penaliza al jugador. Esta acción no se puede deshacer.</li>
          </ul>
        </Notice>
        <div>
          <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-1">
            Motivo (opcional)
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            maxLength={REASON_MAX}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-400 text-right">
            {reason.length}/{REASON_MAX}
          </p>
        </div>
        {cancel.error && <Notice>{calendarErrorMessage(cancel.error)}</Notice>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={cancel.isPending}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="submit"
            disabled={cancel.isPending}
            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {cancel.isPending ? 'Cancelando...' : 'Cancelar reserva'}
          </button>
        </div>
      </form>
    </Dialog>
  )
}
