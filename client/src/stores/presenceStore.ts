
import { create } from 'zustand';

interface PresenceState {
  onlineUserIds: string[];
  setOnlineUsers: (userIds: (string | number)[]) => void;
  updateUserStatus: (
    userId: string | number,
    status: 'online' | 'offline'
  ) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUserIds: [],

  setOnlineUsers: (userIds) =>
    set({
      onlineUserIds: userIds.map(String),
    }),

  updateUserStatus: (userId, status) =>
    set((state) => {
      const id = String(userId);

      if (status === 'online') {
        return {
          onlineUserIds: state.onlineUserIds.includes(id)
            ? state.onlineUserIds
            : [...state.onlineUserIds, id],
        };
      }

      return {
        onlineUserIds: state.onlineUserIds.filter(
          (currentId) => currentId !== id
        ),
      };
    }),
}));
