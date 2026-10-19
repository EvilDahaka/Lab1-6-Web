
import express from "express";
import * as controller from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Користувачі
 *   description: Перегляд і адміністрування користувачів
 */

// Усі маршрути потребують авторизації
router.use(authenticate);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Отримати список користувачів
 *     tags: [Користувачі]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Пошук за ім’ям або електронною адресою
 *     responses:
 *       200:
 *         description: Список користувачів із пагінацією
 *       401:
 *         description: Необхідна авторизація
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Отримати користувача за ID
 *     tags: [Користувачі]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Дані користувача
 *       400:
 *         description: Некоректний ID
 *       401:
 *         description: Необхідна авторизація
 *       404:
 *         description: Користувача не знайдено
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Створити користувача
 *     description: Доступно лише адміністратору. Пароль хешується за допомогою Argon2id.
 *     tags: [Користувачі]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Іван
 *               email:
 *                 type: string
 *                 format: email
 *                 example: ivan@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: StrongPass123!
 *     responses:
 *       201:
 *         description: Користувача створено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       409:
 *         description: Електронна адреса вже використовується
 */
router.post("/", authorize("ADMIN"), controller.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Оновити дані користувача
 *     description: Доступно лише адміністратору.
 *     tags: [Користувачі]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Дані оновлено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Користувача не знайдено
 *       409:
 *         description: Електронна адреса вже використовується
 */
router.put("/:id", authorize("ADMIN"), controller.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Видалити користувача
 *     description: Доступно лише адміністратору.
 *     tags: [Користувачі]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Користувача видалено
 *       400:
 *         description: Некоректний ID
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Користувача не знайдено
 */
router.delete("/:id", authorize("ADMIN"), controller.remove);

export default router;
