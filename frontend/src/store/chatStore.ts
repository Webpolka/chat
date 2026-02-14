// src/store/chatStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User,
  Dialog,
  Message,
  FileAttachment,
  MessageType,
} from "../types/types";
import { getSocket } from "@/app/providers/socket/socket";

type ChatState = {
  currentUserId: string | null;

  users: Record<string, User>;
  dialogs: Record<string, Dialog>;
  messages: Record<string, Message[]>;

  currentDialogId: string | null;

  // ---------------- Dialogs ----------------
  setCurrentDialog: (dialogId: string) => void;
  setDialogs: (dialogs: Dialog[]) => void;

  // ---------------- Messages ----------------
  sendMessage: (
    dialogId: string,
    type: MessageType,
    text?: string,
    attachments?: FileAttachment[]
  ) => void;
  deleteMessage: (dialogId: string, messageId: string) => void;
  markMessageSeen: (dialogId: string) => void;
  setDialogsMessages: (dialogId: string, messages: Message[]) => void;

  // ---------------- User status ----------------
  setCurrentUserId: (userId: string) => void;
  updateUserStatus: (userId: string, online: boolean, lastSeen?: number) => void;
  updateUserProfile: (user: User) => void;

  // ---------------- Typing ----------------
  startTyping: (dialogId: string) => void;
  stopTyping: (dialogId: string) => void;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentUserId: null,
      users: {},
      dialogs: {},
      messages: {},
      currentDialogId: null,

      // ---------------- Current user ----------------
      setCurrentUserId: (userId) => set({ currentUserId: userId }),

      // ---------------- Dialogs ----------------
      setCurrentDialog: (dialogId) => set({ currentDialogId: dialogId }),
      setDialogs: (dialogsArr) => {
        const users = { ...get().users };
        const dialogs: Record<string, Dialog> = {};

        dialogsArr.forEach((d) => {
          dialogs[d.id] = d;

          // Добавляем участников в users, если ещё нет
          d.participants.forEach((uid) => {
            if (!users[uid]) {
              users[uid] = { id: uid, username: "Unknown", online: false };
            }
          });
        });

        set({ dialogs, users });
      },

      // ---------------- Messages ----------------
      sendMessage: (dialogId, type, text, attachments) => {
        const socket = getSocket();
        const { messages, currentUserId } = get();
        if (!currentUserId) return;

        const tempId = crypto.randomUUID();
        const tempMessage: Message = {
          id: tempId,
          dialogId,
          senderId: currentUserId,
          type,
          text,
          attachments,
          createdAt: Date.now(),
          seenBy: [currentUserId],
        };

        const dialogMessages = messages[dialogId] || [];
        messages[dialogId] = [...dialogMessages, tempMessage];

        set({ messages });

        socket?.emit("send_message", {
          dialogId,
          type,
          text,
          attachments,
          tempId,
        });
      },

      deleteMessage: (dialogId, messageId) => {
        const messages = { ...get().messages };
        const dialogMessages = messages[dialogId] || [];
        messages[dialogId] = dialogMessages.filter((m) => m.id !== messageId);
        set({ messages });

        const socket = getSocket();
        socket?.emit("delete_message", messageId, dialogId);
      },

      markMessageSeen: (dialogId) => {
        const socket = getSocket();
        socket?.emit("message_seen", dialogId);
      },

      setDialogsMessages: (dialogId, messagesArr) => {
        const messages = { ...get().messages };
        messages[dialogId] = messagesArr;
        set({ messages });
      },

      // ---------------- User status ----------------
      updateUserStatus: (userId, online, lastSeen) => {
        const users = { ...get().users };
        const user = users[userId];

        if (user) {
          users[userId] = {
            ...user,
            online,
            lastSeen: lastSeen ?? user.lastSeen,
          };
        } else {
          users[userId] = { id: userId, username: "Unknown", online, lastSeen };
        }

        set({ users });
      },

      updateUserProfile: (user: User) => {
        const users = { ...get().users };
        users[user.id] = user;
        set({ users });
      },

      // ---------------- Typing ----------------
      startTyping: (dialogId) => {
        const socket = getSocket();
        socket?.emit("typing_start", dialogId);
      },

      stopTyping: (dialogId) => {
        const socket = getSocket();
        socket?.emit("typing_stop", dialogId);
      },
    }),
    {
      name: "chat-storage",
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        users: state.users,
        dialogs: state.dialogs,
        messages: state.messages,
        currentDialogId: state.currentDialogId,
      }),
    }
  )
);
