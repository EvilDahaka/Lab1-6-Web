
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// userId -> набір активних socket-з'єднань
const onlineUsers = new Map();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
    },
  });

  // JWT-авторизація WebSocket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Потрібна автентифікація"));
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

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

    socket.join(`user:${userId}`);

    let userSockets = onlineUsers.get(userId);

    if (!userSockets) {
      userSockets = new Set();
      onlineUsers.set(userId, userSockets);
    }

    const wasOffline = userSockets.size === 0;
    userSockets.add(socket.id);

    // Передаємо клієнту поточний список онлайн-користувачів
    socket.emit("presence:list", {
      onlineUserIds: [...onlineUsers.keys()],
    });

    // Повідомляємо інших лише про перехід користувача онлайн
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

    // Дозволяємо клієнту запросити актуальний список
    socket.on("presence:get", () => {
      socket.emit("presence:list", {
        onlineUserIds: [...onlineUsers.keys()],
      });
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(userId);

      if (!sockets) return;

      sockets.delete(socket.id);

      // Якщо в користувача немає інших активних з'єднань
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
