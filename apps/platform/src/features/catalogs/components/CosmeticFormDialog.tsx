import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  CatalogCosmetic,
  CatalogCosmeticCreate,
  CatalogCosmeticDetail,
  CatalogCosmeticUpdate,
} from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { COSMETIC_TYPES, COSMETIC_TYPE_LABELS } from '../constants'
import { useCatalogDetail, useCatalogSave } from '../hooks/useCatalogs'
import { applyApiErrors, catalogErrorMessage, lockedDetails } from '../lib/errors'
import { cosmeticSchema, type CosmeticFormValues } from '../lib/schemas'
import {
  DialogShell,
  FormActions,
  FormField,
  ImageUploadField,
  UsageSummary,
  inputClass,
  selectClass,
} from './CatalogUi'

const FIELDS = ['code', 'name', 'description', 'type', 'image_url', 'price_currency'] as const

export function CosmeticFormDialog({
  item,
  onClose,
  onSaved,
}: {
  item?: CatalogCosmetic
  onClose: () => void
  onSaved: (message: string) => void
}) {
  const isEdit = !!item
  const save = useCatalogSave<CatalogCosmeticDetail, CatalogCosmeticCreate | CatalogCosmeticUpdate>('cosmetics')
  const detail = useCatalogDetail<CatalogCosmeticDetail>('cosmetics', item?.id)
  const [general, setGeneral] = useState<string[]>([])

  const usage = detail.data?.usage
  const typeLocked =
    isEdit &&
    (detail.isLoading ||
      (usage ? usage.owners_count > 0 : true) ||
      (save.error ? (lockedDetails(save.error)?.fields ?? []).includes('type') : false))

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<CosmeticFormValues>({
    resolver: zodResolver(cosmeticSchema),
    defaultValues: {
      code: item?.code ?? '',
      name: item?.name ?? '',
      description: item?.description ?? '',
      type: item?.type ?? 'avatar',
      image_url: item?.image_url ?? '',
      price_currency: item?.price_currency ?? 0,
    },
  })

  const onSubmit = handleSubmit((v) => {
    setGeneral([])
    let body: CatalogCosmeticCreate | CatalogCosmeticUpdate
    if (item) {
      const patch: CatalogCosmeticUpdate = {}
      if (v.name !== item.name) patch.name = v.name
      if (v.description !== item.description) patch.description = v.description
      if (v.type !== item.type) patch.type = v.type
      if (v.image_url !== item.image_url) patch.image_url = v.image_url
      if (v.price_currency !== item.price_currency) patch.price_currency = v.price_currency
      if (Object.keys(patch).length === 0) return onClose()
      body = patch
    } else {
      body = { ...v }
    }
    save.mutate(
      { id: item?.id, body },
      {
        onSuccess: (saved) => {
          onSaved(isEdit ? `Cosmético "${saved.name}" actualizado.` : `Cosmético "${saved.name}" creado.`)
          onClose()
        },
        onError: (err) => setGeneral(applyApiErrors<CosmeticFormValues>(err, setError, FIELDS)),
      },
    )
  })

  const errorText = save.error && general.length === 0 && Object.keys(errors).length === 0 ? catalogErrorMessage(save.error) : null

  return (
    <DialogShell title={isEdit ? `Editar cosmético: ${item.name}` : 'Nuevo cosmético'} onClose={onClose} busy={save.isPending}>
      <form onSubmit={onSubmit} className="p-5 space-y-4" noValidate>
        {errorText && <Notice>{errorText}</Notice>}
        {general.length > 0 && <Notice>{general.join(' · ')}</Notice>}

        {isEdit && (
          <UsageSummary
            isLoading={detail.isLoading}
            lines={[{ label: 'Jugadores que lo poseen', value: usage?.owners_count ?? 0 }]}
            locked={!detail.isLoading && typeLocked ? ['Tipo'] : []}
          />
        )}

        <FormField
          label="Código"
          htmlFor="cos-code"
          error={errors.code?.message}
          hint={isEdit ? 'El código no se puede cambiar.' : 'Identificador único: minúsculas, números y _ (ej. gold_frame).'}
        >
          <input id="cos-code" className={inputClass} disabled={isEdit} {...register('code')} />
        </FormField>
        <FormField label="Nombre" htmlFor="cos-name" error={errors.name?.message}>
          <input id="cos-name" className={inputClass} {...register('name')} />
        </FormField>
        <FormField label="Descripción" htmlFor="cos-description" error={errors.description?.message}>
          <textarea id="cos-description" rows={3} className={inputClass} {...register('description')} />
        </FormField>

        <FormField
          label="Tipo (ranura donde se equipa)"
          htmlFor="cos-type"
          error={errors.type?.message}
          hint={typeLocked ? 'Bloqueado: ya hay jugadores que lo poseen.' : undefined}
        >
          <select
            id="cos-type"
            className={`${selectClass} w-full disabled:bg-gray-100 disabled:text-gray-500`}
            disabled={typeLocked}
            {...register('type')}
          >
            {COSMETIC_TYPES.map((t) => (
              <option key={t} value={t}>
                {COSMETIC_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </FormField>

        <Controller
          control={control}
          name="image_url"
          render={({ field }) => (
            <ImageUploadField
              id="cos-image"
              label="Imagen"
              value={field.value}
              onChange={field.onChange}
              error={errors.image_url?.message}
              hint="Se muestra en la tienda y en todos los lugares donde se usa el ítem."
            />
          )}
        />

        <FormField
          label="Precio en monedas (0 a 1000000)"
          htmlFor="cos-price"
          error={errors.price_currency?.message}
          hint="0 = gratis. Aplica a compras futuras; quienes ya lo compraron pagaron el precio anterior."
        >
          <input
            id="cos-price"
            type="number"
            min={0}
            className={inputClass}
            {...register('price_currency', { valueAsNumber: true })}
          />
        </FormField>

        <FormActions
          onClose={onClose}
          isPending={save.isPending}
          submitLabel={isEdit ? 'Guardar cambios' : 'Crear cosmético'}
          pendingLabel="Guardando..."
        />
      </form>
    </DialogShell>
  )
}
