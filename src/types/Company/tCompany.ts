import { z } from 'zod';

export const newCompanyValidate = z.object({
  aliasName: z.string().trim().nonempty().toUpperCase().max(60),
  fullName: z.string().trim().nonempty().toUpperCase(),
  cnpj: z
    .string()
    .trim()
    .nonempty()
    .regex(/\d{14}/)
    .max(14),
  logo: z.string().optional(),
  mainCnae: z.string().trim().nonempty().regex(/\d{7}/).max(7),
  mainIssCode: z
    .string()
    .trim()
    .regex(/\d{4}|^$/)
    .max(4)
    .optional(),
  isMei: z.boolean().optional(),
  isSimplesNac: z.boolean().optional(),
  phone: z
    .string()
    .trim()
    .nonempty()
    .regex(/\d{2}\d{4,5}\d{4}/),
  companyGroupId: z.string(),
});

export const companyValidate = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  aliasName: z.string().trim().nonempty().toUpperCase().max(60).optional(),
  fullName: z.string().trim().nonempty().toUpperCase().optional(),
  cnpj: z
    .string()
    .trim()
    .nonempty()
    .regex(/\d{14}/)
    .max(14)
    .optional(),
  logo: z.string().nullable().optional(),
  mainCnae: z.string().trim().nonempty().regex(/\d{7}/).max(7).optional(),
  mainIssCode: z
    .string()
    .trim()
    .regex(/\d{4}|^$/)
    .max(4)
    .optional(),
  isMei: z.boolean().optional(),
  isSimplesNac: z.boolean().optional(),
  phone: z
    .string()
    .trim()
    .nonempty()
    .regex(/\d{2}\d{4,5}\d{4}/)
    .optional(),
  companyGroupId: z.string().optional(),
});

export const companyTableRow = z.object({
  id: z.string().nonempty(),
  aliasName: z.string().trim().nonempty().toUpperCase().max(60),
  fullName: z.string().trim().nonempty().toUpperCase(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
});

export type tNewCompany = z.infer<typeof newCompanyValidate>;
export type tCompany = z.infer<typeof companyValidate>;
export type tCompanyTableRow = z.infer<typeof companyTableRow>;
