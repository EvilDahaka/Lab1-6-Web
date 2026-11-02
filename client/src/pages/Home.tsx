import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';

function Home() {
  return (
    <div className="space-y-8 p-4 sm:p-6">
      <section>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Task Manager
        </h1>
        <p className="mt-2 text-sm text-gray-600 sm:text-base">
          Керування проєктами та завданнями
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Кнопки">
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </Card>

        <Card title="Поля введення">
          <div className="w-full space-y-4">
            <Input
              label="Назва завдання"
              placeholder="Введіть назву завдання"
            />

            <Input
              label="Електронна пошта"
              type="email"
              placeholder="example@gmail.com"
            />

            <Input
              label="Поле з помилкою"
              placeholder="Введіть дані"
              error="Це поле обов'язкове"
            />
          </div>
        </Card>

        <Card title="Статуси завдань">
          <div className="flex flex-wrap gap-3">
            <Badge variant="success">Виконано</Badge>
            <Badge variant="warning">У процесі</Badge>
            <Badge variant="danger">Прострочено</Badge>
            <Badge variant="info">Нове завдання</Badge>
          </div>
        </Card>

        <Card title="Індикатори завантаження">
          <div className="flex flex-wrap items-center justify-around">
            <Loading size="small" text="Small" />
            <Loading size="medium" text="Medium" />
            <Loading size="large" text="Large" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Home;