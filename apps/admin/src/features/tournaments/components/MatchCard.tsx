import type { ClubTournamentMatch } from '@match-padel/types'
import { StatusBadge } from '@match-padel/ui'
import {
  canEnterResult,
  emptySideLabel,
  formatScore,
  matchLabel,
  matchLinks,
  sideName,
  statusLabel,
} from '../lib/bracket'

function Side({ match, side }: { match: ClubTournamentMatch; side: 1 | 2 }) {
  const name = sideName(match, side)
  const won = match.winner === side
  return (
    <div className={`flex items-center justify-between gap-2 text-sm ${won ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
      <span className={`truncate ${name ? '' : 'italic text-gray-400'}`} title={name ?? undefined}>
        {name ?? emptySideLabel(match)}
      </span>
      {won && <span aria-label="Ganador" className="text-green-600 text-xs">✓</span>}
    </div>
  )
}

/** One match of the fixture: sides, score, status and where the winner / loser go. */
export function MatchCard({
  match,
  matches,
  showLabel = true,
  onEnter,
  compact = false,
}: {
  match: ClubTournamentMatch
  matches: ClubTournamentMatch[]
  showLabel?: boolean
  onEnter?: (match: ClubTournamentMatch) => void
  compact?: boolean
}) {
  const score = formatScore(match)
  const links = matchLinks(match, matches)
  const dim = match.status === 'bye' || match.status === 'void'
  const draw = match.status === 'completed' && match.winner === null
  return (
    <div className={`border rounded-lg bg-white p-3 space-y-1.5 ${dim ? 'border-dashed border-gray-300 bg-gray-50' : 'border-gray-200'} ${compact ? 'w-56' : ''}`}>
      {showLabel && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">{matchLabel(match, matches)}</span>
          {match.status !== 'ready' && match.status !== 'completed' && (
            <StatusBadge label={statusLabel(match.status)} tone={match.status === 'pending' ? 'yellow' : 'gray'} />
          )}
        </div>
      )}
      <Side match={match} side={1} />
      <Side match={match} side={2} />
      {(score || draw) && (
        <p className="text-xs text-gray-700 border-t border-gray-100 pt-1.5">
          <span className="font-medium">{score}</span>
          {draw && ' · empate'}
        </p>
      )}
      {!dim && (links.winner || links.loser) && (
        <div className="text-[11px] text-gray-400 leading-snug">
          {links.winner && <p>Ganador → {links.winner}</p>}
          {links.loser && <p>Perdedor → {links.loser}</p>}
        </div>
      )}
      {onEnter && canEnterResult(match.status) && (
        <button
          type="button"
          onClick={() => onEnter(match)}
          className="text-xs font-medium text-green-700 hover:underline"
        >
          {match.status === 'completed' ? 'Corregir resultado' : 'Cargar resultado'}
        </button>
      )}
    </div>
  )
}
