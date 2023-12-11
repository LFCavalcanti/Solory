import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';

export const itemTypeMap = new Map([
  ['RECURRENT', 'RECORRENTE'],
  ['MAX_PACKAGE', 'PACOTE MAXIMO'],
  ['MIN_PACKAGE', 'PACOTE MINIMO'],
  ['ON_DEMAND', 'SOB DEMANDA'],
]);

export const itemTypeSelectOptions: tSelectMenuOption[] = [
  {
    value: 'RECURRENT',
    label: 'RECORRENTE',
  },
  {
    value: 'MAX_PACKAGE',
    label: 'PACOTE MAXIMO',
  },
  {
    value: 'MIN_PACKAGE',
    label: 'PACOTE MINIMO',
  },
  {
    value: 'ON_DEMAND',
    label: 'SOB DEMANDA',
  },
];

const itemTypeLiterals = z.union([
  z.literal('RECURRENT'),
  z.literal('MAX_PACKAGE'),
  z.literal('MIN_PACKAGE'),
  z.literal('ON_DEMAND'),
]);

export const newContractItemValidate = z
  .object({
    description: z.string().trim().min(1).toUpperCase(),
    itemType: itemTypeLiterals,
    quantity: z.coerce.number().nonnegative(),
    price: z.coerce.number().nonnegative(),
    productId: z.string().trim().min(1),
  })
  .superRefine((data, ctx) => {
    if (
      (data.itemType === 'RECURRENT' || data.itemType === 'ON_DEMAND') &&
      data.quantity !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para os tipos RECORRENTE ou SOB DEMANDA a QUANTIDADE deve ser 0(Zero)`,
        path: ['quantity'],
        fatal: true,
      });
      return;
    }
    if (
      (data.itemType === 'MAX_PACKAGE' || data.itemType === 'MIN_PACKAGE') &&
      data.quantity !== undefined &&
      data.quantity === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para os tipos PACOTE MAXIMO ou PACOTE MINIMO a QUANTIDADE deve MAIOR QUE 0(Zero)`,
        path: ['quantity'],
        fatal: true,
      });
      return;
    }
  });

export const contractItemValidate = z
  .object({
    id: z.string().trim().min(1).optional(),
    isActive: z
      .boolean({
        invalid_type_error: 'isActive must be a boolean',
      })
      .optional(),
    description: z.string().trim().min(1).toUpperCase().optional(),
    itemType: itemTypeLiterals.optional(),
    quantity: z.coerce.number().nonnegative().optional(),
    price: z.coerce.number().nonnegative().optional(),
    productId: z.string().trim().min(1).optional(),
    contractId: z.string().trim().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.itemType === 'RECURRENT' || data.itemType === 'ON_DEMAND') &&
      data.quantity !== 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para os tipos RECORRENTE ou SOB DEMANDA a QUANTIDADE deve ser 0(Zero)`,
        path: ['quantity'],
        fatal: true,
      });
      return;
    }
    if (
      (data.itemType === 'MAX_PACKAGE' || data.itemType === 'MIN_PACKAGE') &&
      data.quantity !== undefined &&
      data.quantity === 0
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para os tipos PACOTE MAXIMO ou PACOTE MINIMO a QUANTIDADE deve MAIOR QUE 0(Zero)`,
        path: ['quantity'],
        fatal: true,
      });
      return;
    }
  });

export const contractItemTableRowValidate = z.object({
  id: z.string().trim().min(1),
  description: z.string().trim().min(1).toUpperCase(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  itemType: itemTypeLiterals,
});

export type tNewContractItem = z.infer<typeof newContractItemValidate>;
export type tContractItem = z.infer<typeof contractItemValidate>;
export type tContractItemTableRow = z.infer<
  typeof contractItemTableRowValidate
>;
