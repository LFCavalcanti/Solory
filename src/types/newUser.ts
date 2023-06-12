import { z } from 'zod';

export const newUserValidate = z
  .object({
    name: z.string().min(3, 'É necessário fornecer um nome'),
    email: z
      .string()
      .email('E-mail inválido')
      .min(1, 'É necessário fornecer um e-mail'),
    emailVerified: z.string().datetime().optional(),
    password: z.string().min(8, 'Senha não atende aos requisitos de segurança'),
    confirmPassword: z
      .string()
      .min(8, 'Senha não atende aos requisitos de segurança')
      .optional(),
    image: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Senhas são diferentes',
  });

export type tNewUser = z.infer<typeof newUserValidate>;
