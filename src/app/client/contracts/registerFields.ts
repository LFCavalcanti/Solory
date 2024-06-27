'use client';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { itemTypeMap } from '@/types/Contract/tContractItem';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { ColumnDef } from '@tanstack/react-table';

export const contractTableColumns: ColumnDef<tRegistryColumnDef, any>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'Descrição',
    accessorKey: 'description',
  },
  {
    header: 'Cliente',
    accessorKey: 'customer.aliasName',
  },
  {
    header: 'Inicio Vigência',
    accessorKey: 'termStart',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
  {
    header: 'Fim Vigência',
    accessorKey: 'termEnd',
    cell: (info) => getTableLocaleDate(info.getValue()),
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

export const contractItemTableColumns: ColumnDef<tRegistryColumnDef, any>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'Tipo',
    accessorKey: 'itemType',
    cell: (info) => itemTypeMap.get(info.getValue()),
  },
  {
    header: 'Descrição',
    accessorKey: 'description',
  },
];

export const contractDocumentApproverTableColumns: ColumnDef<
  tRegistryColumnDef,
  any
>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'Nome',
    accessorKey: 'customerContact.name',
  },
  {
    header: 'E-mail',
    accessorKey: 'customerContact.email',
  },
];
