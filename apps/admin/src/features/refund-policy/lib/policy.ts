import type { PolicyBelowMinimumDetails, RefundPolicyValues, RefundPolicyViolation } from '@match-padel/types'
import { getErrorCode, getErrorDetails } from '@/lib/errors'

/** Percent as players read it: `50`, `33.33`; never `50.00`. */
export function formatPercent(value: number): string {
  return `${Number(value.toFixed(2))}%`
}

export function formatHours(hours: number): string {
  return `${hours} h`
}

/** What a player gets, in one sentence (the cutoff is inclusive: "X h or more" is full refund). */
export function describePolicy({ hours_before_start: hours, late_refund_percent: percent }: RefundPolicyValues): string {
  if (hours === 0) {
    return 'Si el jugador cancela antes de que empiece el turno recibe el 100%; una vez empezado el turno, 0%.'
  }
  return `Si el jugador cancela con ${formatHours(hours)} o más de anticipación recibe el 100%; con menos, recibe ${formatPercent(percent)}; una vez empezado el turno, 0%.`
}

export const FIELD_LABELS: Record<RefundPolicyViolation, string> = {
  hours_before_start: 'Horas de anticipación',
  late_refund_percent: 'Devolución fuera de plazo',
}

/** Message under a field that breaks a platform limit. */
export function limitMessage(field: RefundPolicyViolation, limits: PolicyBelowMinimumDetails['limits']): string {
  return field === 'hours_before_start'
    ? `La plataforma permite como máximo ${formatHours(limits.max_hours_before_start)} de anticipación.`
    : `La plataforma exige devolver al menos el ${formatPercent(limits.min_late_refund_percent)}.`
}

/** Fields of a local policy that break the limits (same rule as the API). */
export function violationsOf(policy: RefundPolicyValues, limits: PolicyBelowMinimumDetails['limits']): RefundPolicyViolation[] {
  const out: RefundPolicyViolation[] = []
  if (policy.hours_before_start > limits.max_hours_before_start) out.push('hours_before_start')
  if (policy.late_refund_percent < limits.min_late_refund_percent) out.push('late_refund_percent')
  return out
}

/** `details` of a 409 `POLICY_BELOW_PLATFORM_MINIMUM`, or `null` for any other error. */
export function policyBelowMinimum(error: unknown): PolicyBelowMinimumDetails | null {
  if (getErrorCode(error) !== 'POLICY_BELOW_PLATFORM_MINIMUM') return null
  const d = getErrorDetails(error)
  if (!d || typeof d !== 'object') return null
  const { limits, requested, violations } = d as Partial<PolicyBelowMinimumDetails>
  if (!limits || !requested || !Array.isArray(violations)) return null
  return { limits, requested, violations }
}
