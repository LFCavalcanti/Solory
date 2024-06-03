'use client';
import { ColumnDef } from '@tanstack/react-table';
import getSelectLabel from '@/lib/getSelectLabel';
import {
  activityEffortSelectOptions,
  activityStatusSelectOptions,
  tProjectActivity,
} from '@/types/Project/tProjectActivity';

export const projectActivityTableColumns: ColumnDef<tProjectActivity, any>[] = [
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
    cell: (info) => getSelectLabel(String(info), activityStatusSelectOptions),
  },
  {
    header: 'Progresso',
    accessorKey: 'progress',
  },
  {
    header: 'Unidade',
    accessorKey: 'effortUnit',
    cell: (info) => getSelectLabel(String(info), activityEffortSelectOptions),
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
