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
