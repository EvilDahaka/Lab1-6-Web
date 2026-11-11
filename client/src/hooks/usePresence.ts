
import { useEffect } from 'react';
import { socket } from '@/services/socket';
import { usePresenceStore } from '@/stores/presenceStore';
import { useSocketEvent } from '@/hooks/useSocketEvent';

interface PresenceListPayload {
  onlineUserIds: (string | number)[];
}

interface PresenceUpdatePayload {
  userId: string | number;
  status: 'online' | 'offline';
}

export function usePresence() {
  const setOnlineUsers = usePresenceStore(
    (state) => state.setOnlineUsers
  );

  const updateUserStatus = usePresenceStore(
    (state) => state.updateUserStatus
  );

  useSocketEvent<PresenceListPayload>(
    'presence:list',
    (payload) => {
      setOnlineUsers(payload.onlineUserIds);
    }
  );

  useSocketEvent<PresenceUpdatePayload>(
    'presence:update',
    (payload) => {
      updateUserStatus(payload.userId, payload.status);
    }
  );

  useEffect(() => {
    const requestPresence = () => {
      socket.emit('presence:get');
    };

    if (socket.connected) {
      requestPresence();
    }

    socket.on('connect', requestPresence);

    return () => {
      socket.off('connect', requestPresence);
    };
  }, []);
}
