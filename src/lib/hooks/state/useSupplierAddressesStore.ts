import { tSupplierAddress } from '@/types/Supplier/tSupplierAddress';
import { create } from 'zustand';

interface iSupplierAddressesStore {
  addressList: tSupplierAddress[];
  insertAddress: (address: tSupplierAddress) => void;
  updateAddress: (address: tSupplierAddress) => void;
  removeAddress: (address: tSupplierAddress) => void;
  setList: (addressLoaded: tSupplierAddress[]) => void;
  clearList: () => void;
}

export const useSupplierAddressesStore = create<iSupplierAddressesStore>()(
  (set) => ({
    addressList: [],
    insertAddress: (address: tSupplierAddress) => {
      set((state) => ({ addressList: [...state.addressList, address] }));
    },
    updateAddress: (address: tSupplierAddress) => {
      set((state) => ({
        addressList: state.addressList.map((item) => {
          if (item.id === address.id) return address;
          return item;
        }),
      }));
    },
    removeAddress: (address: tSupplierAddress) => {
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
    setList: (addressLoaded: tSupplierAddress[]) =>
      set({ addressList: addressLoaded }),
    clearList: () => set({ addressList: [] }),
  }),
);
