
import express from "express";
import * as controller from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Проєкти
 *   description: Керування проєктами
 */

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Отримати список проєктів
 *     tags: [Проєкти]
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
 *         description: Пошук за назвою проєкту
 *     responses:
 *       200:
 *         description: Список проєктів із пагінацією
 *       401:
 *         description: Необхідна авторизація
 */
router.get("/", controller.getAll);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Отримати проєкт за ID
 *     tags: [Проєкти]
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
 *         description: Дані проєкту
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Проєкт не знайдено
 */
router.get("/:id", controller.getById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Створити проєкт
 *     tags: [Проєкти]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Розробка вебзастосунку
 *               description:
 *                 type: string
 *                 example: Проєкт для керування завданнями
 *     responses:
 *       201:
 *         description: Проєкт створено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Необхідна авторизація
 */
router.post("/", controller.create);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Оновити проєкт
 *     tags: [Проєкти]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Проєкт оновлено
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Проєкт не знайдено
 */
router.put("/:id", controller.update);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Видалити проєкт
 *     tags: [Проєкти]
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
 *         description: Проєкт видалено
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Проєкт не знайдено
 */
router.delete("/:id", controller.remove);

export default router;
