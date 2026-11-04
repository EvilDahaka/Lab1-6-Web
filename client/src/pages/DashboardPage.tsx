
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-slate-900 to-blue-800 p-8 text-white shadow-lg">
        <p className="text-sm font-medium text-blue-200">
          TASK MANAGER
        </p>

        <h1 className="mt-3 text-3xl font-bold">
          Панель керування
        </h1>

        <p className="mt-3 text-slate-200">
          Вітаємо, {user?.name || 'користувачу'}!
          Радий бачити тебе в системі.
        </p>

        <div className="mt-5 inline-flex rounded-full bg-white/15 px-4 py-2 text-sm">
          Роль: {user?.role || 'USER'}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-bold text-gray-900">
          Робочий простір
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <div className="text-4xl">👥</div>
            <h3 className="mt-4 text-xl font-semibold">
              Користувачі
            </h3>
            <p className="my-3 text-gray-600">
              Перегляд та керування користувачами системи.
            </p>

            <Link to="/users">
              <Button>Переглянути користувачів</Button>
            </Link>
          </Card>

          <Card>
            <div className="text-4xl">📁</div>
            <h3 className="mt-4 text-xl font-semibold">
              Проєкти
            </h3>
            <p className="my-3 text-gray-600">
              Створення, перегляд та керування проєктами.
            </p>

            <Link to="/projects">
              <Button>Переглянути проєкти</Button>
            </Link>
          </Card>
        </div>
      </section>

      <div className="flex justify-end border-t border-gray-200 pt-5">
        <Button variant="danger" onClick={handleLogout}>
          Вийти з акаунта
        </Button>
      </div>
    </div>
  );
}

export default DashboardPage;
