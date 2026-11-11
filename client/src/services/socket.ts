import { io, type Socket } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000';

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
});

export function connectSocket(token: string) {
  if (socket.active) {
    socket.disconnect();
  }

  socket.auth = { token };
  socket.connect();
}

export function disconnectSocket() {
  socket.disconnect();
}