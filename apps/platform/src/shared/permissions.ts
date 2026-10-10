import type { ClubStatus, PlatformRole } from '@match-padel/types'
import type { StatusTone } from '@match-padel/ui'

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  superadmin: 'Superadmin',
  reviewer: 'Revisor',
}

export const CLUB_STATUSES: ClubStatus[] = ['draft', 'pending', 'changes_requested', 'approved', 'rejected', 'suspended']

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

/** Statuses a reviewer can see (the API answers 404/403 for any other). */
export const REVIEWER_STATUSES: ClubStatus[] = ['pending', 'changes_requested']

export function canSeeStatus(role: PlatformRole, status: ClubStatus): boolean {
  return role === 'superadmin' || REVIEWER_STATUSES.includes(status)
}

/** Lifecycle actions of a club, as the API names them (`/platform/applications/:id/*`, `/platform/clubs/:id/*`). */
export type LifecycleAction = 'approve' | 'request-changes' | 'reject' | 'reopen' | 'suspend' | 'unsuspend'

/** Actions available for a club in `status`, for a platform role. The server enforces it too. */
export function availableActions(role: PlatformRole, status: ClubStatus): LifecycleAction[] {
  const actions: LifecycleAction[] = []
  if (status === 'pending') actions.push('approve', 'request-changes', 'reject')
  if (role === 'superadmin') {
    if (status === 'rejected') actions.push('reopen')
    if (status === 'approved') actions.push('suspend')
    if (status === 'suspended') actions.push('unsuspend')
  }
  return actions
}

export interface ActionCopy {
  /** Button label. */
  label: string
  title: string
  description: string
  /** Label of the text field. */
  field: string
  required: boolean
  confirm: string
  success: string
  tone: 'primary' | 'danger'
}

export const ACTION_COPY: Record<LifecycleAction, ActionCopy> = {
  approve: {
    label: 'Aprobar',
    title: 'Aprobar solicitud',
    description: 'El club pasa a estar visible para los jugadores y el dueño recibe un email.',
    field: 'Nota para el dueño (opcional)',
    required: false,
    confirm: 'Aprobar',
    success: 'Solicitud aprobada.',
    tone: 'primary',
  },
  'request-changes': {
    label: 'Pedir correcciones',
    title: 'Pedir correcciones',
    description: 'El dueño podrá editar la solicitud y volver a enviarla. Recibe tus notas por email.',
    field: 'Qué hay que corregir',
    required: true,
    confirm: 'Pedir correcciones',
    success: 'Se pidieron correcciones al dueño.',
    tone: 'primary',
  },
  reject: {
    label: 'Rechazar',
    title: 'Rechazar solicitud',
    description: 'La solicitud queda rechazada y el dueño recibe el motivo por email. Solo un superadmin puede reabrirla.',
    field: 'Motivo del rechazo',
    required: true,
    confirm: 'Rechazar',
    success: 'Solicitud rechazada.',
    tone: 'danger',
  },
  reopen: {
    label: 'Reabrir',
    title: 'Reabrir solicitud',
    description: 'La solicitud vuelve a borrador para que el dueño la corrija y la envíe de nuevo.',
    field: 'Nota (opcional)',
    required: false,
    confirm: 'Reabrir',
    success: 'Solicitud reabierta como borrador.',
    tone: 'primary',
  },
  suspend: {
    label: 'Suspender',
    title: 'Suspender club',
    description: 'Los jugadores dejan de ver el club y el dueño recibe el motivo por email.',
    field: 'Motivo de la suspensión',
    required: true,
    confirm: 'Suspender',
    success: 'Club suspendido.',
    tone: 'danger',
  },
  unsuspend: {
    label: 'Reactivar',
    title: 'Reactivar club',
    description: 'El club vuelve a estar aprobado y visible para los jugadores.',
    field: 'Nota (opcional)',
    required: false,
    confirm: 'Reactivar',
    success: 'Club reactivado.',
    tone: 'primary',
  },
}
