import type { ClubRole, ClubStatus, ReservationStatus } from '@match-padel/types'
import type { StatusTone } from '@match-padel/ui'

export const CLUB_ROLE_LABELS: Record<ClubRole, string> = {
  owner: 'Dueño',
  admin: 'Administrador',
  staff: 'Recepción',
  superadmin: 'Superadmin',
}

/** Owner, administrator and superadmin manage the club; reception only operates reservations. */
export function canManageClub(role: ClubRole): boolean {
  return role === 'owner' || role === 'admin' || role === 'superadmin'
}

/** The Mercado Pago account is the owner's (and a superadmin's): administrators and reception never see it. */
export function canLinkMercadoPago(role: ClubRole): boolean {
  return role === 'owner' || role === 'superadmin'
}

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
}

export const RESERVATION_STATUS_TONES: Record<ReservationStatus, StatusTone> = {
  pending: 'yellow',
  confirmed: 'green',
  cancelled: 'red',
  completed: 'gray',
}

export const CLUB_STATUS_LABELS: Record<ClubStatus, string> = {
  draft: 'Borrador',
  pending: 'En revisión',
  changes_requested: 'Correcciones solicitadas',
  approved: 'Aprobado',
  rejected: 'Rechazado',
  suspended: 'Suspendido',
}

export const CLUB_STATUS_TONES: Record<ClubStatus, StatusTone> = {
  draft: 'gray',
  pending: 'yellow',
  changes_requested: 'orange',
  approved: 'green',
  rejected: 'red',
  suspended: 'purple',
}

/** The dashboard, reservations and the rest of the panel are only available once the club is approved. */
export function isClubLive(status: ClubStatus): boolean {
  return status === 'approved'
}

/** Where a club opens: the dashboard when approved, the application otherwise. */
export function clubHomePath(club: { clubId: string; status: ClubStatus }): string {
  return `/${club.clubId}/${isClubLive(club.status) ? 'dashboard' : 'onboarding'}`
}
