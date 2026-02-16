// src/app/providers/socket/SocketProvider.tsx
import React, { useEffect, useState } from "react";
import { SocketContext } from "./useSocket";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "@/store/chatStore";
import { useAuth } from "../auth/useAuth";
import type { SafeUser } from "@/types/types";

interface Props {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  const setUsers = useChatStore((s) => s.setUsers);
  const updateUserStatus = useChatStore((s) => s.updateUserStatus);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const s = io({ autoConnect: false });

    // --------- События сокета ---------
    const handleConnect = () => {
      console.log("Socket connected:", s.id);
      s.emit("user_login");
      s.emit("get_users");
    };

    const handleUsersList = (users: SafeUser[]) => {
      setUsers(users);
    };

    const handleUserStatus = (u: SafeUser) => {
      if (!u) return;
      updateUserStatus(u.id, u.online, u.lastSeen);
    };

    const handleDisconnect = (reason: string) => {
      console.log("Socket disconnected:", reason);
    };

    s.on("connect", handleConnect);
    s.on("users_list", handleUsersList);
    s.on("user_status_updated", handleUserStatus);
    s.on("disconnect", handleDisconnect);

    s.connect();
    queueMicrotask(() => {
      setSocket(s);
    })


    // Очистка при размонтировании или логауте
    return () => {
      s.emit("user_logout");
      s.disconnect();
    };
  }, [user?.id, setUsers, updateUserStatus]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
