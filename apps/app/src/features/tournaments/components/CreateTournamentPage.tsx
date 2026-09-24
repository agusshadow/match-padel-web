import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateTournament } from '../hooks/useTournaments'

export function CreateTournamentPage() {
  const navigate = useNavigate()
  const createTournament = useCreateTournament()

  const [form, setForm] = useState({
    name: '',
    description: '',
    format: 'round_robin' as 'round_robin' | 'elimination',
    max_teams: 8,
    start_date: '',
    end_date: '',
    min_elo: '',
    max_elo: '',
    prize_info: '',
  })
  const [error, setError] = useState('')

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!form.name.trim() || !form.start_date) {
      setError('Nombre y fecha de inicio son obligatorios')
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
        min_elo: form.min_elo ? parseInt(form.min_elo) : undefined,
        max_elo: form.max_elo ? parseInt(form.max_elo) : undefined,
        prize_info: form.prize_info.trim() || undefined,
      }
      const tournament = await createTournament.mutateAsync(payload)
      navigate(`/tournaments/${tournament.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al crear torneo'
      setError(msg)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground text-lg">←</button>
        <h1 className="font-bold text-foreground">Crear Torneo</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-4 pb-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-sm text-red-500">
            {error}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Nombre *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Torneo de Verano 2025"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={2}
            placeholder="Detalles del torneo..."
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Formato</label>
          <div className="flex gap-2">
            {[
              { value: 'round_robin', label: 'Round Robin' },
              { value: 'elimination', label: 'Eliminación' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('format', opt.value as 'round_robin' | 'elimination')}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
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
          <label className="text-sm font-medium text-foreground block mb-1">Máximo de equipos</label>
          <select
            value={form.max_teams}
            onChange={(e) => set('max_teams', parseInt(e.target.value))}
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => (
              <option key={n} value={n}>{n} equipos</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Fecha inicio *</label>
            <input
              type="datetime-local"
              value={form.start_date}
              onChange={(e) => set('start_date', e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Fecha fin</label>
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
            <label className="text-sm font-medium text-foreground block mb-1">ELO mínimo</label>
            <input
              type="number"
              value={form.min_elo}
              onChange={(e) => set('min_elo', e.target.value)}
              placeholder="800"
              min={0}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">ELO máximo</label>
            <input
              type="number"
              value={form.max_elo}
              onChange={(e) => set('max_elo', e.target.value)}
              placeholder="1500"
              min={0}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1">Premio (opcional)</label>
          <input
            type="text"
            value={form.prize_info}
            onChange={(e) => set('prize_info', e.target.value)}
            placeholder="$50.000 para el ganador"
            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <button
          type="submit"
          disabled={createTournament.isPending}
          className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl disabled:opacity-60 text-base mt-2"
        >
          {createTournament.isPending ? 'Creando...' : 'Crear Torneo'}
        </button>
      </form>
    </div>
  )
}
