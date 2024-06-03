import { tProject, tProjectTableRow } from '@/types/Project/tProject';
import { tProjectAction } from '@/types/tProjectAction';
import { create } from 'zustand';

interface iProjectActionFormStore {
  isOpen: boolean;
  projectData: tProject | tProjectTableRow | null;
  action: tProjectAction;
  openForm: (
    projectId: tProject | tProjectTableRow | null,
    action: tProjectAction,
  ) => void;
  closeForm: () => void;
}

export const useProjectActionFormStore = create<iProjectActionFormStore>()(
  (set) => ({
    isOpen: false,
    projectData: null,
    action: null,
    openForm: (
      projectData: tProject | tProjectTableRow | null,
      action: tProjectAction,
    ) => set({ isOpen: true, projectData, action }),
    closeForm: () => set({ isOpen: false, projectData: null, action: null }),
  }),
);
