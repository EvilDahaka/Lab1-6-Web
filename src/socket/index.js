
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// userId -> набір активних socket-з'єднань
const onlineUsers = new Map();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // JWT-авторизація Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Потрібна автентифікація"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (!payload.sub) {
        return next(new Error("Токен не містить ID користувача"));
      }

      socket.user = {
        id: String(payload.sub),
        role: payload.role,
      };

      next();
    } catch {
      next(new Error("Недійсний або прострочений токен"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Персональна кімната користувача
    socket.join(`user:${userId}`);

    let userSockets = onlineUsers.get(userId);

    if (!userSockets) {
      userSockets = new Set();
      onlineUsers.set(userId, userSockets);
    }

    const wasOffline = userSockets.size === 0;
    userSockets.add(socket.id);

    socket.emit("presence:list", {
      onlineUserIds: [...onlineUsers.keys()],
    });

    if (wasOffline) {
      io.emit("presence:update", {
        userId,
        status: "online",
        timestamp: new Date().toISOString(),
      });
    }

    socket.emit("connected", {
      message: "З'єднання встановлено",
      userId,
    });

    socket.on("presence:get", () => {
      socket.emit("presence:list", {
        onlineUserIds: [...onlineUsers.keys()],
      });
    });

    // Приєднання до кімнати проєкту з перевіркою доступу
    socket.on("room:join", async (projectId) => {
      try {
        const id = Number(projectId);
        const numericUserId = Number(userId);

        if (
          !Number.isInteger(id) ||
          id <= 0 ||
          !Number.isInteger(numericUserId) ||
          numericUserId <= 0
        ) {
          socket.emit("socket:error", {
            message: "Некоректний ID проєкту або користувача",
          });
          return;
        }

        const project = await prisma.project.findFirst({
          where: {
            id,
            OR: [
              { ownerId: numericUserId },
              {
                tasks: {
                  some: {
                    assigneeId: numericUserId,
                  },
                },
              },
            ],
          },
          select: {
            id: true,
          },
        });

        if (!project) {
          socket.emit("socket:error", {
            message: "Немає доступу до цього проєкту",
          });
          return;
        }

        await socket.join(`project:${id}`);

        socket.emit("room:joined", {
          projectId: id,
        });
      } catch (error) {
        console.error("Помилка room:join:", error);

        socket.emit("socket:error", {
          message: "Не вдалося приєднатися до кімнати проєкту",
        });
      }
    });

    // Вихід із кімнати проєкту
    socket.on("room:leave", async (projectId) => {
      const id = Number(projectId);

      if (!Number.isInteger(id) || id <= 0) {
        return;
      }

      await socket.leave(`project:${id}`);

      socket.emit("room:left", {
        projectId: id,
      });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);

      if (!sockets) {
        return;
      }

      sockets.delete(socket.id);

      if (sockets.size === 0) {
        onlineUsers.delete(userId);

        io.emit("presence:update", {
          userId,
          status: "offline",
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  return io;
}
