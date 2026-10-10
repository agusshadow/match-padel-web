import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ACHIEVEMENT_CONDITION_TYPES } from '@match-padel/types'
import type {
  CatalogAchievement,
  CatalogAchievementCreate,
  CatalogAchievementDetail,
  CatalogAchievementUpdate,
} from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { CONDITION_LABELS, KNOWN_ICON_KEYS } from '../constants'
import { useCatalogDetail, useCatalogSave } from '../hooks/useCatalogs'
import { applyApiErrors, catalogErrorMessage } from '../lib/errors'
import { achievementSchema, type AchievementFormValues } from '../lib/schemas'
import {
  DialogShell,
  FormActions,
  FormField,
  ImageUploadField,
  UsageSummary,
  inputClass,
  selectClass,
} from './CatalogUi'

const FIELDS = ['code', 'name', 'description', 'icon', 'points', 'condition_type', 'condition_count'] as const

export function AchievementFormDialog({
  item,
  onClose,
  onSaved,
}: {
  item?: CatalogAchievement
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = !!item
  const save = useCatalogSave<CatalogAchievementDetail, CatalogAchievementCreate | CatalogAchievementUpdate>(
    'achievements',
  )
  const detail = useCatalogDetail<CatalogAchievementDetail>('achievements', item?.id)
  const [general, setGeneral] = useState<string[]>([])

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AchievementFormValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      code: item?.code ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      icon: item?.icon ?? 'trophy',
      points: item?.points ?? 0,
      condition_type: item?.condition?.type ?? 'matches_played',
      condition_count: item?.condition?.count ?? 1,
    },
  })

  const onSubmit = handleSubmit((v) => {
    setGeneral([])
    const condition = { type: v.condition_type, count: v.condition_count }
    let body: CatalogAchievementCreate | CatalogAchievementUpdate
    if (item) {
      const patch: CatalogAchievementUpdate = {}
      if (v.name !== item.name) patch.name = v.name
      if (v.description !== item.description) patch.description = v.description
      if (v.icon !== item.icon) patch.icon = v.icon
      if (v.points !== item.points) patch.points = v.points
      if (condition.type !== item.condition?.type || condition.count !== item.condition?.count) {
        patch.condition = condition
      }
      if (Object.keys(patch).length === 0) return onClose()
      body = patch
    } else {
      body = {
        code: v.code,
        name: v.name,
        description: v.description,
        icon: v.icon,
        points: v.points,
        condition,
      }
    }
    save.mutate(
      { id: item?.id, body },
      {
        onSuccess: (saved) => {
          onSaved(isEdit ? `Logro "${saved.name}" actualizado.` : `Logro "${saved.name}" creado.`)
          onClose()
        },
        onError: (err) => {
          setGeneral(
            applyApiErrors<AchievementFormValues>(err, setError, FIELDS, {
              'condition.type': 'condition_type',
              'condition.count': 'condition_count',
            }),
          )
        },
      },
    )
  })

  const errorText = save.error && general.length === 0 && !hasFieldErrors(errors) ? catalogErrorMessage(save.error) : null

  return (
    <DialogShell title={isEdit ? `Editar logro: ${item.name}` : 'Nuevo logro'} onClose={onClose} busy={save.isPending}>
      <form onSubmit={onSubmit} className="p-5 space-y-4" noValidate>
        {errorText && <Notice>{errorText}</Notice>}
        {general.length > 0 && <Notice>{general.join(' · ')}</Notice>}

        {isEdit && (
          <UsageSummary
            isLoading={detail.isLoading}
            lines={[{ label: 'Jugadores que lo obtuvieron', value: detail.data?.usage.owners_count ?? 0 }]}
            locked={[]}
          />
        )}

        <FormField
          label="Código"
          htmlFor="ach-code"
          error={errors.code?.message}
          hint={isEdit ? 'El código no se puede cambiar.' : 'Identificador único: minúsculas, números y _ (ej. ten_wins).'}
        >
          <input id="ach-code" className={inputClass} disabled={isEdit} {...register('code')} />
        </FormField>
        <FormField label="Nombre" htmlFor="ach-name" error={errors.name?.message}>
          <input id="ach-name" className={inputClass} {...register('name')} />
        </FormField>
        <FormField label="Descripción" htmlFor="ach-description" error={errors.description?.message}>
          <textarea id="ach-description" rows={3} className={inputClass} {...register('description')} />
        </FormField>

        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <div className="space-y-2">
              <ImageUploadField
                id="ach-icon"
                label="Ícono (clave o imagen)"
                value={field.value}
                onChange={field.onChange}
                error={errors.icon?.message}
                hint={`Clave que conoce la app (${KNOWN_ICON_KEYS.join(', ')}) o una URL https. Con otra clave la app muestra un ícono genérico.`}
              />
              <div className="flex gap-2">
                {KNOWN_ICON_KEYS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => field.onChange(k)}
                    className="text-xs px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}
        />

        <FormField label="Puntos" htmlFor="ach-points" error={errors.points?.message} hint="Solo informativo: hoy no otorga nada.">
          <input
            id="ach-points"
            type="number"
            min={0}
            className={inputClass}
            {...register('points', { valueAsNumber: true })}
          />
        </FormField>

        <fieldset className="border border-gray-200 rounded-lg p-3 space-y-3">
          <legend className="text-sm font-medium text-gray-700 px-1">Condición</legend>
          <p className="text-xs text-gray-500">
            Se otorga al completar un partido en el que el total del jugador llega a la cantidad. No es retroactivo.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contador" htmlFor="ach-cond-type" error={errors.condition_type?.message}>
              <select id="ach-cond-type" className={`${selectClass} w-full`} {...register('condition_type')}>
                {ACHIEVEMENT_CONDITION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CONDITION_LABELS[t]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Cantidad (1 a 100000)" htmlFor="ach-cond-count" error={errors.condition_count?.message}>
              <input
                id="ach-cond-count"
                type="number"
                min={1}
                className={inputClass}
                {...register('condition_count', { valueAsNumber: true })}
              />
            </FormField>
          </div>
        </fieldset>

        <FormActions
          onClose={onClose}
          isPending={save.isPending}
          submitLabel={isEdit ? 'Guardar cambios' : 'Crear logro'}
          pendingLabel="Guardando..."
        />
      </form>
    </DialogShell>
  )
}

function hasFieldErrors(errors: Record<string, unknown>): boolean {
  return Object.keys(errors).length > 0
}
