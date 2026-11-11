
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import projectsService from '@/services/projects.service';
import type { Project } from '@/services/projects.service';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Tabs from '@/components/common/Tabs';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import type { DropdownOption } from '@/components/common/SearchableDropdown';
import useDebounce from '@/hooks/useDebounce';

const sortOptions: DropdownOption[] = [
  { value: 'none', label: 'Без сортування' },
  { value: 'asc', label: 'За назвою: А–Я' },
  { value: 'desc', label: 'За назвою: Я–А' },
];

function ProjectsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('projects');
  const [sortOrder, setSortOrder] = useState('none');

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects', page, debouncedSearch],
    queryFn: () => projectsService.getAll(page, 10, debouncedSearch),
  });

  const sortedProjects = data?.data
    ? [...data.data].sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name, 'uk');
        }

        if (sortOrder === 'desc') {
          return b.name.localeCompare(a.name, 'uk');
        }

        return 0;
      })
    : [];

  const refreshProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
  };

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      toast.success('Проєкт створено');
      setName('');
      setDescription('');
      setActiveTab('projects');
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
      setActiveTab('projects');
      refreshProjects();
    },
    onError: () => toast.error('Не вдалося оновити проєкт'),
  });

  const deleteMutation = useMutation({
    mutationFn: projectsService.remove,
    onSuccess: () => {
      toast.success('Проєкт видалено');
      setSelectedProject(null);
      refreshProjects();
    },
    onError: () => toast.error('Не вдалося видалити проєкт'),
  });

  const openCreateForm = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setActiveTab('create');
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description);
    setActiveTab('create');
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

  const handleDelete = () => {
    if (selectedProject) {
      deleteMutation.mutate(selectedProject.id);
    }
  };

  const closeForm = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setActiveTab('projects');
  };

  const tabs = [
    {
      id: 'projects',
      label: 'Список проєктів',
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Пошук проєктів..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <SearchableDropdown
              options={sortOptions}
              value={sortOrder}
              onChange={setSortOrder}
              placeholder="Оберіть сортування"
              searchPlaceholder="Знайти спосіб сортування..."
            />
          </div>

          {isLoading && (
            <p className="text-gray-600">Завантаження проєктів...</p>
          )}

          {isError && (
            <div>
              <p className="text-red-600">
                Не вдалося завантажити проєкти. Перевір авторизацію.
              </p>
              <Button onClick={refreshProjects}>Повторити</Button>
            </div>
          )}

          {data && (
            <>
              {data.data.length === 0 ? (
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
                      {sortedProjects.map((project) => (
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
                                onClick={() => setSelectedProject(project)}
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

              {data.pagination.totalPages > 1 && (
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
            </>
          )}
        </div>
      ),
    },
    {
      id: 'create',
      label: 'Створення проєкту',
      content: (
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
      ),
    },
    {
      id: 'info',
      label: 'Інформація',
      content: (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Про управління проєктами</h2>
          <p className="mt-3 text-gray-600">
            У цьому розділі можна створювати, переглядати, редагувати та
            видаляти проєкти. Для пошуку використовуй поле на вкладці
            «Список проєктів».
          </p>
        </div>
      ),
    },
  ];

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

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <ConfirmDialog
        isOpen={selectedProject !== null}
        title="Видалити проєкт?"
        message={
          selectedProject
            ? `Ви впевнені, що хочете видалити проєкт «${selectedProject.name}»? Цю дію неможливо скасувати.`
            : ''
        }
        confirmText="Видалити"
        cancelText="Скасувати"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onCancel={() => setSelectedProject(null)}
      />
    </div>
  );
}

export default ProjectsPage;
