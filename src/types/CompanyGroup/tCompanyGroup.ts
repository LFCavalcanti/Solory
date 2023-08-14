import { z } from 'zod';

export const newCompanyGroupValidate = z.object({
  name: z.string().max(100).trim().toUpperCase(),
  description: z.string().trim().toUpperCase(),
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
  name: z.string().max(100).trim().toUpperCase(),
  description: z.string().trim().toUpperCase(),
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

export type tNewCompanyGroup = z.infer<typeof newCompanyGroupValidate>;
export type tCompanyGroup = z.infer<typeof companyGroupValidate>;
