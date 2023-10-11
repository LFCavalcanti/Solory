import { z } from 'zod';

export const newCompanyCnaeIssValidate = z.object({
  cnaeCode: z.string().trim().nonempty().regex(/\d{7}/).max(7),
  issCode: z
    .string()
    .trim()
    .regex(/\d{4}|^$/)
    .max(4)
    .optional(),
  description: z.string().trim().nonempty(),
});

export const companyCnaeIssValidate = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  companyId: z.string().optional(),
  cnaeCode: z.string().trim().nonempty().regex(/\d{7}/).max(7).optional(),
  issCode: z
    .string()
    .trim()
    .regex(/\d{4}|^$/)
    .max(4)
    .optional(),
  description: z.string().trim().nonempty().optional(),
});

export const companyCnaeIssTableRow = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  cnaeCode: z.string().trim().nonempty().regex(/\d{7}/).max(7).optional(),
  issCode: z
    .string()
    .trim()
    .regex(/\d{4}|^$/)
    .max(4)
    .optional(),
  description: z.string().trim().nonempty().optional(),
});

export type tNewCompanyCnaeIss = z.infer<typeof newCompanyCnaeIssValidate>;
export type tCompanyCnaeIss = z.infer<typeof companyCnaeIssValidate>;
export type tCompanyCnaeIssTableRow = z.infer<typeof companyCnaeIssValidate>;
