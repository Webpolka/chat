// src/app/providers/socket/socket.ts
import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * getSocket - возвращает один экземпляр сокета
 * Если сокет ещё не создан, создаёт и подключает его
 */
export const getSocket = (): Socket => {
  if (socket) return socket;

  const isDev = import.meta.env.DEV;

  socket = io(isDev ? undefined : window.location.origin, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    withCredentials: true, // важно для httpOnly cookie
  });


  // ------------------- Логи для отладки -------------------
  // socket.on("connect", () => {
  //   console.log("[SOCKET] Connected, socket id:", socket?.id);
  // });

  // socket.on("disconnect", (reason) => {
  //   console.log("[SOCKET] Disconnected, reason:", reason);
  // });

  // socket.on("connect_error", (err) => {
  //   console.error("[SOCKET] Connection error:", err);
  // });

  return socket;
};


/**
 * disconnectSocket - отключает сокет и обнуляет экземпляр
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
