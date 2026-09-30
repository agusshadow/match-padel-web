import { create } from 'zustand'
import type { Court, ClubAvailabilitySlot } from '../../clubs/services/clubService'

// Card #57: creating a match now needs a club/slot/court just like booking a
// reservation directly. This mirrors reservations/store/reservationStore.ts
// shape-for-shape but stays local to the matches feature — features don't
// import each other's stores.
interface NewMatchWizardState {
  selectedClubId: string | null
  selectedClubName: string | null
  selectedDate: string | null // YYYY-MM-DD
  selectedSlot: ClubAvailabilitySlot | null
  selectedCourtId: string | null
  selectedCourt: Court | null
  type: 'friendly' | 'ranked'
  isRanked: boolean

  setClub: (id: string, name: string) => void
  setDate: (date: string) => void
  setSlot: (slot: ClubAvailabilitySlot) => void
  setCourt: (court: Court) => void
  setType: (type: 'friendly' | 'ranked') => void
  setIsRanked: (isRanked: boolean) => void
  resetWizard: () => void
}

const initialState = {
  selectedClubId: null,
  selectedClubName: null,
  selectedDate: null,
  selectedSlot: null,
  selectedCourtId: null,
  selectedCourt: null,
  type: 'friendly' as const,
  isRanked: false,
}

export const useNewMatchStore = create<NewMatchWizardState>((set) => ({
  ...initialState,

  setClub: (id, name) =>
    set({
      selectedClubId: id,
      selectedClubName: name,
      selectedDate: null,
      selectedSlot: null,
      selectedCourtId: null,
      selectedCourt: null,
    }),

  setDate: (date) =>
    set({ selectedDate: date, selectedSlot: null, selectedCourtId: null, selectedCourt: null }),

  setSlot: (slot) => set({ selectedSlot: slot, selectedCourtId: null, selectedCourt: null }),

  setCourt: (court) => set({ selectedCourtId: court.id, selectedCourt: court }),

  setType: (type) => set({ type, isRanked: type === 'ranked' }),

  setIsRanked: (isRanked) => set({ isRanked }),

  resetWizard: () => set(initialState),
}))
