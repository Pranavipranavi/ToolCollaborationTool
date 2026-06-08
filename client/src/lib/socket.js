import { io } from "socket.io-client";

let socket;

export function getSocket() {
  if (!socket) {
    const fallbackUrl = `${window.location.protocol}//${window.location.hostname}:5000`;
    socket = io(import.meta.env.VITE_SOCKET_URL ?? fallbackUrl, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}
