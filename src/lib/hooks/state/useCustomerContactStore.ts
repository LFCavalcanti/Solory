import { tCustomerContact } from '@/types/Customer/tCustomerContact';
import { create } from 'zustand';

interface iCustomerAddressesStore {
  contactList: tCustomerContact[];
  insertContact: (address: tCustomerContact) => void;
  updateContact: (address: tCustomerContact) => void;
  removeContact: (address: tCustomerContact) => void;
  setList: (addressLoaded: tCustomerContact[]) => void;
  clearList: () => void;
}

export const useCustomerContactStore = create<iCustomerAddressesStore>()(
  (set) => ({
    contactList: [],
    insertContact: (address: tCustomerContact) => {
      set((state) => ({ contactList: [...state.contactList, address] }));
    },
    updateContact: (address: tCustomerContact) => {
      set((state) => ({
        contactList: state.contactList.map((item) => {
          if (item.id === address.id) return address;
          return item;
        }),
      }));
    },
    removeContact: (address: tCustomerContact) => {
      set((state) => ({
        contactList: state.contactList.filter((item) => {
          if (!item.id)
            return item.name !== address.name && item.email !== address.email;
          return item.id !== address.id;
        }),
      }));
    },
    setList: (addressLoaded: tCustomerContact[]) =>
      set({ contactList: addressLoaded }),
    clearList: () => set({ contactList: [] }),
  }),
);
