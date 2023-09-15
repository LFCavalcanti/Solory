import { create } from 'zustand';

type tMessageStatusProp =
  | 'info'
  | 'warning'
  | 'success'
  | 'error'
  | 'loading'
  | undefined;

interface iTopMessageSliderStore {
  isOpen: boolean;
  type: tMessageStatusProp;
  message: string | null;
  sendTopMessage: (type: tMessageStatusProp, message: string | null) => void;
  closeTopMessage: () => void;
}

export const useTopMessageSliderStore = create<iTopMessageSliderStore>()(
  (set) => ({
    isOpen: false,
    type: undefined,
    message: null,
    sendTopMessage: (type: tMessageStatusProp, message: string | null) =>
      set({ isOpen: true, type, message }),
    closeTopMessage: () =>
      set({ isOpen: false, message: null, type: undefined }),
  }),
);
