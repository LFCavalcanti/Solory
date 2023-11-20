import { z } from 'zod';

export const newCustomerAddressValidate = z.object({
  isMainAddress: z.boolean(),
  street: z.string().trim().min(1).toUpperCase(),
  lotNumber: z.string().trim().min(1),
  complement: z.string().trim().toUpperCase().optional(),
  locale: z.string().trim().min(1).toUpperCase(),
  postalCode: z
    .string()
    .trim()
    .min(1)
    .regex(/\d{4,5}\d{3}/)
    .max(8),
  state: z.string().trim().min(1).toUpperCase().max(2),
  cityCode: z.string().regex(/^\d+$/),
  information: z.string().trim().toUpperCase().optional(),
});

export const customerAddressValidate = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  companyId: z.string().optional(),
  isMainAddress: z.boolean().optional(),
  street: z.string().trim().min(1).toUpperCase().optional(),
  lotNumber: z.string().trim().min(1).optional(),
  complement: z.string().trim().toUpperCase().optional(),
  locale: z.string().trim().min(1).toUpperCase().optional(),
  postalCode: z
    .string()
    .trim()
    .min(1)
    .regex(/\d{4,5}\d{3}/)
    .max(8)
    .optional(),
  state: z.string().trim().min(1).toUpperCase().max(2).optional(),
  cityCode: z.string().regex(/^\d+$/).optional(),
  information: z.string().trim().toUpperCase().optional(),
});

export const customerAddressTableRow = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  companyId: z.string().optional(),
  isMainAddress: z.boolean().optional(),
  street: z.string().trim().min(1).toUpperCase().optional(),
  state: z.string().trim().min(1).toUpperCase().max(2).optional(),
  cityCode: z.string().regex(/^\d+$/).optional(),
});

export type tNewCustomerAddress = z.infer<typeof newCustomerAddressValidate>;
export type tCustomerAddress = z.infer<typeof customerAddressValidate>;
export type tCustomerAddressTableRow = z.infer<typeof customerAddressTableRow>;
