// src/store/chatStore.ts
import { create } from "zustand";
import type { User, Dialog, Message, FileAttachment, MessageType } from "../types/types";
import { getSocket } from "@/app/providers/socket/socket";

type ChatState = {
  currentUserId: string | null;


  users: Record<string, User>;
  dialogs: Record<string, Dialog>;
  messages: Record<string, Message[]>;

  currentDialogId: string | null;

  setUsers: (users: User[]) => void;

  // ---------------- Current dialog ----------------
  setCurrentDialog: (dialogId: string) => void;
  setDialogs: (dialogs: Dialog[]) => void;
  setDialogMessages: (dialogId: string, messages: Message[]) => void;

  // ---------------- Messages ----------------
  sendMessage: (dialogId: string, type: MessageType, text?: string, attachments?: FileAttachment[]) => void;
  deleteMessage: (dialogId: string, messageId: string) => void;
  markMessageSeen: (dialogId: string) => void;

  // ---------------- User status ----------------
  setCurrentUserId: (userId: string) => void;
  updateUserStatus: (userId: string, online: boolean, lastSeen?: number) => void;
  updateUserProfile: (user: User) => void;

  // ---------------- Typing ----------------
  startTyping: (dialogId: string) => void;
  stopTyping: (dialogId: string) => void;
};

export const useChatStore = create<ChatState>()((set, get) => ({
  currentUserId: null,
  users: {},
  dialogs: {},
  messages: {},
  currentDialogId: null,

  setUsers: (users) =>
  set(() => ({
    users: Object.fromEntries(users.map(u => [u.id, u])),
  })),


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

  setDialogMessages: (dialogId, messagesArr) => {
    const messages = { ...get().messages };
    messages[dialogId] = messagesArr;
    set({ messages });
  },

  // ---------------- Messages ----------------
  sendMessage: (dialogId, type, text, attachments) => {
    const socket = getSocket();
    const { currentUserId, messages } = get();
    if (!currentUserId) return;

    // Создаем сообщение локально (сервер потом пришлёт с id)
    const dialogMessages = messages[dialogId] || [];
    const tempMessage: Message = {
      id: `temp-${Date.now()}`, // временный id
      dialogId,
      senderId: currentUserId,
      type,
      text,
      attachments,
      createdAt: Date.now(),
      seenBy: [currentUserId],
    };
    messages[dialogId] = [...dialogMessages, tempMessage];
    set({ messages });

    // Отправляем на сервер
    socket?.emit("send_message", { dialogId, type, text, attachments });
  },

  deleteMessage: (dialogId, messageId) => {
    const messages = { ...get().messages };
    messages[dialogId] = (messages[dialogId] || []).filter((m) => m.id !== messageId);
    set({ messages });

    const socket = getSocket();
    socket?.emit("delete_message", messageId, dialogId);
  },

  markMessageSeen: (dialogId) => {
    const socket = getSocket();
    socket?.emit("message_seen", dialogId);
  },

  // ---------------- User status ----------------
  updateUserStatus: (userId, online, lastSeen) => {
    const users = { ...get().users };
    users[userId] = { ...users[userId], online, lastSeen };
    set({ users });
  },

updateUserProfile: (user) => {
  const users = { ...get().users };
  const existingUser = users[user.id] || { id: user.id, username: user.username || "Unknown" };
  users[user.id] = { ...existingUser, ...user };
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
}));
