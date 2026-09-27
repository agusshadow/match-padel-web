import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Swords, CalendarPlus, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCompleteOnboarding } from '../hooks/useOnboarding'
import { useAuthStore } from '../../auth/store/auth.store'

const STEPS = [
  { icon: Swords, titleKey: 'onboarding.step1Title', bodyKey: 'onboarding.step1Body' },
  { icon: CalendarPlus, titleKey: 'onboarding.step2Title', bodyKey: 'onboarding.step2Body' },
  { icon: Trophy, titleKey: 'onboarding.step3Title', bodyKey: 'onboarding.step3Body' },
] as const

export function OnboardingPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)
  const complete = useCompleteOnboarding()

  // Already onboarded (e.g. typed the URL directly) — nothing to do here.
  if (user?.onboarding_completed_at) {
    return <Navigate to="/" replace />
  }

  const isLast = step === STEPS.length - 1
  const { icon: Icon, titleKey, bodyKey } = STEPS[step]

  return (
    <div className="min-h-screen bg-background flex flex-col p-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => complete.mutate()}
          disabled={complete.isPending}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {t('onboarding.skip')}
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
          <Icon className="w-10 h-10" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">{t(titleKey)}</h1>
        <p className="text-sm text-muted-foreground max-w-xs">{t(bodyKey)}</p>
      </div>

      <div className="flex justify-center gap-1.5 mb-6">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => (isLast ? complete.mutate() : setStep((s) => s + 1))}
        disabled={complete.isPending}
        className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
      >
        {complete.isPending ? t('common.loading') : t(isLast ? 'onboarding.start' : 'onboarding.next')}
      </button>
    </div>
  )
}
