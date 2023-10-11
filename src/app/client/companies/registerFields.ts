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

export const companyAddressTableColumns: ColumnDef<tRegistryColumnDef, any>[] =
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

export const companyCnaeIssTableColumns: ColumnDef<tRegistryColumnDef, any>[] =
  [
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
      header: 'CNAE',
      accessorKey: 'cnaeCode',
    },
    {
      header: 'ISS',
      accessorKey: 'issCode',
    },
  ];
