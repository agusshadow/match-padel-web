import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, Target } from 'lucide-react'
import { useMyChallenges } from '../hooks/useChallenges'
import type { ChallengeCadence, UserChallenge } from '../services/challengesService'

const CADENCE_ORDER: ChallengeCadence[] = ['daily', 'weekly', 'monthly', 'one_time']

export function ChallengesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: challenges, isLoading } = useMyChallenges()

  const byCadence = new Map<ChallengeCadence, UserChallenge[]>()
  for (const uc of challenges ?? []) {
    const list = byCadence.get(uc.challenge.cadence) ?? []
    list.push(uc)
    byCadence.set(uc.challenge.cadence, list)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('challenges.title')}</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : !challenges || challenges.length === 0 ? (
          <div className="py-12 text-center">
            <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">{t('challenges.empty')}</p>
          </div>
        ) : (
          CADENCE_ORDER.filter((c) => byCadence.has(c)).map((cadence) => (
            <div key={cadence}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {t(`challenges.cadence.${cadence}`)}
              </p>
              <div className="space-y-2">
                {byCadence.get(cadence)!.map((uc) => {
                  const pct = Math.min(100, Math.round((uc.progress / uc.challenge.target_count) * 100))
                  const isCompleted = uc.status === 'completed'
                  return (
                    <div
                      key={uc.id}
                      className={`bg-card border rounded-xl p-4 ${
                        isCompleted ? 'border-primary/40' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-foreground">{uc.challenge.name}</p>
                        {isCompleted ? (
                          <Check size={16} className="text-primary shrink-0" />
                        ) : (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {uc.progress}/{uc.challenge.target_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{uc.challenge.description}</p>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCompleted ? 'bg-primary' : 'bg-primary/60'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {t('challenges.reward', { xp: uc.challenge.reward_xp })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
