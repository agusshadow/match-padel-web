import type { ClubRole, ReservationStatus } from '@match-padel/types'
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
