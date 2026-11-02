import { Link } from 'react-router';

function Header() {
  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-4 sm:flex-row sm:px-6">
        <Link to="/" className="text-xl font-bold">
          Task Manager
        </Link>

        <nav className="flex gap-6">
          <Link to="/" className="transition hover:text-primary-500">
            Home
          </Link>

          <Link to="/about" className="transition hover:text-primary-500">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;