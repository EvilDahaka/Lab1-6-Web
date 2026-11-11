
import { Outlet } from 'react-router';
import Header from './Header';
import Footer from './Footer';
import { useSocketConnection } from '@/hooks/useSocketConnection';

function Layout() {
  useSocketConnection();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
