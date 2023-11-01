import { z } from 'zod';

export const newSupplierContactValidate = z.object({
  name: z.string().trim().min(1).toUpperCase(),
  role: z.string().trim().min(1).toUpperCase(),
  email: z
    .string()
    .email('E-mail inválido')
    .min(1, 'É necessário fornecer um e-mail'),
  phone: z
    .string()
    .trim()
    .regex(/\d{2}\d{4,5}\d{4}|^$/),
});

export const supplierContactValidate = z.object({
  id: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  createdAt: z.string().optional(),
  disabledAt: z.string().nullable().optional(),
  name: z.string().trim().min(1).toUpperCase().optional(),
  role: z.string().trim().min(1).toUpperCase().optional(),
  email: z
    .string()
    .email('E-mail inválido')
    .min(1, 'É necessário fornecer um e-mail')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/\d{2}\d{4,5}\d{4}|^$/)
    .optional(),
});

export const supplierContactTableRow = z.object({
  d: z.string().optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  name: z.string().trim().min(1).toUpperCase().optional(),
  role: z.string().trim().min(1).toUpperCase().optional(),
});

export type tNewSupplierContact = z.infer<typeof newSupplierContactValidate>;
export type tSupplierContact = z.infer<typeof supplierContactValidate>;
export type tSupplierContactTableRow = z.infer<typeof supplierContactTableRow>;
