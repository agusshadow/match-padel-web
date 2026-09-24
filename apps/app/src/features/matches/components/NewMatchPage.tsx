import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Swords, Trophy } from 'lucide-react'
import { useCreateMatch } from '../hooks/useMatches'

export function NewMatchPage() {
  const navigate = useNavigate()
  const createMatch = useCreateMatch()
  const [type, setType] = useState<'friendly' | 'ranked'>('friendly')
  const [isRanked, setIsRanked] = useState(false)

  const handleCreate = async () => {
    const match = await createMatch.mutateAsync({
      type,
      is_ranked: isRanked,
    })
    navigate(`/matches/${match.id}`)
  }

  const typeOptions = [
    { value: 'friendly', label: 'Amistoso', icon: Swords, desc: 'Partido sin clasificación' },
    { value: 'ranked', label: 'Rankeado', icon: Trophy, desc: 'Afecta tu ELO' },
  ] as const

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
        <h1 className="text-xl font-bold text-foreground">Nuevo partido</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        {/* Type selection */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-3">Tipo de partido</p>
          <div className="grid grid-cols-2 gap-3">
            {typeOptions.map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                onClick={() => {
                  setType(value)
                  setIsRanked(value === 'ranked')
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  type === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <Icon
                  size={24}
                  className={type === value ? 'text-primary' : 'text-muted-foreground'}
                />
                <p className={`font-semibold mt-2 ${type === value ? 'text-primary' : 'text-foreground'}`}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Ranked toggle (only shown for friendly) */}
        {type === 'friendly' && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
            <div>
              <p className="font-medium text-foreground text-sm">Partido rankeado</p>
              <p className="text-xs text-muted-foreground">El resultado afectará tu ELO</p>
            </div>
            <button
              onClick={() => setIsRanked((v) => !v)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                isRanked ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isRanked ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}

        {/* Info */}
        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground space-y-1">
          <p>Al crear el partido recibirás un código de lobby para compartir con los demás jugadores.</p>
          <p>El partido comienza cuando se unan 4 jugadores.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pb-6">
        <button
          onClick={handleCreate}
          disabled={createMatch.isPending}
          className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {createMatch.isPending ? 'Creando...' : 'Crear partido'}
        </button>
        {createMatch.isError && (
          <p className="text-center text-sm text-destructive mt-2">
            Error al crear el partido. Intentá de nuevo.
          </p>
        )}
      </div>
    </div>
  )
}
