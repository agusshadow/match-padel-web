import { create } from 'zustand'
import type { Court, ClubAvailabilitySlot } from '../../clubs/services/clubService'

interface ReservationWizardState {
  // Step 1: Club
  selectedClubId: string | null
  selectedClubName: string | null
  // Step 2: Date + time slot (chosen before the court, on purpose — the
  // player cares about the time, not which specific court)
  selectedDate: string | null // YYYY-MM-DD
  selectedSlot: ClubAvailabilitySlot | null
  // Step 2b: Court, chosen from the slot's own available courts
  selectedCourtId: string | null
  selectedCourt: Court | null
  // Step 3: Notes
  notes: string

  // Actions
  setClub: (id: string, name: string) => void
  setDate: (date: string) => void
  setSlot: (slot: ClubAvailabilitySlot) => void
  setCourt: (court: Court) => void
  setNotes: (notes: string) => void
  resetWizard: () => void
}

const initialState = {
  selectedClubId: null,
  selectedClubName: null,
  selectedDate: null,
  selectedSlot: null,
  selectedCourtId: null,
  selectedCourt: null,
  notes: '',
}

export const useReservationStore = create<ReservationWizardState>((set) => ({
  ...initialState,

  setClub: (id, name) =>
    set({
      selectedClubId: id,
      selectedClubName: name,
      // Reset downstream selections when club changes
      selectedDate: null,
      selectedSlot: null,
      selectedCourtId: null,
      selectedCourt: null,
    }),

  setDate: (date) =>
    set({
      selectedDate: date,
      // Reset slot + court when date changes — the previous slot's courts
      // no longer apply to a different day.
      selectedSlot: null,
      selectedCourtId: null,
      selectedCourt: null,
    }),

  setSlot: (slot) =>
    set({
      selectedSlot: slot,
      // Reset court when slot changes — it belonged to the previous slot's
      // court list.
      selectedCourtId: null,
      selectedCourt: null,
    }),

  setCourt: (court) =>
    set({
      selectedCourtId: court.id,
      selectedCourt: court,
    }),

  setNotes: (notes) => set({ notes }),

  resetWizard: () => set(initialState),
}))
