
import prisma from "../lib/prisma.js";
import { z } from "zod";

const createSchema = z.object({
  content: z.string().trim().min(1).max(5000),
  taskId: z.coerce.number().int().positive(),
});

const updateSchema = z.object({
  content: z.string().trim().min(1).max(5000),
});

const commentSelect = {
  id: true,
  content: true,
  authorId: true,
  taskId: true,
  author: {
    select: { id: true, name: true, email: true },
  },
  task: {
    select: {
      id: true,
      title: true,
      project: {
        select: { id: true, name: true, ownerId: true },
      },
    },
  },
};

function canRead(comment, req) {
  return (
    comment.authorId === Number(req.user.id) ||
    comment.task.project.ownerId === Number(req.user.id) ||
    req.user.role === "ADMIN"
  );
}

function canManage(comment, req) {
  return (
    comment.authorId === Number(req.user.id) ||
    req.user.role === "ADMIN"
  );
}

function notifyCommentUsers(io, event, comment) {
  if (!io || !comment) return;

  const userIds = new Set([
    comment.authorId,
    comment.task?.project?.ownerId,
  ]);

  for (const userId of userIds) {
    if (userId == null) continue;

    io.to(`user:${userId}`).emit(event, {
      comment,
      notification: {
        type: event,
        priority: "MEDIUM",
        message:
          event === "comment:created"
            ? `Додано коментар до завдання: ${comment.task.title}`
            : event === "comment:updated"
              ? `Оновлено коментар до завдання: ${comment.task.title}`
              : `Видалено коментар до завдання: ${comment.task.title}`,
        createdAt: new Date().toISOString(),
      },
    });
  }
}

export const getAll = async (req, res, next) => {
  try {
    const where =
      req.user.role === "ADMIN"
        ? {}
        : {
            OR: [
              { authorId: Number(req.user.id) },
              {
                task: {
                  project: {
                    ownerId: Number(req.user.id),
                  },
                },
              },
            ],
          };

    const comments = await prisma.comment.findMany({
      where,
      select: commentSelect,
      orderBy: { id: "asc" },
    });

    return res.json(comments);
  } catch (error) {
    return next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID коментаря",
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      select: commentSelect,
    });

    if (!comment) {
      return res.status(404).json({
        error: "Коментар не знайдено",
      });
    }

    if (!canRead(comment, req)) {
      return res.status(403).json({
        error: "Недостатньо прав для перегляду коментаря",
      });
    }

    return res.json(comment);
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

    const task = await prisma.task.findUnique({
      where: { id: parsed.data.taskId },
      select: {
        id: true,
        project: {
          select: { ownerId: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        error: "Завдання не знайдено",
      });
    }

    if (
      task.project.ownerId !== Number(req.user.id) &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        error: "Немає доступу до цього завдання",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content: parsed.data.content,
        taskId: parsed.data.taskId,
        authorId: Number(req.user.id),
      },
      select: commentSelect,
    });

    notifyCommentUsers(
      req.app.get("io"),
      "comment:created",
      comment
    );

    return res.status(201).json(comment);
  } catch (error) {
    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID коментаря",
      });
    }

    const parsed = updateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Некоректні дані",
        details: parsed.error.issues,
      });
    }

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Коментар не знайдено",
      });
    }

    if (!canManage(existing, req)) {
      return res.status(403).json({
        error:
          "Редагувати коментар може лише його автор або адміністратор",
      });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: parsed.data,
      select: commentSelect,
    });

    notifyCommentUsers(
      req.app.get("io"),
      "comment:updated",
      comment
    );

    return res.json(comment);
  } catch (error) {
    return next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        error: "Некоректний ID коментаря",
      });
    }

    const existing = await prisma.comment.findUnique({
      where: { id },
      select: commentSelect,
    });

    if (!existing) {
      return res.status(404).json({
        error: "Коментар не знайдено",
      });
    }

    if (!canManage(existing, req)) {
      return res.status(403).json({
        error:
          "Видалити коментар може лише його автор або адміністратор",
      });
    }

    await prisma.comment.delete({
      where: { id },
    });

    notifyCommentUsers(
      req.app.get("io"),
      "comment:deleted",
      existing
    );

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};
