
import prisma from "../lib/prisma.js";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  projectId: z.number().int().positive(),
  assigneeId: z.number().int().positive().optional().nullable(),
});

const updateSchema = taskSchema
  .omit({ projectId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Передайте хоча б одне поле для зміни",
  });

const taskSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  projectId: true,
  assigneeId: true,
  createdAt: true,
  updatedAt: true,
  project: {
    select: {
      id: true,
      name: true,
      ownerId: true,
    },
  },
  assignee: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  comments: true,
};

function projectAccessFilter(req) {
  return req.user.role === "ADMIN"
    ? {}
    : { project: { ownerId: Number(req.user.id) } };
}

function canManage(task, req) {
  return (
    task.project.ownerId === Number(req.user.id) ||
    req.user.role === "ADMIN"
  );
}

async function getAll(req, res, next) {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10),
    );

    const { search, status, priority, projectId } = req.query;
    const where = projectAccessFilter(req);

    if (search !== undefined) {
      if (typeof search !== "string") {
        return res.status(400).json({
          error: "Некоректний параметр пошуку",
        });
      }

      where.title = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    if (status !== undefined) {
      if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        return res.status(400).json({
          error: "Некоректний статус завдання",
        });
      }

      where.status = status;
    }

    if (priority !== undefined) {
      if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
        return res.status(400).json({
          error: "Некоректний пріоритет завдання",
        });
      }

      where.priority = priority;
    }

    if (projectId !== undefined) {
      const parsedProjectId = Number(projectId);

      if (!Number.isInteger(parsedProjectId) || parsedProjectId < 1) {
        return res.status(400).json({
          error: "Некоректний ID проєкту",
        });
      }

      where.projectId = parsedProjectId;
    }

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        select: taskSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);

    return res.json({
      data: tasks,
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
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID завдання",
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        ...projectAccessFilter(req),
      },
      select: taskSelect,
    });

    if (!task) {
      return res.status(404).json({
        error: "Завдання не знайдено",
      });
    }

    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const result = taskSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Помилка валідації",
        details: result.error.issues,
      });
    }

    const { projectId, ...data } = result.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, ownerId: true },
    });

    if (!project) {
      return res.status(404).json({
        error: "Проєкт не знайдено",
      });
    }

    if (
      project.ownerId !== Number(req.user.id) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error: "Недостатньо прав для створення завдання в цьому проєкті",
      });
    }

    const task = await prisma.task.create({
      data: { ...data, projectId },
      select: taskSelect,
    });

    return res.status(201).json(task);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID завдання",
      });
    }

    const result = updateSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Передайте коректні поля для оновлення",
        details: result.error.issues,
      });
    }

    const existing = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        project: { select: { ownerId: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Завдання не знайдено",
      });
    }

    if (!canManage(existing, req)) {
      return res.status(403).json({
        error: "Недостатньо прав",
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: result.data,
      select: taskSelect,
    });

    return res.json(task);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID завдання",
      });
    }

    const existing = await prisma.task.findUnique({
      where: { id },
      select: {
        id: true,
        project: { select: { ownerId: true } },
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Завдання не знайдено",
      });
    }

    if (!canManage(existing, req)) {
      return res.status(403).json({
        error: "Недостатньо прав",
      });
    }

    await prisma.task.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export { getAll, getById, create, update, remove };
