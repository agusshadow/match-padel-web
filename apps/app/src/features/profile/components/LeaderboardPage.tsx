import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronLeft, ChevronRight, Star, Trophy } from 'lucide-react'
import { useLeaderboard } from '../hooks/useProfile'
import { useAuthStore } from '../../auth/store/auth.store'

// Card #60: best-to-worst ELO ranking, tap a player to see their public profile.
export function LeaderboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user: me } = useAuthStore()
  const [page, setPage] = useState(1)
  const { data, isLoading } = useLeaderboard(page)

  const players = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('profile.leaderboard')}</h1>
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : players.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">{t('common.noResults')}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {players.map((player, i) => {
              const rank = (page - 1) * 20 + i + 1
              const isMe = player.id === me?.id
              const initials = player.full_name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()

              return (
                <button
                  key={player.id}
                  onClick={() => navigate(`/players/${player.username}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent ${
                    isMe ? 'bg-primary/5' : ''
                  }`}
                >
                  <span className="w-6 text-sm font-semibold text-muted-foreground text-center">{rank}</span>
                  {player.avatar_url ? (
                    <img src={player.avatar_url} alt={player.full_name ?? ''} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {initials ?? '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {player.full_name} {isMe && `(${t('profile.you')})`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">@{player.username}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-foreground">{player.elo}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-2 rounded-full bg-muted disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-muted-foreground">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 rounded-full bg-muted disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
