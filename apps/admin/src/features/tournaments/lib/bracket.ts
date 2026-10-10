/**
 * Pure helpers that turn the API's flat match list into what the screens draw: rounds of a round
 * robin or an americano, the columns of an elimination bracket, links between matches and the
 * checks of a score before it is sent. No React, no I/O: they are exercised with a plain script.
 */
import type {
  ClubTournamentMatch,
  TournamentFormat,
  TournamentMatchStage,
  TournamentMatchStatus,
} from '@match-padel/types'

export type Match = ClubTournamentMatch

const byPosition = (a: Match, b: Match) => a.round - b.round || a.position - b.position

export interface RoundColumn {
  round: number
  name: string
  matches: Match[]
}

export interface BracketSection {
  stage: TournamentMatchStage
  title: string
  rounds: RoundColumn[]
}

/** Minimum registrations the API asks for to start (`docs/tournaments.md`). */
export function minTeamsToStart(format: TournamentFormat): number {
  return format === 'double_elimination' ? 3 : 2
}

/** Elimination formats draw a bracket; round robin and americano draw rounds. */
export function isElimination(format: TournamentFormat): boolean {
  return format === 'single_elimination' || format === 'double_elimination'
}

/** Name of a round inside its stage: "Final", "Semifinal", "Cuartos de final", "Octavos de final" or "Ronda n". */
export function roundName(stage: TournamentMatchStage, round: number, lastRound: number): string {
  if (stage === 'grand_final') return 'Gran final'
  if (stage === 'group' || stage === 'americano') return `Ronda ${round}`
  if (stage === 'losers') return `Perdedores · ronda ${round}`
  const fromEnd = lastRound - round
  const base = fromEnd === 0 ? 'Final' : fromEnd === 1 ? 'Semifinal' : fromEnd === 2 ? 'Cuartos de final' : fromEnd === 3 ? 'Octavos de final' : `Ronda ${round}`
  return stage === 'winners' ? `Ganadores · ${base.toLowerCase()}` : base
}

const STAGE_TITLES: Record<TournamentMatchStage, string> = {
  group: 'Rondas',
  americano: 'Rondas',
  main: 'Llave',
  winners: 'Llave de ganadores',
  losers: 'Llave de perdedores',
  grand_final: 'Final',
}

const STAGE_ORDER: TournamentMatchStage[] = ['main', 'winners', 'losers', 'grand_final', 'group', 'americano']

/** Rounds of one stage, ordered, each with its matches ordered by position. */
export function roundsOf(matches: Match[], stage: TournamentMatchStage): RoundColumn[] {
  const own = matches.filter((m) => m.stage === stage).sort(byPosition)
  const rounds = [...new Set(own.map((m) => m.round))].sort((a, b) => a - b)
  const last = rounds.length ? rounds[rounds.length - 1] : 0
  return rounds.map((round) => ({
    round,
    name: roundName(stage, round, last),
    matches: own.filter((m) => m.round === round),
  }))
}

/** Sections of the fixture in drawing order (only the stages that have matches). */
export function bracketSections(matches: Match[]): BracketSection[] {
  return STAGE_ORDER.filter((stage) => matches.some((m) => m.stage === stage)).map((stage) => ({
    stage,
    title: STAGE_TITLES[stage],
    rounds: roundsOf(matches, stage),
  }))
}

/** Human label of a match: "Semifinal · partido 2". */
export function matchLabel(match: Match, matches: Match[]): string {
  const rounds = roundsOf(matches, match.stage)
  const round = rounds.find((r) => r.round === match.round)
  return `${round?.name ?? `Ronda ${match.round}`} · partido ${match.position + 1}`
}

/** Where the winner and the loser of a match go ("Ganador → Final · partido 1"), or `null` when nowhere. */
export function matchLinks(match: Match, matches: Match[]): { winner: string | null; loser: string | null } {
  const byId = new Map(matches.map((m) => [m.id, m]))
  const target = (id: string | null, slot: number | null) => {
    const next = id ? byId.get(id) : undefined
    if (!next) return null
    return `${matchLabel(next, matches)}${slot ? ` (lugar ${slot})` : ''}`
  }
  return {
    winner: target(match.next_match_id, match.next_match_slot),
    loser: target(match.loser_next_match_id, match.loser_next_match_slot),
  }
}

/** Matches that receive a team from this one (winner or loser link). */
export function downstreamOf(match: Match, matches: Match[]): Match[] {
  const ids = new Set([match.next_match_id, match.loser_next_match_id].filter((x): x is string => !!x))
  return matches.filter((m) => ids.has(m.id))
}

/**
 * A winner change is refused (409 `RESULT_LOCKED`) while a match fed by this one was already played.
 * Returns those matches, so the form can warn before the request. Only a hint: the API decides.
 */
export function playedDownstream(match: Match, matches: Match[]): Match[] {
  return downstreamOf(match, matches).filter((m) => m.status === 'completed')
}

/** The two sides are known and the match is not a bye / void: a result can be entered. */
export function canEnterResult(status: TournamentMatchStatus): boolean {
  return status === 'ready' || status === 'completed'
}

export function statusLabel(status: TournamentMatchStatus): string {
  return {
    pending: 'Esperando equipos',
    ready: 'Listo para jugar',
    completed: 'Jugado',
    bye: 'Libre (bye)',
    void: 'No se juega',
  }[status]
}

/** `6-4 3-6 7-5`; americano `21-18`; `null` when there is no score. */
export function formatScore(match: Pick<Match, 'score_team1' | 'score_team2'>): string | null {
  const a = match.score_team1
  const b = match.score_team2
  if (!a || !b || a.length === 0) return null
  return a.map((games, i) => `${games}-${b[i] ?? 0}`).join(' ')
}

/** Names of a side: the team's name, or the two players of an americano side. */
export function sideName(match: Match, side: 1 | 2): string | null {
  const players = side === 1 ? match.team1_players : match.team2_players
  if (players && players.length > 0) {
    return players.map((p) => p.username || `${p.first_name} ${p.last_name}`.trim()).join(' / ')
  }
  const team = side === 1 ? match.team1 : match.team2
  return team ? (team.name ?? 'Equipo sin nombre') : null
}

/** What fills an empty side of a match: a bye, a team still to be decided, or nobody (void). */
export function emptySideLabel(match: Pick<Match, 'status'>): string {
  if (match.status === 'bye') return 'Libre (bye)'
  if (match.status === 'void') return '—'
  return 'Por definir'
}

// ---- Americano rounds -----------------------------------------------------------------------------

/** Players of an americano match (both sides), or `[]`. */
export function americanoPlayerIds(match: Match): string[] {
  return [...(match.team1_players ?? []), ...(match.team2_players ?? [])].map((p) => p.id)
}

/** Players who do not play a round (they rest), given the full roster. */
export function restingPlayers(roundMatches: Match[], roster: Array<{ id: string; name: string }>): string[] {
  const playing = new Set(roundMatches.flatMap(americanoPlayerIds))
  return roster.filter((p) => !playing.has(p.id)).map((p) => p.name)
}

// ---- Scores -----------------------------------------------------------------------------------------

export interface Decision {
  /** `1` / `2`, or `null` for a tie. */
  winner: 1 | 2 | null
  tie: boolean
}

/**
 * Same rule as the API: the side with more sets wins, then more games; padel sets of equal length.
 * A tie needs the operator to say who goes through (elimination and round robin); an americano
 * draw is valid.
 */
export function decide(score1: number[], score2: number[]): Decision {
  let sets1 = 0
  let sets2 = 0
  let games1 = 0
  let games2 = 0
  score1.forEach((g1, i) => {
    const g2 = score2[i] ?? 0
    games1 += g1
    games2 += g2
    if (g1 > g2) sets1 += 1
    else if (g2 > g1) sets2 += 1
  })
  if (sets1 !== sets2) return { winner: sets1 > sets2 ? 1 : 2, tie: false }
  if (games1 !== games2) return { winner: games1 > games2 ? 1 : 2, tie: false }
  return { winner: null, tie: true }
}

export type ScoreParse =
  | { ok: true; score_team1: number[]; score_team2: number[] }
  | { ok: false; error: string }

/**
 * Rows of "games side 1 / games side 2" as typed in the form (strings) to the arrays the API takes.
 * Padel: 1 to 5 sets. Americano: exactly one row (points of each side).
 */
export function parseScoreRows(rows: Array<{ a: string; b: string }>, americano: boolean): ScoreParse {
  const filled = rows.filter((r) => r.a.trim() !== '' || r.b.trim() !== '')
  if (filled.length === 0) return { ok: false, error: 'Cargá al menos un set.' }
  if (americano && filled.length !== 1) return { ok: false, error: 'En americano se carga un solo marcador.' }
  if (filled.length > 5) return { ok: false, error: 'Como máximo 5 sets.' }
  const a: number[] = []
  const b: number[] = []
  for (const [i, r] of filled.entries()) {
    const x = r.a.trim()
    const y = r.b.trim()
    if (!/^\d{1,2}$/.test(x) || !/^\d{1,2}$/.test(y)) {
      return { ok: false, error: `${americano ? 'El marcador' : `El set ${i + 1}`} debe tener números enteros de 0 a 99.` }
    }
    a.push(Number(x))
    b.push(Number(y))
  }
  return { ok: true, score_team1: a, score_team2: b }
}

/** Rows to pre-fill the form from a stored score (one empty row when there is none). */
export function rowsFromScore(match: Pick<Match, 'score_team1' | 'score_team2'>, americano: boolean): Array<{ a: string; b: string }> {
  const a = match.score_team1 ?? []
  const b = match.score_team2 ?? []
  if (a.length === 0) return americano ? [{ a: '', b: '' }] : [{ a: '', b: '' }, { a: '', b: '' }]
  return a.map((g, i) => ({ a: String(g), b: String(b[i] ?? 0) }))
}

// ---- Placement ------------------------------------------------------------------------------------------

/** `1º`, `2º`, `3º (compartido)`; `null` placement means the team is still alive. */
export function placementLabel(placement: number | null, shared: boolean): string {
  if (placement === null) return 'En juego'
  return `${placement}º${shared ? ' (compartido)' : ''}`
}
