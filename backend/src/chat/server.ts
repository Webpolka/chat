import type { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import {
  chatStore,
  createOrUpdateUser,
  disconnectUserSocket,
  getUserBySocket,
  getOrCreateDialog,
  getUserDialogs,
  getDialogMessages,
  addMessage,
  deleteMessage,
  markMessageSeen,
  setTyping,
  stopTyping,
} from "./chat.store.js";

import type {
  ClientToServerEvents,
  ServerToClientEvents,
  UserID,
  User,
} from "../types.js";

import { JWT_ACCESS_SECRET } from "../config.js";
import { getUserById, updateUserProfile } from "../db/user.db.js"; // модуль БД

/**
 * Инициализация Chat Server
 */
export const initChatServer = (
  io: SocketServer<ClientToServerEvents, ServerToClientEvents>,
) => {
  // ================= Middleware: JWT =================
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
    } catch (err) {
      return next(new Error("Unauthorized: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    console.log("New websocket connected:", socket.id, "userId:", userId);

    const dbUser = getUserById(userId);
    if (!dbUser) {
      console.log("User not found in DB:", userId);
      return socket.disconnect();
    }

    // Создаем/обновляем пользователя в сторе при подключении
    createOrUpdateUser(dbUser, socket.id);

    // Отправляем список диалогов сразу после подключения
    const dialogs = getUserDialogs(userId);
    socket.emit("dialogs_list", dialogs);

    // ================= register_user =================
    // Фронт шлёт это после появления user в AuthProvider
    socket.on("register_user", () => {
      const userId = socket.data.userId;
      if (!userId) return;

      const dbUser = getUserById(userId); // берем актуальные данные
      if (!dbUser) return;

      const user = createOrUpdateUser(dbUser, socket.id);
      socket.broadcast.emit("user_online", user.id);
    });
    // ================= Socket Events =================

    // -------- GET DIALOGS --------
    socket.on("get_dialogs", () => {
      const user = getUserBySocket(socket.id);
      if (!user) return;
      socket.emit("dialogs_list", getUserDialogs(user.id));
    });

    // -------- OPEN DIALOG --------
    socket.on("open_dialog", (otherUserId: UserID) => {
      const user = getUserBySocket(socket.id);
      if (!user) return;

      const dialog = getOrCreateDialog(user.id, otherUserId);
      const messages = getDialogMessages(dialog.id);

      // Присоединяем пользователя к комнате диалога
      socket.join(dialog.id);

      socket.emit("messages_list", dialog.id, messages);
    });

    // -------- SEND MESSAGE --------
    socket.on("send_message", (data) => {
      const user = getUserBySocket(socket.id);
      if (!user) return;

      const message = addMessage({
        dialogId: data.dialogId,
        senderId: user.id,
        type: data.type,
        text: data.text,
        attachments: data.attachments,
      });

      // Отправляем сообщение всем участникам комнаты
      io.to(data.dialogId).emit("new_message", message);
    });

    // -------- DELETE MESSAGE --------
    socket.on("delete_message", (messageId, dialogId) => {
      deleteMessage(messageId, dialogId);
      io.to(dialogId).emit("message_deleted", messageId, dialogId);
    });

    // -------- TYPING --------
    socket.on("typing_start", (dialogId) => {
      const user = getUserBySocket(socket.id);
      if (!user) return;

      setTyping(dialogId, user.id);
      io.to(dialogId).emit("user_typing", { dialogId, userId: user.id });
    });

    socket.on("typing_stop", (dialogId) => {
      const user = getUserBySocket(socket.id);
      if (!user) return;

      stopTyping(dialogId, user.id);
      io.to(dialogId).emit("user_stop_typing", { dialogId, userId: user.id });
    });

    // -------- MESSAGE SEEN --------
    socket.on("message_seen", (dialogId) => {
      const user = getUserBySocket(socket.id);
      if (!user) return;

      markMessageSeen(dialogId, user.id);
      io.to(dialogId).emit("messages_seen", dialogId, user.id);
    });

    // -------- UPDATE USER PROFILE --------

    socket.on(
      "update_user",
      (
        updatedData: Partial<
          Omit<
            User,
            "id" | "password" | "sockets" | "online" | "lastSeen" | "typingIn"
          >
        >,
      ) => {
        const user = getUserBySocket(socket.id);
        if (!user) return;

        // ---- Обновляем профиль в БД ----
        const updatedDbUser = updateUserProfile(user.id, updatedData);
        if (!updatedDbUser) return;

        // ---- Обновляем стор ----
        const updatedUser = createOrUpdateUser(updatedDbUser, socket.id);

        // ---- Рассылаем обновленного юзера всем ----
        socket.broadcast.emit("user_updated", updatedUser);
        socket.emit("user_updated", updatedUser);
      },
    );

    // -------- DISCONNECT --------
    socket.on("disconnect", () => {
      const user = disconnectUserSocket(socket.id);
      if (user) {
        socket.broadcast.emit(
          "user_offline",
          user.id,
          user.lastSeen ?? Date.now(),
        );
      }
    });
  });
};
