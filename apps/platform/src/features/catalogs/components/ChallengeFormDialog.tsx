import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  CatalogChallenge,
  CatalogChallengeCreate,
  CatalogChallengeDetail,
  CatalogChallengeUpdate,
} from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { ACTIONS, ACTION_LABELS, CADENCES, CADENCE_LABELS, FIELD_LABELS } from '../constants'
import { useCatalogDetail, useCatalogSave } from '../hooks/useCatalogs'
import { applyApiErrors, catalogErrorMessage, lockedDetails } from '../lib/errors'
import { challengeSchema, type ChallengeFormValues } from '../lib/schemas'
import { DialogShell, FormActions, FormField, UsageSummary, inputClass, selectClass } from './CatalogUi'

const FIELDS = [
  'code',
  'name',
  'description',
  'cadence',
  'action_type',
  'target_count',
  'reward_xp',
  'reward_currency',
] as const

export function ChallengeFormDialog({
  item,
  onClose,
  onSaved,
}: {
  item?: CatalogChallenge
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = !!item
  const save = useCatalogSave<CatalogChallengeDetail, CatalogChallengeCreate | CatalogChallengeUpdate>('challenges')
  const detail = useCatalogDetail<CatalogChallengeDetail>('challenges', item?.id)
  const [general, setGeneral] = useState<string[]>([])

  const usage = detail.data?.usage
  // Locked once any player was assigned the challenge. Until the usage is known, treat as locked.
  const lockedByUsage = isEdit && (detail.isLoading || (usage ? usage.assignments_count > 0 : true))
  const lockedErrorFields = save.error ? (lockedDetails(save.error)?.fields ?? []) : []
  const isLocked = (field: string) => lockedByUsage || lockedErrorFields.includes(field)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ChallengeFormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      code: item?.code ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      cadence: item?.cadence ?? 'weekly',
      action_type: item?.action_type ?? 'play_matches',
      target_count: item?.target_count ?? 1,
      reward_xp: item?.reward_xp ?? 0,
      reward_currency: item?.reward_currency ?? 0,
    },
  })

  const onSubmit = handleSubmit((v) => {
    setGeneral([])
    let body: CatalogChallengeCreate | CatalogChallengeUpdate
    if (item) {
      const patch: CatalogChallengeUpdate = {}
      if (v.name !== item.name) patch.name = v.name
      if (v.description !== item.description) patch.description = v.description
      if (v.cadence !== item.cadence) patch.cadence = v.cadence
      if (v.action_type !== item.action_type) patch.action_type = v.action_type
      if (v.target_count !== item.target_count) patch.target_count = v.target_count
      if (v.reward_xp !== item.reward_xp) patch.reward_xp = v.reward_xp
      if (v.reward_currency !== item.reward_currency) patch.reward_currency = v.reward_currency
      if (Object.keys(patch).length === 0) return onClose()
      body = patch
    } else {
      body = { ...v }
    }
    save.mutate(
      { id: item?.id, body },
      {
        onSuccess: (saved) => {
          onSaved(isEdit ? `Desafío "${saved.name}" actualizado.` : `Desafío "${saved.name}" creado.`)
          onClose()
        },
        onError: (err) => setGeneral(applyApiErrors<ChallengeFormValues>(err, setError, FIELDS)),
      },
    )
  })

  const errorText = save.error && general.length === 0 && Object.keys(errors).length === 0 ? catalogErrorMessage(save.error) : null
  const lockedNames = (['cadence', 'action_type'] as const).filter(isLocked).map((f) => FIELD_LABELS[f])

  return (
    <DialogShell title={isEdit ? `Editar desafío: ${item.name}` : 'Nuevo desafío'} onClose={onClose} busy={save.isPending}>
      <form onSubmit={onSubmit} className="p-5 space-y-4" noValidate>
        {errorText && <Notice>{errorText}</Notice>}
        {general.length > 0 && <Notice>{general.join(' · ')}</Notice>}

        {isEdit && (
          <UsageSummary
            isLoading={detail.isLoading}
            lines={[
              { label: 'Asignaciones totales', value: usage?.assignments_count ?? 0 },
              { label: 'Asignaciones en curso', value: usage?.active_assignments_count ?? 0 },
            ]}
            locked={detail.isLoading ? [] : lockedNames}
          />
        )}

        <FormField
          label="Código"
          htmlFor="chl-code"
          error={errors.code?.message}
          hint={isEdit ? 'El código no se puede cambiar.' : 'Identificador único: minúsculas, números y _ (ej. weekly_wins).'}
        >
          <input id="chl-code" className={inputClass} disabled={isEdit} {...register('code')} />
        </FormField>
        <FormField label="Nombre" htmlFor="chl-name" error={errors.name?.message}>
          <input id="chl-name" className={inputClass} {...register('name')} />
        </FormField>
        <FormField label="Descripción" htmlFor="chl-description" error={errors.description?.message}>
          <textarea id="chl-description" rows={3} className={inputClass} {...register('description')} />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Frecuencia"
            htmlFor="chl-cadence"
            error={errors.cadence?.message}
            hint={isLocked('cadence') ? 'Bloqueado: ya hay jugadores asignados.' : undefined}
          >
            <select
              id="chl-cadence"
              className={`${selectClass} w-full disabled:bg-gray-100 disabled:text-gray-500`}
              disabled={isLocked('cadence')}
              {...register('cadence')}
            >
              {CADENCES.map((c) => (
                <option key={c} value={c}>
                  {CADENCE_LABELS[c]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            label="Acción"
            htmlFor="chl-action"
            error={errors.action_type?.message}
            hint={isLocked('action_type') ? 'Bloqueado: ya hay jugadores asignados.' : undefined}
          >
            <select
              id="chl-action"
              className={`${selectClass} w-full disabled:bg-gray-100 disabled:text-gray-500`}
              disabled={isLocked('action_type')}
              {...register('action_type')}
            >
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {ACTION_LABELS[a]}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label="Meta (1 a 10000)"
          htmlFor="chl-target"
          error={errors.target_count?.message}
          hint="También aplica a las asignaciones en curso."
        >
          <input
            id="chl-target"
            type="number"
            min={1}
            className={inputClass}
            {...register('target_count', { valueAsNumber: true })}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Recompensa XP (0 a 100000)" htmlFor="chl-xp" error={errors.reward_xp?.message}>
            <input
              id="chl-xp"
              type="number"
              min={0}
              className={inputClass}
              {...register('reward_xp', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Recompensa monedas (0 a 1000000)" htmlFor="chl-currency" error={errors.reward_currency?.message}>
            <input
              id="chl-currency"
              type="number"
              min={0}
              className={inputClass}
              {...register('reward_currency', { valueAsNumber: true })}
            />
          </FormField>
        </div>
        <p className="text-xs text-gray-500">
          La recompensa que se paga es la vigente al completar el desafío, también en asignaciones ya creadas. Para
          frenar un pago de inmediato, poné la recompensa en 0 y después desactivalo.
        </p>

        <FormActions
          onClose={onClose}
          isPending={save.isPending}
          submitLabel={isEdit ? 'Guardar cambios' : 'Crear desafío'}
          pendingLabel="Guardando..."
        />
      </form>
    </DialogShell>
  )
}
