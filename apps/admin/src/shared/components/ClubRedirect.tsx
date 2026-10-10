import { Navigate } from 'react-router-dom'
import { useAccess } from '@/features/auth'
import { usePanelStore } from '@/store/panel.store'

/** `/` goes to the last club used (when still accessible) or to the first one. */
export function ClubRedirect() {
  const { data: access } = useAccess(true)
  const lastClubId = usePanelStore((s) => s.lastClubId)
  if (!access) return null

  const target = access.clubs.find((c) => c.clubId === lastClubId) ?? access.clubs[0]
  if (!target) return <Navigate to="/login" replace />
  return <Navigate to={`/${target.clubId}/dashboard`} replace />
}
