const prisma = require("../lib/prisma");
const { z } = require("zod");

const createSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email()
});

const updateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "ередай хоча б одне поле для зміни"
});

exports.getAll = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { id: "asc" }
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "екоректний ID користувача" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { projects: true, tasks: true, comments: true }
    });

    if (!user) {
      return res.status(404).json({ error: "ористувача не знайдено" });
    }

    res.json(user);
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

    const user = await prisma.user.create({ data: parsed.data });
    res.status(201).json(user);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "я електронна адреса вже використовується" });
    }
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "екоректний ID користувача" });
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "екоректні дані",
        details: parsed.error.issues
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data
    });

    res.json(user);
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "ористувача не знайдено" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "я електронна адреса вже використовується" });
    }
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "екоректний ID користувача" });
    }

    await prisma.user.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "ористувача не знайдено" });
    }
    next(error);
  }
};