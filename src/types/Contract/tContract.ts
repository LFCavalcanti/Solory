import { z } from 'zod';
import { tSelectMenuOption } from '../tSelectMenuOption';
import ValidateBrContract from '@/lib/validateBusinessRules/validateBrContract';

const recurrenceLiterals = z.union([
  z.literal('INVOICE'),
  z.literal('FIXED'),
  z.literal('ON_DEMAND'),
  z.literal('NONE'),
]);

export const recurrenceSelectOptions: tSelectMenuOption[] = [
  {
    value: 'INVOICE',
    label: 'FATURA',
  },
  {
    value: 'FIXED',
    label: 'FIXO',
  },
  {
    value: 'ON_DEMAND',
    label: 'SOB DEMANDA',
  },
  {
    value: 'NONE',
    label: 'NENHUMA',
  },
];

const measureTypeLiterals = z.union([
  z.literal('EVENTUAL'),
  z.literal('WEEKLY'),
  z.literal('MONTLY'),
  z.literal('SCOPE'),
  z.literal('ONCE'),
]);

export const measureTypeSelectOptions: tSelectMenuOption[] = [
  {
    label: 'EVENTUAL',
    value: 'EVENTUAL',
  },
  {
    label: 'SEMANAL',
    value: 'WEEKLY',
  },
  {
    label: 'MENSAL',
    value: 'MONTLY',
  },
  {
    label: 'ESCOPO',
    value: 'SCOPE',
  },
  {
    label: 'UNICA',
    value: 'ONCE',
  },
];

const contractTypeLiterals = z.union([
  z.literal('PACKAGE'),
  z.literal('PROJECT'),
  z.literal('ON_DEMAND'),
]);

export const contractTypeSelectOptions: tSelectMenuOption[] = [
  {
    label: 'PACOTE',
    value: 'PACKAGE',
  },
  {
    label: 'PROJETO',
    value: 'PROJECT',
  },
  {
    label: 'SOB DEMANDA',
    value: 'ON_DEMAND',
  },
];

const paymentTypeLiterals = z.union([
  z.literal('X_DAYS'),
  z.literal('FIXED_DAY'),
  z.literal('DAY_OF_MONTH'),
]);

export const paymentTypeSelectOptions: tSelectMenuOption[] = [
  {
    label: 'X DIAS',
    value: 'X_DAYS',
  },
  {
    label: 'DIA FIXO',
    value: 'FIXED_DAY',
  },
  {
    label: 'DIA DO MES',
    value: 'DAY_OF_MONTH',
  },
];

export const newContractValidate = z
  .object({
    termStart: z.string(),
    termEnd: z
      .string()
      .transform((val) => (val ? val : null))
      .nullable()
      .optional(),
    termDuration: z.coerce.number().nonnegative(),
    description: z.string().trim().min(1).toUpperCase(),
    recurrence: recurrenceLiterals,
    measureType: measureTypeLiterals,
    contractType: contractTypeLiterals,
    paymentType: paymentTypeLiterals,
    paymentTerm: z.coerce.number().nonnegative(),
    invoiceClosureDay: z.coerce.number().nonnegative().optional(),
    autoRenewal: z.boolean(),
    renewalPriceIndex: z.string().trim().max(10).toUpperCase(),
    generalNotes: z.string(),
    customerId: z.string().trim().min(1),
  })
  .superRefine((contract, ctx) => ValidateBrContract(contract, ctx));

export const contractValidate = z
  .object({
    id: z.string().trim().min(1).optional(),
    isActive: z
      .boolean({
        invalid_type_error: 'isActive must be a boolean',
      })
      .optional(),
    termStart: z.string().optional(),
    termEnd: z
      .string()
      .transform((val) => (val ? val : null))
      .nullable()
      .optional(),
    termDuration: z.coerce.number().nonnegative().optional(),
    description: z.string().trim().min(1).toUpperCase().optional(),
    recurrence: recurrenceLiterals.optional(),
    measureType: measureTypeLiterals.optional(),
    contractType: contractTypeLiterals.optional(),
    paymentType: paymentTypeLiterals.optional(),
    paymentTerm: z.coerce.number().nonnegative().optional(),
    invoiceClosureDay: z.coerce.number().nonnegative().optional(),
    autoRenewal: z.boolean().optional(),
    renewalPriceIndex: z.string().trim().max(10).toUpperCase().optional(),
    generalNotes: z.string().optional(),
    customerId: z.string().trim().min(1).optional(),
    companyId: z.string().trim().min(1).optional(),
  })
  .superRefine((contract, ctx) => ValidateBrContract(contract, ctx));

export const contractTableRowValidate = z.object({
  id: z.string().trim().min(1),
  description: z.string().trim().min(1).toUpperCase(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  termStart: z.string(),
  termEnd: z
    .string()
    .transform((val) => (val ? val : null))
    .nullable(),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
  customer: z.object({
    aliasName: z.string().trim().min(1).toUpperCase().max(60),
  }),
});

export type tNewContract = z.infer<typeof newContractValidate>;
export type tContract = z.infer<typeof contractValidate>;
export type tContractTableRow = z.infer<typeof contractTableRowValidate>;
