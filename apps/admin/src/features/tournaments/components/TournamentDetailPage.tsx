import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import type { ClubTournamentCancelResult, ClubTournamentDetail, ClubTournamentStartResult } from '@match-padel/types'
import { Notice, PageHeader, StatusBadge } from '@match-padel/ui'
import { useCurrentClub } from '@/shared/club-context'
import { useClubTournament } from '../hooks/useClubTournaments'
import { FORMAT_INFO, STATUS, tournamentErrorMessage } from '../lib/labels'
import { FixtureTab } from './FixtureTab'
import { ResultsTab } from './ResultsTab'
import { StandingsTab } from './StandingsTab'
import { SummaryTab } from './SummaryTab'
import { TeamsTab } from './TeamsTab'

const TABS = [
  { key: 'summary', label: 'Resumen' },
  { key: 'teams', label: 'Inscripciones' },
  { key: 'fixture', label: 'Fixture' },
  { key: 'results', label: 'Resultados' },
  { key: 'standings', label: 'Posiciones' },
] as const

type TabKey = (typeof TABS)[number]['key']

export type LastAction =
  | { kind: 'cancelled'; result: ClubTournamentCancelResult }
  | { kind: 'started'; result: ClubTournamentStartResult }
  | { kind: 'published' }
  | null

export function TournamentDetailPage() {
  const club = useCurrentClub()
  const { tournamentId } = useParams<{ tournamentId: string }>()
  const [params, setParams] = useSearchParams()
  const [lastAction, setLastAction] = useState<LastAction>(null)
  const { data, isLoading, error } = useClubTournament(club.clubId, tournamentId)

  if (isLoading) return <p className="text-sm text-gray-400">Cargando torneo...</p>
  if (!data) {
    return (
      <div className="space-y-4">
        <Notice>{error ? tournamentErrorMessage(error) : 'No encontramos el torneo.'}</Notice>
        <Link to={`/${club.clubId}/tournaments`} className="text-sm text-green-700 underline">
          Volver a torneos
        </Link>
      </div>
    )
  }

  const requested = params.get('tab')
  const tab: TabKey = TABS.some((t) => t.key === requested) ? (requested as TabKey) : 'summary'
  const select = (key: TabKey) => setParams(key === 'summary' ? {} : { tab: key }, { replace: true })

  return (
    <div className="space-y-5">
      <Link to={`/${club.clubId}/tournaments`} className="text-sm text-gray-500 hover:text-gray-700">
        ← Torneos
      </Link>
      <PageHeader
        title={data.name}
        subtitle={FORMAT_INFO[data.format].label}
        actions={<StatusBadge label={STATUS[data.status].label} tone={STATUS[data.status].tone} />}
      />

      <div role="tablist" aria-label="Secciones del torneo" className="flex gap-1 border-b border-gray-200 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            onClick={() => select(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${tab === t.key ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
            {t.key === 'teams' && data.counts.teams_pending_payment > 0 && (
              <span className="ml-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-full px-1.5">
                {data.counts.teams_pending_payment}
              </span>
            )}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'summary' && (
          <SummaryTab tournament={data} lastAction={lastAction} onAction={setLastAction} onGo={select} />
        )}
        {tab === 'teams' && <TeamsTab tournament={data} />}
        {tab === 'fixture' && <FixtureTab tournament={data as ClubTournamentDetail} />}
        {tab === 'results' && <ResultsTab tournament={data} />}
        {tab === 'standings' && <StandingsTab tournament={data} />}
      </div>
    </div>
  )
}
