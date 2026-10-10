import { useState } from 'react'
import type { CourtPriceRules, PriceRuleInput } from '@match-padel/types'
import { Notice, formatMoney } from '@match-padel/ui'
import { CLOSE_TIMES, DAY_NAMES, DAY_ORDER, DAY_SHORT, OPEN_TIMES, daysLabel, overlaps, toMinutes, withValue } from '../lib/time'
import { inputClass } from '../lib/styles'
import { usePriceRules, useReplacePriceRules } from '../hooks/useCourts'
import { ErrorNotice, ProblemNotice } from './ProblemList'
import { PrimaryButton, TimeSelect } from './ui'

const MAX_RULES = 30

/** The form keeps numbers as text so a half-typed value does not jump around. */
interface RuleDraft {
  name: string
  days_of_week: number[]
  start_time: string
  end_time: string
  price_per_hour: string
  priority: string
  is_active: boolean
}

const EMPTY_RULE: RuleDraft = {
  name: '',
  days_of_week: [1, 2, 3, 4, 5],
  start_time: '08:00',
  end_time: '18:00',
  price_per_hour: '',
  priority: '0',
  is_active: true,
}

function parsePriority(v: string): number {
  return v.trim() === '' ? 0 : Number(v)
}

/** Blocking problems: what the API would answer 400 to (single-rule schema and same-priority ties). */
function validate(rules: RuleDraft[]): string[] {
  const problems: string[] = []
  if (rules.length > MAX_RULES) problems.push(`Máximo ${MAX_RULES} franjas.`)
  rules.forEach((r, i) => {
    const label = r.name.trim() || `Franja ${i + 1}`
    if (r.name.trim() === '') problems.push(`Franja ${i + 1}: falta el nombre.`)
    else if (r.name.trim().length > 60) problems.push(`${label}: el nombre admite hasta 60 caracteres.`)
    if (r.days_of_week.length === 0) problems.push(`${label}: elegí al menos un día.`)
    if (toMinutes(r.start_time) >= toMinutes(r.end_time)) problems.push(`${label}: el inicio tiene que ser anterior al fin.`)
    const price = Number(r.price_per_hour)
    if (r.price_per_hour.trim() === '' || Number.isNaN(price) || price <= 0 || price > 10_000_000) {
      problems.push(`${label}: el precio por hora tiene que ser mayor a 0.`)
    }
    const priority = parsePriority(r.priority)
    if (!Number.isInteger(priority) || priority < -100 || priority > 100) {
      problems.push(`${label}: la prioridad es un entero entre -100 y 100.`)
    }
  })
  for (const [a, b] of overlappingPairs(rules)) {
    if (parsePriority(a.priority) === parsePriority(b.priority)) {
      problems.push(
        `"${a.name.trim() || 'Franja'}" y "${b.name.trim() || 'Franja'}" se superponen con la misma prioridad (${parsePriority(a.priority)}): dales prioridades distintas.`,
      )
    }
  }
  return problems
}

function overlappingPairs(rules: RuleDraft[]): Array<[RuleDraft, RuleDraft]> {
  const pairs: Array<[RuleDraft, RuleDraft]> = []
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const a = rules[i]
      const b = rules[j]
      if (!a.is_active || !b.is_active) continue
      if (!a.days_of_week.some((d) => b.days_of_week.includes(d))) continue
      if (overlaps(toMinutes(a.start_time), toMinutes(a.end_time), toMinutes(b.start_time), toMinutes(b.end_time))) {
        pairs.push([a, b])
      }
    }
  }
  return pairs
}

function toDrafts(data: CourtPriceRules): RuleDraft[] {
  return data.rules.map((r) => ({
    name: r.name,
    days_of_week: [...r.days_of_week],
    start_time: r.start_time,
    end_time: r.end_time,
    price_per_hour: String(r.price_per_hour),
    priority: String(r.priority),
    is_active: r.is_active,
  }))
}

function toBody(rules: RuleDraft[]): PriceRuleInput[] {
  return rules.map((r) => ({
    name: r.name.trim(),
    days_of_week: [...r.days_of_week].sort((a, b) => a - b),
    start_time: r.start_time,
    end_time: r.end_time,
    price_per_hour: Number(r.price_per_hour),
    priority: parsePriority(r.priority),
    is_active: r.is_active,
  }))
}

function PricesEditor({
  clubId,
  courtId,
  data,
  editable,
}: {
  clubId: string
  courtId: string
  data: CourtPriceRules
  editable: boolean
}) {
  const save = useReplacePriceRules(clubId, courtId)
  const [rules, setRules] = useState<RuleDraft[]>(() => toDrafts(data))
  const [problems, setProblems] = useState<string[]>([])

  const change = (next: RuleDraft[]) => {
    setRules(next)
    setProblems([])
    save.reset()
  }
  const patch = (index: number, p: Partial<RuleDraft>) => change(rules.map((r, i) => (i === index ? { ...r, ...p } : r)))

  // Overlaps with different priorities are valid (the higher priority wins); say so instead of leaving it implicit.
  const hints = overlappingPairs(rules)
    .filter(([a, b]) => parsePriority(a.priority) !== parsePriority(b.priority))
    .map(([a, b]) => {
      const [winner, loser] = parsePriority(a.priority) > parsePriority(b.priority) ? [a, b] : [b, a]
      return `"${winner.name.trim() || 'Franja'}" y "${loser.name.trim() || 'Franja'}" se superponen: donde coinciden se aplica "${winner.name.trim() || 'Franja'}" por tener mayor prioridad.`
    })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const invalid = validate(rules)
    setProblems(invalid)
    if (invalid.length === 0) save.mutate({ rules: toBody(rules) })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Notice tone="info">
        Precio base de la cancha: <strong>{formatMoney(data.base_price_per_hour)}</strong> por hora. Se cobra en los
        turnos que ninguna franja cubre. Se edita desde la lista de canchas.
      </Notice>
      {save.isError && <ErrorNotice error={save.error} />}
      <ProblemNotice problems={problems} />
      {hints.length > 0 && (
        <Notice tone="warning">
          <ul className="list-disc pl-5 space-y-0.5">
            {hints.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Notice>
      )}
      <p className="text-sm text-gray-500">
        Cada turno se cobra según la franja que cubre su hora de inicio: precio por hora x duración del turno. Si
        varias franjas coinciden gana la de mayor prioridad.
      </p>

      {rules.length === 0 && <p className="text-sm text-gray-400">Sin franjas: todos los turnos usan el precio base.</p>}
      <ul className="space-y-3">
        {rules.map((rule, index) => (
          <li key={index} className="border border-gray-200 rounded-lg bg-white p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`rule-name-${index}`}>
                  Nombre
                </label>
                <input
                  id={`rule-name-${index}`}
                  disabled={!editable}
                  value={rule.name}
                  maxLength={60}
                  placeholder="Noche de semana"
                  onChange={(e) => patch(index, { name: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`rule-price-${index}`}>
                  Precio por hora ($)
                </label>
                <input
                  id={`rule-price-${index}`}
                  disabled={!editable}
                  inputMode="decimal"
                  value={rule.price_per_hour}
                  onChange={(e) => patch(index, { price_per_hour: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1" htmlFor={`rule-prio-${index}`}>
                  Prioridad
                </label>
                <input
                  id={`rule-prio-${index}`}
                  disabled={!editable}
                  inputMode="numeric"
                  value={rule.priority}
                  onChange={(e) => patch(index, { priority: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {DAY_ORDER.map((d) => (
                <label key={d} className="flex items-center gap-1 text-gray-700">
                  <input
                    type="checkbox"
                    disabled={!editable}
                    checked={rule.days_of_week.includes(d)}
                    onChange={(e) =>
                      patch(index, {
                        days_of_week: e.target.checked
                          ? [...rule.days_of_week, d]
                          : rule.days_of_week.filter((x) => x !== d),
                      })
                    }
                    aria-label={DAY_NAMES[d]}
                  />
                  {DAY_SHORT[d]}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <TimeSelect
                label="Desde"
                disabled={!editable}
                value={rule.start_time}
                options={withValue(OPEN_TIMES, rule.start_time)}
                onChange={(v) => patch(index, { start_time: v })}
              />
              <span className="text-gray-400 text-sm">a</span>
              <TimeSelect
                label="Hasta"
                disabled={!editable}
                value={rule.end_time}
                options={withValue(CLOSE_TIMES, rule.end_time)}
                onChange={(v) => patch(index, { end_time: v })}
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 ml-2">
                <input
                  type="checkbox"
                  disabled={!editable}
                  checked={rule.is_active}
                  onChange={(e) => patch(index, { is_active: e.target.checked })}
                />
                Activa
              </label>
              <span className="text-xs text-gray-400 ml-auto">{daysLabel(rule.days_of_week)}</span>
              {editable && (
                <button
                  type="button"
                  onClick={() => change(rules.filter((_, i) => i !== index))}
                  className="text-xs text-red-600 underline"
                >
                  Quitar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editable && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={rules.length >= MAX_RULES}
            onClick={() => change([...rules, { ...EMPTY_RULE, price_per_hour: String(data.base_price_per_hour) }])}
            className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            + Agregar franja
          </button>
          <PrimaryButton type="submit" disabled={save.isPending}>
            {save.isPending ? 'Guardando...' : 'Guardar precios'}
          </PrimaryButton>
          {save.isSuccess && !save.isPending && <span className="text-xs text-green-700">Precios guardados</span>}
        </div>
      )}
    </form>
  )
}

export function PricesTab({ clubId, courtId, editable }: { clubId: string; courtId: string; editable: boolean }) {
  const prices = usePriceRules(clubId, courtId)
  if (prices.isLoading) return <p className="text-sm text-gray-400">Cargando precios...</p>
  if (prices.isError) return <ErrorNotice error={prices.error} />
  if (!prices.data) return null
  return <PricesEditor key={courtId} clubId={clubId} courtId={courtId} data={prices.data} editable={editable} />
}
