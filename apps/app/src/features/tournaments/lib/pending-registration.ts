/**
 * The public tournament detail only lists CONFIRMED registrations, and no endpoint returns the
 * caller's unpaid one. The registration response (`expires_at`, `init_point`) is therefore kept in the
 * browser so the player can resume the payment or see the deadline after coming back from Mercado Pago.
 */
export interface PendingRegistration {
  tournamentId: string
  teamId: string
  /** ISO instant after which the API releases the place (30 minutes). */
  expiresAt: string | null
  /** Checkout Pro URL (production or sandbox, already chosen). */
  checkoutUrl: string
  amount: number
}

const key = (userId: string, tournamentId: string) => `tournament-pending:${userId}:${tournamentId}`

export function savePendingRegistration(userId: string, value: PendingRegistration): void {
  try {
    localStorage.setItem(key(userId, value.tournamentId), JSON.stringify(value))
  } catch {
    /* storage unavailable: the page falls back to the confirmed list only */
  }
}

export function loadPendingRegistration(userId: string, tournamentId: string): PendingRegistration | null {
  try {
    const raw = localStorage.getItem(key(userId, tournamentId))
    if (!raw) return null
    const v = JSON.parse(raw) as Partial<PendingRegistration>
    if (typeof v.teamId !== 'string' || typeof v.checkoutUrl !== 'string' || typeof v.amount !== 'number') return null
    return {
      tournamentId,
      teamId: v.teamId,
      expiresAt: typeof v.expiresAt === 'string' ? v.expiresAt : null,
      checkoutUrl: v.checkoutUrl,
      amount: v.amount,
    }
  } catch {
    return null
  }
}

export function clearPendingRegistration(userId: string, tournamentId: string): void {
  try {
    localStorage.removeItem(key(userId, tournamentId))
  } catch {
    /* nothing to clear */
  }
}
