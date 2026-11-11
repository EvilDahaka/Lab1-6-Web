import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  connectSocket,
  disconnectSocket,
} from '@/services/socket';

export function useSocketConnection() {
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    connectSocket(token);

    return () => {
      disconnectSocket();
    };
  }, [token]);
}