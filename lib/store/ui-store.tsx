// lib/store/ui-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIStore {
  // PIA Assistant View State
  piaView: "chat" | "split" | "document";
  setPiaView: (view: "chat" | "split" | "document") => void;

  // Selected Project
  selectedProject: string | null;
  setSelectedProject: (projectId: string | null) => void;

  // Sidebar State
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // PIA View
      piaView: "split",
      setPiaView: (view) => set({ piaView: view }),

      // Project Selection
      selectedProject: "",
      setSelectedProject: (projectId) => set({ selectedProject: projectId }),

      // Sidebar
      isSidebarOpen: true,
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    }),
    {
      name: "ui-store",
      skipHydration: true,
    }
  )
);
