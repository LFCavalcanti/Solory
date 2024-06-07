import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';

const typeLiterals = z.union([
  z.literal('ISSUED'),
  z.literal('APPROVAL_CUSTOMER'),
  z.literal('APPROVAL_AUTOMATIC'),
  z.literal('REFUSAL'),
  z.literal('BILLIED'),
  z.literal('CANCELLED_BILLING'),
  z.literal('SUPRESSED_ON_BILL'),
  z.literal('OTHER'),
]);

export const typeSelectOptions: tSelectMenuOption[] = [
  {
    value: 'ISSUED',
    label: 'EMISSÃO',
  },
  {
    value: 'APPROVAL_CUSTOMER',
    label: 'APROVADA PELO CLIENTE',
  },
  {
    value: 'APPROVAL_AUTOMATIC',
    label: 'APROVADA APOS ESPERA',
  },
  {
    value: 'REFUSAL',
    label: 'RECUSADA',
  },
  {
    value: 'BILLIED',
    label: 'FATURADA',
  },
  {
    value: 'CANCELLED_BILLING',
    label: 'FATURAMENTO CANCELADO',
  },
  {
    value: 'SUPRESSED_ON_BILL',
    label: 'ABONADA DA FATURA',
  },
  {
    value: 'OTHER',
    label: 'OUTROS',
  },
];

export const newServiceOrderEventValidate = z.object({
  serviceOrderId: z.string().trim().min(1),
  timeStamp: z.string(),
  eventType: typeLiterals,
  isActionAutomatic: z.boolean(),
  description: z.string().min(1).max(500).toUpperCase(),
  userId: z.string().trim().min(1).optional(),
});

export const serviceOrderEventValidate = z.object({
  id: z.string().trim().min(1),
  serviceOrderId: z.string().trim().min(1),
  timeStamp: z.string(),
  eventType: typeLiterals,
  isActionAutomatic: z.boolean(),
  description: z.string().min(1).max(500).toUpperCase(),
  userId: z.string().trim().min(1).optional(),
});

export const serviceOrderEventTableRowValidate = z.object({
  id: z.string().trim().min(1),
  timeStamp: z.string(),
  eventType: typeLiterals,
  isActionAutomatic: z.boolean(),
});

export type tNewServiceOrderEvent = z.infer<
  typeof newServiceOrderEventValidate
>;
export type tServiceOrderEvent = z.infer<typeof serviceOrderEventValidate>;
export type tServiceOrderEventTableRow = z.infer<
  typeof serviceOrderEventTableRowValidate
>;
