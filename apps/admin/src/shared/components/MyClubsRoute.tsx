import { useAccess } from '@/features/auth'
import { MyClubsPage, NewClubPage } from '@/features/my-clubs'

// The access list lives in the `auth` feature; features do not import each other, so these thin
// route elements hand it to the pages as props.
export function MyClubsRoute() {
  const { data: access } = useAccess(true)
  return <MyClubsPage clubs={access?.clubs ?? []} />
}

export function NewClubRoute() {
  const { data: access } = useAccess(true)
  return <NewClubPage hasClubs={(access?.clubs.length ?? 0) > 0} />
}
