import { tCompanyAddress } from '@/types/Company/tCompanyAddress';
import { tCompanyCnaeIss } from '@/types/Company/tCompanyCnaeIss';
import { create } from 'zustand';

interface iCompanyCnaeIssStore {
  cnaeIssList: tCompanyCnaeIss[];
  insertCnaeIss: (cnaeIss: tCompanyCnaeIss) => void;
  updateCnaeIss: (cnaeIss: tCompanyCnaeIss) => void;
  removeCnaeIss: (cnaeIss: tCompanyCnaeIss) => void;
  setList: (cnaeIssLoaded: tCompanyCnaeIss[]) => void;
  clearList: () => void;
}

export const useCompanyCnaeIssStore = create<iCompanyCnaeIssStore>()((set) => ({
  cnaeIssList: [],
  insertCnaeIss: (cnaeIss: tCompanyCnaeIss) => {
    set((state) => ({ cnaeIssList: [...state.cnaeIssList, cnaeIss] }));
  },
  updateCnaeIss: (cnaeIss: tCompanyCnaeIss) => {
    set((state) => ({
      cnaeIssList: state.cnaeIssList.map((item) => {
        if (!item.id) {
          if (item.cnaeCode === cnaeIss.cnaeCode) return cnaeIss;
          return item;
        }
        if (item.id === cnaeIss.id) return cnaeIss;
        return item;
      }),
    }));
  },
  removeCnaeIss: (cnaeIss: tCompanyCnaeIss) => {
    set((state) => ({
      cnaeIssList: state.cnaeIssList.filter((item) => {
        if (!item.id)
          return (
            item.cnaeCode !== cnaeIss.cnaeCode &&
            ((item.issCode && item.issCode !== cnaeIss.issCode) ||
              !item.issCode)
          );
        return item.id !== cnaeIss.id;
      }),
    }));
  },
  setList: (cnaeIssLoaded: tCompanyAddress[]) =>
    set({ cnaeIssList: cnaeIssLoaded }),
  clearList: () => set({ cnaeIssList: [] }),
}));
