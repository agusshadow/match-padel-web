import { Navigate } from 'react-router-dom'
import { useCurrentClub } from '../club-context'
import { clubHomePath } from '../permissions'

/** `/:clubId` opens the dashboard of an approved club and the application of any other. */
export function ClubIndexRedirect() {
  const club = useCurrentClub()
  return <Navigate to={clubHomePath(club)} replace />
}
