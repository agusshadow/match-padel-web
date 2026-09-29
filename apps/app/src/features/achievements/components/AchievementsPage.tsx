import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trophy, Medal, Flame, Award, type LucideIcon } from 'lucide-react'
import { useAchievementsCatalog, useMyAchievements } from '../hooks/useAchievements'

// Maps the API's plain icon name (see achievements.icon in docs/schema.sql)
// to a component. Falls back to a generic Award for any future achievement
// whose icon isn't listed here yet.
const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  flame: Flame,
}

export function AchievementsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: catalog, isLoading: catalogLoading } = useAchievementsCatalog()
  const { data: earned, isLoading: earnedLoading } = useMyAchievements()

  const earnedCodes = new Set((earned ?? []).map((e) => e.achievement.code))
  const earnedAtByCode = new Map((earned ?? []).map((e) => [e.achievement.code, e.earned_at]))
  const isLoading = catalogLoading || earnedLoading

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('profile.myAchievements')}</h1>
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : !catalog || catalog.length === 0 ? (
          <div className="py-12 text-center">
            <Award className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">{t('achievements.empty')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {catalog.map((achievement) => {
              const isEarned = earnedCodes.has(achievement.code)
              const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? Award
              const earnedAt = earnedAtByCode.get(achievement.code)

              return (
                <div
                  key={achievement.id}
                  className={`bg-card border rounded-xl p-4 flex flex-col items-center text-center gap-2 ${
                    isEarned ? 'border-primary/40' : 'border-border opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isEarned ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{achievement.name}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{achievement.description}</p>
                  {isEarned && earnedAt ? (
                    <p className="text-[10px] text-primary font-medium">
                      {new Date(earnedAt).toLocaleDateString('es-AR')}
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">{t('achievements.locked')}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
