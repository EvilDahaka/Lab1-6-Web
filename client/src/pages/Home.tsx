
import { Link } from 'react-router';
import { useAuthStore } from '@/stores/authStore';

function Home() {
  const user = useAuthStore((state) => state.user);

  const features = [
    {
      icon: '📁',
      title: 'Управління проєктами',
      description: 'Створюй проєкти, переглядай їх та контролюй робочий процес.',
    },
    {
      icon: '📋',
      title: 'Керування завданнями',
      description: 'Додавай завдання, змінюй їх статуси та стеж за виконанням.',
    },
    {
      icon: '👥',
      title: 'Користувачі',
      description: 'Переглядай інформацію про користувачів системи.',
    },
  ];

  return (
    <div className="space-y-12 pb-10">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-blue-800 px-6 py-16 text-white shadow-lg sm:px-12">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-200">
            Task Manager
          </p>

          <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
            Керуй роботою ефективніше
          </h1>

          <p className="mt-5 text-base leading-relaxed text-slate-200 sm:text-lg">
            Зручна система для управління проєктами, завданнями
            та організації спільної роботи.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-blue-100"
              >
                Перейти до Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-blue-100"
                >
                  Увійти
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg border border-white px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Реєстрація
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Можливості системи
          </h2>
          <p className="mt-2 text-gray-600">
            Усе необхідне для організації та контролю роботи в одному місці.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 text-4xl">{feature.icon}</div>

              <h3 className="text-lg font-bold text-gray-900">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {user && (
        <section className="rounded-xl border border-blue-100 bg-blue-50 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Вітаємо, {user.name}!
          </h2>

          <p className="mt-2 text-gray-600">
            Ти увійшов до системи. Можеш перейти до особистого кабінету
            та продовжити роботу.
          </p>

          <Link
            to="/dashboard"
            className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Відкрити Dashboard
          </Link>
        </section>
      )}
    </div>
  );
}

export default Home;
