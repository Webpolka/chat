// src/store/chatStore.ts
import { create } from "zustand";
import type { SafeUser } from "../types/types";
import { getSocket } from "@/app/providers/socket/socket";

type ChatState = {
  currentUserId: string | null;
  users: Record<string, SafeUser>;

  // ---------------- Current user ----------------
  setCurrentUserId: (userId: string) => void;

  // ---------------- Users ----------------
  setUsers: (users: SafeUser[]) => void;
  updateUserStatus: (
    userId: string,
    online: boolean,
    lastSeen?: number,
  ) => void;

  // ---------------- Socket ----------------
  initSocketListeners: () => void;
};

export const useChatStore = create<ChatState>()((set, get) => ({
  currentUserId: null,
  users: {},

  // ---------------- Current user ----------------
  setCurrentUserId: (userId) => set({ currentUserId: userId }),

  // ---------------- Users ----------------
  setUsers: (users) =>
    set(() => ({
      users: Object.fromEntries(users.map((u) => [u.id, u])),
    })),

  updateUserStatus: (userId, online, lastSeen) => {
    const users = { ...get().users };
    if (!users[userId]) return;
    users[userId] = { ...users[userId], online, lastSeen: lastSeen ?? 0 };
    set({ users });
  },

  // ---------------- Socket ----------------
  initSocketListeners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("user_status_updated", (user: SafeUser) => {
      get().updateUserStatus(user.id, user.online ?? false, user.lastSeen ?? 0);
    });

    socket.on("users_list", (users: SafeUser[]) => {
      get().setUsers(users);
    });
  },
}));
