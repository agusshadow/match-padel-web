import type { ClubTournamentDetail } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { bracketSections, restingPlayers, roundsOf } from '../lib/bracket'
import { MatchCard } from './MatchCard'

/** Players of the confirmed registrations, for the "descansa" list of an americano round. */
function roster(t: ClubTournamentDetail): Array<{ id: string; name: string }> {
  return t.teams
    .filter((team) => team.status === 'confirmed')
    .flatMap((team) => [team.player1, team.player2])
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ id: p.id, name: p.username || `${p.first_name} ${p.last_name}`.trim() }))
}

export function FixtureTab({ tournament: t }: { tournament: ClubTournamentDetail }) {
  if (t.matches.length === 0) {
    return (
      <Notice tone="info">
        {t.status === 'cancelled'
          ? 'El torneo se canceló antes de generar el fixture.'
          : 'El fixture se genera cuando iniciás el torneo, con las inscripciones confirmadas.'}
      </Notice>
    )
  }

  if (t.format === 'round_robin') {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Todos contra todos: cada pareja juega una vez contra cada una de las demás. Una pareja descansa en la ronda
          en que no aparece.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {roundsOf(t.matches, 'group').map((round) => (
            <section key={round.round} className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">{round.name}</h3>
              {round.matches.map((m) => (
                <MatchCard key={m.id} match={m} matches={t.matches} showLabel={false} />
              ))}
            </section>
          ))}
        </div>
      </div>
    )
  }

  if (t.format === 'americano') {
    const players = roster(t)
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Cada ronda se juega de a cuatro por cancha, con compañero distinto. Cada partido suma puntos individuales a
          los cuatro jugadores.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roundsOf(t.matches, 'americano').map((round) => {
            const resting = restingPlayers(round.matches, players)
            return (
              <section key={round.round} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900">{round.name}</h3>
                {round.matches.map((m) => (
                  <MatchCard key={m.id} match={m} matches={t.matches} showLabel={false} />
                ))}
                {resting.length > 0 && <p className="text-xs text-gray-500">Descansan: {resting.join(', ')}</p>}
              </section>
            )
          })}
        </div>
      </div>
    )
  }

  const sections = bracketSections(t.matches)
  return (
    <div className="space-y-8">
      <p className="text-sm text-gray-600">
        Las llaves se leen de izquierda a derecha. Los partidos con <strong>bye</strong> no se juegan: la pareja pasa
        sola a la ronda siguiente. Debajo de cada partido ves a dónde va el ganador
        {t.format === 'double_elimination' ? ' y el perdedor' : ''}.
      </p>
      {sections.map((section) => (
        <section key={section.stage} aria-label={section.title}>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{section.title}</h3>
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-6 min-w-max">
              {section.rounds.map((round) => (
                <div key={round.round} className="flex flex-col">
                  <p className="text-xs font-medium text-gray-500 mb-2">{round.name}</p>
                  <div className="flex flex-col justify-around gap-3 flex-1">
                    {round.matches.map((m) => (
                      <MatchCard key={m.id} match={m} matches={t.matches} compact showLabel={false} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}
