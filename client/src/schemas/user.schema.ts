import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, 'Мінімум 2 символи'),
  email: z.email({ error: 'Введіть коректний email' }),
});

export const userCreateSchema = userSchema.extend({
  password: z.string().min(8, 'Пароль має містити не менше 8 символів'),
});

export type UserFormData = z.infer<typeof userSchema>;
export type UserCreateFormData = z.infer<typeof userCreateSchema>;