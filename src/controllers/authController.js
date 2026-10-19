import crypto from "node:crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma.js";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform(v => v.toLowerCase()),
  password: z.string().min(8).max(128)
});

const loginSchema = z.object({
  email: z.string().trim().email().transform(v => v.toLowerCase()),
  password: z.string().min(1).max(128)
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128)
});

const publicUser = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true
};

function makeAccessToken(user) {
  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: "15m" }
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function issueRefreshToken(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { tokenHash: hashToken(token), userId, expiresAt }
  });

  return token;
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "екоректні дані реєстрації",
        details: parsed.error.issues
      });
    }

    const { name, email, password } = parsed.data;
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id
    });

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: publicUser
    });

    const accessToken = makeAccessToken(user);
    const refreshToken = await issueRefreshToken(user.id);

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "я електронна адреса вже зареєстрована" });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "екоректна електронна адреса або пароль" });
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (!user?.passwordHash) {
      return res.status(401).json({ error: "еправильна електронна адреса або пароль" });
    }

    const valid = await argon2.verify(user.passwordHash, parsed.data.password);
    if (!valid) {
      return res.status(401).json({ error: "еправильна електронна адреса або пароль" });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    const accessToken = makeAccessToken(safeUser);
    const refreshToken = await issueRefreshToken(user.id);

    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.body?.refreshToken;
    if (typeof token !== "string" || token.length < 20) {
      return res.status(400).json({ error: "отрібен refreshToken" });
    }

    const tokenHash = hashToken(token);
    const record = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!record || record.revokedAt || record.expiresAt <= new Date()) {
      return res.status(401).json({ error: "Refresh-токен недійсний або відкликаний" });
    }

    const newToken = crypto.randomBytes(48).toString("hex");
    const newHash = hashToken(newToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: record.id },
        data: { revokedAt: new Date() }
      }),
      prisma.refreshToken.create({
        data: { tokenHash: newHash, userId: record.userId, expiresAt }
      })
    ]);

    const user = record.user;
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      accessToken: makeAccessToken(safeUser),
      refreshToken: newToken
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.body?.refreshToken;
    if (typeof token !== "string") {
      return res.status(400).json({ error: "отрібен refreshToken" });
    }

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashToken(token),
        userId: Number(req.user.id),
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const parsed = passwordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "оточний пароль і новий пароль (не менше 8 символів) обов'язкові"
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) }
    });

    if (!user?.passwordHash ||
        !(await argon2.verify(user.passwordHash, parsed.data.currentPassword))) {
      return res.status(400).json({ error: "оточний пароль неправильний" });
    }

    const passwordHash = await argon2.hash(parsed.data.newPassword, {
      type: argon2.argon2id
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() }
      })
    ]);

    res.json({ message: "ароль змінено. війдіть повторно." });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: publicUser
    });
    if (!user) return res.status(404).json({ error: "ористувача не знайдено" });
    res.json(user);
  } catch (error) {
    next(error);
  }
}
