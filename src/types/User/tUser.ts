import { z } from 'zod';

export const userProfileValidate = z
  .object({
    name: z.string().min(3, 'É necessário fornecer um nome'),
    email: z
      .string()
      .email('E-mail inválido')
      .min(1, 'É necessário fornecer um e-mail'),
    emailVerified: z.string().datetime().optional(),
    currentPassword: z
      .string()
      .min(8, 'Senha não atende aos requisitos de segurança')
      .optional(),
    newPassword: z
      .string()
      .min(8, 'Senha não atende aos requisitos de segurança')
      .optional(),
    confirmNewPassword: z
      .string()
      .min(8, 'Senha não atende aos requisitos de segurança')
      .optional(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ['confirmPassword'],
    message: 'Senhas são diferentes',
  });

export type tUserProfile = z.infer<typeof userProfileValidate>;

export type tUserProfileData = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
};
