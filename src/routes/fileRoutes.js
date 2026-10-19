
import express from "express";
import { authenticate } from "../middleware/auth.js";
import { receiveFile } from "../middleware/upload.js";
import {
  listFiles,
  getFile,
  uploadFile,
  replaceFile,
  deleteFile,
} from "../controllers/fileController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Файли
 *   description: Завантаження та керування файлами
 */

router.use(authenticate);

/**
 * @swagger
 * /api/files:
 *   get:
 *     summary: Отримати список файлів
 *     tags: [Файли]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список доступних користувачу файлів
 *       401:
 *         description: Необхідна авторизація
 */
router.get("/", listFiles);

/**
 * @swagger
 * /api/files/{id}:
 *   get:
 *     summary: Отримати інформацію про файл
 *     tags: [Файли]
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
 *         description: Інформація про файл
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Файл не знайдено
 */
router.get("/:id", getFile);

/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: Завантажити файл
 *     description: Дозволені JPEG, PNG і PDF розміром до 5 МБ.
 *     tags: [Файли]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Файл завантажено
 *       400:
 *         description: Файл не передано або запит некоректний
 *       401:
 *         description: Необхідна авторизація
 *       413:
 *         description: Файл перевищує 5 МБ
 *       415:
 *         description: Непідтримуваний тип файлу
 */
router.post("/", receiveFile, uploadFile);

/**
 * @swagger
 * /api/files/{id}:
 *   put:
 *     summary: Замінити файл
 *     description: Новий файл передається в полі file. Дозволені JPEG, PNG і PDF до 5 МБ.
 *     tags: [Файли]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Файл замінено
 *       400:
 *         description: Файл не передано або ID некоректний
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Файл не знайдено
 *       413:
 *         description: Файл перевищує 5 МБ
 *       415:
 *         description: Непідтримуваний тип файлу
 */
router.put("/:id", receiveFile, replaceFile);

/**
 * @swagger
 * /api/files/{id}:
 *   delete:
 *     summary: Видалити файл
 *     tags: [Файли]
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
 *         description: Файл видалено
 *       401:
 *         description: Необхідна авторизація
 *       403:
 *         description: Недостатньо прав
 *       404:
 *         description: Файл не знайдено
 */
router.delete("/:id", deleteFile);

export default router;
