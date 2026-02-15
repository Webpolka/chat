// src/app/providers/socket/SocketProvider.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Socket } from "socket.io-client";
import { SocketContext } from "./useSocket";
import { io } from "socket.io-client";
import { useChatStore } from "@/store/chatStore";
import type { SafeUser } from "@/types/types";
import { useAuth } from "../auth/useAuth";

interface Props {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  const setUsers = useChatStore((s) => s.setUsers);
  const updateUserStatus = useChatStore((s) => s.updateUserStatus);

  const [socket, setSocket] = useState<Socket | null>(null);

  // -------- Создание нового сокета --------
  const connectSocket = useCallback(() => {
    if (!user?.id) return;

    // Закрываем старый сокет, если есть
    if (socket) {
      socket.disconnect();
    }

    const s = io({ autoConnect: false });
    setSocket(s);

    // ---------------- CONNECT ----------------
    s.on("connect", () => {
      console.log("Socket connected:", s.id);

      // Сообщаем серверу, что юзер вошёл
      s.emit("user_login");

      // Запрашиваем полный список пользователей
      s.emit("get_users");
    });

    // ---------------- Список пользователей ----------------
    s.on("users_list", (users: SafeUser[]) => {
      setUsers(users);
    });

    // ---------------- Обновление статуса пользователей ----------------
    s.on("user_status_updated", (user) => {
      if (!user) return;
      updateUserStatus(user.id, user.online, user.lastSeen);
    });

    // ---------------- DISCONNECT ----------------
    s.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    s.connect();
  }, [user?.id, socket, setUsers, updateUserStatus]);

  // -------- Подключаем сокет при логине --------
  useEffect(() => {
    if (user?.id) {
      connectSocket();
    } else if (socket) {
      // Если юзер разлогинился, отключаем сокет
      socket.emit("user_logout");
      socket.disconnect();
      setSocket(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
