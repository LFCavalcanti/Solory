import { tRegistryAction } from '@/types/tRegistryAction';
import { create } from 'zustand';

interface iProjectTaskActivityFormStore {
  isTaskActivityFormOpen: boolean;
  rowDepth: number | null;
  taskRowIndex: number | null;
  activityRowIndex: number | null;
  taskActivityFormAction: tRegistryAction;
  openTaskActivityForm: (
    rowDepth: number | null,
    taskRowIndex: number | null,
    activityRowIndex: number | null,
    taskActivityFormAction: tRegistryAction,
  ) => void;
  closeTaskActivityForm: () => void;
}

export const useTaskActivityFormStore = create<iProjectTaskActivityFormStore>()(
  (set) => ({
    isTaskActivityFormOpen: false,
    rowDepth: null,
    taskRowIndex: null,
    activityRowIndex: null,
    taskActivityFormAction: null,
    openTaskActivityForm: (
      rowDepth: number | null,
      taskRowIndex: number | null,
      activityRowIndex: number | null,
      taskActivityFormAction: tRegistryAction,
    ) => {
      set({
        isTaskActivityFormOpen: true,
        taskRowIndex,
        activityRowIndex,
        rowDepth,
        taskActivityFormAction,
      });
    },
    closeTaskActivityForm: () => {
      set({
        isTaskActivityFormOpen: false,
        rowDepth: null,
        taskRowIndex: null,
        activityRowIndex: null,
        taskActivityFormAction: null,
      });
    },
  }),
);
