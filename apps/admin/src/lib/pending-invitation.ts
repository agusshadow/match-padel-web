import { useState } from 'react'
import type { InvitableRole } from '@match-padel/types'

/**
 * The invitation the person is in the middle of accepting. It lives in `sessionStorage` (this tab only,
 * gone when it closes) so the token is not carried through the login / register URLs and can be taken
 * out of the address bar as soon as `/invite` opens. Never log it or send it to analytics.
 */
export interface PendingInvitation {
  token: string
  /** `club` query param of the email link (a hint; the API answers the real club on accept). */
  clubId: string | null
  /** Filled in once the preview loaded, so login and register can say what the person is joining. */
  context?: { clubName: string; role: InvitableRole; emailHint: string }
}

const KEY = 'match-padel-pending-invitation'

export function readPendingInvitation(): PendingInvitation | null {
  try {
    const raw = window.sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'token' in parsed && typeof parsed.token === 'string') {
      return parsed as PendingInvitation
    }
  } catch {
    // Storage blocked or corrupt: behave as if there is no pending invitation.
  }
  return null
}

export function savePendingInvitation(invitation: PendingInvitation): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(invitation))
  } catch {
    // Without storage the person can still accept on this page, but login/register cannot resume it.
  }
}

export function clearPendingInvitation(): void {
  try {
    window.sessionStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}

/** Where to go after signing in or registering: back to the invitation when one is pending, else the root. */
export function postAuthPath(): string {
  return readPendingInvitation() ? '/invite' : '/'
}

/** The pending invitation of this tab, read once per mount (login and register use it for their copy). */
export function usePendingInvitation(): PendingInvitation | null {
  const [pending] = useState(readPendingInvitation)
  return pending
}
