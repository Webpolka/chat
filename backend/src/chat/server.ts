import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config.js";
import {
  getUserById,
  getAllUsersFromDB,
  updateUserProfile,
  setUserOnlineStatus,
} from "../db/user.db.js";
import type {
  User,
  UserID,
  Dialog,
  DialogID,
  Message,
  MessageID,
} from "../types.js";

// ================== STORE ==================
// Кеш пользователей и диалогов
const users = new Map<UserID, User>();
const dialogs = new Map<DialogID, Dialog>();
const messages = new Map<DialogID, Message[]>();

// ================== HELPERS ==================
const createOrUpdateUserCache = (dbUser: User): User => {
  const user = users.get(dbUser.id);
  if (!user) {
    users.set(dbUser.id, { ...dbUser });
    return dbUser;
  }
  Object.assign(user, dbUser);
  return user;
};

const findDialogBetween = (a: UserID, b: UserID): Dialog | null => {
  for (const d of dialogs.values())
    if (d.participants.includes(a) && d.participants.includes(b)) return d;
  return null;
};

const getOrCreateDialog = (a: UserID, b: UserID): Dialog => {
  if (a === b) throw new Error("Cannot chat with yourself");
  const existing = findDialogBetween(a, b);
  if (existing) return existing;

  const id = crypto.randomUUID();
  const now = Date.now();
  const d: Dialog = {
    id,
    participants: [a, b],
    createdAt: now,
    updatedAt: now,
  };
  dialogs.set(id, d);
  messages.set(id, []);
  return d;
};

// ================== CHAT SERVER ==================
export const initChatServer = (io: SocketServer) => {
  // ---------------- JWT Middleware ----------------
  io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) return next(new Error("Unauthorized"));

    const token = cookie
      .split("; ")
      .find((c) => c.startsWith("accessToken="))
      ?.split("=")[1];
    if (!token) return next(new Error("Unauthorized"));

    try {
      const payload = jwt.verify(token, JWT_ACCESS_SECRET) as {
        userId: string;
      };
      socket.data.userId = payload.userId;
      next();
    } catch {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string;
    console.log("Connected:", socket.id, userId);

    // ---------------- GET USER FROM DB ----------------
    let dbUser = getUserById(userId);
    if (!dbUser) return socket.disconnect();

    // ---- Устанавливаем пользователя онлайн в БД ----
    dbUser = setUserOnlineStatus(userId, true);   
    // ---- Оповещаем всех фронтов, что пользователь онлайн ----
    io.emit("user_status_updated", dbUser);

    // ---- Отправляем список всех пользователей ----
    const allUsers = getAllUsersFromDB();
    socket.emit("users_list", allUsers);

    // ================= SOCKET EVENTS =================

    // Получить список пользователей по запросу
    socket.on("get_users", () => {
      const allUsers = getAllUsersFromDB();
      socket.emit("users_list", allUsers);
    });

    // Открыть диалог
    socket.on("open_dialog", (otherId: UserID) => {
      const dialog = getOrCreateDialog(userId, otherId);
      socket.join(dialog.id);
      socket.emit("messages_list", dialog.id, messages.get(dialog.id) || []);
    });

    // Отправить сообщение
    socket.on("send_message", (data) => {
      const dialog = dialogs.get(data.dialogId);
      if (!dialog) return;

      const msg: Message = {
        id: crypto.randomUUID(),
        dialogId: data.dialogId,
        senderId: userId,
        type: data.type,
        text: data.text,
        attachments: data.attachments,
        createdAt: Date.now(),
        deleted: false,
        seenBy: [userId],
      };
      messages.get(data.dialogId)?.push(msg);
      dialog.lastMessageId = msg.id;
      dialog.updatedAt = Date.now();

      io.to(data.dialogId).emit("new_message", msg);
    });

    // Печатает/не печатает
    socket.on("typing_start", (dialogId: DialogID) => {
      socket.to(dialogId).emit("user_typing", { dialogId, userId });
    });

    socket.on("typing_stop", (dialogId: DialogID) => {
      socket.to(dialogId).emit("user_stop_typing", { dialogId, userId });
    });

    // Обновление профиля пользователя
    socket.on("update_user", (data) => {
      const updatedDbUser = updateUserProfile(userId, data);
      if (!updatedDbUser) return;
      createOrUpdateUserCache(updatedDbUser);
      io.emit("user_updated", updatedDbUser);
    });

    // Отключение пользователя
    socket.on("disconnect", () => {
      const offlineUser = setUserOnlineStatus(userId, false);
      console.log(`User offline: ${offlineUser?.username}`);

      // ---- Оповещаем всех фронтов, что пользователь оффлайн ----
      io.emit("user_status_updated", offlineUser);
    });
  });
};
