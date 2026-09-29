import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, TrendingUp, TrendingDown, LineChart } from 'lucide-react'
import { useMyEloHistory } from '../hooks/useProfile'

export function EloHistoryPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: history, isLoading } = useMyEloHistory()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 pt-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">{t('profile.eloHistory')}</h1>
      </div>

      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground text-sm">{t('common.loading')}</div>
        ) : !history || history.length === 0 ? (
          <div className="py-12 text-center">
            <LineChart className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-medium">{t('achievements.eloHistoryEmpty')}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {history.map((entry) => {
              const isGain = entry.delta > 0
              return (
                <div key={entry.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center ${
                        isGain
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {isGain ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {entry.elo_before} → {entry.elo_after}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isGain ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {isGain ? '+' : ''}
                    {entry.delta}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
