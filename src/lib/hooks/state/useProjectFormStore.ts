import { tProjectActivity } from '@/types/Project/tProjectActivity';
import { tProjectMilestoneWithTasks } from '@/types/Project/tProjectMilestone';
import { tProjectTaskWithActivities } from '@/types/Project/tProjectTask';
import { create } from 'zustand';

type tMilestoneOperationResult = {
  result: boolean;
  message?: string;
};

interface iProjectFormStore {
  customerId: string | null;
  contractId: string | null;
  milestoneList: tProjectMilestoneWithTasks[];
  setMilestoneList: (newList: tProjectMilestoneWithTasks[]) => void;
  resetMilestoneList: () => void;
  editListItem: (
    depth: 'milestone' | 'task' | 'activity',
    itemIndex: number[],
    itemData:
      | tProjectMilestoneWithTasks
      | tProjectTaskWithActivities
      | tProjectActivity,
  ) => tMilestoneOperationResult;
  addItemToList: (
    depth: 'milestone' | 'task' | 'activity',
    itemIndex: number[],
    itemData:
      | tProjectMilestoneWithTasks
      | tProjectTaskWithActivities
      | tProjectActivity,
  ) => tMilestoneOperationResult;
  removeItemFromList: (
    depth: 'milestone' | 'task' | 'activity',
    itemIndex: number[],
  ) => tMilestoneOperationResult;
  setContractId: (id: string | null) => void;
  setCustomerId: (id: string | null) => void;
  resetAll: () => void;
}

export const useProjectFormStore = create<iProjectFormStore>()((set, get) => ({
  customerId: null,
  contractId: null,
  milestoneList: [],
  setMilestoneList: (newList: tProjectMilestoneWithTasks[]) =>
    set({
      milestoneList: newList,
    }),
  resetMilestoneList: () =>
    set({
      milestoneList: [],
    }),
  editListItem: (
    depth: 'milestone' | 'task' | 'activity',
    itemIndex: number[],
    itemData:
      | tProjectMilestoneWithTasks
      | tProjectTaskWithActivities
      | tProjectActivity,
  ) => {
    if (
      depth === null ||
      depth === undefined ||
      !itemIndex ||
      (depth === 'milestone' && itemIndex.length !== 1) ||
      (depth === 'task' && itemIndex.length !== 2) ||
      (depth === 'activity' && itemIndex.length !== 3)
    ) {
      return {
        result: false,
        message: 'Profundidade de linha ou índice inválido',
      };
    }

    const newMilestoneList = [...get().milestoneList];

    //Activity
    if (depth === 'activity') {
      newMilestoneList[itemIndex[0]].tasks[itemIndex[1]].activities[
        itemIndex[2]
      ] = itemData;
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    //Task
    if (depth === 'task') {
      const activitiesCurrList =
        newMilestoneList[itemIndex[0]].tasks[itemIndex[1]].activities;

      newMilestoneList[itemIndex[0]].tasks[itemIndex[1]] = {
        ...itemData,
        activities: activitiesCurrList,
      };
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    //Milestone
    if (depth === 'milestone') {
      const tasksCurrList = newMilestoneList[itemIndex[0]].tasks;

      newMilestoneList[itemIndex[0]] = {
        ...itemData,
        tasks: tasksCurrList,
      };
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    return {
      result: false,
    };
  },
  addItemToList: (
    depth: 'milestone' | 'task' | 'activity',
    itemIndex: number[],
    itemData:
      | tProjectMilestoneWithTasks
      | tProjectTaskWithActivities
      | tProjectActivity,
  ) => {
    if (
      depth === null ||
      depth === undefined ||
      !itemIndex ||
      (depth === 'milestone' && itemIndex.length !== 0) ||
      (depth === 'task' && itemIndex.length !== 1) ||
      (depth === 'activity' && itemIndex.length !== 2)
    ) {
      // console.log('Erro ao inserir item na tabela');
      // console.log(depth);
      // console.log(itemIndex);
      // console.log(itemData);
      return {
        result: false,
        message: 'Profundidade de linha ou índice inválido',
      };
    }
    const newMilestoneList = [...get().milestoneList];

    //Activity
    if (depth === 'activity') {
      const newIndex =
        newMilestoneList[itemIndex[0]].tasks[itemIndex[1]].activities.length;
      newMilestoneList[itemIndex[0]].tasks[itemIndex[1]].activities.push({
        ...itemData,
        order: newIndex,
      });
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    //Task
    if (depth === 'task') {
      const newIndex = newMilestoneList[itemIndex[0]].tasks.length;
      newMilestoneList[itemIndex[0]].tasks.push({
        ...itemData,
        order: newIndex,
        activities: [],
      });
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    //Milestone
    if (depth === 'milestone') {
      const newIndex = newMilestoneList.length;
      newMilestoneList.push({
        ...itemData,
        order: newIndex,
        tasks: [],
      });
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    return {
      result: false,
    };
  },
  removeItemFromList: (
    depth: 'milestone' | 'task' | 'activity',
    itemIndex: number[],
  ) => {
    if (
      depth === null ||
      depth === undefined ||
      !itemIndex ||
      (depth === 'milestone' && itemIndex.length !== 1) ||
      (depth === 'task' && itemIndex.length !== 2) ||
      (depth === 'activity' && itemIndex.length !== 3)
    )
      return {
        result: false,
        message: 'Profundidade de linha ou índice inválido',
      };

    const newMilestoneList = [...get().milestoneList];

    //Activity
    if (depth === 'activity') {
      newMilestoneList[itemIndex[0]].tasks[itemIndex[1]].activities.splice(
        itemIndex[2],
        1,
      );
      const reorderedList = newMilestoneList[itemIndex[0]].tasks[
        itemIndex[1]
      ].activities.map((activity, index) => {
        activity.order = index;
        return activity;
      });
      newMilestoneList[itemIndex[0]].tasks[itemIndex[1]].activities =
        reorderedList;
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    //Task
    if (depth === 'task') {
      newMilestoneList[itemIndex[0]].tasks.splice(itemIndex[1], 1);
      const reorderedList = newMilestoneList[itemIndex[0]].tasks.map(
        (task, index) => {
          task.order = index;
          return task;
        },
      );
      newMilestoneList[itemIndex[0]].tasks = reorderedList;
      set({
        milestoneList: newMilestoneList,
      });
      return {
        result: true,
      };
    }

    //Milestone
    if (depth === 'milestone') {
      newMilestoneList.splice(itemIndex[0], 1);
      const reorderedList = newMilestoneList.map((milestone, index) => {
        milestone.order = index;
        return milestone;
      });
      set({
        milestoneList: reorderedList,
      });
      return {
        result: true,
      };
    }
    return {
      result: false,
    };
  },
  resetAll: () =>
    set({
      customerId: null,
      contractId: null,
      milestoneList: [],
    }),
  setCustomerId: (id: string | null) =>
    set({
      customerId: id,
    }),
  setContractId: (id: string | null) =>
    set({
      contractId: id,
    }),
}));
