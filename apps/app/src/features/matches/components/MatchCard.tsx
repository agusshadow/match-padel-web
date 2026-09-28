import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MatchWithPlayers } from '../services/matchService'

interface MatchCardProps {
  match: MatchWithPlayers
  onClick?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

function PlayerSlot({ player }: { player?: MatchWithPlayers['match_players'][0] }) {
  const { t } = useTranslation()
  const initials = player?.users?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (!player) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="w-9 h-9 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
          <span className="text-xs text-muted-foreground">?</span>
        </div>
        <span className="text-[10px] text-muted-foreground">{t('matches.emptySlot')}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {player.users?.avatar_url ? (
        <img
          src={player.users.avatar_url}
          alt={player.users.full_name ?? ''}
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
          {initials ?? '?'}
        </div>
      )}
      <span className="text-[10px] text-foreground font-medium truncate max-w-[56px]">
        {player.users?.username ?? t('matches.defaultUsername')}
      </span>
    </div>
  )
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const STATUS_LABELS: Record<string, string> = {
    waiting: t('matches.status.waiting'),
    in_progress: t('matches.status.in_progress'),
    completed: t('matches.status.completed'),
    cancelled: t('matches.status.cancelled'),
  }

  const TYPE_LABELS: Record<string, string> = {
    friendly: t('matches.type.friendly'),
    ranked: t('matches.type.ranked'),
    tournament: t('matches.type.tournament'),
  }

  const team1Players = match.match_players?.filter((p) => p.team === 1) ?? []
  const team2Players = match.match_players?.filter((p) => p.team === 2) ?? []

  // Fill slots to 2 each
  const team1Slots = [team1Players[0], team1Players[1]]
  const team2Slots = [team2Players[0], team2Players[1]]

  const handleCopyLobby = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (match.lobby_url) {
      navigator.clipboard.writeText(match.lobby_url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const scoreDisplay =
    match.status === 'completed' && match.score_team1 && match.score_team2
      ? (match.score_team1 as number[])
          .map((s, i) => `${s}-${(match.score_team2 as number[])[i]}`)
          .join(', ')
      : null

  return (
    <div
      onClick={onClick}
      className={`bg-card border border-border rounded-xl p-4 space-y-3 ${onClick ? 'cursor-pointer hover:bg-accent/50 transition-colors' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[match.status]}`}>
            {STATUS_LABELS[match.status]}
          </span>
          <span className="text-xs text-muted-foreground">{TYPE_LABELS[match.type]}</span>
          {match.is_ranked && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {t('matches.rankedBadge')}
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(match.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-3">
        {/* Team 1 */}
        <div className="flex-1 flex gap-3 justify-center">
          {team1Slots.map((player, i) => (
            <PlayerSlot key={player?.id ?? `t1-${i}`} player={player} />
          ))}
        </div>

        {/* VS / Score */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {scoreDisplay ? (
            <div className="text-center">
              <p className="text-xs font-bold text-foreground">{scoreDisplay}</p>
              {match.winner_team && (
                <p className="text-[10px] text-muted-foreground">
                  {t('matches.teamWins', { team: match.winner_team })}
                </p>
              )}
            </div>
          ) : (
            <span className="text-sm font-bold text-muted-foreground">{t('matches.vs')}</span>
          )}
        </div>

        {/* Team 2 */}
        <div className="flex-1 flex gap-3 justify-center">
          {team2Slots.map((player, i) => (
            <PlayerSlot key={player?.id ?? `t2-${i}`} player={player} />
          ))}
        </div>
      </div>

      {/* Lobby URL */}
      {match.status === 'waiting' && match.lobby_url && (
        <div className="flex items-center justify-between bg-muted rounded-lg px-3 py-2">
          <div>
            <p className="text-[10px] text-muted-foreground">{t('matches.lobbyCode')}</p>
            <p className="text-sm font-mono font-bold text-foreground">{match.lobby_url}</p>
          </div>
          <button
            onClick={handleCopyLobby}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('common.copied') : t('common.copy')}
          </button>
        </div>
      )}
    </div>
  )
}
