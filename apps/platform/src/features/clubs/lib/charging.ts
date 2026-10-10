import type { CollectionMode } from '@match-padel/types'

export const COLLECTION_MODES: CollectionMode[] = ['platform_account', 'club_account']

export const COLLECTION_MODE_LABELS: Record<CollectionMode, string> = {
  platform_account: 'Cuenta de la plataforma',
  club_account: 'Cuenta del club',
}

export const COLLECTION_MODE_HINTS: Record<CollectionMode, string> = {
  platform_account:
    'Los cobros van a la cuenta de Mercado Pago de la plataforma, sin comisión: el club no recibe el dinero directamente.',
  club_account:
    'Los cobros van a la cuenta de Mercado Pago del club y llevan la comisión configurada. El club tiene que vincular su cuenta.',
}

/** Explains what changes when the mode is switched to `mode`. */
export const COLLECTION_MODE_CONFIRMATION: Record<CollectionMode, string> = {
  platform_account:
    'Desde ahora los cobros de este club se acreditan en la cuenta de la plataforma, sin comisión. Los pagos ya hechos no cambian.',
  club_account:
    'Desde ahora los cobros se acreditan en la cuenta de Mercado Pago del club y llevan la comisión configurada. El club tiene que tener su cuenta vinculada: mientras no lo esté (o si el vínculo vence), las reservas y los partidos con precio quedan bloqueados para los jugadores.',
}

/**
 * Parses a commission typed by the user (`12,5` or `12.5`). Mirrors the API rule: 0..100, at most
 * 2 decimals. Returns the value or an error message.
 */
export function parseCommission(raw: string): { value: number } | { error: string } {
  const text = raw.trim().replace(',', '.')
  if (text === '') return { error: 'Ingresá un porcentaje.' }
  if (!/^\d+(\.\d+)?$/.test(text)) return { error: 'Ingresá un número válido.' }
  const value = Number(text)
  if (value < 0 || value > 100) return { error: 'El porcentaje debe estar entre 0 y 100.' }
  if (Math.round(value * 100) / 100 !== value) return { error: 'Usá hasta 2 decimales.' }
  return { value }
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`
}
