import { z } from 'zod';

export const newCompanyGroupValidate = z.object({
  name: z.string().nonempty().max(100).trim().toUpperCase(),
  description: z.string().nonempty().trim().toUpperCase(),
  shareSuppliers: z
    .boolean({
      invalid_type_error: 'shareSuppliers must be a boolean',
    })
    .optional(),
  shareClients: z
    .boolean({
      invalid_type_error: 'shareClients must be a boolean',
    })
    .optional(),
  shareProducts: z
    .boolean({
      invalid_type_error: 'shareProducts must be a boolean',
    })
    .optional(),
  shareKpi: z
    .boolean({
      invalid_type_error: 'shareProducts must be a boolean',
    })
    .optional(),
});

export const companyGroupValidate = z.object({
  id: z.string().optional(),
  name: z.string().nonempty().max(100).trim().toUpperCase().optional(),
  description: z.string().nonempty().trim().toUpperCase().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  shareSuppliers: z
    .boolean({
      invalid_type_error: 'shareSuppliers must be a boolean',
    })
    .optional(),
  shareClients: z
    .boolean({
      invalid_type_error: 'shareClients must be a boolean',
    })
    .optional(),
  shareProducts: z
    .boolean({
      invalid_type_error: 'shareProducts must be a boolean',
    })
    .optional(),
  shareKpi: z
    .boolean({
      invalid_type_error: 'shareProducts must be a boolean',
    })
    .optional(),
});

export const companyGroupTableRow = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty().max(100).trim().toUpperCase(),
  description: z.string().nonempty().trim().toUpperCase(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
});

export type tNewCompanyGroup = z.infer<typeof newCompanyGroupValidate>;
export type tCompanyGroup = z.infer<typeof companyGroupValidate>;
export type tCompanyGroupTableRow = z.infer<typeof companyGroupTableRow>;
