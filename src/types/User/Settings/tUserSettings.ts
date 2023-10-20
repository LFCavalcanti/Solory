import { z } from 'zod';

export const newUserSettingsValidate = z.object({
  userId: z.string().min(1),
  activeCompanyId: z.string().min(1),
});

export const userSettingsValidate = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  activeCompanyId: z.string().min(1).optional(),
});

export type tNewUserSettings = z.infer<typeof newUserSettingsValidate>;
export type tUserSettings = z.infer<typeof userSettingsValidate>;

export type tUserSettingsContext = {
  activeCompanyId: string | undefined;
  activeCompanyName: string | undefined;
  userRoles: string[] | undefined;
};
