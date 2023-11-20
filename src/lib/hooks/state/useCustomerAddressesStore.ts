import { tCustomerAddress } from '@/types/Customer/tCustomerAddress';
import { create } from 'zustand';

interface iCustomerAddressesStore {
  addressList: tCustomerAddress[];
  insertAddress: (address: tCustomerAddress) => void;
  updateAddress: (address: tCustomerAddress) => void;
  removeAddress: (address: tCustomerAddress) => void;
  setList: (addressLoaded: tCustomerAddress[]) => void;
  clearList: () => void;
}

export const useCustomerAddressesStore = create<iCustomerAddressesStore>()(
  (set) => ({
    addressList: [],
    insertAddress: (address: tCustomerAddress) => {
      set((state) => ({ addressList: [...state.addressList, address] }));
    },
    updateAddress: (address: tCustomerAddress) => {
      set((state) => ({
        addressList: state.addressList.map((item) => {
          if (item.id === address.id) return address;
          return item;
        }),
      }));
    },
    removeAddress: (address: tCustomerAddress) => {
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
    setList: (addressLoaded: tCustomerAddress[]) =>
      set({ addressList: addressLoaded }),
    clearList: () => set({ addressList: [] }),
  }),
);
