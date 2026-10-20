
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Task Manager API",
      version: "3.0.0",
      description: `
REST API для керування користувачами, проєктами, завданнями,
коментарями, файлами та сповіщеннями.

Сервер підтримує Socket.IO для обміну подіями в реальному часі.
Події Socket.IO описані в README.md.
      `.trim(),
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Локальний сервер",
      },
      {
        url: "https://task-manager-api-production-154a.up.railway.app",
        description: "Production-сервер Railway",
      },
    ],
    tags: [
      { name: "Авторизація", description: "Реєстрація, вхід і керування токенами" },
      { name: "Користувачі", description: "Користувачі системи" },
      { name: "Проєкти", description: "Керування проєктами" },
      { name: "Завдання", description: "Керування завданнями" },
      { name: "Коментарі", description: "Коментарі до завдань" },
      { name: "Файли", description: "Завантаження та керування файлами" },
      { name: "Сповіщення", description: "Персональні сповіщення користувачів" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Notification: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            userId: { type: "integer", example: 16 },
            type: { type: "string", example: "task:updated" },
            priority: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH"],
              example: "MEDIUM",
            },
            message: {
              type: "string",
              example: "Завдання оновлено",
            },
            isRead: { type: "boolean", example: false },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string", example: "Необхідна авторизація" },
          },
        },
      },
    },
    paths: {
      "/api/notifications": {
        get: {
          tags: ["Сповіщення"],
          summary: "Отримати сповіщення поточного користувача",
          description:
            "Повертає персональні сповіщення з пагінацією та кількістю непрочитаних сповіщень.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "page",
              schema: { type: "integer", minimum: 1, default: 1 },
            },
            {
              in: "query",
              name: "limit",
              schema: { type: "integer", minimum: 1, maximum: 100, default: 10 },
            },
          ],
          responses: {
            "200": {
              description: "Список сповіщень",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      notifications: {
                        type: "array",
                        items: {
                          $ref: "#/components/schemas/Notification",
                        },
                      },
                      unreadCount: { type: "integer", example: 2 },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Необхідна авторизація",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Error" },
                },
              },
            },
          },
        },
      },
      "/api/notifications/read-all": {
        patch: {
          tags: ["Сповіщення"],
          summary: "Позначити всі сповіщення прочитаними",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": { description: "Сповіщення позначено прочитаними" },
            "401": { description: "Необхідна авторизація" },
          },
        },
      },
      "/api/notifications/{id}/read": {
        patch: {
          tags: ["Сповіщення"],
          summary: "Позначити сповіщення прочитаним",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "200": { description: "Сповіщення позначено прочитаним" },
            "401": { description: "Необхідна авторизація" },
            "404": { description: "Сповіщення не знайдено" },
          },
        },
      },
      "/api/notifications/{id}": {
        delete: {
          tags: ["Сповіщення"],
          summary: "Видалити власне сповіщення",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "integer" },
            },
          ],
          responses: {
            "204": { description: "Сповіщення видалено" },
            "401": { description: "Необхідна авторизація" },
            "404": { description: "Сповіщення не знайдено" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
