
import { create } from 'zustand';

export interface Notification {
  id: number | string;
  userId: number;
  type: string;
  priority: string;
  message: string;
  createdAt?: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'isRead'>) => void;
  markAsRead: (id: number | string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => {
      const exists = state.notifications.some(
        (item) => item.id === notification.id
      );

      if (exists) return state;

      return {
        notifications: [
          { ...notification, isRead: false },
          ...state.notifications,
        ].slice(0, 50),
      };
    }),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({
        ...item,
        isRead: true,
      })),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));
