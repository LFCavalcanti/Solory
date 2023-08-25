'use client';
import TableLocaleDate from '@/lib/tableLocaleDate';
import { ColumnDef } from '@tanstack/react-table';

export const companyGroupTableColumns: ColumnDef<object, any>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'Nome',
    accessorKey: 'name',
  },
  {
    header: 'Descrição',
    accessorKey: 'description',
  },
  {
    header: 'Data Criação',
    accessorKey: 'createdAt',
    cell: (info) => TableLocaleDate(info.getValue()),
  },
  {
    header: 'Data Desativação',
    accessorKey: 'disabledAt',
    cell: (info) => TableLocaleDate(info.getValue()),
  },
];
export const companyGroupRegisterFields = [];
