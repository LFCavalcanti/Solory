import { tContractDocumentApprover } from '@/types/Contract/tContractDocumentApprover';
import { create } from 'zustand';

interface iContractDocumentApproverStore {
  contractDocumentApproverList: tContractDocumentApprover[];
  insertContractDocumentApproverStore: (
    address: tContractDocumentApprover,
  ) => void;
  updateContractDocumentApproverStore: (
    address: tContractDocumentApprover,
  ) => void;
  removeContractDocumentApproverStore: (
    address: tContractDocumentApprover,
  ) => void;
  setList: (addressLoaded: tContractDocumentApprover[]) => void;
  clearList: () => void;
}

export const useContractDocumentApproverStore =
  create<iContractDocumentApproverStore>()((set) => ({
    contractDocumentApproverList: [],
    insertContractDocumentApproverStore: (
      newItem: tContractDocumentApprover,
    ) => {
      set((state) => ({
        contractDocumentApproverList: [
          ...state.contractDocumentApproverList,
          newItem,
        ],
      }));
    },
    updateContractDocumentApproverStore: (
      updatedItem: tContractDocumentApprover,
    ) => {
      set((state) => ({
        contractDocumentApproverList: state.contractDocumentApproverList.map(
          (item) => {
            if (!item.id) {
              if (item.customerContactId === updatedItem.customerContactId)
                return updatedItem;
              return item;
            }
            if (item.id === updatedItem.id) return updatedItem;
            return item;
          },
        ),
      }));
    },
    removeContractDocumentApproverStore: (
      itemToRemove: tContractDocumentApprover,
    ) => {
      set((state) => ({
        contractDocumentApproverList: state.contractDocumentApproverList.filter(
          (item) => {
            if (!item.id)
              return item.customerContactId === itemToRemove.customerContactId;
            return item.id !== itemToRemove.id;
          },
        ),
      }));
    },
    setList: (itemsLoaded: tContractDocumentApprover[]) =>
      set({ contractDocumentApproverList: itemsLoaded }),
    clearList: () => set({ contractDocumentApproverList: [] }),
  }));
