
import { BrowserRouter, Route, Routes } from 'react-router';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import UsersListPage from './pages/UsersListPage';
import UserCreatePage from './pages/UserCreatePage';
import UserEditPage from './pages/UserEditPage';
import ProjectsPage from './pages/ProjectsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />

            <Route path="users" element={<UsersListPage />} />
            <Route path="users/create" element={<UserCreatePage />} />
            <Route path="users/:id/edit" element={<UserEditPage />} />

            <Route path="projects" element={<ProjectsPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
