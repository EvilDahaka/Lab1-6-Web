const prisma = require("../lib/prisma");
const { z } = require("zod");

const taskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  projectId: z.number().int().positive(),
  assigneeId: z.number().int().positive().optional().nullable(),
});

async function getAll(req, res, next) {
  try {
    const tasks = await prisma.task.findMany({
      include: { project: true, assignee: true, comments: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "екоректний ID завдання" });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: { project: true, assignee: true, comments: true },
    });

    if (!task) {
      return res.status(404).json({ error: "авдання не знайдено" });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const result = taskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "омилка валідації",
        details: result.error.issues,
      });
    }

    const task = await prisma.task.create({ data: result.data });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "екоректний ID завдання" });
    }

    const schema = taskSchema.omit({ projectId: true }).partial();
    const result = schema.safeParse(req.body);

    if (!result.success || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "ередай коректні поля для оновлення",
        details: result.success ? [] : result.error.issues,
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: result.data,
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "екоректний ID завдання" });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: "авдання видалено" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
