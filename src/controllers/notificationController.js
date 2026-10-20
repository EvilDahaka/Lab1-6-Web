
import prisma from "../lib/prisma.js";

export async function getNotifications(req, res, next) {
  try {
    const userId = Number(req.user.id);
    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1,
    );

    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20),
    );

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId },
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      unread,
    });
  } catch (error) {
    return next(error);
  }
}

export async function markNotificationRead(req, res, next) {
  try {
    const userId = Number(req.user.id);
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });

    return res.json({ notification });
  } catch (error) {
    return next(error);
  }
}

export async function markAllNotificationsRead(req, res, next) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: Number(req.user.id),
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.json({
      message: "All notifications marked as read",
      updated: result.count,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteNotification(req, res, next) {
  try {
    const userId = Number(req.user.id);
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const result = await prisma.notification.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.json({
      message: "Notification deleted",
    });
  } catch (error) {
    return next(error);
  }
}
