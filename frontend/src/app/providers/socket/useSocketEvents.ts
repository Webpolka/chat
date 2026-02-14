// src/app/hooks/useSocketEvents.ts
import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSocket } from "@/app/providers/socket/useSocket";
import type { Message, Dialog, User } from "@/types/types";

/**
 * useSocketEvents - хук для подписки на события сокета
 * Используется в App.tsx для глобальной подписки на чат-события
 */
export const useSocketEvents = () => {
  const { socket } = useSocket();

  const setDialogs = useChatStore((s) => s.setDialogs);
  const setDialogsMessages = useChatStore((s) => s.setDialogsMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const updateUserStatus = useChatStore((s) => s.updateUserStatus);
  const updateUserProfile = useChatStore((s) => s.updateUserProfile);
  const startTyping = useChatStore((s) => s.startTyping);
  const stopTyping = useChatStore((s) => s.stopTyping);

  useEffect(() => {
    if (!socket) return;

    // ------------------- CHAT EVENTS -------------------
    const onDialogsList = (dialogs: Dialog[]) => setDialogs(dialogs);
    const onMessagesList = (dialogId: string, messages: Message[]) =>
      setDialogsMessages(dialogId, messages);

    type IncomingMessage = Message & { tempId?: string };
    
    const onNewMessage = (message: IncomingMessage) => {
      const { messages } = useChatStore.getState();
      const arr = messages.get(message.dialogId) || [];
      // Удаляем временное сообщение с tempId, если оно есть
      const filtered = arr.filter((m) => m.id !== message.tempId);
      messages.set(message.dialogId, [...filtered, message]);
      useChatStore.setState({ messages });
    };

    const onMessageDeleted = (messageId: string, dialogId: string) =>
      deleteMessage(dialogId, messageId);

    // ------------------- USER STATUS -------------------
    const onUserOnline = (userId: string) => updateUserStatus(userId, true);
    const onUserOffline = (userId: string, lastSeen: number) =>
      updateUserStatus(userId, false, lastSeen);

    // ------------------- USER PROFILE -------------------
    const onUserUpdated = (user: User) => updateUserProfile(user);

    // ------------------- TYPING -------------------
    const onUserTyping = ({
      dialogId,
      // , userId
    }: {
      dialogId: string;
      userId: string;
    }) => startTyping(dialogId);
    const onUserStopTyping = ({
      dialogId,
      // , userId
    }: {
      dialogId: string;
      userId: string;
    }) => stopTyping(dialogId);

    // ------------------- SUBSCRIBE -------------------
    socket.on("dialogs_list", onDialogsList);
    socket.on("messages_list", onMessagesList);
    socket.on("new_message", onNewMessage);
    socket.on("message_deleted", onMessageDeleted);
    socket.on("user_online", onUserOnline);
    socket.on("user_offline", onUserOffline);
    socket.on("user_updated", onUserUpdated);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stop_typing", onUserStopTyping);

    // ------------------- CLEANUP -------------------
    return () => {
      socket.off("dialogs_list", onDialogsList);
      socket.off("messages_list", onMessagesList);
      socket.off("new_message", onNewMessage);
      socket.off("message_deleted", onMessageDeleted);
      socket.off("user_online", onUserOnline);
      socket.off("user_offline", onUserOffline);
      socket.off("user_updated", onUserUpdated);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stop_typing", onUserStopTyping);
    };
  }, [
    socket,
    setDialogs,
    setDialogsMessages,
    sendMessage,
    deleteMessage,
    updateUserStatus,
    updateUserProfile,
    startTyping,
    stopTyping,
  ]);
};
