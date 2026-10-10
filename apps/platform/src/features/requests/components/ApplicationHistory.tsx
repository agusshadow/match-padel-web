import type { ClubStatusHistoryEntry } from '@match-padel/types'
import { StatusBadge, formatDateTime, personName } from '@match-padel/ui'
import { CLUB_STATUS_LABELS, CLUB_STATUS_TONES } from '@/shared/permissions'

/** Status history, newest first (as the API returns it), with the note and the actor of each step. */
export function ApplicationHistory({ history }: { history: ClubStatusHistoryEntry[] }) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Historial</h2>
      {history.length === 0 ? (
        <p className="text-sm text-gray-400">Sin movimientos todavía.</p>
      ) : (
        <ol className="space-y-4 border-l border-gray-200 ml-2">
          {history.map((entry) => (
            <li key={entry.id} className="pl-4 relative">
              <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300" />
              <div className="flex flex-wrap items-center gap-2">
                {entry.from_status && (
                  <>
                    <StatusBadge label={CLUB_STATUS_LABELS[entry.from_status]} tone="gray" />
                    <span className="text-xs text-gray-400">→</span>
                  </>
                )}
                <StatusBadge label={CLUB_STATUS_LABELS[entry.to_status]} tone={CLUB_STATUS_TONES[entry.to_status]} />
                <span className="text-xs text-gray-400">
                  {formatDateTime(entry.created_at)}
                  {entry.actor ? ` · ${personName(entry.actor)}` : ''}
                </span>
              </div>
              {entry.note && <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{entry.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
