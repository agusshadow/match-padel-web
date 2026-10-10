import { useState } from 'react'
import type { CalendarCourt, CourtBlock } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { clubParts, formatClubTime, formatDayLong } from '@/lib/club-time'
import { calendarErrorMessage } from '../lib/errors'
import { useDeleteBlock } from '../hooks/useCalendar'
import { Dialog } from './Dialog'

export function BlockDetailDialog({
  clubId,
  block,
  court,
  canDelete,
  onClose,
  onDeleted,
}: {
  clubId: string
  block: CourtBlock
  court: CalendarCourt['court']
  /** Owner and admin only; reception sees the block but cannot remove it. */
  canDelete: boolean
  onClose: () => void
  onDeleted: () => void
}) {
  const remove = useDeleteBlock(clubId)
  const [confirming, setConfirming] = useState(false)
  const start = clubParts(block.start_time)
  const end = clubParts(block.end_time)

  return (
    <Dialog title="Bloqueo" onClose={onClose} busy={remove.isPending}>
      <dl className="text-sm space-y-2">
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Cancha</dt>
          <dd className="text-gray-900">{court.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Desde</dt>
          <dd className="text-gray-900 text-right">
            {formatDayLong(start.date)}, {formatClubTime(block.start_time)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Hasta</dt>
          <dd className="text-gray-900 text-right">
            {formatDayLong(end.date)}, {formatClubTime(block.end_time)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-gray-500">Motivo</dt>
          <dd className="text-gray-900 text-right">{block.reason || 'Sin motivo'}</dd>
        </div>
      </dl>
      {remove.error && <Notice>{calendarErrorMessage(remove.error)}</Notice>}
      {canDelete && confirming && (
        <Notice tone="warning">
          Al eliminar el bloqueo, ese horario vuelve a estar disponible para los jugadores.
        </Notice>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={remove.isPending}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cerrar
        </button>
        {canDelete &&
          (confirming ? (
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(block.id, { onSuccess: onDeleted })}
              className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {remove.isPending ? 'Eliminando...' : 'Sí, eliminar'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
            >
              Eliminar bloqueo
            </button>
          ))}
      </div>
    </Dialog>
  )
}
