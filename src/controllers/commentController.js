const prisma = require("../lib/prisma");
const { z } = require("zod");

const createSchema = z.object({
  content: z.string().trim().min(1),
  taskId: z.coerce.number().int().positive(),
  authorId: z.coerce.number().int().positive()
});

const updateSchema = z.object({
  content: z.string().trim().min(1)
});

exports.getAll = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        author: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } }
      },
      orderBy: { id: "asc" }
    });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "екоректний ID коментаря" });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: "оментар не знайдено" });
    }

    res.json(comment);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "екоректні дані",
        details: parsed.error.issues
      });
    }

    const comment = await prisma.comment.create({
      data: parsed.data,
      include: {
        author: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(400).json({
        error: "ористувача або завдання із зазначеним ID не знайдено"
      });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "екоректний ID коментаря" });
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "екоректні дані",
        details: parsed.error.issues
      });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: parsed.data
    });

    res.json(comment);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "оментар не знайдено" });
    }
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "екоректний ID коментаря" });
    }

    await prisma.comment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "оментар не знайдено" });
    }
    next(error);
  }
};