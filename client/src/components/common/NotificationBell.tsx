
import { useState } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useSocketEvent } from '@/hooks/useSocketEvent';

interface IncomingNotification {
  id: number | string;
  userId: number;
  type: string;
  priority: string;
  message: string;
  createdAt?: string;
}

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = useNotificationStore(
    (state) => state.notifications
  );
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const markAsRead = useNotificationStore(
    (state) => state.markAsRead
  );
  const markAllAsRead = useNotificationStore(
    (state) => state.markAllAsRead
  );

  useSocketEvent<IncomingNotification>('notification', (notification) => {
    addNotification(notification);
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-lg p-2 text-white transition hover:bg-slate-700"
        aria-label="Сповіщення"
        aria-expanded={isOpen}
      >
        <span className="text-xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-lg border border-gray-200 bg-white text-gray-900 shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold">Сповіщення</h3>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:underline"
              >
                Прочитати всі
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                Сповіщень поки немає
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={`block w-full border-b px-4 py-3 text-left transition hover:bg-gray-50 ${
                    notification.isRead ? 'bg-white' : 'bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">
                      {notification.message}
                    </span>

                    {!notification.isRead && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                  </div>

                  <span className="mt-1 block text-xs text-gray-500">
                    {notification.type} · {notification.priority}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
