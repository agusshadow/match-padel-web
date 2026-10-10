import { create } from 'zustand'

interface PanelState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const usePanelStore = create<PanelState>()((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
