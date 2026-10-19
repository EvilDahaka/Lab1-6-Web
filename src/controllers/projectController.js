const prisma = require("../lib/prisma");
const { z } = require("zod");

const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(1000).optional().nullable(),
  ownerId: z.number().int().positive(),
});

async function getAll(req, res, next) {
  try {
    const projects = await prisma.project.findMany({
      include: { owner: true, tasks: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "екоректний ID проєкту" });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      include: { owner: true, tasks: true },
    });

    if (!project) {
      return res.status(404).json({ error: "роєкт не знайдено" });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const result = projectSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "омилка валідації",
        details: result.error.issues,
      });
    }

    const project = await prisma.project.create({
      data: result.data,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "екоректний ID проєкту" });
    }

    const schema = projectSchema.omit({ ownerId: true }).partial();
    const result = schema.safeParse(req.body);

    if (!result.success || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        error: "ередай коректні поля для оновлення",
        details: result.success ? [] : result.error.issues,
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: result.data,
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "екоректний ID проєкту" });
    }

    await prisma.project.delete({ where: { id } });
    res.json({ message: "роєкт видалено" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAll, getById, create, update, remove };
