import type { ClubStatus } from '@match-padel/types'
import { StatusBadge } from '@match-padel/ui'
import { CLUB_STATUS_LABELS, CLUB_STATUS_TONES } from '../permissions'

export function ClubStatusBadge({ status }: { status: ClubStatus }) {
  return <StatusBadge label={CLUB_STATUS_LABELS[status]} tone={CLUB_STATUS_TONES[status]} />
}
