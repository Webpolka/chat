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
  const setDialogMessages = useChatStore((s) => s.setDialogMessages);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const updateUserProfile = useChatStore((s) => s.updateUserProfile);
  const startTyping = useChatStore((s) => s.startTyping);
  const stopTyping = useChatStore((s) => s.stopTyping);

  const setUsers = useChatStore((s) => s.setUsers);


  useEffect(() => {
    if (!user) return;

    const s = socket;

    // ВСЕ пользователи из БД
    // Получаем всех пользователей при подключении
    s.emit("get_users");

    s.on("users_list", (users) => setUsers(users));

    s.on("user_status_updated", (user) => {
      updateUserProfile(user);
    });


    // ---------------- CONNECT ----------------
    s.on("connect", () => {
      s.emit("register_user");
      console.log("Socket connected:", socket.id);

      s.emit("get_users");

      s.emit("get_dialogs");

      s.on("user_status_updated", (user) => {
        updateUserProfile(user);
      });
    });

    s.on("disconnect", () => { });


    // ---------------- DIALOG EVENTS ----------------
    s.on("dialogs_list", (dialogs: Dialog[]) => setDialogs(dialogs));

    s.on("messages_list", (dialogId: string, messages: Message[]) =>
      setDialogMessages(dialogId, messages)
    );

    s.on("new_message", (message: Message) => {
      const { messages } = useChatStore.getState();
      const dialogMessages = messages[message.dialogId] || [];
      useChatStore.setState({
        messages: {
          ...messages,
          [message.dialogId]: [...dialogMessages, message],
        },
      });
    });


    s.on("message_deleted", (messageId: string, dialogId: string) =>
      deleteMessage(dialogId, messageId)
    );

    // ---------------- USER STATUS ----------------

    // ---------------- USER PROFILE ----------------
    s.on("user_updated", (user: User) => updateUserProfile(user));

    // ---------------- TYPING ----------------
    s.on("user_typing", ({ dialogId }: { dialogId: string }) =>
      startTyping(dialogId)
    );
    s.on("user_stop_typing", ({ dialogId }: { dialogId: string }) =>
      stopTyping(dialogId)
    );

    return () => {
      s.offAny();
    };
  }, [user, socket, setDialogs, setDialogMessages, deleteMessage, updateUserProfile, startTyping, stopTyping]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
