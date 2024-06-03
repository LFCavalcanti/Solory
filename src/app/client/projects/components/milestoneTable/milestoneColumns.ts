'use client';
import { ColumnDef } from '@tanstack/react-table';
import {
  statusSelectOptions,
  tProjectMilestoneWithTasks,
} from '@/types/Project/tProjectMilestone';
import getSelectLabel from '@/lib/getSelectLabel';

export const projectMilestoneTableColumns: ColumnDef<
  tProjectMilestoneWithTasks,
  any
>[] = [
  {
    header: 'Ordem',
    accessorKey: 'order',
  },
  {
    header: 'Descrição',
    accessorKey: 'description',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: (info) => getSelectLabel(info.getValue(), statusSelectOptions),
  },
  {
    header: 'Progresso',
    accessorKey: 'progress',
  },
];
