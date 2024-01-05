import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';

const statusLiterals = z.union([
  z.literal('CREATED'),
  z.literal('IN_PROGRESS'),
  z.literal('COMPLETED'),
]);

export const activityStatusSelectOptions: tSelectMenuOption[] = [
  {
    value: 'CREATED',
    label: 'CRIADA',
  },
  {
    value: 'IN_PROGRESS',
    label: 'EM ANDAMENTO',
  },
  {
    value: 'COMPLETED',
    label: 'CONCLUIDO',
  },
];

const effortLiterals = z.union([
  z.literal('HOUR'),
  z.literal('UNIT'),
  z.literal('NONE'),
]);

export const activityEffortSelectOptions: tSelectMenuOption[] = [
  {
    value: 'HOUR',
    label: 'HORAS',
  },
  {
    value: 'UNIT',
    label: 'UNIDADES',
  },
  {
    value: 'NONE',
    label: 'NENHUM',
  },
];

export const newProjectActivityValidate = z
  .object({
    order: z.coerce.number().nonnegative(),
    description: z.string().trim().min(1).toUpperCase(),
    status: statusLiterals,
    progress: z.coerce.number().nonnegative().max(100),
    effortUnit: effortLiterals,
    effortQuantity: z.coerce.number().nonnegative(),
    effortBalance: z.coerce.number().nonnegative(),
    taskId: z.string(),
  })
  .superRefine((activity, ctx) => {
    if (activity.effortUnit === 'NONE' && activity.effortQuantity !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for NENHUM então a quantidade deve ser ZERO`,
        path: ['effortQuantity'],
        fatal: true,
      });
      return;
    }
    if (activity.effortUnit !== 'NONE' && activity.effortQuantity === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for HORAS ou UNIDADES então deve ter quantidade maior que zero.`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
    if (
      activity.effortUnit !== 'NONE' &&
      activity.effortQuantity !== activity.effortQuantity
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Quantidade e Saldo de esforço devem ser iguais.`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
  });

export const projectActivityValidate = z
  .object({
    id: z.string().trim().min(1).optional(),
    isActive: z
      .boolean({
        invalid_type_error: 'isActive must be a boolean',
      })
      .optional(),
    order: z.coerce.number().nonnegative().optional(),
    description: z.string().trim().min(1).toUpperCase().optional(),
    status: statusLiterals.optional(),
    progress: z.coerce.number().nonnegative().max(100).optional(),
    effortUnit: effortLiterals.optional(),
    effortQuantity: z.coerce.number().nonnegative().optional(),
    effortExecuted: z.coerce.number().nonnegative().optional(),
    effortBalance: z.coerce.number().nonnegative().optional(),
    taskId: z.string().optional(),
  })
  .superRefine((activity, ctx) => {
    if (activity.effortUnit === 'NONE' && activity.effortQuantity !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for NENHUM então a quantidade deve ser ZERO`,
        path: ['effortQuantity'],
        fatal: true,
      });
      return;
    }
    if (activity.effortUnit !== 'NONE' && activity.effortQuantity === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for HORAS ou UNIDADES então deve ter quantidade maior que zero.`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
  });

export const projectActivityTableRowValidate = z.object({
  id: z.string().trim().min(1),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  order: z.coerce.number().nonnegative(),
  description: z.string().trim().min(1).toUpperCase(),
  status: statusLiterals,
  progress: z.coerce.number().nonnegative().max(100),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
});

export type tNewProjectActivity = z.infer<typeof newProjectActivityValidate>;
export type tProjectActivity = z.infer<typeof projectActivityValidate>;
export type tProjectActivityTableRow = z.infer<
  typeof projectActivityTableRowValidate
>;
