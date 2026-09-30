import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Star } from 'lucide-react'
import { usePublicProfile } from '../hooks/useProfile'

// Card #60: the destination when tapping a player in the leaderboard.
export function PublicProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { username } = useParams<{ username: string }>()
  const { data: user, isLoading, error } = usePublicProfile(username)

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('profile.title')}</h1>
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : error || !user ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('clubs.notFound')}</div>
        ) : (
          <div className="flex flex-col items-center gap-3 pt-6">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
                {initials ?? '?'}
              </div>
            )}
            <div className="text-center">
              <p className="font-bold text-foreground text-xl">{user.full_name}</p>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
            </div>
            <div className="flex items-center gap-1.5 bg-card border border-border rounded-full px-4 py-1.5">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-foreground">{user.elo}</span>
              <span className="text-xs text-muted-foreground">{t('profile.elo')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
