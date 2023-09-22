import { z } from 'zod';

export const newCompanyAddressValidate = z.object({
  isMainAddress: z.boolean(),
  street: z.string().trim().nonempty().toUpperCase(),
  lotNumber: z.string().trim().nonempty(),
  complement: z.string().trim().nonempty().toUpperCase().optional(),
  locale: z.string().trim().nonempty().toUpperCase(),
  postalCode: z
    .string()
    .trim()
    .nonempty()
    .regex(/\d{4,5}\d{3}/)
    .max(8),
  state: z.string().trim().nonempty().toUpperCase().max(2),
  cityCode: z.string().regex(/^\d+$/),
  information: z.string().trim().nonempty().toUpperCase().optional(),
});

export const companyAddressValidate = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  companyId: z.string().optional(),
  isMainAddress: z.boolean().optional(),
  street: z.string().trim().nonempty().toUpperCase().optional(),
  lotNumber: z.string().trim().nonempty().optional(),
  complement: z.string().trim().nonempty().toUpperCase().optional(),
  locale: z.string().trim().nonempty().toUpperCase().optional(),
  postalCode: z
    .string()
    .trim()
    .nonempty()
    .regex(/\d{4,5}\d{3}/)
    .max(4)
    .optional(),
  state: z.string().trim().nonempty().toUpperCase().max(2).optional(),
  cityCode: z.string().regex(/^\d+$/).optional(),
  information: z.string().trim().nonempty().toUpperCase().optional(),
});

export const companyAddressTableRow = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  companyId: z.string().optional(),
  isMainAddress: z.boolean().optional(),
  street: z.string().trim().nonempty().toUpperCase().optional(),
  state: z.string().trim().nonempty().toUpperCase().max(2).optional(),
  cityCode: z.string().regex(/^\d+$/).optional(),
});

export type tNewCompanyAddress = z.infer<typeof newCompanyAddressValidate>;
export type tCompanyAddress = z.infer<typeof companyAddressValidate>;
export type tCompanyAddressTableRow = z.infer<typeof companyAddressTableRow>;
