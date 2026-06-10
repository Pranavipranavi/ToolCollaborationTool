import { io } from "socket.io-client";
import { clientEnv } from "./env";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(clientEnv.socketUrl, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return socket;
}
