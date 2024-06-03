import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';
import { tProjectTaskWithActivities } from './tProjectTask';

const statusLiterals = z.union([
  z.literal('CREATED'),
  z.literal('IN_PROGRESS'),
  z.literal('COMPLETED'),
]);

export const statusSelectOptions: tSelectMenuOption[] = [
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

export const newProjectMilestoneValidate = z.object({
  order: z.coerce.number().nonnegative(),
  description: z.string().trim().min(1).toUpperCase(),
  status: statusLiterals,
  progress: z.coerce.number().nonnegative().max(100),
  isPaymentReq: z.boolean(),
  paymentValue: z.coerce.number().nonnegative(),
  contractItemId: z.string().trim().min(1).optional().nullable(),
});

export const projectMilestoneValidate = z.object({
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
  isPaymentReq: z.boolean().optional(),
  paymentValue: z.coerce.number().nonnegative().optional(),
  contractItemId: z.string().optional().nullable(),
});

export const projectMilestoneTableRowValidate = z.object({
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

export type tNewProjectMilestone = z.infer<typeof newProjectMilestoneValidate>;
export type tProjectMilestone = z.infer<typeof projectMilestoneValidate>;
export type tProjectMilestoneTableRow = z.infer<
  typeof projectMilestoneTableRowValidate
>;
export type tProjectMilestoneWithTasks = tProjectMilestone & {
  tasks: tProjectTaskWithActivities[];
};
