import { Navigate } from 'react-router-dom'
import { useAccess } from '@/features/auth'
import { usePanelStore } from '@/store/panel.store'
import { clubHomePath, isClubLive } from '../permissions'

/**
 * `/` goes to the last club used (when still accessible), then to the first approved club, then to the
 * first club. Non-approved clubs open on their application. No clubs at all: start a new application.
 */
export function ClubRedirect() {
  const { data: access } = useAccess(true)
  const lastClubId = usePanelStore((s) => s.lastClubId)
  if (!access) return null

  const target =
    access.clubs.find((c) => c.clubId === lastClubId) ??
    access.clubs.find((c) => isClubLive(c.status)) ??
    access.clubs[0]
  if (!target) return <Navigate to="/new-club" replace />
  return <Navigate to={clubHomePath(target)} replace />
}
