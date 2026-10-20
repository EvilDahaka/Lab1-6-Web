
import prisma from "../lib/prisma.js";
import { z } from "zod";
import { createNotification } from "../services/notificationService.js";

function notifyProjectUsers(io, event, project) {
  if (!io || !project) return;

  const userIds = new Set([
    project.ownerId,
    ...(project.tasks || []).map((task) => task.assigneeId),
  ]);

  for (const userId of userIds) {
    if (userId != null) {
      io.to(`user:${userId}`).emit(event, {
        project,
        notification: {
          type: event,
          priority: "MEDIUM",
          message:
            event === "project:created"
              ? `Створено проєкт: ${project.name}`
              : `Оновлено проєкт: ${project.name}`,
          createdAt: new Date().toISOString(),
        },
      });
    }
  }
}

async function saveProjectNotifications(io, project, event) {
  if (!project) return;

  const userIds = new Set([
    project.ownerId,
    ...(project.tasks || []).map((task) => task.assigneeId),
  ]);

  const messages = {
    "project:created": `Створено проєкт: ${project.name}`,
    "project:updated": `Оновлено проєкт: ${project.name}`,
  };

  const message = messages[event];

  if (!message) return;

  for (const userId of userIds) {
    if (userId == null) continue;

    await createNotification(prisma, io, {
      userId,
      type: event,
      priority: "MEDIUM",
      message,
    });
  }
}

const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional().nullable(),
});

const updateSchema = projectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "Передайте хоча б одне поле для зміни" },
);

const projectSelect = {
  id: true,
  name: true,
  description: true,
  ownerId: true,
  createdAt: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  tasks: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      projectId: true,
      assigneeId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};

function canManage(project, req) {
  return (
    project.ownerId === Number(req.user.id) ||
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

    const where =
      req.user.role === "ADMIN"
        ? {}
        : { ownerId: Number(req.user.id) };

    if (req.query.search !== undefined) {
      if (typeof req.query.search !== "string") {
        return res.status(400).json({
          error: "Некоректний параметр пошуку",
        });
      }

      where.name = {
        contains: req.query.search.trim(),
        mode: "insensitive",
      };
    }

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        select: projectSelect,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    return res.json({
      data: projects,
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
        error: "Некоректний ID проєкту",
      });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: projectSelect,
    });

    if (!project) {
      return res.status(404).json({
        error: "Проєкт не знайдено",
      });
    }

    if (!canManage(project, req)) {
      return res.status(403).json({
        error: "Недостатньо прав",
      });
    }

    return res.json(project);
  } catch (error) {
    return next(error);
  }
}

async function create(req, res, next) {
  try {
    const result = projectSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Помилка валідації",
        details: result.error.issues,
      });
    }

    const project = await prisma.project.create({
      data: {
        ...result.data,
        ownerId: Number(req.user.id),
      },
      select: projectSelect,
    });

    const io = req.app.get("io");

    notifyProjectUsers(io, "project:created", project);
    await saveProjectNotifications(io, project, "project:created");

    return res.status(201).json(project);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID проєкту",
      });
    }

    const result = updateSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Передайте коректні поля для оновлення",
        details: result.error.issues,
      });
    }

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Проєкт не знайдено",
      });
    }

    if (!canManage(existing, req)) {
      return res.status(403).json({
        error: "Недостатньо прав",
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: result.data,
      select: projectSelect,
    });

    const io = req.app.get("io");

    notifyProjectUsers(io, "project:updated", project);
    await saveProjectNotifications(io, project, "project:updated");

    return res.json(project);
  } catch (error) {
    return next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID проєкту",
      });
    }

    const existing = await prisma.project.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Проєкт не знайдено",
      });
    }

    if (!canManage(existing, req)) {
      return res.status(403).json({
        error: "Недостатньо прав",
      });
    }

    await prisma.project.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export { getAll, getById, create, update, remove };
