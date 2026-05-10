import { io } from "socket.io-client";

// Use VITE_API_URL which is defined in .env
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

export const socket = io(SOCKET_URL, {
  autoConnect: false // We will connect manually when entering the room
});
