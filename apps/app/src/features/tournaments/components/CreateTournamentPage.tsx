import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { useCreateTournament } from '../hooks/useTournaments'

export function CreateTournamentPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const createTournament = useCreateTournament()

  const [form, setForm] = useState({
    name: '',
    description: '',
    format: 'round_robin' as 'round_robin' | 'single_elimination' | 'double_elimination' | 'americano',
    max_teams: 8,
    start_date: '',
    end_date: '',
    entry_fee: '',
    prize_pool: '',
  })
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.start_date) {
      setError(t('tournaments.nameAndStartRequired'))
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        format: form.format,
        max_teams: form.max_teams,
        start_date: new Date(form.start_date).toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        entry_fee: form.entry_fee ? parseFloat(form.entry_fee) : undefined,
        prize_pool: form.prize_pool ? parseFloat(form.prize_pool) : undefined,
      }
      const tournament = await createTournament.mutateAsync(payload)
      navigate(`/tournaments/${tournament.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : t('tournaments.createError')
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-foreground">{t('tournaments.createTournament')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4 pb-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.nameRequired')}</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder={t('tournaments.namePlaceholder')}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.description')}</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder={t('tournaments.descriptionPlaceholder')}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">{t('tournaments.format_')}</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'round_robin', label: t('tournaments.format.round_robin') },
              { value: 'single_elimination', label: t('tournaments.format.single_elimination') },
              { value: 'double_elimination', label: t('tournaments.format.double_elimination') },
              { value: 'americano', label: t('tournaments.format.americano') },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('format', opt.value as typeof form.format)}
                className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  form.format === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-foreground'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.maxTeams')}</label>
          <select
            value={form.max_teams}
            onChange={(e) => set('max_teams', parseInt(e.target.value))}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => (
              <option key={n} value={n}>{t('tournaments.teamsOption', { count: n })}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.startDateRequired')}</label>
            <input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.endDate')}</label>
            <input
              type="datetime-local"
              value={form.end_date}
              onChange={(e) => set('end_date', e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.entryFeeLabel')}</label>
            <input
              type="number"
              value={form.entry_fee}
              onChange={(e) => set('entry_fee', e.target.value)}
              placeholder="0"
              min={0}
              step="0.01"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">{t('tournaments.prizePoolLabel')}</label>
            <input
              type="number"
              value={form.prize_pool}
              onChange={(e) => set('prize_pool', e.target.value)}
              placeholder="0"
              min={0}
              step="0.01"
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createTournament.isPending}
          className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-60 text-base mt-2"
        >
          {createTournament.isPending ? t('matches.creating') : t('tournaments.createTournament')}
        </button>
      </form>
    </div>
  )
}
