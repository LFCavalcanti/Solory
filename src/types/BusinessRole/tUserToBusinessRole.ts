import { z } from 'zod';

export const newUserToBusinessRoleValidate = z.object({
  userId: z.string().trim().min(1),
});

export const userToBusinessRoleValidate = z.object({
  id: z.string().trim().min(1).optional(),
  userId: z.string().trim().min(1).optional(),
  businessRoleId: z.string().trim().min(1).optional(),
  isActive: z
    .boolean({
      invalid_type_error: 'isActive must be a boolean',
    })
    .optional(),
  createdAt: z.string().optional(),
  disabledAt: z.string().nullable().optional(),
});

export const userToBusinessRoleTableRowValidate = z.object({
  id: z.string().trim().min(1),
  isActive: z.boolean({
    invalid_type_error: 'isActive must be a boolean',
  }),
  createdAt: z.string(),
  disabledAt: z.string().nullable(),
  user: z.object({
    name: z.string(),
  }),
});

export type tNewUserToBusinessRole = z.infer<
  typeof newUserToBusinessRoleValidate
>;
export type tUserToBusinessRole = z.infer<typeof userToBusinessRoleValidate>;
export type tUserToBusinessRoleTableRow = z.infer<
  typeof userToBusinessRoleTableRowValidate
>;

export type tNewUserToBusinessRoleApi = tNewUserToBusinessRole & {
  createdAt: string;
};
