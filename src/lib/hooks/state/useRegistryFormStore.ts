import { tRegistryAction } from '@/types/tRegistryAction';
import { create } from 'zustand';

interface iRegistryFormStore {
  isOpen: boolean;
  registryData: object | null;
  action: tRegistryAction;
  openForm: (registryId: object | null, action: tRegistryAction) => void;
  closeForm: () => void;
}

export const useRegistryFormStore = create<iRegistryFormStore>()((set) => ({
  isOpen: false,
  registryData: null,
  action: null,
  openForm: (registryData: object | null, action: tRegistryAction) =>
    set({ isOpen: true, registryData, action }),
  closeForm: () => set({ isOpen: false, registryData: null, action: null }),
}));
