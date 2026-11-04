import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import usersService from '@/services/users.service';
import {
  userCreateSchema,
  type UserCreateFormData,
} from '@/schemas/user.schema';
import FormField from '@/components/common/FormField';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

function UserCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
  });

  const mutation = useMutation({
    mutationFn: usersService.create,
    onSuccess: () => {
      toast.success('Користувача створено');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/users');
    },
    onError: () => toast.error('Помилка створення користувача'),
  });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-bold">Створення користувача</h1>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <FormField label="Ім’я" error={errors.name?.message}>
          <Input {...register('name')} placeholder="Введіть ім’я" />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input {...register('email')} type="email" placeholder="Введіть email" />
        </FormField>

        <FormField label="Пароль" error={errors.password?.message}>
          <Input {...register('password')} type="password" placeholder="Введіть пароль" />
        </FormField>

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Створення...' : 'Створити'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/users')}
          >
            Скасувати
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UserCreatePage;