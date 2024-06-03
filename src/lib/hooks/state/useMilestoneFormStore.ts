import { tRegistryAction } from '@/types/tRegistryAction';
import { create } from 'zustand';

interface iProjectActionFormStore {
  isMilestoneFormOpen: boolean;
  milestoneRowIndex: number | null;
  milestoneFormAction: tRegistryAction;
  openMilestoneForm: (
    milestoneRowIndex: number | null,
    milestoneFormAction: tRegistryAction,
  ) => void;
  closeMilestoneForm: () => void;
}

export const useMilestoneFormStore = create<iProjectActionFormStore>()(
  (set) => ({
    isMilestoneFormOpen: false,
    milestoneRowIndex: null,
    milestoneFormAction: null,
    openMilestoneForm: (
      milestoneRowIndex: number | null,
      milestoneFormAction: tRegistryAction,
    ) =>
      set({
        isMilestoneFormOpen: true,
        milestoneRowIndex,
        milestoneFormAction,
      }),
    closeMilestoneForm: () => {
      set({
        isMilestoneFormOpen: false,
        milestoneRowIndex: null,
        milestoneFormAction: null,
      });
    },
  }),
);
