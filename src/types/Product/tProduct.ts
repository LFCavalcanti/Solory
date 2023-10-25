import { z } from 'zod';

export const newProductValidate = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/(?:^[a-zA-Z0-9-]{1,60}$)|^$/)
    .toUpperCase(),
  description: z.string().trim().min(1).toUpperCase(),
  typeId: z.string().trim().min(1),
  ncm: z
    .string()
    .trim()
    .regex(/\d{8}|^$/)
    .max(8)
    .toUpperCase(),
  codCnae: z.string().trim().regex(/\d{7}/).max(7).toUpperCase(),
  codIss: z
    .string()
    .trim()
    .regex(/^\d+$|^$/)
    .max(4)
    .toUpperCase(),
  codebar: z
    .string()
    .trim()
    .regex(/^\d+$|^$/)
    .toUpperCase()
    .optional(),
  gtin: z
    .string()
    .trim()
    .regex(/^\d+$|^$/)
    .toUpperCase()
    .optional(),
});

export const productValidate = z.object({
  id: z.string().trim().min(1).optional(),
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/(?:^[a-zA-Z0-9-]{1,60}$)|^$/)
    .toUpperCase()
    .optional(),
  description: z.string().trim().min(1).toUpperCase().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  typeId: z.string().trim().min(1).optional(),
  type: z.string().trim().min(1).toUpperCase().optional(),
  ncm: z
    .string()
    .trim()
    .regex(/\d{8}|^$/)
    .max(8)
    .toUpperCase()
    .optional(),
  codCnae: z.string().trim().regex(/\d{7}/).max(7).toUpperCase().optional(),
  codIss: z
    .string()
    .trim()
    .regex(/^\d+$|^$/)
    .max(4)
    .toUpperCase()
    .optional(),
  codebar: z
    .string()
    .trim()
    .regex(/^\d+$|^$/)
    .toUpperCase()
    .optional(),
  gtin: z
    .string()
    .trim()
    .regex(/^\d+$|^$/)
    .toUpperCase()
    .optional(),
  companyId: z.string().trim().min(1).optional(),
  companyGroupId: z.string().trim().min(1).optional(),
});

export const productTableRowValidate = z.object({
  id: z.string().trim().min(1).optional(),
  code: z
    .string()
    .trim()
    .min(1)
    .max(60)
    .regex(/(?:^[a-zA-Z0-9-]{1,60}$)|^$/)
    .toUpperCase(),
  description: z.string().trim().min(1).toUpperCase(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
  typeId: z.string().trim().min(1).optional(),
});

export type tNewProduct = z.infer<typeof newProductValidate>;
export type tProduct = z.infer<typeof productValidate>;
export type tProductTableRow = z.infer<typeof productTableRowValidate>;
