'use client';
import getTableLocaleDate from '@/lib/getTableLocaleDate';
import { tRegistryColumnDef } from '@/types/tRegistryColumnDef';
import { ColumnDef } from '@tanstack/react-table';

export const simplesNacConfigTableColumns: ColumnDef<
  tRegistryColumnDef,
  any
>[] = [
  {
    header: 'Status',
    accessorKey: 'isActive',
    cell: (info) => (info.getValue() ? 'ATIVO' : 'INATIVO'),
  },
  {
    header: 'CNAE',
    accessorKey: 'cnaeCode',
  },
  {
    header: 'Anexo',
    accessorKey: 'anexoSimples',
  },
  {
    header: 'Piso Faturamento',
    accessorKey: 'floorRevenue',
    cell: (info) => parseFloat(info.getValue()).toFixed(2),
  },
  {
    header: 'Teto Faturamento',
    accessorKey: 'ceilRevenue',
    cell: (info) => parseFloat(info.getValue()).toFixed(2),
  },
  {
    header: 'Inicio Validade',
    accessorKey: 'activeSince',
    cell: (info) => getTableLocaleDate(info.getValue()),
  },
  {
    header: 'Fim Validade',
    accessorKey: 'expiresAt',
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
