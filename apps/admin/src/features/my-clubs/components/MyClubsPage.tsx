import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { ClubAccess } from '@match-padel/types'
import { PageHeader } from '@match-padel/ui'
import { ClubStatusBadge } from '@/shared/components/ClubStatusBadge'
import { CLUB_ROLE_LABELS, clubHomePath } from '@/shared/permissions'

/** Club selector: every club of the user with its status, plus "Agregar otro club". */
export function MyClubsPage({ clubs }: { clubs: ClubAccess[] }) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mis clubes"
        subtitle="Elegí un club para administrarlo o continuar su solicitud."
        actions={
          <Link
            to="/new-club"
            className="flex items-center gap-1 bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Agregar otro club
          </Link>
        }
      />
      {clubs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          Todavía no tenés clubes.
        </div>
      ) : (
        <ul className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {clubs.map((club) => (
            <li key={club.clubId}>
              <Link to={clubHomePath(club)} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{club.name}</p>
                  <p className="text-xs text-gray-400">{CLUB_ROLE_LABELS[club.role]}</p>
                </div>
                <ClubStatusBadge status={club.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
