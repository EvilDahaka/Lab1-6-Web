
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse } from '@/types/api.types';
import {
  registerSchema,
  type RegisterFormData,
} from '@/schemas/auth.schema';
import FormField from '@/components/common/FormField';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });

      login(response.data.user, response.data.accessToken);
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Помилка реєстрації:', error);

      if (axios.isAxiosError(error)) {
        const serverData = error.response?.data;

        const message =
          serverData?.message ||
          serverData?.error ||
          error.message;

        setError('root', {
          message: String(message),
        });
      } else {
        setError('root', {
          message:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-md rounded-xl bg-white p-8 shadow">
      <h1 className="mb-6 text-center text-2xl font-bold">
        Реєстрація
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField label="Ім’я" error={errors.name?.message}>
          <Input placeholder="Ваше ім’я" {...register('name')} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="Ваша пошта"
            {...register('email')}
          />
        </FormField>

        <FormField label="Пароль" error={errors.password?.message}>
          <Input
            type="password"
            placeholder="Ваш пароль (від 8 символів)"
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Підтвердження пароля"
          error={errors.confirmPassword?.message}
        >
          <Input
            type="password"
            placeholder="Повторіть пароль"
            {...register('confirmPassword')}
          />
        </FormField>

        {errors.root && (
          <p className="text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Реєстрація...' : 'Зареєструватися'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        Вже маєте акаунт?{' '}
        <Link to="/login" className="text-blue-600">
          Увійти
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
