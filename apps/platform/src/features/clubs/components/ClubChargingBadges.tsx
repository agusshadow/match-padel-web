import type { ClubChargingSettings } from '@match-padel/types'
import { StatusBadge } from '@match-padel/ui'
import { COLLECTION_MODE_LABELS } from '../lib/charging'

/** Collection mode and Mercado Pago link of a club, as badges. */
export function ClubChargingBadges({ club }: { club: ClubChargingSettings }) {
  const blocked = club.collection_mode === 'club_account' && !club.mp_connected
  return (
    <div className="flex flex-wrap gap-1">
      <StatusBadge
        label={COLLECTION_MODE_LABELS[club.collection_mode]}
        tone={club.collection_mode === 'club_account' ? 'blue' : 'gray'}
      />
      <StatusBadge
        label={club.mp_connected ? 'MP vinculado' : 'MP sin vincular'}
        tone={club.mp_connected ? 'green' : blocked ? 'red' : 'gray'}
      />
    </div>
  )
}
