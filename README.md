# Task Manager API

## Опис проєкту
Task Manager API — серверний застосунок для керування проєктами та завданнями.
API дозволяє працювати з користувачами, проєктами, завданнями та коментарями.

## Використані технології
- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Zod

## становлення та запуск

1. становити залежності:

   npm install

2. Створити файл `.env` у корені проєкту та вказати рядок підключення до PostgreSQL:

   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/task_manager?schema=public"

   амість USER і PASSWORD вказати власні дані PostgreSQL.
   е публікувати файл `.env`.

3. генерувати Prisma Client:

   npx prisma generate

4. апустити сервер у режимі розробки:

   npm run dev

а замовчуванням сервер працює на порту 3000.

## Основні маршрути API

### користувачі
- GET `/api/users` — отримати всіх користувачів
- GET `/api/users/:id` — отримати користувача за ID
- POST `/api/users` — створити користувача
- PUT `/api/users/:id` — змінити користувача
- DELETE `/api/users/:id` — видалити користувача

### проєкти
- GET `/api/projects` — отримати всі проєкти
- GET `/api/projects/:id` — отримати проєкт за ID
- POST `/api/projects` — створити проєкт
- PUT `/api/projects/:id` — змінити проєкт
- DELETE `/api/projects/:id` — видалити проєкт

### завдання
- GET `/api/tasks` — отримати всі завдання
- GET `/api/tasks/:id` — отримати завдання за ID
- POST `/api/tasks` — створити завдання
- PUT `/api/tasks/:id` — змінити завдання
- DELETE `/api/tasks/:id` — видалити завдання

### коментарі
- GET `/api/comments` — отримати всі коментарі
- GET `/api/comments/:id` — отримати коментар за ID
- POST `/api/comments` — створити коментар
- PUT `/api/comments/:id` — змінити коментар
- DELETE `/api/comments/:id` — видалити коментар

## перевірка роботи
- GET `/` — інформація про API
- GET `/api/health` — перевірка доступності сервера

## приклад створення користувача

етод: POST  
URL: `http://localhost:3000/api/users`

Тіло запиту у форматі JSON:

    {
      "name": "Test User",
      "email": "test@example.com"
    }

спішне створення повертає HTTP-статус 201.

## обробка помилок
API повертає відповідні HTTP-статуси для некоректних даних, відсутніх записів та інших помилок запитів.
