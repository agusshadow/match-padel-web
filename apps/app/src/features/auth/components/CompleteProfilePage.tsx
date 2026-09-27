import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useCompleteProfile } from '../hooks/useAuth'
import { useAuthStore } from '../store/auth.store'

const completeProfileSchema = z.object({
  first_name: z.string().min(2, 'Ingresá tu nombre'),
  last_name: z.string().min(2, 'Ingresá tu apellido'),
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Solo letras minúsculas, números y _'),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Elegí tu nivel de juego' }),
  }),
  preferred_hand: z.enum(['drive', 'backhand'], {
    errorMap: () => ({ message: 'Elegí tu lado preferido' }),
  }),
  phone: z.union([z.string().min(6, 'Mínimo 6 caracteres').max(20), z.literal('')]).optional(),
})

type CompleteProfileForm = z.infer<typeof completeProfileSchema>

export function CompleteProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const complete = useCompleteProfile()

  const form = useForm<CompleteProfileForm>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      // For a Google user these are the trigger's placeholders ('Usuario'/'-')
      // — shown as editable text, not read-only, so the person confirms or
      // fixes them rather than silently keeping a placeholder.
      first_name: user?.first_name === 'Usuario' ? '' : user?.first_name ?? '',
      last_name: user?.last_name === '-' ? '' : user?.last_name ?? '',
      // Never pre-fill the random fallback username — force picking a real one.
      username: '',
    },
  })

  const handleSubmit = form.handleSubmit((data) =>
    complete.mutate({ ...data, phone: data.phone || undefined })
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo-app.svg" alt="Match Padel" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground">{t('auth.completeProfileTitle')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('auth.completeProfileBody')}</p>
        </div>

        {complete.error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3 mb-4">
            {(complete.error as any)?.response?.data?.message ?? t('common.error')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.firstName')}
              </label>
              <input
                {...form.register('first_name')}
                type="text"
                autoComplete="given-name"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="Juan"
              />
              {form.formState.errors.first_name && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.first_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('auth.lastName')}
              </label>
              <input
                {...form.register('last_name')}
                type="text"
                autoComplete="family-name"
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                placeholder="Pérez"
              />
              {form.formState.errors.last_name && (
                <p className="text-destructive text-xs mt-1">{form.formState.errors.last_name.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('auth.username')}
            </label>
            <input
              {...form.register('username')}
              type="text"
              autoComplete="username"
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              placeholder="juan_padel"
            />
            {form.formState.errors.username && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('auth.skillLevel')}
            </label>
            <div className="flex bg-muted rounded-lg p-1">
              {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => form.setValue('skill_level', level, { shouldValidate: true })}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                    form.watch('skill_level') === level
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(`auth.skill${level.charAt(0).toUpperCase()}${level.slice(1)}`)}
                </button>
              ))}
            </div>
            {form.formState.errors.skill_level && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.skill_level.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('auth.preferredHand')}
            </label>
            <div className="flex bg-muted rounded-lg p-1">
              {(['drive', 'backhand'] as const).map((hand) => (
                <button
                  key={hand}
                  type="button"
                  onClick={() => form.setValue('preferred_hand', hand, { shouldValidate: true })}
                  className={`flex-1 py-2 text-xs font-medium rounded-md transition-colors ${
                    form.watch('preferred_hand') === hand
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(hand === 'drive' ? 'auth.handDrive' : 'auth.handBackhand')}
                </button>
              ))}
            </div>
            {form.formState.errors.preferred_hand && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.preferred_hand.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('auth.phone')}
            </label>
            <input
              {...form.register('phone')}
              type="tel"
              autoComplete="tel"
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              placeholder="+54 9 11 1234-5678"
            />
            {form.formState.errors.phone && (
              <p className="text-destructive text-xs mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={complete.isPending}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
          >
            {complete.isPending ? t('common.loading') : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  )
}
