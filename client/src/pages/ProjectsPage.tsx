
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import projectsService from '@/services/projects.service';
import type { Project } from '@/services/projects.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import useDebounce from '@/hooks/useDebounce';

function ProjectsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', page, debouncedSearch],
    queryFn: () => projectsService.getAll(page, 10, debouncedSearch),
  });

  const refreshProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      toast.success('Проєкт створено');
      setName('');
      setDescription('');
      setShowForm(false);
      setPage(1);
      refreshProjects();
    },
    onError: () => toast.error('Не вдалося створити проєкт'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: {
      id: number;
      data: { name: string; description: string };
    }) => projectsService.update(id, data),
    onSuccess: () => {
      toast.success('Проєкт оновлено');
      setEditingProject(null);
      setName('');
      setDescription('');
      refreshProjects();
    },
    onError: () => toast.error('Не вдалося оновити проєкт'),
  });

  const deleteMutation = useMutation({
    mutationFn: projectsService.remove,
    onSuccess: () => {
      toast.success('Проєкт видалено');
      refreshProjects();
    },
    onError: () => toast.error('Не вдалося видалити проєкт'),
  });

  const openCreateForm = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setShowForm(true);
  };

  const openEditForm = (project: Project) => {
    setShowForm(false);
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error('Заповніть назву та опис проєкту');
      return;
    }

    const projectData = {
      name: name.trim(),
      description: description.trim(),
    };

    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        data: projectData,
      });
    } else {
      createMutation.mutate(projectData);
    }
  };

  const handleDelete = (project: Project) => {
    if (window.confirm(`Видалити проєкт «${project.name}»?`)) {
      deleteMutation.mutate(project.id);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProject(null);
    setName('');
    setDescription('');
  };

  if (isLoading) {
    return <p className="p-6 text-gray-600">Завантаження проєктів...</p>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Не вдалося завантажити проєкти. Перевір авторизацію.
        </p>
        <Button onClick={refreshProjects}>Повторити</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Проєкти</h1>
          <p className="mt-2 text-gray-600">
            Перегляд та керування проєктами.
          </p>
        </div>

        <Button onClick={openCreateForm}>Створити проєкт</Button>
      </div>

      <Input
        placeholder="Пошук проєктів..."
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
      />

      {(showForm || editingProject) && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold">
            {editingProject ? 'Редагувати проєкт' : 'Новий проєкт'}
          </h2>

          <Input
            label="Назва проєкту"
            placeholder="Введіть назву"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Опис проєкту
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              rows={4}
              placeholder="Введіть опис проєкту"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingProject ? 'Зберегти зміни' : 'Створити'}
            </Button>

            <Button type="button" variant="secondary" onClick={closeForm}>
              Скасувати
            </Button>
          </div>
        </form>
      )}

      {data?.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-lg font-medium text-gray-700">
            Проєктів поки немає
          </p>
          <p className="mt-2 text-gray-500">
            Створи перший проєкт, щоб він з'явився у списку.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4">Назва</th>
                <th className="p-4">Опис</th>
                <th className="p-4">Дії</th>
              </tr>
            </thead>

            <tbody>
              {data?.data.map((project) => (
                <tr key={project.id} className="border-t border-gray-200">
                  <td className="p-4 font-medium">{project.name}</td>
                  <td className="p-4 text-gray-600">
                    {project.description}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => openEditForm(project)}
                      >
                        Редагувати
                      </Button>

                      <Button
                        variant="danger"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(project)}
                      >
                        Видалити
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Назад
          </Button>

          <span>
            Сторінка {page} з {data.pagination.totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Далі
          </Button>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;
