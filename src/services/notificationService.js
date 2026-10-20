
import prisma from "../lib/prisma.js";

export async function createNotification(
  io,
  { userId, type, priority = "MEDIUM", message } = {},
) {
  const numericUserId = Number(userId);

  if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
    throw new Error("createNotification: invalid userId");
  }

  if (typeof type !== "string" || !type.trim()) {
    throw new Error("createNotification: type is required");
  }

  if (typeof message !== "string" || !message.trim()) {
    throw new Error("createNotification: message is required");
  }

  const notification = await prisma.notification.create({
    data: {
      userId: numericUserId,
      type,
      priority,
      message,
    },
  });

  io?.to(`user:${numericUserId}`).emit("notification", notification);

  return notification;
}
