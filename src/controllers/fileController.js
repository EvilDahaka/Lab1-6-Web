
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { fileTypeFromFile } from "file-type";
import prisma from "../lib/prisma.js";

const uploadDir = path.resolve("uploads");

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["application/pdf", "pdf"],
]);

async function removePhysicalFile(filePath) {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function canAccess(file, req) {
  return (
    file.userId === Number(req.user.id) ||
    req.user.role === "ADMIN"
  );
}

function publicFile(file) {
  const { path: _path, ...safe } = file;
  return safe;
}

async function inspectUpload(file) {
  const detected = await fileTypeFromFile(file.path);
  const extension = detected && allowedTypes.get(detected.mime);

  if (!detected || !extension) {
    return null;
  }

  return { mimeType: detected.mime, extension };
}

function originalName(file) {
  return path.basename(file.originalname).slice(0, 255);
}

export async function listFiles(req, res, next) {
  try {
    const files = await prisma.uploadedFile.findMany({
      where:
        req.user.role === "ADMIN"
          ? {}
          : { userId: Number(req.user.id) },
      orderBy: { createdAt: "desc" },
    });

    return res.json(files.map(publicFile));
  } catch (error) {
    return next(error);
  }
}

export async function getFile(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Некоректний ID файлу" });
    }

    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({ error: "Файл не знайдено" });
    }

    if (!canAccess(file, req)) {
      return res.status(403).json({ error: "Недостатньо прав" });
    }

    return res.json(publicFile(file));
  } catch (error) {
    return next(error);
  }
}

export async function uploadFile(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      error: "Передайте файл у полі file",
    });
  }

  let storedPath;

  try {
    const inspected = await inspectUpload(req.file);

    if (!inspected) {
      await removePhysicalFile(req.file.path);
      return res.status(415).json({
        error: "Дозволені лише справжні файли JPEG, PNG та PDF",
      });
    }

    const storedName = `${crypto.randomUUID()}.${inspected.extension}`;
    storedPath = path.join(uploadDir, storedName);

    await fs.rename(req.file.path, storedPath);

    const file = await prisma.uploadedFile.create({
      data: {
        originalName: originalName(req.file),
        storedName,
        mimeType: inspected.mimeType,
        size: req.file.size,
        path: storedPath,
        userId: Number(req.user.id),
      },
    });

    return res.status(201).json(publicFile(file));
  } catch (error) {
    await removePhysicalFile(storedPath ?? req.file.path).catch(() => {});
    return next(error);
  }
}

export async function replaceFile(req, res, next) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    if (req.file) {
      await removePhysicalFile(req.file.path).catch(() => {});
    }

    return res.status(400).json({ error: "Некоректний ID файлу" });
  }

  if (!req.file) {
    return res.status(400).json({
      error: "Передайте новий файл у полі file",
    });
  }

  let newPath;

  try {
    const existing = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!existing) {
      await removePhysicalFile(req.file.path);
      return res.status(404).json({ error: "Файл не знайдено" });
    }

    if (!canAccess(existing, req)) {
      await removePhysicalFile(req.file.path);
      return res.status(403).json({ error: "Недостатньо прав" });
    }

    const inspected = await inspectUpload(req.file);

    if (!inspected) {
      await removePhysicalFile(req.file.path);
      return res.status(415).json({
        error: "Дозволені лише справжні файли JPEG, PNG та PDF",
      });
    }

    const storedName = `${crypto.randomUUID()}.${inspected.extension}`;
    newPath = path.join(uploadDir, storedName);

    await fs.rename(req.file.path, newPath);

    let updated;

    try {
      updated = await prisma.uploadedFile.update({
        where: { id },
        data: {
          originalName: originalName(req.file),
          storedName,
          mimeType: inspected.mimeType,
          size: req.file.size,
          path: newPath,
        },
      });
    } catch (error) {
      await removePhysicalFile(newPath).catch(() => {});
      return next(error);
    }

    // Старий файл видаляємо лише після успішного оновлення запису.
    await removePhysicalFile(existing.path).catch((error) => {
      console.error("Не вдалося видалити попередній файл:", error.message);
    });

    return res.json(publicFile(updated));
  } catch (error) {
    await removePhysicalFile(newPath ?? req.file.path).catch(() => {});
    return next(error);
  }
}

export async function deleteFile(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Некоректний ID файлу" });
    }

    const file = await prisma.uploadedFile.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({ error: "Файл не знайдено" });
    }

    if (!canAccess(file, req)) {
      return res.status(403).json({ error: "Недостатньо прав" });
    }

    // Спочатку видаляємо файл із диска, потім запис із БД.
    await removePhysicalFile(file.path);
    await prisma.uploadedFile.delete({ where: { id } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
