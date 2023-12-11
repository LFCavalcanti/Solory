import { tContractItem } from '@/types/Contract/tContractItem';
import { create } from 'zustand';

interface iCustomerAddressesStore {
  contractItemList: tContractItem[];
  insertContractItem: (address: tContractItem) => void;
  updateContractItem: (address: tContractItem) => void;
  removeContractItem: (address: tContractItem) => void;
  setList: (addressLoaded: tContractItem[]) => void;
  clearList: () => void;
}

export const useContractItemStore = create<iCustomerAddressesStore>()(
  (set) => ({
    contractItemList: [],
    insertContractItem: (newItem: tContractItem) => {
      set((state) => ({
        contractItemList: [...state.contractItemList, newItem],
      }));
    },
    updateContractItem: (updatedItem: tContractItem) => {
      set((state) => ({
        contractItemList: state.contractItemList.map((item) => {
          if (!item.id) {
            if (
              item.itemType === updatedItem.itemType &&
              item.productId === updatedItem.productId
            )
              return updatedItem;
            return item;
          }
          if (item.id === updatedItem.id) return updatedItem;
          return item;
        }),
      }));
    },
    removeContractItem: (itemToRemove: tContractItem) => {
      set((state) => ({
        contractItemList: state.contractItemList.filter((item) => {
          if (!item.id)
            return (
              item.itemType !== itemToRemove.itemType &&
              item.productId !== itemToRemove.productId
            );
          return item.id !== itemToRemove.id;
        }),
      }));
    },
    setList: (itemsLoaded: tContractItem[]) =>
      set({ contractItemList: itemsLoaded }),
    clearList: () => set({ contractItemList: [] }),
  }),
);
