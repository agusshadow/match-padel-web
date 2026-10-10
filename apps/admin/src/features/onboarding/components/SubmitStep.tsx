import type { ClubOnboarding, ClubStatus } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { STEP_LABELS, missingLabel, missingStep, type WizardStepKey } from '../constants'
import { incompleteDetails, useSubmitApplication } from '../hooks/useOnboarding'

interface Props {
  clubId: string
  status: ClubStatus
  onboarding: ClubOnboarding
  /** Only the club owner (or a superadmin) can submit. */
  canSubmitRole: boolean
  onGoToStep: (step: WizardStepKey) => void
}

export function SubmitStep({ clubId, status, onboarding, canSubmitRole, onGoToStep }: Props) {
  const submit = useSubmitApplication(clubId)
  const incomplete = submit.isError ? incompleteDetails(submit.error) : null
  const submittable = status === 'draft' || status === 'changes_requested'

  const allComplete = onboarding.steps.every((s) => s.complete)

  return (
    <div className="space-y-4">
      <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white">
        {onboarding.steps.map((step) => (
          <li key={step.key} className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-900">{STEP_LABELS[step.key]}</p>
              <button type="button" onClick={() => onGoToStep(step.key)} className="text-xs text-gray-600 underline">
                {step.complete ? 'Revisar' : 'Completar'}
              </button>
            </div>
            {step.complete ? (
              <p className="text-xs text-green-700 mt-1">Completo</p>
            ) : (
              <ul className="mt-1 text-xs text-red-600 list-disc list-inside">
                {step.missing.map((m) => (
                  <li key={m}>{missingLabel(m)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {submit.isError && !incomplete && <Notice>{getErrorMessage(submit.error)}</Notice>}
      {incomplete && (
        <Notice>
          <p className="font-medium">La solicitud está incompleta. Falta:</p>
          <ul className="list-disc list-inside mt-1">
            {incomplete.missing.map((code) => {
              const step = missingStep(code)
              return (
                <li key={code}>
                  {step ? `${STEP_LABELS[step]}: ` : ''}
                  {missingLabel(code)}
                </li>
              )
            })}
          </ul>
        </Notice>
      )}

      {!submittable ? null : !canSubmitRole ? (
        <Notice tone="info">Solo el dueño del club puede enviar la solicitud a revisión.</Notice>
      ) : (
        <div className="space-y-2">
          {!allComplete && (
            <p className="text-xs text-gray-500">
              Completá todos los pasos para poder enviar la solicitud.
            </p>
          )}
          <button
            type="button"
            disabled={!onboarding.canSubmit || submit.isPending}
            onClick={() => {
              if (
                window.confirm(
                  'Vas a enviar la solicitud a revisión. Mientras se revisa no vas a poder editarla. ¿Continuar?',
                )
              )
                submit.mutate()
            }}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {submit.isPending ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      )}
    </div>
  )
}
