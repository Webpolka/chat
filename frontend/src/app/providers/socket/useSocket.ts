// src/app/providers/socket/useSocket.ts
import { createContext, useContext } from "react";
import type { Socket } from "socket.io-client";

/**
 * Тип контекста сокета
 */
interface SocketContextType {
  socket: Socket | null;
}

/**
 * Создаём контекст сокета
 */
export const SocketContext = createContext<SocketContextType>({ socket: null });

/**
 * useSocket - hook для получения сокета из контекста
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used inside SocketProvider");
  return context;
};
