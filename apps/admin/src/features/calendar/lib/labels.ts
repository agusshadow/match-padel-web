import type { CalendarPaymentStatus, CalendarReservation } from '@match-padel/types'
import type { StatusTone } from '@match-padel/ui'

export const PAYMENT_LABELS: Record<CalendarPaymentStatus, string> = {
  unpaid: 'Sin pago',
  partial: 'Pago parcial',
  paid: 'Pagada',
  refunded: 'Reembolsada',
}

export const PAYMENT_TONES: Record<CalendarPaymentStatus, StatusTone> = {
  unpaid: 'red',
  partial: 'orange',
  paid: 'green',
  refunded: 'gray',
}

/** Tailwind classes of a reservation block by status (background, border and text). */
export const RESERVATION_BLOCK_CLASSES: Record<CalendarReservation['status'], string> = {
  pending: 'bg-yellow-100 border-yellow-400 text-yellow-900',
  confirmed: 'bg-green-100 border-green-500 text-green-900',
  completed: 'bg-slate-200 border-slate-400 text-slate-800',
}

export function matchLabel(match: NonNullable<CalendarReservation['match']>): string {
  if (match.type === 'tournament') return 'Torneo'
  return match.is_ranked || match.type === 'ranked' ? 'Rankeado' : 'Amistoso'
}

/** `1 h 30 min` */
export function durationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}
