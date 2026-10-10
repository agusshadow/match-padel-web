import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Notice, PageHeader } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCreateMyClub } from '../hooks/useCreateMyClub'

const schema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
  address: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  city: z.string().trim().min(2, 'Mínimo 2 caracteres').max(100),
})
type FormValues = z.infer<typeof schema>

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'

/** Starts a club application (`POST /me/clubs`) and continues on its onboarding. */
export function NewClubPage({ hasClubs }: { hasClubs: boolean }) {
  const navigate = useNavigate()
  const create = useCreateMyClub()
  const form = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = form.handleSubmit((values) =>
    create.mutate(values, {
      onSuccess: (club) => navigate(`/${club.id}/onboarding`, { replace: true }),
    }),
  )

  const field = (name: keyof FormValues, label: string, placeholder?: string) => (
    <div>
      <label htmlFor={`club-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input id={`club-${name}`} className={inputClass} placeholder={placeholder} {...form.register(name)} />
      {form.formState.errors[name] && (
        <p className="text-red-600 text-xs mt-1">{form.formState.errors[name]?.message}</p>
      )}
    </div>
  )

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader
        title="Empezá la solicitud de tu club"
        subtitle="Con estos datos creamos tu solicitud en borrador. Después la completás paso a paso y la enviás a revisión."
      />
      <form
        onSubmit={onSubmit}
        noValidate
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
      >
        {create.isError && <Notice>{getErrorMessage(create.error)}</Notice>}
        {field('name', 'Nombre del club', 'Club Padel Norte')}
        {field('address', 'Dirección', 'Av. Libertador 1234')}
        {field('city', 'Ciudad', 'Buenos Aires')}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={create.isPending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creando...' : 'Crear solicitud'}
          </button>
          {hasClubs && (
            <Link to="/clubs" className="text-sm text-gray-500 hover:underline">
              Cancelar
            </Link>
          )}
        </div>
      </form>
    </div>
  )
}
