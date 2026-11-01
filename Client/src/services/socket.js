import { io } from "socket.io-client";

// Determine backend Socket.io server URL
const SERVER_URL =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_SERVER_URL ||
    (import.meta.env.VITE_PUBLIC_API_URL
        ? import.meta.env.VITE_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
        : "http://localhost:5000");

// Initialize singleton Socket.io instance
export const socket = io(SERVER_URL, {
    autoConnect: true,
    transports: ["websocket", "polling"],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
});

socket.on("connect", () => {
    console.log(`[Socket.io] Connected to server at ${SERVER_URL} with ID: ${socket.id}`);
});

socket.on("connect_error", (error) => {
    console.warn(`[Socket.io] Connection warning (${SERVER_URL}):`, error.message);
});

socket.on("disconnect", (reason) => {
    console.log(`[Socket.io] Disconnected: ${reason}`);
});

export default socket;
