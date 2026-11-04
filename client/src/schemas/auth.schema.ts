import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ error: 'Введіть коректну електронну пошту' }),
  password: z.string().min(6, 'Пароль має містити не менше 6 символів'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Ім’я має містити не менше 2 символів'),
    email: z.email({ error: 'Введіть коректну електронну пошту' }),
    password: z.string().min(8, 'Пароль має містити не менше 8 символів'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;