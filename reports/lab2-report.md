# Звіт з лабораторної роботи № 2

## Тема роботи: Аутентифікація, авторизація та розширений функціонал

Здобувач освіти: [Лешо Давид Сергійович]  
Група: [42]  
GitHub репозиторій: [https://github.com/EvilDahaka/Lab1-6-Web.git]  
Рівень складності: 1-2

## Реалізований функціонал

У ході виконання лабораторної роботи розроблено REST API для керування проєктами, завданнями, користувачами, коментарями та файлами на основі Node.js, Express.js і PostgreSQL.

Реалізовано такі можливості:

- Реєстрація користувачів із перевіркою вхідних даних.
- Хешування паролів за допомогою Argon2id.
- Авторизація користувачів із використанням JWT.
- Реалізація middleware для перевірки автентифікації та прав доступу.
- Розмежування доступу до операцій відповідно до ролей користувачів.
- Реалізація refresh-токенів із можливістю оновлення та відкликання.
- Реалізація виходу із системи та зміни пароля.
- Створення, перегляд, редагування та видалення користувачів, проєктів, завдань і коментарів.
- Реалізація контролю доступу до проєктів і коментарів.
- Завантаження, заміна та видалення файлів.
- Перевірка типу та розміру файлів під час завантаження.
- Реалізація пошуку, фільтрації та пагінації для відповідних списків.
- Використання Prisma ORM для взаємодії з PostgreSQL.
- Перевірка вхідних даних за допомогою Zod.
- Документування API за допомогою Swagger UI.
- Написання автоматизованих тестів для перевірки основних сценаріїв авторизації.

## Ключові фрагменти коду

### 1. Перевірка автентифікації

Для захисту маршрутів реалізовано middleware, який перевіряє наявність Bearer-токена та його дійсність.

```javascript
import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Потрібна автентифікація"
    });
  }

  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET
    );

    req.user = {
      id: payload.sub,
      role: payload.role
    };

    next();
  } catch {
    return res.status(401).json({
      error: "Недійсний або прострочений токен"
    });
  }
}
```

### 2. Перевірка прав доступу

Для обмеження доступу до окремих операцій залежно від ролі користувача використовується middleware `authorize`.

```javascript
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Потрібна автентифікація"
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Недостатньо прав"
      });
    }

    next();
  };
}
```

### 3. Захист маршрутів

Приклад використання middleware для захисту маршрутів користувачів:

```javascript
import express from "express";
import * as controller from "../controllers/userController.js";
import {
  authenticate,
  authorize
} from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

router.post(
  "/",
  authorize("ADMIN"),
  controller.create
);

router.put(
  "/:id",
  authorize("ADMIN"),
  controller.update
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  controller.remove
);

export default router;
```

### 4. Документування API

Для автоматичної документації використовується Swagger. Документація містить опис маршрутів, параметрів запитів, форматів даних і відповідей сервера.

```javascript
import swaggerJsdoc from "swagger-jsdoc";

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "2.0.0",
      description:
        "REST API для керування користувачами, проєктами, завданнями та файлами"
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Локальний сервер"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["./src/routes/*.js"]
});

export default swaggerSpec;
```

Інтерфейс документації доступний за адресою `http://localhost:3000/api-docs`.

## Скріншоти

**Скріншот 1.** Документація API у Swagger UI.

![1](<screenshots1/1-документація у Swagger.png>)

**Скріншот 2.** Реєстрація та авторизація користувача.

![2](<screenshots1/2-реєстрація користувача.png>)

**Скріншот 3.** Робота захищених маршрутів.

![3](<screenshots1/3-робота захищених маршутів.png>)

**Скріншот 4.** Завантаження файлів.

![4](<screenshots1/4-завантаження файлів.png>)

**Скріншот 5.** Результати автоматизованого тестування.

![5](<screenshots1/5-автоматизоване тестування.png>)

## Висновки

У ході виконання лабораторної роботи було розроблено та вдосконалено серверний застосунок Task Manager API. Реалізовано механізми автентифікації й авторизації користувачів, захист маршрутів, перевірку вхідних даних, керування refresh-токенами та обмеження доступу до ресурсів.

Розширено функціональність API для роботи з користувачами, проєктами, завданнями, коментарями та файлами. Передбачено пошук, фільтрацію, пагінацію та документування маршрутів за допомогою Swagger UI.

Для зберігання даних використано PostgreSQL і Prisma ORM. Автоматизовані тести основних сценаріїв авторизації виконуються успішно. Перевірено працездатність Swagger-документації.

У результаті виконання лабораторної роботи закріплено практичні навички розроблення REST API, роботи з базою даних, реалізації механізмів безпеки та тестування серверних застосунків.

**Самооцінка: 4

