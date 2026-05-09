import { io } from "socket.io-client";

// The backend is running on port 5002 as seen in server.js
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5002";

export const socket = io(SOCKET_URL, {
  autoConnect: false // We will connect manually when entering the room
});
