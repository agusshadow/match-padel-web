import type { ClubStatusHistoryEntry } from '@match-padel/types'
import { formatDateTime, personName } from '@match-padel/ui'
import { ClubStatusBadge } from '@/shared/components/ClubStatusBadge'

/** Status history of the application, newest first (as the API returns it). */
export function HistoryTimeline({ history }: { history: ClubStatusHistoryEntry[] }) {
  if (history.length === 0) return null
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-900 mb-4">Historial</h2>
      <ol className="space-y-4 border-l border-gray-200 ml-2">
        {history.map((entry) => (
          <li key={entry.id} className="pl-4 relative">
            <span className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300" />
            <div className="flex flex-wrap items-center gap-2">
              <ClubStatusBadge status={entry.to_status} />
              <span className="text-xs text-gray-400">
                {formatDateTime(entry.created_at)}
                {entry.actor ? ` · ${personName(entry.actor)}` : ''}
              </span>
            </div>
            {entry.note && <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{entry.note}</p>}
          </li>
        ))}
      </ol>
    </section>
  )
}
