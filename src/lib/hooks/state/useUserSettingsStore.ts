import { tUserSettingsContext } from '@/types/User/Settings/tUserSettings';
import { create } from 'zustand';

interface iUserSettingsStore {
  userSettings: tUserSettingsContext;
  setUserSettings: (newSettings: tUserSettingsContext) => void;
}

export const useUserSettingsStore = create<iUserSettingsStore>()((set) => ({
  userSettings: {
    activeCompanyId: undefined,
    activeCompanyName: undefined,
    userRoles: [],
  },
  setUserSettings: (newSettings: tUserSettingsContext) =>
    set({ userSettings: newSettings }),
}));
