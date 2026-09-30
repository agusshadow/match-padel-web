import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useJoinMatch } from '../hooks/useMatches'

export function JoinMatchPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const joinMatch = useJoinMatch()
  const [lobbyCode, setLobbyCode] = useState('')

  const handleJoin = async () => {
    if (!lobbyCode.trim()) return
    const payment = await joinMatch.mutateAsync(lobbyCode.trim().toUpperCase())
    const url = import.meta.env.PROD ? payment.init_point : payment.sandbox_init_point
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('matches.joinMatch')}</h1>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <p className="text-muted-foreground text-sm">{t('matches.joinMatchBody')}</p>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">{t('matches.lobbyCode')}</label>
          <input
            type="text"
            value={lobbyCode}
            onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
            placeholder={t('matches.lobbyCodePlaceholder')}
            maxLength={8}
            className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-center font-mono text-xl font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          />
        </div>

        {joinMatch.isError && (
          <p className="text-sm text-destructive text-center">{t('matches.invalidLobbyCode')}</p>
        )}
      </div>

      <div className="p-4 pb-6">
        <button
          onClick={handleJoin}
          disabled={!lobbyCode.trim() || joinMatch.isPending}
          className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {joinMatch.isPending ? t('matches.joining') : t('matches.joinTheMatch')}
        </button>
      </div>
    </div>
  )
}
