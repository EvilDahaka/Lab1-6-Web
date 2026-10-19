
import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  changePassword,
  me,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Авторизація
 *   description: Реєстрація, вхід і керування токенами
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Реєстрація користувача
 *     tags: [Авторизація]
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
 *         description: Користувача зареєстровано
 *       400:
 *         description: Некоректні дані
 *       409:
 *         description: Електронна адреса вже використовується
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вхід користувача
 *     tags: [Авторизація]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успішний вхід
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Неправильні облікові дані
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Оновлення токенів
 *     tags: [Авторизація]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Токени оновлено
 *       401:
 *         description: Недійсний або прострочений токен
 */
router.post("/refresh", refresh);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Вихід користувача
 *     tags: [Авторизація]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       204:
 *         description: Успішний вихід
 *       401:
 *         description: Необхідна авторизація
 */
router.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Зміна пароля
 *     tags: [Авторизація]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Пароль змінено
 *       400:
 *         description: Некоректні дані
 *       401:
 *         description: Неправильний поточний пароль або відсутня авторизація
 */
router.post("/change-password", authenticate, changePassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Отримання даних поточного користувача
 *     tags: [Авторизація]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дані поточного користувача
 *       401:
 *         description: Необхідна авторизація
 */
router.get("/me", authenticate, me);

export default router;
