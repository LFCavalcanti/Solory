'use client';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { ColumnDef } from '@tanstack/react-table';

export const supplierTableColumns: ColumnDef<tRegistryColumnDef, any>[] = [
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
    header: 'Nome Fantasia',
    accessorKey: 'aliasName',
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

export const supplierAddressTableColumns: ColumnDef<tRegistryColumnDef, any>[] =
  [
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
    },
    {
      header: 'Tipo Endereço',
      accessorKey: 'isMainAddress',
      cell: (info) => (info.getValue() ? 'PRINCIPAL' : '-'),
    },
    {
      header: 'Endereço',
      accessorKey: 'street',
    },
    {
      header: 'Estado',
      accessorKey: 'state',
    },
    {
      header: 'Código Cidade',
      accessorKey: 'cityCode',
    },
  ];
