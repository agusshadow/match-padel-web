import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Circle } from 'lucide-react'
import { Notice, PageHeader } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { ClubStatusBadge } from '@/shared/components/ClubStatusBadge'
import { EDITABLE_STATUSES, STEP_LABELS, STEP_ORDER, type WizardStepKey } from '../constants'
import { useApplicationClub, useOnboarding } from '../hooks/useOnboarding'
import { ClubStep } from './ClubStep'
import { ContactStep } from './ContactStep'
import { CourtsStep } from './CourtsStep'
import { DocumentsStep } from './DocumentsStep'
import { HistoryTimeline } from './HistoryTimeline'
import { LocationStep } from './LocationStep'
import { ScheduleStep } from './ScheduleStep'
import { StatusBanner } from './StatusBanner'
import { SubmitStep } from './SubmitStep'

/** Application wizard of a club (`/:clubId/onboarding`): owner, administrator and superadmin. */
export function OnboardingPage() {
  const current = useCurrentClub()
  const { clubId } = current
  const [params, setParams] = useSearchParams()
  const onboarding = useOnboarding(clubId)
  const club = useApplicationClub(clubId)

  const requested = params.get('step') as WizardStepKey | null
  const step: WizardStepKey = requested && STEP_ORDER.includes(requested) ? requested : 'club'
  const goTo = (next: WizardStepKey) => setParams({ step: next }, { replace: true })
  const goNext = () => goTo(STEP_ORDER[Math.min(STEP_ORDER.indexOf(step) + 1, STEP_ORDER.length - 1)])

  if (onboarding.isLoading || club.isLoading) return <p className="text-sm text-gray-400">Cargando solicitud...</p>
  if (onboarding.isError || club.isError || !onboarding.data || !club.data) {
    return <Notice>{getErrorMessage(onboarding.error ?? club.error)}</Notice>
  }

  const { status, steps, history } = onboarding.data
  const editable = (EDITABLE_STATUSES as readonly string[]).includes(status)
  const completeByStep = new Map(steps.map((s) => [s.key, s.complete]))
  const completed = steps.filter((s) => s.complete).length
  const canSubmitRole = current.role === 'owner' || current.role === 'superadmin'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitud del club"
        subtitle={`${club.data.name} · ${completed} de ${steps.length} pasos completos`}
        actions={<ClubStatusBadge status={status} />}
      />

      <StatusBanner clubId={clubId} status={status} history={history} />

      <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-6">
        <nav aria-label="Pasos de la solicitud" className="bg-white rounded-xl border border-gray-200 p-2 h-fit">
          <ol className="space-y-1">
            {STEP_ORDER.map((key) => {
              const done = key === 'submit' ? false : completeByStep.get(key) === true
              const active = key === step
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => goTo(key)}
                    aria-current={active ? 'step' : undefined}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      active ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                    )}
                    {STEP_LABELS[key]}
                  </button>
                </li>
              )
            })}
          </ol>
        </nav>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{STEP_LABELS[step]}</h2>
            {step !== 'submit' && !completeByStep.get(step) && (
              <p className="text-xs text-red-600 mt-1">
                Falta completar este paso para poder enviar la solicitud.
              </p>
            )}
            {!editable && (
              <p className="text-xs text-gray-500 mt-1">Solo lectura: la solicitud no se puede editar ahora.</p>
            )}
          </div>

          {step === 'club' && (
            <ClubStep key={club.data.updated_at} clubId={clubId} club={club.data} editable={editable} onSaved={goNext} />
          )}
          {step === 'location' && (
            <LocationStep key={club.data.updated_at} clubId={clubId} club={club.data} editable={editable} onSaved={goNext} />
          )}
          {step === 'contact' && (
            <ContactStep key={club.data.updated_at} clubId={clubId} club={club.data} editable={editable} onSaved={goNext} />
          )}
          {step === 'courts' && <CourtsStep clubId={clubId} editable={editable} onContinue={goNext} />}
          {step === 'schedule' && (
            <ScheduleStep key={club.data.updated_at} clubId={clubId} club={club.data} editable={editable} onSaved={goNext} />
          )}
          {step === 'documents' && (
            <DocumentsStep
              clubId={clubId}
              documents={onboarding.data.documents}
              editable={editable}
              onContinue={goNext}
            />
          )}
          {step === 'submit' && (
            <SubmitStep
              clubId={clubId}
              status={status}
              onboarding={onboarding.data}
              canSubmitRole={canSubmitRole}
              onGoToStep={goTo}
            />
          )}
        </section>
      </div>

      <HistoryTimeline history={history} />
    </div>
  )
}
