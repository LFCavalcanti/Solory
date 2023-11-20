import { z } from 'zod';

export const newCustomerValidate = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/(?:^[a-zA-Z0-9-]{1,60}$)|^$/)
    .toUpperCase(),
  aliasName: z.string().trim().min(1).toUpperCase().max(60),
  fullName: z.string().trim().min(1).toUpperCase(),
  cnpj: z
    .string()
    .trim()
    .regex(/\d{14}/)
    .max(14),
  logo: z.string().optional().nullable(),
  isMei: z.boolean().optional(),
  isSimplesNac: z.boolean().optional(),
  phone: z
    .string()
    .trim()
    .min(1)
    .regex(/\d{2}\d{4,5}\d{4}/),
});

export const customerValidate = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/(?:^[a-zA-Z0-9-]{1,60}$)|^$/)
    .toUpperCase()
    .optional(),
  aliasName: z.string().trim().min(1).toUpperCase().max(60).optional(),
  fullName: z.string().trim().min(1).toUpperCase().optional(),
  cnpj: z
    .string()
    .trim()
    .regex(/\d{14}/)
    .max(14)
    .optional(),
  logo: z.string().optional().nullable(),
  isMei: z.boolean().optional(),
  isSimplesNac: z.boolean().optional(),
  phone: z
    .string()
    .trim()
    .min(1)
    .regex(/\d{2}\d{4,5}\d{4}/)
    .optional(),
  companyId: z.string().optional(),
  companyGroupId: z.string().optional(),
});

export const customerTableRow = z.object({
  id: z.string().min(1),
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/(?:^[a-zA-Z0-9-]{1,60}$)|^$/)
    .toUpperCase()
    .optional(),
  aliasName: z.string().trim().min(1).toUpperCase().max(60),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
});

export type tNewCustomer = z.infer<typeof newCustomerValidate>;
export type tCustomer = z.infer<typeof customerValidate>;
export type tCustomerTableRow = z.infer<typeof customerTableRow>;
