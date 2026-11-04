import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router';
import toast from 'react-hot-toast';
import usersService from '@/services/users.service';
import { userSchema, type UserFormData } from '@/schemas/user.schema';
import FormField from '@/components/common/FormField';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

function UserEditPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersService.getById(id!),
    enabled: !!idParam && Number.isInteger(id) && id > 0,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => usersService.update(id!, data),
    onSuccess: () => {
      toast.success('Дані користувача оновлено');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
      navigate('/users');
    },
    onError: () => toast.error('Не вдалося оновити користувача'),
  });

  if (isLoading) return <p>Завантаження...</p>;
  if (isError || !user) return <p className="text-red-600">Користувача не знайдено.</p>;

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-3xl font-bold">Редагування користувача</h1>

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

        <div className="flex gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            Зберегти
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

export default UserEditPage;