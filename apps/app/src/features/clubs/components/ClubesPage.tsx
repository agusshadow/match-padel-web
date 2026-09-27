import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Map, List, Search, Loader2, Building2, ArrowRight } from 'lucide-react'
import { useClubes } from '../hooks/useClubes'
import type { Club } from '../services/clubService'

// Vite bundles Leaflet's default marker icon at paths that break at runtime
// (the CSS references relative image URLs Leaflet's own JS resolves
// differently once bundled) — point them at the CDN copies instead, the
// standard workaround for Leaflet + Vite.
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Buenos Aires city center — reasonable default when the map has no clubs
// to fit yet, or geolocation isn't available/granted.
const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816]

export function ClubesPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'map' | 'list'>('map')
  const [search, setSearch] = useState('')
  const { data, isLoading } = useClubes({ search: search || undefined, limit: 50 })
  const clubs = data?.data ?? []
  const clubsWithLocation = clubs.filter((c) => c.lat != null && c.lng != null)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar club por nombre o ciudad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Map/list toggle */}
          <div className="flex bg-muted rounded-lg p-1 flex-shrink-0">
            <button
              onClick={() => setView('map')}
              aria-label="Ver mapa"
              className={`p-2 rounded-md transition-colors ${
                view === 'map' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <Map size={18} />
            </button>
            <button
              onClick={() => setView('list')}
              aria-label="Ver lista"
              className={`p-2 rounded-md transition-colors ${
                view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {!isLoading && clubs.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm px-4">
          No se encontraron clubes{search ? ` para "${search}"` : ''}.
        </p>
      )}

      {!isLoading && clubs.length > 0 && view === 'map' && (
        <div style={{ height: 'calc(100vh - 12rem)' }}>
          <MapContainer
            center={
              clubsWithLocation.length > 0
                ? [clubsWithLocation[0].lat!, clubsWithLocation[0].lng!]
                : DEFAULT_CENTER
            }
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clubsWithLocation.map((club) => (
              <Marker key={club.id} position={[club.lat!, club.lng!]} icon={markerIcon}>
                <Popup>
                  <div className="space-y-1">
                    <p className="font-semibold">{club.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {club.address}, {club.city}
                    </p>
                    <button
                      onClick={() => navigate(`/clubs/${club.id}`)}
                      className="text-xs font-medium text-primary underline"
                    >
                      Ver club
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {!isLoading && clubs.length > 0 && view === 'list' && (
        <div className="px-4 pb-4 space-y-2">
          {clubs.map((club: Club) => (
            <button
              key={club.id}
              onClick={() => navigate(`/clubs/${club.id}`)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-left"
            >
              {club.logo_url ? (
                <img
                  src={club.logo_url}
                  alt={club.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground text-sm truncate">{club.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {club.address}, {club.city}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {club.courts_count} {club.courts_count === 1 ? 'cancha' : 'canchas'}
                </p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
