import { useNavigate, useParams } from 'react-router-dom'
import { ChevronLeft, Loader2, Building2, MapPin } from 'lucide-react'
import { useClubById } from '../hooks/useClubes'
import type { Court } from '../services/clubService'

function surfaceLabel(surface: string): string {
  return surface === 'indoor' ? 'Cubierta' : surface === 'outdoor' ? 'Descubierta' : 'Panorámica'
}

export function ClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: club, isLoading } = useClubById(id ?? null)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-semibold text-foreground truncate">{club?.name ?? 'Club'}</h1>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {!isLoading && !club && (
        <p className="text-center text-muted-foreground py-16 text-sm">No se encontró el club.</p>
      )}

      {club && (
        <div className="pb-10">
          {/* Cover photo */}
          {club.cover_url ? (
            <img
              src={club.cover_url}
              alt={club.name}
              className="w-full h-44 object-cover"
            />
          ) : (
            <div className="w-full h-44 bg-primary/10 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-primary" />
            </div>
          )}

          <div className="p-4 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">{club.name}</h2>
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin size={14} className="flex-shrink-0" />
                {club.address}, {club.city}
              </p>
            </div>

            {club.description && (
              <p className="text-sm text-foreground leading-relaxed">{club.description}</p>
            )}

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Canchas</h3>
              <div className="space-y-2">
                {club.courts.map((court: Court) => (
                  <div
                    key={court.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-card"
                  >
                    <p className="font-medium text-sm text-foreground">{court.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {surfaceLabel(court.surface)} · ${court.price_per_hour.toLocaleString('es-AR')}/hora
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate(`/reservations/new?clubId=${club.id}`)}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Reservar cancha
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
