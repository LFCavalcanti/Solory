'use client';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { ColumnDef } from '@tanstack/react-table';

export const productTableColumns: ColumnDef<tRegistryColumnDef, any>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'Código',
    accessorKey: 'code',
  },
  {
    header: 'Descrição',
    accessorKey: 'description',
  },
  {
    header: 'Tipo',
    accessorKey: 'typeId',
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
