import { z } from 'zod';

export const newContractDocumentApproverValidate = z.object({
  customerContactId: z.string().trim().min(1),
  approveServiceOrder: z.boolean(),
});

export const contractDocumentApproverValidate = z.object({
  id: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
  contractId: z.string().trim().min(1).optional(),
  customerContactId: z.string().trim().min(1).optional(),
  approveServiceOrder: z.boolean().optional(),
});

export type tNewContractDocumentApprover = z.infer<
  typeof newContractDocumentApproverValidate
>;

export type tContractDocumentApprover = z.infer<
  typeof contractDocumentApproverValidate
>;
