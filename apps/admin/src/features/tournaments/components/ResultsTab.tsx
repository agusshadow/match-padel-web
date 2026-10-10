import { useState } from 'react'
import type { ClubTournamentDetail, ClubTournamentMatch, TournamentResultOutcome } from '@match-padel/types'
import { Notice } from '@match-padel/ui'
import { Dialog } from '@/shared/components/Dialog'
import { useCurrentClub } from '@/shared/club-context'
import { useRecordResult } from '../hooks/useClubTournaments'
import {
  canEnterResult,
  decide,
  isElimination,
  matchLabel,
  parseScoreRows,
  playedDownstream,
  rowsFromScore,
  sideName,
} from '../lib/bracket'
import { lockedMatchIds, tournamentErrorMessage } from '../lib/labels'
import { MatchCard } from './MatchCard'
import { inputClass, primaryButton, secondaryButton } from './ui'

type Filter = 'todo' | 'played' | 'all'

export function ResultsTab({ tournament: t }: { tournament: ClubTournamentDetail }) {
  const [filter, setFilter] = useState<Filter>('todo')
  const [editing, setEditing] = useState<ClubTournamentMatch | null>(null)

  if (t.matches.length === 0) {
    return (
      <Notice tone="info">
        Los resultados se cargan una vez iniciado el torneo y generado el fixture.
      </Notice>
    )
  }
  const writable = t.status === 'in_progress' || t.status === 'completed'
  const playable = t.matches.filter((m) => canEnterResult(m.status))
  const shown = playable.filter((m) =>
    filter === 'all' ? true : filter === 'todo' ? m.status === 'ready' : m.status === 'completed',
  )
  const waiting = t.matches.filter((m) => m.status === 'pending').length

  return (
    <div className="space-y-4">
      {t.status === 'completed' && (
        <Notice tone="success">
          El torneo terminó. Podés corregir resultados: cambiar el marcador siempre se puede; cambiar el ganador
          sólo mientras no se haya jugado un partido que dependa de él.
        </Notice>
      )}
      {t.status === 'cancelled' && <Notice tone="warning">El torneo está cancelado: no se cargan resultados.</Notice>}

      <div className="flex flex-wrap items-center gap-2">
        {(
          [
            ['todo', 'Por cargar'],
            ['played', 'Jugados'],
            ['all', 'Todos'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-sm rounded-full border ${filter === value ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
          >
            {label}
          </button>
        ))}
        {waiting > 0 && <span className="text-xs text-gray-500">{waiting} partido(s) esperan a sus equipos</span>}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-500 py-8 text-center">No hay partidos en esta vista.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shown.map((m) => (
            <div key={m.id}>
              <p className="text-xs font-medium text-gray-500 mb-1">{matchLabel(m, t.matches)}</p>
              <MatchCard
                match={m}
                matches={t.matches}
                showLabel={false}
                onEnter={writable ? setEditing : undefined}
              />
            </div>
          ))}
        </div>
      )}

      {editing && (
        <ResultDialog
          key={editing.id}
          tournament={t}
          match={t.matches.find((m) => m.id === editing.id) ?? editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function ResultDialog({
  tournament: t,
  match,
  onClose,
}: {
  tournament: ClubTournamentDetail
  match: ClubTournamentMatch
  onClose: () => void
}) {
  const club = useCurrentClub()
  const record = useRecordResult(club.clubId, t.id)
  const americano = t.format === 'americano'
  const [rows, setRows] = useState(() => rowsFromScore(match, americano))
  const [winner, setWinner] = useState<'team1' | 'team2' | ''>('')
  const [outcome, setOutcome] = useState<TournamentResultOutcome | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const parsed = parseScoreRows(rows, americano)
  const decision = parsed.ok ? decide(parsed.score_team1, parsed.score_team2) : null
  const needsWinner = !!decision?.tie && !americano
  const lockedBy = playedDownstream(match, t.matches)
  const one = sideName(match, 1) ?? 'Lado 1'
  const two = sideName(match, 2) ?? 'Lado 2'
  const lockedIds = record.error ? lockedMatchIds(record.error) : null

  const setCell = (i: number, key: 'a' | 'b', value: string) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)))

  const submit = () => {
    setFormError(null)
    if (!parsed.ok) return setFormError(parsed.error)
    if (needsWinner && !winner) return setFormError('El marcador está empatado: elegí quién pasa.')
    record.mutate(
      {
        matchId: match.id,
        body: {
          score_team1: parsed.score_team1,
          score_team2: parsed.score_team2,
          ...(needsWinner && winner ? { winner } : {}),
        },
      },
      { onSuccess: setOutcome },
    )
  }

  if (outcome) {
    return (
      <Dialog title="Resultado guardado" onClose={onClose}>
        <Notice tone="success">
          {outcome.match.winner
            ? `Ganó ${sideName(outcome.match, outcome.match.winner) ?? 'el lado ' + outcome.match.winner}.`
            : 'Empate registrado.'}
        </Notice>
        {outcome.advanced.length > 0 ? (
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Esto movió la llave:</p>
            <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
              {outcome.advanced.map((m) => (
                <li key={m.id}>
                  {matchLabel(m, t.matches)}: {sideName(m, 1) ?? 'por definir'} vs {sideName(m, 2) ?? 'por definir'}
                  {m.status === 'bye' && ' (bye)'}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          !americano &&
          t.format !== 'round_robin' && (
            <p className="text-sm text-gray-600">No cambió ningún otro partido.</p>
          )
        )}
        {outcome.tournament.status === 'completed' && (
          <Notice tone="info">Era el último partido: el torneo quedó finalizado. Mirá las posiciones finales.</Notice>
        )}
        <div className="flex justify-end">
          <button type="button" className={primaryButton} onClick={onClose}>
            Listo
          </button>
        </div>
      </Dialog>
    )
  }

  return (
    <Dialog
      title={match.status === 'completed' ? 'Corregir resultado' : 'Cargar resultado'}
      onClose={onClose}
      busy={record.isPending}
      wide
    >
      <p className="text-sm text-gray-700">
        <strong>{matchLabel(match, t.matches)}</strong>
      </p>
      <p className="text-sm text-gray-600">
        {one} <span className="text-gray-400">vs</span> {two}
      </p>

      <div className="space-y-2">
        <div className="grid grid-cols-[4rem_1fr_1fr_2rem] gap-2 text-xs text-gray-500">
          <span />
          <span className="truncate">{one}</span>
          <span className="truncate">{two}</span>
          <span />
        </div>
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[4rem_1fr_1fr_2rem] gap-2 items-center">
            <span className="text-sm text-gray-600">{americano ? 'Puntos' : `Set ${i + 1}`}</span>
            <input
              aria-label={`${americano ? 'Puntos' : `Set ${i + 1}`} de ${one}`}
              inputMode="numeric"
              value={r.a}
              onChange={(e) => setCell(i, 'a', e.target.value)}
              className={inputClass}
            />
            <input
              aria-label={`${americano ? 'Puntos' : `Set ${i + 1}`} de ${two}`}
              inputMode="numeric"
              value={r.b}
              onChange={(e) => setCell(i, 'b', e.target.value)}
              className={inputClass}
            />
            {!americano && rows.length > 1 ? (
              <button
                type="button"
                aria-label={`Quitar set ${i + 1}`}
                onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))}
                className="text-gray-400 hover:text-red-600 text-lg leading-none"
              >
                ×
              </button>
            ) : (
              <span />
            )}
          </div>
        ))}
        {!americano && rows.length < 5 && (
          <button
            type="button"
            className="text-sm text-green-700 hover:underline"
            onClick={() => setRows((rs) => [...rs, { a: '', b: '' }])}
          >
            + Agregar set
          </button>
        )}
        <p className="text-xs text-gray-500">
          {americano
            ? 'Puntos de cada lado. Un empate es válido.'
            : 'Games de cada set (por ejemplo 6-4, 3-6, 7-5). Gana quien gana más sets.'}
        </p>
      </div>

      {decision && !decision.tie && (
        <p className="text-sm text-gray-700">
          Gana: <strong>{decision.winner === 1 ? one : two}</strong>
        </p>
      )}
      {decision?.tie && americano && <p className="text-sm text-gray-700">Empate: cada lado suma sus puntos.</p>}
      {needsWinner && (
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium text-gray-700">El marcador está empatado: ¿quién pasa?</legend>
          {(
            [
              ['team1', one],
              ['team2', two],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="winner" checked={winner === value} onChange={() => setWinner(value)} />
              {label}
            </label>
          ))}
        </fieldset>
      )}

      {match.status === 'completed' && lockedBy.length > 0 && (
        <Notice tone="warning">
          Ya se jugó {lockedBy.map((m) => matchLabel(m, t.matches)).join(', ')}, que depende de este partido. Podés
          corregir el marcador, pero no cambiar quién ganó.
        </Notice>
      )}
      {match.status === 'completed' && isElimination(t.format) && lockedBy.length === 0 && (
        <Notice tone="info">
          Si cambiás el ganador, la llave se recalcula: el nuevo ganador reemplaza al anterior en los partidos siguientes.
        </Notice>
      )}

      {formError && <Notice>{formError}</Notice>}
      {record.isError && (
        <Notice>
          {lockedIds ? (
            <>
              <strong>No se puede cambiar el ganador.</strong> Ya se jugó
              {lockedIds.length > 0
                ? ` ${lockedIds
                    .map((id) => t.matches.find((m) => m.id === id))
                    .filter((m): m is ClubTournamentMatch => !!m)
                    .map((m) => matchLabel(m, t.matches))
                    .join(', ')}`
                : ' un partido'}{' '}
              con equipos que vienen de este. Para corregir el ganador primero hay que revisar esos resultados; el
              marcador sí se puede corregir manteniendo el mismo ganador.
            </>
          ) : (
            tournamentErrorMessage(record.error)
          )}
        </Notice>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" className={secondaryButton} onClick={onClose} disabled={record.isPending}>
          Cancelar
        </button>
        <button type="button" className={primaryButton} onClick={submit} disabled={record.isPending}>
          {record.isPending ? 'Guardando...' : 'Guardar resultado'}
        </button>
      </div>
    </Dialog>
  )
}
