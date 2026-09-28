import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useAuthStore } from '../../auth/store/auth.store'
import { useUpdateProfile } from '../hooks/useProfile'

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const updateProfile = useUpdateProfile()

  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.full_name ?? '')
      setPhone(user.phone ?? '')
    }
  }, [user])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError(t('profile.nameMinLength'))
      return
    }

    try {
      await updateProfile.mutateAsync({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      })
      navigate('/profile')
    } catch {
      setError(t('profile.saveError'))
    }
  }

  const isDirty = fullName !== (user?.full_name ?? '') || phone !== (user?.phone ?? '')

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('profile.edit')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="flex-1 p-4 space-y-5">
          {/* Avatar placeholder */}
          <div className="flex flex-col items-center gap-2 py-4">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
              {fullName?.[0]?.toUpperCase() ?? user?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <p className="text-xs text-muted-foreground">@{user?.username}</p>
          </div>

          {/* Full name */}
          <div>
            <label htmlFor="full_name" className="text-sm font-medium text-foreground block mb-1.5">
              {t('profile.fullName')}
            </label>
            <input
              id="full_name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('profile.fullNamePlaceholder')}
              required
              minLength={2}
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-foreground block mb-1.5">
              {t('auth.phoneLabel')}{' '}
              <span className="text-muted-foreground font-normal">({t('profile.optional')})</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder={t('profile.phonePlaceholder')}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 pb-8">
          <button
            type="submit"
            disabled={updateProfile.isPending || !isDirty}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {updateProfile.isPending ? t('matches.saving') : t('profile.saveChanges')}
          </button>
        </div>
      </form>
    </div>
  )
}
