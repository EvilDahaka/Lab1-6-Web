
import prisma from "../lib/prisma.js";

export async function createNotification(
  io,
  { userId, type, priority = "MEDIUM", message }
) {
  const notification = await prisma.notification.create({
    data: {
      userId: Number(userId),
      type,
      priority,
      message,
    },
  });

  io?.to(`user:${userId}`).emit("notification", notification);

  return notification;
}
