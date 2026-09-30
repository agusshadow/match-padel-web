import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LogOut, Trophy, Swords, Star, Percent, ChevronRight, Edit, Zap } from 'lucide-react'
import { useLogout } from '../../auth/hooks/useAuth'
import { useAuthStore } from '../../auth/store/auth.store'
import { useMyStats } from '../hooks/useProfile'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const logout = useLogout()
  const { data: stats, isLoading: statsLoading } = useMyStats()

  const initials = user?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const statItems = [
    {
      icon: Swords,
      label: t('profile.matches'),
      value: statsLoading ? '...' : String(stats?.total_matches ?? 0),
    },
    {
      icon: Trophy,
      label: t('profile.wins'),
      value: statsLoading ? '...' : String(stats?.wins ?? 0),
    },
    {
      icon: Star,
      label: t('profile.losses'),
      value: statsLoading ? '...' : String(stats?.losses ?? 0),
    },
    {
      icon: Percent,
      label: t('profile.winRate'),
      value: statsLoading ? '...' : `${stats?.win_rate ?? 0}%`,
    },
  ]

  const menuItems = [
    { label: t('profile.edit'), action: () => navigate('/profile/edit') },
    { label: t('profile.myAchievements'), action: () => navigate('/profile/achievements') },
    { label: t('challenges.title'), action: () => navigate('/profile/challenges') },
    { label: t('profile.eloHistory'), action: () => navigate('/profile/elo-history') },
    { label: t('profile.leaderboard'), action: () => navigate('/profile/leaderboard') },
    { label: t('notifications.title'), action: () => {} },
    { label: t('profile.help'), action: () => {} },
  ]

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="pt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{t('profile.title')}</h1>
        <button
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut size={16} />
          {t('auth.logout')}
        </button>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name ?? ''}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {initials ?? '?'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground text-xl leading-tight">{user?.full_name}</p>
          <p className="text-sm text-muted-foreground">@{user?.username}</p>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-semibold text-foreground">{user?.elo ?? 1000}</span>
              <span className="text-xs text-muted-foreground">{t('profile.elo')}</span>
            </div>
            {/* Card #61: level is a separate axis from ELO — engagement, not skill */}
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-primary fill-primary" />
              <span className="text-sm font-semibold text-foreground">{user?.level ?? 1}</span>
              <span className="text-xs text-muted-foreground">{t('profile.level')}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/profile/edit')}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <Edit size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {menuItems.map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full text-left px-4 py-3.5 text-sm font-medium text-foreground hover:bg-accent transition-colors flex items-center justify-between"
          >
            {label}
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
