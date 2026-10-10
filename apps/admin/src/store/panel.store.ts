import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PanelState {
  /** Last club the user worked on; `/` redirects to it when it is still accessible. */
  lastClubId: string | null
  setLastClubId: (clubId: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const usePanelStore = create<PanelState>()(
  persist(
    (set) => ({
      lastClubId: null,
      setLastClubId: (lastClubId) => set({ lastClubId }),
      sidebarOpen: false,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
    }),
    {
      name: 'match-padel-club-panel',
      partialize: (state) => ({ lastClubId: state.lastClubId }),
    },
  ),
)
