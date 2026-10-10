import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { PlatformClubCreate } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCreateClub } from '../hooks/useClubs'

const optional = (schema: z.ZodString) => schema.or(z.literal(''))

const schema = z.object({
  name: z.string().trim().min(1, 'Requerido').max(120),
  slug: z
    .string()
    .trim()
    .min(1, 'Requerido')
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Solo minúsculas, números y guiones'),
  address: z.string().trim().min(1, 'Requerido').max(200),
  city: z.string().trim().min(1, 'Requerido').max(100),
  description: z.string().trim().max(1000),
  phone: z.string().trim().max(40),
  email: optional(z.string().trim().email('Email inválido')),
  ownerUserId: optional(z.string().trim().uuid('Debe ser el UUID del usuario')),
})

type FormValues = z.infer<typeof schema>

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toPayload(v: FormValues): PlatformClubCreate {
  return {
    name: v.name,
    slug: v.slug,
    address: v.address,
    city: v.city,
    ...(v.description && { description: v.description }),
    ...(v.phone && { phone: v.phone }),
    ...(v.email && { email: v.email }),
    ...(v.ownerUserId && { ownerUserId: v.ownerUserId }),
  }
}

export function CreateClubDialog({ onClose }: { onClose: () => void }) {
  const create = useCreateClub()
  const {
    register,
    handleSubmit,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      slug: '',
      address: '',
      city: 'Buenos Aires',
      description: '',
      phone: '',
      email: '',
      ownerUserId: '',
    },
  })

  const nameField = register('name')
  const onSubmit = handleSubmit((values) =>
    create.mutate(toPayload(values), { onSuccess: onClose }),
  )

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

  const field = (name: keyof FormValues, label: string, placeholder?: string) => (
    <div>
      <label htmlFor={`club-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input id={`club-${name}`} className={inputClass} placeholder={placeholder} {...register(name)} />
      {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]?.message}</p>}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div role="dialog" aria-modal="true" aria-label="Nuevo club" className="bg-white rounded-xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Nuevo club</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {create.error && <Notice>{getErrorMessage(create.error)}</Notice>}

          <div>
            <label htmlFor="club-name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              id="club-name"
              className={inputClass}
              placeholder="Club Pádel Centro"
              {...nameField}
              onChange={(e) => {
                nameField.onChange(e)
                // Suggest the slug until the user edits it by hand.
                if (!getFieldState('slug').isDirty) {
                  setValue('slug', slugify(e.target.value))
                }
              }}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          {field('slug', 'Slug (URL)', 'club-padel-centro')}
          {field('address', 'Dirección', 'Av. Corrientes 1234')}
          {field('city', 'Ciudad')}
          {field('description', 'Descripción (opcional)')}
          {field('phone', 'Teléfono (opcional)')}
          {field('email', 'Email (opcional)')}
          {field('ownerUserId', 'ID del usuario dueño (opcional)')}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={create.isPending}
              className="flex-1 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {create.isPending ? 'Creando...' : 'Crear club'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
