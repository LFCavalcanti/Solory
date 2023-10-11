import { tCompanyAddress } from '@/types/Company/tCompanyAddress';
import { create } from 'zustand';

interface iCompanyAddressesStore {
  addressList: tCompanyAddress[];
  insertAddress: (address: tCompanyAddress) => void;
  updateAddress: (address: tCompanyAddress) => void;
  removeAddress: (address: tCompanyAddress) => void;
  setList: (addressLoaded: tCompanyAddress[]) => void;
  clearList: () => void;
}

export const useCompanyAddressesStore = create<iCompanyAddressesStore>()(
  (set) => ({
    addressList: [],
    insertAddress: (address: tCompanyAddress) => {
      set((state) => ({ addressList: [...state.addressList, address] }));
    },
    updateAddress: (address: tCompanyAddress) => {
      set((state) => ({
        addressList: state.addressList.map((item) => {
          if (item.id === address.id) return address;
          return item;
        }),
      }));
    },
    removeAddress: (address: tCompanyAddress) => {
      set((state) => ({
        addressList: state.addressList.filter((item) => {
          if (!item.id)
            return (
              item.street !== address.street &&
              item.lotNumber !== address.lotNumber
            );
          return item.id !== address.id;
        }),
      }));
    },
    setList: (addressLoaded: tCompanyAddress[]) =>
      set({ addressList: addressLoaded }),
    clearList: () => set({ addressList: [] }),
  }),
);
