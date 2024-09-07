import { z } from 'zod';

export const newBusinessRoleValidate = z.object({
  name: z.string().trim().min(1).toUpperCase(),
  serviceOrder: z.boolean({
    invalid_type_error: 'serviceOrder must be a boolean',
  }),
  invoiceCalculate: z.boolean({
    invalid_type_error: 'serviceOrder must be a boolean',
  }),
});

export const businessRoleValidate = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1).toUpperCase().optional(),
  serviceOrder: z
    .boolean({
      invalid_type_error: 'serviceOrder must be a boolean',
    })
    .optional(),
  invoiceCalculate: z
    .boolean({
      invalid_type_error: 'serviceOrder must be a boolean',
    })
    .optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  createdAt: z.string().optional(),
  disabledAt: z.string().nullable().optional(),
  companyId: z.string().trim().min(1).optional(),
});

export const businessRoleTableRowValidate = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).toUpperCase(),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
});

export type tNewBusinessRole = z.infer<typeof newBusinessRoleValidate>;
export type tBusinessRole = z.infer<typeof businessRoleValidate>;
export type tBusinessRoleTableRow = z.infer<
  typeof businessRoleTableRowValidate
>;
