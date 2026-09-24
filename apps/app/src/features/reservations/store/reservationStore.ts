import { create } from 'zustand'
import type { Court } from '../../clubs/services/clubService'
import type { TimeSlot } from '../services/reservationService'

interface ReservationWizardState {
  // Step 1: Club
  selectedClubId: string | null
  selectedClubName: string | null
  // Step 2: Court + date + slot
  selectedCourtId: string | null
  selectedCourt: Court | null
  selectedDate: string | null // YYYY-MM-DD
  selectedSlot: TimeSlot | null
  // Step 3: Notes
  notes: string

  // Actions
  setClub: (id: string, name: string) => void
  setCourt: (court: Court) => void
  setDate: (date: string) => void
  setSlot: (slot: TimeSlot) => void
  setNotes: (notes: string) => void
  resetWizard: () => void
}

const initialState = {
  selectedClubId: null,
  selectedClubName: null,
  selectedCourtId: null,
  selectedCourt: null,
  selectedDate: null,
  selectedSlot: null,
  notes: '',
}

export const useReservationStore = create<ReservationWizardState>((set) => ({
  ...initialState,

  setClub: (id, name) =>
    set({
      selectedClubId: id,
      selectedClubName: name,
      // Reset downstream selections when club changes
      selectedCourtId: null,
      selectedCourt: null,
      selectedDate: null,
      selectedSlot: null,
    }),

  setCourt: (court) =>
    set({
      selectedCourtId: court.id,
      selectedCourt: court,
      // Reset slot when court changes
      selectedDate: null,
      selectedSlot: null,
    }),

  setDate: (date) =>
    set({
      selectedDate: date,
      selectedSlot: null, // Reset slot when date changes
    }),

  setSlot: (slot) => set({ selectedSlot: slot }),

  setNotes: (notes) => set({ notes }),

  resetWizard: () => set(initialState),
}))
