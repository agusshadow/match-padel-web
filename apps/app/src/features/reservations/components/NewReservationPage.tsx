import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Search, Check, Loader2, ChevronLeft, Building2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useClubes, useClubById, useClubAvailability, useClubPaymentsEnabled, useClubRefundPolicy } from '../../clubs/hooks/useClubes'
import { useCreateReservation } from '../hooks/useReservations'
import { useReservationStore } from '../store/reservationStore'
import type { ClubAvailabilityCourt, ClubAvailabilitySlot } from '../../clubs/services/clubService'
import { bookingErrorMessage } from '../../../lib/booking-errors'
import { PaymentsDisabledNotice } from '../../../shared/components/PaymentsDisabledNotice'
import { RefundPolicyNotice } from '../../../shared/components/RefundPolicyNotice'

const DAY_LABELS = ['Hoy', 'Mañana']

// 5 day tabs starting today — the reservation window that matters in
// practice is a few days out, a date picker is more friction than it's worth.
function getDayTabs(): { label: string; date: string }[] {
  const days: { label: string; date: string }[] = []
  for (let i = 0; i < 5; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const label =
      DAY_LABELS[i] ??
      d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
    days.push({ label, date: d.toISOString().slice(0, 10) })
  }
  return days
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function money(value: number): string {
  return `$${value.toLocaleString('es-AR')}`
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
    </div>
  )
}

// ---- Step 2: Select Date + Time Slot, then Court ----
// Time first, court second: the player cares about when they can play, not
// which specific court — the court (and its exact price) only matters once
// a time is chosen. See Trello card #47.
function StepSelectSlot({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()
  const {
    selectedClubId,
    selectedClubName,
    selectedDate,
    selectedSlot,
    selectedCourtId,
    setDate,
    setSlot,
    setCourt,
  } = useReservationStore()

  const [dayTabs] = useState(getDayTabs)
  const activeDate = selectedDate ?? dayTabs[0].date

  // "Hoy" is the active tab by default without the user tapping it — write
  // that default into the store too, or selectedDate stays null and the
  // confirm step's summary shows a blank date.
  useEffect(() => {
    if (!selectedDate) setDate(dayTabs[0].date)
  }, [selectedDate, dayTabs, setDate])

  const { data: slots, isLoading: loadingSlots } = useClubAvailability(
    selectedClubId,
    activeDate,
  )
  // A club that cannot take online payments yet: free slots stay bookable, priced ones do not.
  const paymentsEnabled = useClubPaymentsEnabled(selectedClubId, activeDate)
  const selectedCourtPrice = selectedSlot?.courts.find((c) => c.court_id === selectedCourtId)?.price ?? 0
  const blockedByPayments = !paymentsEnabled && selectedCourtPrice > 0

  return (
    <div className="space-y-5">
      {/* Club info */}
      <p className="text-sm text-muted-foreground">
        {t('reservations.club')}: <span className="font-medium text-foreground">{selectedClubName}</span>
      </p>

      {!paymentsEnabled && <PaymentsDisabledNotice />}

      {/* Day tabs */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">{t('reservations.day')}</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dayTabs.map((day) => (
            <button
              key={day.date}
              onClick={() => setDate(day.date)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors border ${
                activeDate === day.date
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border text-foreground hover:bg-accent'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time slots for the selected day */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">{t('reservations.slot')}</p>
        {loadingSlots ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : (slots ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t('reservations.noSlots')}
          </p>
        ) : (
          <div className="space-y-2">
            {(slots ?? []).map((slot: ClubAvailabilitySlot) => (
              <button
                key={slot.start_time}
                onClick={() => setSlot(slot)}
                disabled={!paymentsEnabled && slot.min_total_price > 0}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedSlot?.start_time === slot.start_time
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <span className="font-medium text-sm text-foreground">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t('reservations.fromTotal', { price: money(slot.min_total_price) })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Court, chosen from the selected slot's available courts */}
      {selectedSlot && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">{t('reservations.court')}</p>
          <div className="space-y-2">
            {selectedSlot.courts.map((court: ClubAvailabilityCourt) => (
              <button
                key={court.court_id}
                onClick={() => setCourt(court)}
                disabled={!paymentsEnabled && court.price > 0}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedCourtId === court.court_id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{court.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('reservations.courtPriceLine', {
                      surface: t(`clubs.surface.${court.surface}`),
                      rate: money(court.price_per_hour),
                      price: money(court.price),
                    })}
                  </p>
                </div>
                {selectedCourtId === court.court_id && (
                  <Check size={16} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={onNext}
        disabled={!selectedSlot || !selectedCourtId || blockedByPayments}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {t('reservations.continue')}
      </button>
    </div>
  )
}

// ---- Step 3: Confirm ----
function StepConfirm({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const {
    selectedClubId,
    selectedClubName,
    selectedCourt,
    selectedDate,
    selectedSlot,
    notes,
    setNotes,
    resetWizard,
  } = useReservationStore()

  const createMutation = useCreateReservation()
  const paymentsEnabled = useClubPaymentsEnabled(selectedClubId, selectedDate)
  const refundPolicy = useClubRefundPolicy(selectedClubId, selectedDate)

  if (!selectedSlot || !selectedCourt) return null
  const blockedByPayments = !paymentsEnabled && selectedCourt.price > 0

  // The price is the slot's total as the API computed it (price rules included); never rate x duration.
  const durationMinutes = Math.round(
    (new Date(selectedSlot.end_time).getTime() - new Date(selectedSlot.start_time).getTime()) / 60_000,
  )

  const handleConfirm = () => {
    createMutation.mutate(
      {
        court_id: selectedCourt.court_id,
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
        <h3 className="font-semibold text-foreground">{t('reservations.summary')}</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('reservations.club')}</span>
            <span className="font-medium text-foreground">{selectedClubName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('reservations.court')}</span>
            <span className="font-medium text-foreground">{selectedCourt.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('reservations.date')}</span>
            <span className="font-medium text-foreground">{selectedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('reservations.slot')}</span>
            <span className="font-medium text-foreground">
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('reservations.duration')}</span>
            <span className="font-medium text-foreground">
              {t('reservations.durationMinutes', { count: durationMinutes })}
            </span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-semibold text-foreground">{t('reservations.total')}</span>
            <span className="font-bold text-foreground text-base">
              {money(selectedCourt.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {t('reservations.notes')}
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t('reservations.notesPlaceholder')}
          rows={3}
          maxLength={500}
          className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <RefundPolicyNotice policy={refundPolicy} />

      {blockedByPayments && <PaymentsDisabledNotice />}

      {createMutation.isError && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg px-4 py-3">
          {bookingErrorMessage(createMutation.error, t)}
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={createMutation.isPending || blockedByPayments}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {createMutation.isPending && <Loader2 size={16} className="animate-spin" />}
        {t('reservations.confirmBooking')}
      </button>
    </div>
  )
}

// ---- Main Page ----
const STEPS = ['Elegir club', 'Elegir turno', 'Confirmar']

export function NewReservationPage() {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { resetWizard, setClub, selectedClubId } = useReservationStore()

  // Arriving from a club's detail page ("Reservar cancha") — the club is
  // already known, so skip straight to step 1 instead of the club list.
  const [searchParams] = useSearchParams()
  const preselectedClubId = searchParams.get('clubId')
  const { data: preselectedClub } = useClubById(
    preselectedClubId && preselectedClubId !== selectedClubId ? preselectedClubId : null,
  )

  useEffect(() => {
    if (preselectedClub && preselectedClub.id !== selectedClubId) {
      setClub(preselectedClub.id, preselectedClub.name)
      setStep(1)
    }
  }, [preselectedClub, selectedClubId, setClub])

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
          <StepSelectSlot onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepConfirm onBack={() => setStep(1)} />
        )}
      </div>
    </div>
  )
}
