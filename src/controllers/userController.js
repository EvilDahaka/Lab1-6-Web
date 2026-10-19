
import prisma from "../lib/prisma.js";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().trim().min(1, "Вкажіть ім’я"),
  email: z.string().trim().email("Некоректна електронна адреса"),
  password: z.string().min(8, "Пароль має містити щонайменше 8 символів"),
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: "Передайте хоча б одне поле для зміни",
});

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export const getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const where = {};

    if (req.query.search !== undefined) {
      if (typeof req.query.search !== "string") {
        return res.status(400).json({
          error: "Некоректний параметр пошуку",
        });
      }

      const search = req.query.search.trim();

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { id: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID користувача",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        projects: {
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            taskId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Користувача не знайдено",
      });
    }

    return res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Некоректні дані",
        details: parsed.error.issues,
      });
    }

    const { name, email, password } = parsed.data;

    // Хешуємо пароль Argon2id — відкритий пароль не зберігається.
    const argon2 = await import("argon2");
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: publicUserSelect,
    });

    return res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Ця електронна адреса вже використовується",
      });
    }

    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID користувача",
      });
    }

    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Некоректні дані",
        details: parsed.error.issues,
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: publicUserSelect,
    });

    return res.json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Користувача не знайдено",
      });
    }

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Ця електронна адреса вже використовується",
      });
    }

    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID користувача",
      });
    }

    await prisma.user.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        error: "Користувача не знайдено",
      });
    }

    return next(error);
  }
};
