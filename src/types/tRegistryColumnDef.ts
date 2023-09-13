import { CellContext } from '@tanstack/react-table';

export type tRegistryColumnDef = {
  header?: string;
  accessorKey?: string;
  cell?: (info: CellContext<any, any>) => string;
  id?: string;
};
