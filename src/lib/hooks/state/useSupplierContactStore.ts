import { tSupplierContact } from '@/types/Supplier/tSupplierContact';
import { create } from 'zustand';

interface iSupplierAddressesStore {
  contactList: tSupplierContact[];
  insertContact: (address: tSupplierContact) => void;
  updateContact: (address: tSupplierContact) => void;
  removeContact: (address: tSupplierContact) => void;
  setList: (addressLoaded: tSupplierContact[]) => void;
  clearList: () => void;
}

export const useSupplierContactStore = create<iSupplierAddressesStore>()(
  (set) => ({
    contactList: [],
    insertContact: (address: tSupplierContact) => {
      set((state) => ({ contactList: [...state.contactList, address] }));
    },
    updateContact: (address: tSupplierContact) => {
      set((state) => ({
        contactList: state.contactList.map((item) => {
          if (item.id === address.id) return address;
          return item;
        }),
      }));
    },
    removeContact: (address: tSupplierContact) => {
      set((state) => ({
        contactList: state.contactList.filter((item) => {
          if (!item.id)
            return item.name !== address.name && item.email !== address.email;
          return item.id !== address.id;
        }),
      }));
    },
    setList: (addressLoaded: tSupplierContact[]) =>
      set({ contactList: addressLoaded }),
    clearList: () => set({ contactList: [] }),
  }),
);
