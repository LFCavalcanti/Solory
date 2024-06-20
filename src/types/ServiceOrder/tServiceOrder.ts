import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';

const typeLiterals = z.union([
  z.literal('ON_SITE_SCHEDULE'),
  z.literal('REMOTE_SCHEDULE'),
  z.literal('ON_DEMAND'),
]);

export const typeSelectOptions: tSelectMenuOption[] = [
  {
    value: 'ON_SITE_SCHEDULE',
    label: 'AGENDA PRESENCIAL',
  },
  {
    value: 'REMOTE_SCHEDULE',
    label: 'AGENDA REMOTA',
  },
  {
    value: 'ON_DEMAND',
    label: 'ATENDIMENTO AVULSO',
  },
];

const statusLiterals = z.union([
  z.literal('DRAFT'),
  z.literal('ISSUED'),
  z.literal('CUSTOMER_APPROVED'),
  z.literal('TIMEOUT_APPROVED'),
  z.literal('REFUSED'),
  z.literal('BILLED'),
  z.literal('CANCELED'),
]);

export const statusSelectOptions: tSelectMenuOption[] = [
  {
    value: 'DRAFT',
    label: 'RASCUNHO',
  },
  {
    value: 'ISSUED',
    label: 'EMITIDA',
  },
  {
    value: 'CUSTOMER_APPROVED',
    label: 'APROVADA - CLIENTE',
  },
  {
    value: 'TIMEOUT_APPROVED',
    label: 'APROVADA - POR TEMPO',
  },
  {
    value: 'REFUSED',
    label: 'RECUSADA',
  },
  {
    value: 'BILLED',
    label: 'FATURADA',
  },
  {
    value: 'CANCELED',
    label: 'CANCELADA',
  },
];

export const newServiceOrderValidate = z
  .object({
    orderCode: z.string().trim().min(1).max(10).toUpperCase(),
    status: statusLiterals,
    customerId: z.string().trim().min(1),
    customerAddressId: z.string().trim().min(1).optional(),
    contractId: z.string().trim().min(1),
    contractItemId: z.string().trim().min(1),
    analystId: z.string().trim().min(1),
    orderDate: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    breakTotal: z.coerce.number().nonnegative(),
    totalWork: z.coerce.number().nonnegative(),
    type: typeLiterals,
    serviceSummary: z.string().min(1).max(500).toUpperCase(),
    tasksText: z.string().min(1).max(20000),
    notesText: z.string().max(20000).optional(),
    meals: z.coerce.number().nonnegative(),
    travel: z.boolean(),
  })
  .superRefine((serviceOrder, ctx) => {
    if (serviceOrder.status !== 'DRAFT' && serviceOrder.status !== 'ISSUED') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Uma nova Ordem de Serviço só pode estar em RASCUNHO ou EMITIDA`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
    if (
      serviceOrder.type === 'ON_SITE_SCHEDULE' &&
      !serviceOrder.customerAddressId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `AGENDAS PRESENCIAIS devem estar associadas com um endereço de cliente`,
        path: ['customerAddressId'],
        fatal: true,
      });
      return;
    }
  });

export const serviceOrderValidate = z
  .object({
    id: z.string().trim().min(1).optional(),
    orderCode: z.string().trim().min(1).max(10).toUpperCase().optional(),
    isActive: z.boolean().optional(),
    createdAt: z.string().optional(),
    disabledAt: z.string().optional(),
    status: statusLiterals.optional(),
    companyId: z.string().trim().min(1).optional(),
    customerId: z.string().trim().min(1).optional(),
    customerAddressId: z.string().trim().min(1).optional(),
    contractId: z.string().trim().min(1).optional(),
    contractItemId: z.string().trim().min(1).optional(),
    analystId: z.string().trim().min(1).optional(),
    orderDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    breakTotal: z.coerce.number().nonnegative().optional(),
    totalWork: z.coerce.number().nonnegative().optional(),
    type: typeLiterals.optional(),
    serviceSummary: z.string().min(1).max(500).toUpperCase().optional(),
    tasksText: z.string().min(1).max(20000).optional(),
    notesText: z.string().max(20000).optional().optional(),
    meals: z.coerce.number().nonnegative().optional(),
    travel: z.boolean().optional(),
  })
  .superRefine((serviceOrder, ctx) => {
    if (
      serviceOrder.type === 'ON_SITE_SCHEDULE' &&
      !serviceOrder.customerAddressId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `AGENDAS PRESENCIAIS devem estar associadas com um endereço de cliente`,
        path: ['customerAddressId'],
        fatal: true,
      });
      return;
    }
  });

export const serviceOrderDraftValidate = z
  .object({
    id: z.string().trim().min(1).optional(),
    orderCode: z.string().trim().min(1).max(10).toUpperCase().optional(),
    isActive: z.boolean().optional(),
    status: statusLiterals.optional(),
    customerAddressId: z.string().trim().min(1).optional(),
    contractId: z.string().trim().min(1).optional(),
    contractItemId: z.string().trim().min(1).optional(),
    analystId: z.string().trim().min(1).optional(),
    orderDate: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    breakTotal: z.coerce.number().nonnegative().optional(),
    totalWork: z.coerce.number().nonnegative().optional(),
    type: typeLiterals.optional(),
    serviceSummary: z.string().min(1).max(500).toUpperCase().optional(),
    tasksText: z.string().min(1).max(20000).optional(),
    notesText: z.string().max(20000).optional().optional(),
    meals: z.coerce.number().nonnegative().optional(),
    travel: z.boolean().optional(),
  })
  .superRefine((serviceOrder, ctx) => {
    if (serviceOrder.status !== 'DRAFT' && serviceOrder.status !== 'ISSUED') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Uma nova Ordem de Serviço só pode estar em RASCUNHO ou EMITIDA`,
        path: ['status'],
        fatal: true,
      });
      return;
    }
    if (
      serviceOrder.type === 'ON_SITE_SCHEDULE' &&
      !serviceOrder.customerAddressId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `AGENDAS PRESENCIAIS devem estar associadas com um endereço de cliente`,
        path: ['customerAddressId'],
        fatal: true,
      });
      return;
    }
  });

export const serviceOrderTableRowValidate = z.object({
  id: z.string().trim().min(1),
  orderCode: z.string().trim().min(1).max(10).toUpperCase(),
  isActive: z.boolean(),
  status: statusLiterals,
  orderDate: z.string(),
  totalWork: z.coerce.number().nonnegative(),
  type: typeLiterals,
  customer: z.object({
    aliasName: z.string().trim().min(1).toUpperCase().max(60),
  }),
});

export type tNewServiceOrder = z.infer<typeof newServiceOrderValidate>;
export type tServiceOrder = z.infer<typeof serviceOrderValidate>;
export type tServiceOrderDraft = z.infer<typeof serviceOrderDraftValidate>;
export type tServiceOrderTableRow = z.infer<
  typeof serviceOrderTableRowValidate
>;
