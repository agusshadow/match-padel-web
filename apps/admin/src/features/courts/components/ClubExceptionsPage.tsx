import { Link } from 'react-router-dom'
import { Notice, PageHeader } from '@match-padel/ui'
import { getErrorMessage } from '@/lib/errors'
import { useCurrentClub } from '@/shared/club-context'
import { useClubCourts } from '../hooks/useCourts'
import { ExceptionsPanel } from './ExceptionsPanel'

export function ClubExceptionsPage() {
  const club = useCurrentClub()
  const courts = useClubCourts(club.clubId)
  return (
    <div className="space-y-6">
      <div className="text-sm">
        <Link to={`/${club.clubId}/courts`} className="text-green-700 hover:underline">
          Canchas
        </Link>
      </div>
      <PageHeader
        title="Excepciones del club"
        subtitle="Feriados, cierres y horarios especiales de todo el club o de una cancha"
      />
      {courts.isError && <Notice>{getErrorMessage(courts.error)}</Notice>}
      <ExceptionsPanel clubId={club.clubId} courts={courts.data ?? []} editable />
    </div>
  )
}
