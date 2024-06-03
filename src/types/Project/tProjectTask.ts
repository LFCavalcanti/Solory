import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';
import { tProjectActivity } from './tProjectActivity';

const statusLiterals = z.union([
  z.literal('CREATED'),
  z.literal('IN_PROGRESS'),
  z.literal('COMPLETED'),
]);

export const taskStatusSelectOptions: tSelectMenuOption[] = [
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

export const taskEffortSelectOptions: tSelectMenuOption[] = [
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

export const newProjectTaskValidate = z
  .object({
    order: z.coerce.number().nonnegative(),
    description: z.string().trim().min(1).toUpperCase(),
    status: statusLiterals,
    progress: z.coerce.number().nonnegative().max(100),
    effortUnit: effortLiterals,
    effortQuantity: z.coerce.number().nonnegative(),
    effortBalance: z.coerce.number().nonnegative(),
    // milestoneId: z.string(),
  })
  .superRefine((task, ctx) => {
    if (task.effortUnit === 'NONE' && task.effortQuantity !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for NENHUM então a quantidade deve ser ZERO`,
        path: ['effortQuantity'],
        fatal: true,
      });
      return;
    }
    if (task.effortUnit !== 'NONE' && task.effortQuantity === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for HORAS ou UNIDADES então deve ter quantidade maior que zero.`,
        path: ['effortQuantity'],
        fatal: true,
      });
      return;
    }
    if (
      task.effortUnit !== 'NONE' &&
      task.effortQuantity !== task.effortQuantity
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Quantidade e Saldo de esforço devem ser iguais.`,
        path: ['effortBalance'],
        fatal: true,
      });
      return;
    }
  });

export const projectTaskValidate = z
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
    milestoneId: z.string().optional(),
  })
  .superRefine((task, ctx) => {
    if (task.effortUnit === 'NONE' && task.effortQuantity !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for NENHUM então a quantidade deve ser ZERO`,
        path: ['effortQuantity'],
        fatal: true,
      });
      return;
    }
    if (task.effortUnit !== 'NONE' && task.effortQuantity === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Se o tipo de esforço for HORAS ou UNIDADES então deve ter quantidade maior que zero.`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
  });

export const projectTaskTableRowValidate = z.object({
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

export type tNewProjectTask = z.infer<typeof newProjectTaskValidate>;
export type tProjectTask = z.infer<typeof projectTaskValidate>;
export type tProjectTaskTableRow = z.infer<typeof projectTaskTableRowValidate>;
export type tProjectTaskWithActivities = tProjectTask & {
  activities: tProjectActivity[];
};
