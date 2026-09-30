import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Search, Check, Loader2, ChevronLeft, Building2, Swords, Trophy } from 'lucide-react'
import { useClubes, useClubAvailability } from '../../clubs/hooks/useClubes'
import { useCreateMatch } from '../hooks/useMatches'
import { useNewMatchStore } from '../store/newMatchStore'
import type { ClubAvailabilityCourt, ClubAvailabilitySlot } from '../../clubs/services/clubService'

const DAY_LABELS = ['Hoy', 'Mañana']

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

function surfaceLabel(surface: string): string {
  return surface === 'indoor' ? 'Cubierta' : surface === 'outdoor' ? 'Descubierta' : 'Panorámica'
}

// ---- Step 1: Select Club ----
function StepSelectClub({ onNext }: { onNext: () => void }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useClubes({ search: search || undefined, limit: 30 })
  const { setClub, selectedClubId } = useNewMatchStore()
  const clubs = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={t('clubs.searchPlaceholder')}
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
          {search ? t('clubs.noResultsFor', { search }) : t('clubs.noResults')}
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
              <img src={club.logo_url} alt={club.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm truncate">{club.name}</p>
              <p className="text-xs text-muted-foreground truncate">{club.address}, {club.city}</p>
            </div>
            <ArrowRight size={16} className="text-muted-foreground flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ---- Step 2: Select Date + Time Slot, then Court ----
function StepSelectSlot({ onNext }: { onNext: () => void }) {
  const {
    selectedClubId,
    selectedClubName,
    selectedDate,
    selectedSlot,
    selectedCourtId,
    setDate,
    setSlot,
    setCourt,
  } = useNewMatchStore()

  const [dayTabs] = useState(getDayTabs)
  const activeDate = selectedDate ?? dayTabs[0].date

  useEffect(() => {
    if (!selectedDate) setDate(dayTabs[0].date)
  }, [selectedDate, dayTabs, setDate])

  const { data: slots, isLoading: loadingSlots } = useClubAvailability(selectedClubId, activeDate)

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Club: <span className="font-medium text-foreground">{selectedClubName}</span>
      </p>

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Día</p>
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

      <div>
        <p className="text-sm font-medium text-foreground mb-2">Horario</p>
        {loadingSlots ? (
          <div className="flex justify-center py-6">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : (slots ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No hay turnos disponibles para este día.</p>
        ) : (
          <div className="space-y-2">
            {(slots ?? []).map((slot: ClubAvailabilitySlot) => (
              <button
                key={slot.start_time}
                onClick={() => setSlot(slot)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                  selectedSlot?.start_time === slot.start_time
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <span className="font-medium text-sm text-foreground">
                  {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                </span>
                <span className="text-xs text-muted-foreground">
                  desde ${slot.min_price.toLocaleString('es-AR')} (1/4: $
                  {Math.round((slot.min_price / 4) * 100) / 100})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedSlot && (
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Cancha</p>
          <div className="space-y-2">
            {selectedSlot.courts.map((court: ClubAvailabilityCourt) => (
              <button
                key={court.court_id}
                onClick={() =>
                  setCourt({
                    id: court.court_id,
                    name: court.name,
                    surface: court.surface,
                    is_indoor: court.is_indoor,
                    price_per_hour: court.price_per_hour,
                    is_active: true,
                  })
                }
                className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                  selectedCourtId === court.court_id
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <div>
                  <p className="font-medium text-sm text-foreground">{court.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {surfaceLabel(court.surface)} · ${court.price_per_hour.toLocaleString('es-AR')}/hora
                  </p>
                </div>
                {selectedCourtId === court.court_id && <Check size={16} className="text-primary flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!selectedSlot || !selectedCourtId}
        className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}

// ---- Step 3: Match type + confirm + pay ----
function StepConfirm() {
  const { t } = useTranslation()
  const {
    selectedClubName,
    selectedCourt,
    selectedSlot,
    type,
    isRanked,
    setType,
    setIsRanked,
    resetWizard,
  } = useNewMatchStore()

  const createMatch = useCreateMatch()

  if (!selectedSlot || !selectedCourt) return null

  const durationMs = new Date(selectedSlot.end_time).getTime() - new Date(selectedSlot.start_time).getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  const totalPrice = Math.round(selectedCourt.price_per_hour * durationHours * 100) / 100
  const share = Math.round((totalPrice / 4) * 100) / 100

  const typeOptions = [
    { value: 'friendly' as const, label: t('matches.type.friendly'), icon: Swords, desc: t('matches.friendlyDesc') },
    { value: 'ranked' as const, label: t('matches.type.ranked'), icon: Trophy, desc: t('matches.rankedDesc') },
  ]

  const handleCreate = async () => {
    const { payment } = await createMatch.mutateAsync({
      type,
      is_ranked: isRanked,
      court_id: selectedCourt.id,
      start_time: selectedSlot.start_time,
      end_time: selectedSlot.end_time,
    })
    resetWizard()
    const url = import.meta.env.PROD ? payment.init_point : payment.sandbox_init_point
    window.location.href = url
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">{t('matches.matchType')}</p>
        <div className="grid grid-cols-2 gap-3">
          {typeOptions.map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              onClick={() => setType(value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                type === value ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <Icon size={24} className={type === value ? 'text-primary' : 'text-muted-foreground'} />
              <p className={`font-semibold mt-2 ${type === value ? 'text-primary' : 'text-foreground'}`}>{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {type === 'friendly' && (
        <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
          <div>
            <p className="font-medium text-foreground text-sm">{t('matches.rankedMatch')}</p>
            <p className="text-xs text-muted-foreground">{t('matches.rankedMatchBody')}</p>
          </div>
          <button
            onClick={() => setIsRanked(!isRanked)}
            className={`w-11 h-6 rounded-full transition-colors relative ${isRanked ? 'bg-primary' : 'bg-muted'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                isRanked ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-foreground">{t('matches.paymentSplitTitle')}</h3>
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
            <span className="text-muted-foreground">Horario</span>
            <span className="font-medium text-foreground">
              {formatTime(selectedSlot.start_time)} – {formatTime(selectedSlot.end_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('matches.totalCourtPrice')}</span>
            <span className="font-medium text-foreground">${totalPrice.toLocaleString('es-AR')}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-semibold text-foreground">{t('matches.yourShare')}</span>
            <span className="font-bold text-foreground text-base">${share.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground space-y-1">
        <p>{t('matches.createInfoLobby')}</p>
        <p>{t('matches.createInfoSplitPayment')}</p>
      </div>

      {createMatch.isError && (
        <p className="text-center text-sm text-destructive">{t('matches.createError')}</p>
      )}

      <button
        onClick={handleCreate}
        disabled={createMatch.isPending}
        className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
      >
        {createMatch.isPending && <Loader2 size={16} className="animate-spin" />}
        {createMatch.isPending ? t('matches.creating') : t('matches.createAndPay', { amount: share.toLocaleString('es-AR') })}
      </button>
    </div>
  )
}

// ---- Main Page ----
export function NewMatchPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const { resetWizard } = useNewMatchStore()

  const steps = [t('clubs.title'), t('reservations.time'), t('matches.matchType')]

  const handleBack = () => {
    if (step === 0) {
      resetWizard()
      navigate(-1)
    } else {
      setStep((s) => s - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={handleBack} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {t('reservations.new')} · {step + 1}/{steps.length}
            </p>
            <h1 className="font-semibold text-foreground">{steps[step]}</h1>
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4 pb-10">
        {step === 0 && <StepSelectClub onNext={() => setStep(1)} />}
        {step === 1 && <StepSelectSlot onNext={() => setStep(2)} />}
        {step === 2 && <StepConfirm />}
      </div>
    </div>
  )
}
