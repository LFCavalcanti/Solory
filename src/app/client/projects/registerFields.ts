'use client';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import {
  statusSelectOptions,
  typeSelectOptions,
} from '@/types/Project/tProject';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import { ColumnDef } from '@tanstack/react-table';

export const projectTableColumns: ColumnDef<tRegistryColumnDef, any>[] = [
  {
    header: 'Bloqueio',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'NORMAL' : 'BLOQUEADO'),
  },
  {
    header: 'Nome',
    accessorKey: 'name',
  },
  {
    header: 'Tipo',
    accessorKey: 'type',
    cell: (info) => findLiteralLabel(typeSelectOptions, info.getValue()),
  },
  {
    header: 'Situação',
    accessorKey: 'status',
    cell: (info) => findLiteralLabel(statusSelectOptions, info.getValue()),
  },
  {
    header: 'Progresso',
    accessorKey: 'progress',
    cell: (info) => info.getValue() + ' %',
  },
  {
    header: 'Cliente',
    accessorKey: 'customer.aliasName',
  },
  {
    header: 'Inicio',
    accessorKey: 'startDate',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
  {
    header: 'Conclusão',
    accessorKey: 'endDate',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
  {
    header: 'Data Criação',
    accessorKey: 'createdAt',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
  {
    header: 'Data de Bloqueio',
    accessorKey: 'disabledAt',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
];

function findLiteralLabel(literals: tSelectMenuOption[], valueToFind: string) {
  const element: tSelectMenuOption | undefined = literals.find((item) => {
    return item.value === valueToFind;
  });

  if (!element) return '--ERRO--';

  return element.label;
}
