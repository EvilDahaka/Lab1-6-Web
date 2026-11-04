import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/common/Button';

function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="text-xl font-bold">
          Task Manager
        </Link>

        <nav className="flex flex-wrap items-center gap-5">
          <Link to="/" className="transition hover:text-primary-500">
            Home
          </Link>

          <Link to="/about" className="transition hover:text-primary-500">
            About
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="transition hover:text-primary-500">
                Dashboard
              </Link>

              <Link to="/users" className="transition hover:text-primary-500">
                Користувачі
              </Link>

              <span className="text-sm text-gray-300">
                {user.name} ({user.role})
              </span>

              <Button variant="danger" onClick={handleLogout}>
                Вийти
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="transition hover:text-primary-500">
                Увійти
              </Link>

              <Link to="/register" className="transition hover:text-primary-500">
                Реєстрація
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;