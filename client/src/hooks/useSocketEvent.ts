
import { useEffect, useRef } from 'react';
import { socket } from '@/services/socket';

export function useSocketEvent<T>(
  event: string,
  handler: (payload: T) => void
) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    const listener = (payload: T) => {
      handlerRef.current(payload);
    };

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
