import { io } from "socket.io-client";

// set this at build time: VITE_SOCKET_URL=https://your-api.onrender.com
const URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export const socket = io(URL, {
  transports: ["websocket"],
  autoConnect: true,
});

export default socket;
