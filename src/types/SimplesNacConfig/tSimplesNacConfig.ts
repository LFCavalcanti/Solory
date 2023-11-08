import { z } from 'zod';

export const newSimplesNacConfigValidate = z.object({
  cnaeCode: z.string().trim().regex(/\d{7}/).max(7).toUpperCase(),
  anexoSimples: z.string().trim().min(1).max(4).toUpperCase(),
  activeSince: z.string(),
  expiresAt: z
    .string()
    .transform((val) => (val ? val : null))
    .nullable()
    .optional(),
  isEligibleRFactor: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  rFactor: z.coerce.number().lt(100).nonnegative().multipleOf(0.01),
  aliquotStandard: z.coerce.number().lt(100).positive().multipleOf(0.01),
  aliquotRFactor: z.coerce.number().lt(100).nonnegative().multipleOf(0.01),
  anexoSimplesFatorR: z
    .string()
    .trim()
    .min(1)
    .max(4)
    .toUpperCase()
    .transform((val) => (val ? val : null))
    .nullable()
    .optional(),
  floorRevenue: z.coerce.number().nonnegative(),
  ceilRevenue: z.coerce.number().positive(),
});

export const simplesNacConfigValidate = z.object({
  id: z.string().trim().min(1).optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  activeSince: z.string().optional(),
  expiresAt: z
    .string()
    .transform((val) => (val ? val : null))
    .nullable()
    .optional(),
  cnaeCode: z.string().trim().regex(/\d{7}/).max(7).toUpperCase().optional(),
  anexoSimples: z.string().trim().min(1).max(4).toUpperCase().optional(),
  isEligibleRFactor: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  rFactor: z.coerce.number().lt(100).nonnegative().multipleOf(0.01).optional(),
  aliquotStandard: z.coerce
    .number()
    .lt(100)
    .positive()
    .multipleOf(0.01)
    .optional(),
  aliquotRFactor: z.coerce
    .number()
    .lt(100)
    .nonnegative()
    .multipleOf(0.01)
    .optional(),
  anexoSimplesFatorR: z
    .string()
    .trim()
    .min(1)
    .max(4)
    .toUpperCase()
    .nullable()
    .optional(),
  floorRevenue: z.coerce.number().nonnegative().optional(),
  ceilRevenue: z.coerce.number().positive().optional(),
  companyId: z.string().optional(),
  companyGroupId: z.string().optional(),
});

export const simplesNacConfigTableRowValidate = z.object({
  id: z.string().trim().min(1).optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  activeSince: z.string().optional(),
  expiresAt: z.string().nullable().optional(),
  cnaeCode: z.string().trim().regex(/\d{7}/).max(7).toUpperCase().optional(),
  anexoSimples: z.string().trim().min(1).max(4).toUpperCase().optional(),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
  floorRevenue: z.number().nonnegative(),
  ceilRevenue: z.number().positive(),
});

export type tNewSimplesNacConfig = z.infer<typeof newSimplesNacConfigValidate>;
export type tSimplesNacConfig = z.infer<typeof simplesNacConfigValidate>;
export type tSimplesNacConfigTableRow = z.infer<
  typeof simplesNacConfigTableRowValidate
>;
