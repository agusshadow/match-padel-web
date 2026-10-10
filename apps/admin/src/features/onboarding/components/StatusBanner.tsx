import { Link } from 'react-router-dom'
import type { ClubStatus, ClubStatusHistoryEntry } from '@match-padel/types'
import { Notice } from '@match-padel/ui'

/** Latest note written when the application moved to `status` (history is newest first). */
function latestNote(history: ClubStatusHistoryEntry[], status: ClubStatus): string | null {
  return history.find((h) => h.to_status === status && h.note)?.note ?? null
}

export function StatusBanner({
  clubId,
  status,
  history,
}: {
  clubId: string
  status: ClubStatus
  history: ClubStatusHistoryEntry[]
}) {
  const note = latestNote(history, status)
  const noteBlock = note && (
    <p className="mt-2 whitespace-pre-line border-l-2 border-current pl-3">{note}</p>
  )

  switch (status) {
    case 'draft':
      return (
        <Notice tone="info">
          Completá los pasos y enviá la solicitud para que el equipo de Match Padel la revise. Todo lo que cargues
          queda guardado como borrador y podés retomarlo cuando quieras.
        </Notice>
      )
    case 'pending':
      return (
        <Notice tone="warning">
          <p className="font-medium">Tu solicitud está en revisión.</p>
          <p>
            Mientras el equipo la revisa no se puede editar (modo solo lectura). Te avisamos por email cuando haya
            novedades.
          </p>
        </Notice>
      )
    case 'changes_requested':
      return (
        <Notice tone="warning">
          <p className="font-medium">El equipo pidió correcciones.</p>
          <p>Corregí lo indicado y volvé a enviar la solicitud.</p>
          {noteBlock}
        </Notice>
      )
    case 'approved':
      return (
        <Notice tone="success">
          <p className="font-medium">Tu club está aprobado.</p>
          <p>
            Ya podés usar el panel:{' '}
            <Link to={`/${clubId}/dashboard`} className="underline">
              ir al resumen
            </Link>
            .
          </p>
        </Notice>
      )
    case 'rejected':
      return (
        <Notice>
          <p className="font-medium">La solicitud fue rechazada.</p>
          <p>No se puede editar ni volver a enviar.</p>
          {noteBlock}
        </Notice>
      )
    case 'suspended':
      return (
        <Notice>
          <p className="font-medium">El club está suspendido.</p>
          <p>Los jugadores no lo ven y la información no se puede editar. Contactá al equipo de Match Padel.</p>
          {noteBlock}
        </Notice>
      )
  }
}
