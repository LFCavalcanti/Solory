'use client';
import { ColumnDef } from '@tanstack/react-table';
import getSelectLabel from '@/lib/getSelectLabel';
import {
  tProjectTaskWithActivities,
  taskEffortSelectOptions,
  taskStatusSelectOptions,
} from '@/types/Project/tProjectTask';
import {
  activityEffortSelectOptions,
  activityStatusSelectOptions,
  tProjectActivity,
} from '@/types/Project/tProjectActivity';

export const projectTaskTableColumns: ColumnDef<
  tProjectTaskWithActivities | tProjectActivity,
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
    cell: (info) =>
      getSelectLabel(
        info.getValue(),
        info.row.depth === 0
          ? taskStatusSelectOptions
          : activityStatusSelectOptions,
      ),
  },
  {
    header: 'Progresso',
    accessorKey: 'progress',
  },
  {
    header: 'Unidade',
    accessorKey: 'effortUnit',
    cell: (info) =>
      getSelectLabel(
        info.getValue(),
        info.row.depth === 1
          ? taskEffortSelectOptions
          : activityEffortSelectOptions,
      ),
  },
  {
    header: 'Quantidade',
    accessorKey: 'effortQuantity',
  },
  {
    header: 'Saldo',
    accessorKey: 'effortBalance',
  },
];
