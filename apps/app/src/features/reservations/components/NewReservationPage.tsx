import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Check, Loader2, ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClubes } from '../../clubs/hooks/useClubes'
import { useClubCourts } from '../../clubs/hooks/useClubes'
import { useAvailableSlots, useCreateReservation } from '../hooks/useReservations'
import { useReservationStore } from '../store/reservationStore'
import type { Court } from '../../clubs/services/clubService'
import type { TimeSlot } from '../services/reservationService'

// Min date = today, max date = 30 days ahead
function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}
function getMaxDateStr(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// ---- Step 1: Select Club ----
function StepSelectClub({ onNext }: { onNext: () => void }) {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useClubes({ search: search || undefined, limit: 30 })
  const { setClub, selectedClubId } = useReservationStore()
  const clubs = data?.data ?? []

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar club por nombre o ciudad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {!isLoading && clubs.length === 0 && (
        <p className="text-center text-muted-foreground py-8 text-sm">
          No se encontraron clubes{search ? ` para "${search}"` : ''}.
        </p>
      )}

      <div className="space-y-2">
        {clubs.map((club) => (
          <button
            key={club.id}
            onClick={() => {
              setClub(club.id, club.name)
              onNext()
            }}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
              selectedClubId === club.id
                ? 'border-primary bg-primary/5'
                : 'border-border bg-card hover:bg-accent'
            }`}
          >
            {club.logo_url ? (
              <img
                src={club.logo_url}
                alt={club.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🏟️</span>
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
    </div>
  )
}

// ---- Step 2: Select Court + Date + Slot ----
function StepSelectSlot({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const {
    selectedClubId,
    selectedClubName,
    selectedCourtId,
    selectedCourt,
    selectedDate,
    selectedSlot,
    setCourt,
    setDate,
    setSlot,
  } = useReservationStore()

  const { data: courts, isLoading: loadingCourts } = useClubCourts(selectedClubId)
  const { data: slots, isLoading: loadingSlots } = useAvailableSlots(
    selectedCourtId,
    selectedDate,
  )

  const today = getTodayStr()
  const maxDate = getMaxDateStr()

  return (
    <div className="space-y-5">
      {/* Club info */}
      <p className="text-sm text-muted-foreground">
        Club: <span className="font-medium text-foreground">{selectedClubName}</span>
      </p>

      {/* Select Court */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Cancha</p>
        {loadingCourts ? (
          <Loader2 size={20} className="animate-spin text-primary" />
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {(courts ?? []).map((court: Court) => (
              <button
                key={court.id}
                onClick={() => setCourt(court)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                  selectedCourtId === court.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{court.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {court.surface === 'indoor'
                      ? 'Cubierta'
                      : court.surface === 'outdoor'
                      ? 'Descubierta'
                      : 'Panorámica'}{' '}
                    · ${court.price_per_hour.toLocaleString('es-AR')}/hora
                  </p>
                </div>
                {selectedCourtId === court.id && (
                  <Check size={16} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Select Date */}
      {selectedCourtId && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Fecha</p>
          <input
            type="date"
            min={today}
            max={maxDate}
            value={selectedDate ?? ''}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {/* Slot Grid */}
      {selectedCourtId && selectedDate && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Horario disponible</p>
          {loadingSlots ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin text-primary" />
            </div>
          ) : (slots ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay turnos disponibles para esta fecha.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(slots ?? []).map((slot: TimeSlot) => (
                <button
                  key={slot.start_time}
                  onClick={() => slot.available && setSlot(slot)}
                  disabled={!slot.available}
                  className={`py-2.5 px-2 rounded-lg text-xs font-medium transition-colors border ${
                    !slot.available
                      ? 'bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50'
                      : selectedSlot?.start_time === slot.start_time
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border hover:border-primary hover:bg-primary/5 text-foreground'
                  }`}
                >
                  {formatTime(slot.start_time)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!selectedSlot}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

// ---- Step 3: Confirm ----
function StepConfirm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    selectedClubName,
    selectedCourt,
    selectedDate,
    selectedSlot,
    notes,
    setNotes,
    resetWizard,
  } = useReservationStore()

  const createMutation = useCreateReservation()

  if (!selectedSlot || !selectedCourt) return null

  const durationMs =
    new Date(selectedSlot.end_time).getTime() -
    new Date(selectedSlot.start_time).getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  const totalPrice = Math.round(selectedCourt.price_per_hour * durationHours * 100) / 100

  function formatTime(iso: string): string {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  const handleConfirm = () => {
    createMutation.mutate(
      {
        court_id: selectedCourt.id,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          resetWizard()
          navigate('/reservations')
        },
      },
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground">Resumen de tu reserva</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Club</span>
            <span className="font-medium text-foreground">{selectedClubName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cancha</span>
            <span className="font-medium text-foreground">{selectedCourt.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fecha</span>
            <span className="font-medium text-foreground">{selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Horario</span>
            <span className="font-medium text-foreground">
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duración</span>
            <span className="font-medium text-foreground">
              {durationHours === 1 ? '1 hora' : `${durationHours} horas`}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground text-base">
              ${totalPrice.toLocaleString('es-AR')}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          Notas (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ej: somos 4 personas, traemos pelotas..."
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {createMutation.isError && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          {(createMutation.error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? t('common.error')}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={createMutation.isPending}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
        Confirmar reserva
      </button>
    </div>
  )
}

// ---- Main Page ----
const STEPS = ['Elegir club', 'Elegir turno', 'Confirmar']

export function NewReservationPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { resetWizard } = useReservationStore()

  const handleBack = () => {
    if (step === 0) {
      resetWizard()
      navigate('/reservations')
    } else {
      setStep((s) => s - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={handleBack}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Paso {step + 1} de {STEPS.length}</p>
            <h1 className="font-semibold text-foreground">{STEPS[step]}</h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4 pb-10">
        {step === 0 && (
          <StepSelectClub onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepSelectSlot
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepConfirm onBack={() => setStep(1)} />
        )}
      </div>
    </div>
  )
}
