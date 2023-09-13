import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { ColumnDef } from '@tanstack/react-table';
import { create } from 'zustand';

interface iRegistryExportStore {
  isOpen: boolean;
  rowsData: object[];
  columnsDef: ColumnDef<tRegistryColumnDef, any>[];
  openModal: (
    rowsData: object[],
    columnsDef: ColumnDef<tRegistryColumnDef, any>[],
  ) => void;
  closeModal: () => void;
}

export const useRegistryExportStore = create<iRegistryExportStore>()((set) => ({
  isOpen: false,
  rowsData: [],
  columnsDef: [],
  openModal: (
    rowsData: object[],
    columnsDef: ColumnDef<tRegistryColumnDef, any>[],
  ) => set({ isOpen: true, rowsData, columnsDef }),
  closeModal: () => set({ isOpen: false, rowsData: [], columnsDef: [] }),
}));
