
import express from "express";
import * as controller from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Завдання
 *   description: Керування завданнями
 */

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Отримати список завдань
 *     tags: [Завдання]
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
 *         description: Пошук за назвою завдання
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TODO, IN_PROGRESS, DONE]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Список завдань із пагінацією та фільтрами
 *       401:
 *         description: Необхідна авторизація
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Отримати завдання за ID
 *     tags: [Завдання]
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
 *         description: Дані завдання
 *       401:
 *         description: Необхідна авторизація
 *       404:
 *         description: Завдання не знайдено
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Створити завдання
 *     tags: [Завдання]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, projectId]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Реалізувати авторизацію
 *               description:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               projectId:
 *                 type: integer
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Завдання створено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Немає доступу до проєкту
 *       404:
 *         description: Проєкт не знайдено
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Оновити завдання
 *     tags: [Завдання]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [TODO, IN_PROGRESS, DONE]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               projectId:
 *                 type: integer
 *               assigneeId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Завдання оновлено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Завдання не знайдено
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Видалити завдання
 *     tags: [Завдання]
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
 *         description: Завдання видалено
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Завдання не знайдено
 */
router.delete("/:id", controller.remove);

export default router;
