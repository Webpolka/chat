// src/app/providers/socket/SocketProvider.tsx
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { SocketContext } from "./useSocket";
import { getSocket } from "./socket";
import { useChatStore } from "@/store/chatStore";
import type { Message, Dialog, User } from "@/types/types";
import { useAuth } from "../auth/useAuth";

interface Props {
  children: React.ReactNode;
}

/**
 * SocketProvider - подключает сокет и синхронизирует chatStore
 */
export const SocketProvider: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();
  const [socket] = useState<Socket>(getSocket());

  const setDialogs = useChatStore((s) => s.setDialogs);
  const setDialogsMessages = useChatStore((s) => s.setDialogsMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const updateUserStatus = useChatStore((s) => s.updateUserStatus);
  const updateUserProfile = useChatStore((s) => s.updateUserProfile);
  const startTyping = useChatStore((s) => s.startTyping);
  const stopTyping = useChatStore((s) => s.stopTyping);

  useEffect(() => {
    if (!user) return;
  }, [user]);


  useEffect(() => {
    const s = socket;
    // ------------------- CONNECT -------------------
    s.on("connect", () => {
      console.log("[SOCKET] Connected:", s.id);
      s.emit("register_user"); // регистрация текущего пользователя
    });

    s.on("disconnect", (reason) => {
      console.log("[SOCKET] Disconnected:", reason);
    });

    // ------------------- DIALOG EVENTS -------------------
    s.on("dialogs_list", (dialogs: Dialog[]) => setDialogs(dialogs));
    s.on("messages_list", (dialogId: string, messages: Message[]) =>
      setDialogsMessages(dialogId, messages)
    );

    type IncomingMessage = Message & { tempId?: string };

    s.on("new_message", (message: IncomingMessage) => {
      // Приходят authoritative сообщения от сервера
      const { messages } = useChatStore.getState();
      const arr = messages[message.dialogId] || [];
      const filtered = arr.filter((m) => m.id !== message.tempId);
      useChatStore.setState({
        messages: {
          ...messages,
          [message.dialogId]: [...filtered, message],
        },
      });

    });

    s.on("message_deleted", (messageId: string, dialogId: string) => {
      deleteMessage(dialogId, messageId);
    });

    // ------------------- USER STATUS -------------------
    s.on("user_online", (userId: string) => updateUserStatus(userId, true));
    s.on("user_offline", (userId: string, lastSeen: number) =>
      updateUserStatus(userId, false, lastSeen)
    );

    // ------------------- USER PROFILE -------------------
    s.on("user_updated", (user: User) => {
      updateUserProfile(user);
    });

    // ------------------- TYPING -------------------
    s.on(
      "user_typing",
      ({ dialogId
        // , userId 
      }: { dialogId: string; userId: string }) =>
        startTyping(dialogId)
    );
    s.on(
      "user_stop_typing",
      ({ dialogId
        // , userId 
      }: { dialogId: string; userId: string }) =>
        stopTyping(dialogId)
    );

    return () => {
      s.offAny();
    };
  }, [socket, setDialogs, setDialogsMessages, sendMessage, deleteMessage, updateUserStatus, updateUserProfile, startTyping, stopTyping]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
