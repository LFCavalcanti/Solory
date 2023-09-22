import { create } from 'zustand';

interface iLoadingSpinnerStore {
  isSpinnerOpen: boolean;
  startProcessingSpinner: () => void;
  stopProcessingSpinner: () => void;
}

export const useLoadingSpinnerStore = create<iLoadingSpinnerStore>()((set) => ({
  isSpinnerOpen: false,
  startProcessingSpinner: () => set({ isSpinnerOpen: true }),
  stopProcessingSpinner: () => set({ isSpinnerOpen: false }),
}));
