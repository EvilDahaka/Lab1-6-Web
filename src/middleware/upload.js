
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";

const uploadDir = path.resolve("uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, _file, cb) =>
    cb(null, `${crypto.randomUUID()}.tmp`)
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

export function receiveFile(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();

    const tooLarge = error.code === "LIMIT_FILE_SIZE";

    return res.status(tooLarge ? 413 : 400).json({
      error: tooLarge
        ? "Файл перевищує максимальний розмір 5 МБ"
        : "Не вдалося прийняти файл"
    });
  });
}
