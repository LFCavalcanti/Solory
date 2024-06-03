import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';
import {
  tProjectMilestone,
  tProjectMilestoneWithTasks,
} from './tProjectMilestone';

const typeLiterals = z.union([
  z.literal('PACKAGE'),
  z.literal('SCOPED'),
  z.literal('OPEN_SCOPE'),
]);

export const typeSelectOptions: tSelectMenuOption[] = [
  {
    value: 'PACKAGE',
    label: 'PACOTE SERVIÇO',
  },
  {
    value: 'SCOPED',
    label: 'ESCOPO FECHADO',
  },
  {
    value: 'OPEN_SCOPE',
    label: 'ESCOPO ABERTO',
  },
];

const statusLiterals = z.union([
  z.literal('PROPOSAL'),
  z.literal('APPROVED'),
  z.literal('REFUSED'),
  z.literal('IN_PROGRESS'),
  z.literal('COMPLETE'),
  z.literal('CANCEL'),
  z.literal('REVIEWED'),
]);

export const statusSelectOptions: tSelectMenuOption[] = [
  {
    value: 'PROPOSAL',
    label: 'PROPOSTO',
  },
  {
    value: 'APPROVED',
    label: 'APROVADO',
  },
  {
    value: 'REFUSED',
    label: 'RECUSADO',
  },
  {
    value: 'IN_PROGRESS',
    label: 'EM ANDAMENTO',
  },
  {
    value: 'COMPLETE',
    label: 'COMPLETO',
  },
  {
    value: 'CANCEL',
    label: 'CANCELADO',
  },
  {
    value: 'REVIEWED',
    label: 'REVISADO',
  },
];

const measureTypeLiterals = z.union([
  z.literal('MILESTONE'),
  z.literal('COMPLETION'),
  z.literal('PROGRESS'),
]);

export const measureSelectOptions: tSelectMenuOption[] = [
  {
    value: 'MILESTONE',
    label: 'MILESTONE',
  },
  {
    value: 'COMPLETION',
    label: 'FINALIZAÇÃO',
  },
  {
    value: 'PROGRESS',
    label: 'PROGRESSO',
  },
];

export const newProjectValidate = z
  .object({
    name: z.string().trim().min(1).max(100).toUpperCase(),
    description: z.string().trim().min(1).toUpperCase(),
    type: typeLiterals,
    status: statusLiterals,
    progress: z.coerce.number().nonnegative().max(100),
    startDate: z.string(),
    endDate: z
      .string()
      .transform((val) => (val ? val : null))
      .nullable()
      .optional(),
    totalCost: z.coerce.number().nonnegative(),
    measureType: measureTypeLiterals,
    customerId: z.string().trim().min(1),
    contractId: z.string().trim().min(1).optional(),
  })
  .superRefine((project, ctx) => {
    if (project.status === 'APPROVED' && !project.contractId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para projetos APROVADOS é obrigatório vincular um CONTRATO`,
        path: ['contractId'],
        fatal: true,
      });
      return;
    }
    if (project.status !== 'APPROVED' && project.status !== 'PROPOSAL') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para novos projetos apenas os status PROPOSTA e APROVADO são válidos`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
  });

export const reviewProjectValidate = z
  .object({
    name: z.string().trim().min(1).max(100).toUpperCase(),
    description: z.string().trim().min(1).toUpperCase(),
    type: typeLiterals,
    status: statusLiterals,
    progress: z.coerce.number().nonnegative().max(100),
    startDate: z.string(),
    endDate: z
      .string()
      .transform((val) => (val ? val : null))
      .nullable()
      .optional(),
    totalCost: z.coerce.number().nonnegative(),
    measureType: measureTypeLiterals,
    customerId: z.string().trim().min(1),
    contractId: z.string().trim().min(1).optional(),
  })
  .superRefine((project, ctx) => {
    if (project.status !== 'APPROVED' && project.status !== 'PROPOSAL') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para novos projetos apenas os status PROPOSTA e APROVADO são válidos`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
  });

export const projectValidate = z
  .object({
    id: z.string().trim().min(1).optional(),
    version: z.coerce.number().positive().optional(),
    isActive: z
      .boolean({
        invalid_type_error: 'isActive must be a boolean',
      })
      .optional(),
    name: z.string().trim().min(1).max(100).toUpperCase().optional(),
    description: z.string().trim().min(1).toUpperCase().optional(),
    type: typeLiterals.optional(),
    status: statusLiterals.optional(),
    progress: z.coerce.number().nonnegative().max(100).optional(),
    startDate: z.string().optional(),
    endDate: z
      .string()
      .transform((val) => (val ? val : null))
      .nullable()
      .optional(),
    totalCost: z.coerce.number().nonnegative().optional(),
    measureType: measureTypeLiterals.optional(),
    customerId: z.string().trim().min(1).optional(),
    contractId: z.string().trim().min(1).optional(),
    companyId: z.string().trim().min(1).optional(),
  })
  .superRefine((project, ctx) => {
    if (project.status === 'APPROVED' && !project.contractId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Para contratos APROVADOS é obrigatório vincular um CONTRATO`,
        path: ['contractId'],
        fatal: true,
      });
    }
  });

export const projectTableRowValidate = z.object({
  id: z.string().trim().min(1),
  version: z.coerce.number().positive().optional(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  name: z.string().trim().min(1).max(100).toUpperCase(),
  type: typeLiterals,
  status: statusLiterals,
  progress: z.coerce.number().nonnegative().max(100),
  startDate: z.string(),
  endDate: z
    .string()
    .transform((val) => (val ? val : null))
    .nullable()
    .optional(),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
  customer: z.object({
    aliasName: z.string().trim().min(1).toUpperCase().max(60),
  }),
});

export type tNewProject = z.infer<typeof newProjectValidate>;
export type tProject = z.infer<typeof projectValidate>;
export type tProjectTableRow = z.infer<typeof projectTableRowValidate>;
export type tPtojectWithMilestones = tProject & {
  milestones: tProjectMilestone[] | tProjectMilestoneWithTasks[];
};
