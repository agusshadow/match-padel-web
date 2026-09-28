import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Swords } from 'lucide-react'
import { useMyMatches } from '../hooks/useMatches'
import { MatchCard } from './MatchCard'

export function MatchesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')

  const TABS = [
    { id: 'active', label: t('matches.active'), statuses: ['waiting', 'in_progress'] },
    { id: 'history', label: t('matches.history'), statuses: ['completed', 'cancelled'] },
  ] as const

  const { data: allMatches, isLoading, error, refetch } = useMyMatches()

  const currentTabConfig = TABS.find((tab) => tab.id === activeTab)!
  const filteredMatches = (allMatches ?? []).filter((m) =>
    (currentTabConfig.statuses as readonly string[]).includes(m.status)
  )

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-bold text-foreground">{t('matches.title')}</h1>
        <button
          onClick={() => navigate('/matches/new')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          {t('common.create')}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-center">
          <p className="text-sm text-destructive">{t('matches.loadError')}</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-sm text-primary font-medium"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Match list */}
      {!isLoading && !error && (
        <div className="space-y-3">
          {filteredMatches.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center mt-2">
              <Swords size={36} className="text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-foreground">
                {activeTab === 'active' ? t('matches.noActiveMatches') : t('matches.noMatchHistory')}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {activeTab === 'active'
                  ? t('matches.emptyActiveBody')
                  : t('matches.emptyHistoryBody')}
              </p>
              {activeTab === 'active' && (
                <button
                  onClick={() => navigate('/matches/new')}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {t('matches.new')}
                </button>
              )}
            </div>
          ) : (
            filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match as any}
                onClick={() => navigate(`/matches/${match.id}`)}
              />
            ))
          )}
        </div>
      )}

      {/* Join by code button */}
      {activeTab === 'active' && !isLoading && (
        <button
          onClick={() => navigate('/matches/join')}
          className="w-full py-3 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {t('matches.joinWithLobbyCode')}
        </button>
      )}
    </div>
  )
}
