
import express from "express";
import * as controller from "../controllers/commentController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Коментарі
 *   description: Керування коментарями до завдань
 */

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Отримати список коментарів
 *     tags: [Коментарі]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список коментарів, доступних користувачу
 *       401:
 *         description: Необхідна авторизація
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/comments/{id}:
 *   get:
 *     summary: Отримати коментар за ID
 *     tags: [Коментарі]
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
 *         description: Дані коментаря
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав для перегляду
 *       404:
 *         description: Коментар не знайдено
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Створити коментар до завдання
 *     tags: [Коментарі]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content, taskId]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 example: Завдання виконано частково
 *               taskId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Коментар створено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Немає доступу до завдання
 *       404:
 *         description: Завдання не знайдено
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Оновити коментар
 *     tags: [Коментарі]
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
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *                 example: Оновлений текст коментаря
 *     responses:
 *       200:
 *         description: Коментар оновлено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Коментар не знайдено
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Видалити коментар
 *     tags: [Коментарі]
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
 *         description: Коментар видалено
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Коментар не знайдено
 */
router.delete("/:id", controller.remove);

export default router;
