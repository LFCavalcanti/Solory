import { z } from 'zod';

export const userProfileValidate = z.object({
  name: z.string().min(3, 'É necessário fornecer um nome'),
  email: z
    .string()
    .email('E-mail inválido')
    .min(1, 'É necessário fornecer um e-mail'),
  emailVerified: z.string().datetime().optional(),
});

export type tUserProfile = z.infer<typeof userProfileValidate>;
