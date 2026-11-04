
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import axios from 'axios';
import api from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { AuthResponse } from '@/types/api.types';
import {
  loginSchema,
  type LoginFormData,
} from '@/schemas/auth.schema';
import FormField from '@/components/common/FormField';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      });

      login(response.data.user, response.data.accessToken);
      navigate('/dashboard');
    } catch (error: unknown) {
      console.error('Помилка входу:', error);

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
        Вхід
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
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
            placeholder="Ваш пароль"
            {...register('password')}
          />
        </FormField>

        {errors.root && (
          <p className="text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Вхід...' : 'Увійти'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm">
        Ще не маєте акаунта?{' '}
        <Link to="/register" className="text-blue-600">
          Зареєструватися
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
