import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import usersService from '@/services/users.service';
import useDebounce from '@/hooks/useDebounce';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

function UsersListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.role === 'ADMIN';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', page, debouncedSearch],
    queryFn: () => usersService.getAll(page, 10, debouncedSearch),
  });

  const deleteMutation = useMutation({
    mutationFn: usersService.remove,
    onSuccess: () => {
      toast.success('Користувача видалено');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => toast.error('Не вдалося видалити користувача'),
  });

  const handleDelete = (id: number) => {
    if (confirm('Ви впевнені, що хочете видалити користувача?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Користувачі</h1>

        {isAdmin && (
          <Button onClick={() => navigate('/users/create')}>
            Додати користувача
          </Button>
        )}
      </div>

      <Input
        placeholder="Пошук користувачів..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />

      {isLoading && <p>Завантаження користувачів...</p>}

      {isError && (
        <p className="text-red-600">
          Помилка завантаження користувачів.
        </p>
      )}

      {data && (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Ім’я</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Роль</th>
                  {isAdmin && <th className="p-3">Дії</th>}
                </tr>
              </thead>

              <tbody>
                {data.data.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.role}</td>

                    {isAdmin && (
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                          >
                            Редагувати
                          </Button>

                          <Button
                            variant="danger"
                            disabled={deleteMutation.isPending}
                            onClick={() => handleDelete(user.id)}
                          >
                            Видалити
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}

                {data.data.length === 0 && (
                  <tr>
                    <td
                      colSpan={isAdmin ? 4 : 3}
                      className="p-4 text-center text-gray-500"
                    >
                      Користувачів не знайдено
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Назад
            </Button>

            <span>
              Сторінка {data.pagination.page} з {data.pagination.totalPages}
            </span>

            <Button
              variant="secondary"
              disabled={page >= data.pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Далі
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default UsersListPage;