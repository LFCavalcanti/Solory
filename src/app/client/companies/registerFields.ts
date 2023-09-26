'use client';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { ColumnDef } from '@tanstack/react-table';

export const companyTableColumns: ColumnDef<tRegistryColumnDef, any>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'Nome Comercial',
    accessorKey: 'aliasName',
  },
  {
    header: 'Razão Social',
    accessorKey: 'fullName',
  },
  {
    header: 'Data Criação',
    accessorKey: 'createdAt',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
  {
    header: 'Data Desativação',
    accessorKey: 'disabledAt',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
];
