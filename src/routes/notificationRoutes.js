
import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, getNotifications);
router.patch("/read-all", authenticate, markAllNotificationsRead);
router.patch("/:id/read", authenticate, markNotificationRead);
router.delete("/:id", authenticate, deleteNotification);

export default router;
