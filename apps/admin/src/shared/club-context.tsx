import { createContext, useContext } from 'react'
import type { ClubAccess } from '@match-padel/types'

const CurrentClubContext = createContext<ClubAccess | null>(null)

export const CurrentClubProvider = CurrentClubContext.Provider

/** The club selected in the URL (`/:clubId/...`), with the user's role in it. */
export function useCurrentClub(): ClubAccess {
  const club = useContext(CurrentClubContext)
  if (!club) throw new Error('useCurrentClub must be used inside a club route')
  return club
}
