import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";
import { JWT_ACCESS_SECRET } from "../config.js";
import {
  getUserById,
  getAllUsersFromDB,
  setUserOnlineStatus,
} from "../db/user.db.js";
import type { ServerUser, SafeUser } from "../types.js";

// ================== CHAT SERVER ==================
export const initChatServer = (io: SocketServer) => {
  // -------- Микрофункция: превращает ServerUser в SafeUser --------
  const toSafeUser = (user: ServerUser): SafeUser => ({
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    photo_url: user.photo_url,
    bio: user.bio,
    email: user.email,
    createdAt: user.createdAt,
    online: user.online ?? false,
    lastSeen: user.lastSeen ?? 0,
  });

  // -------- JWT Middleware --------
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

  // -------- Polling для новых пользователей --------
  let lastUserCount = getAllUsersFromDB().length;
  const POLLING_INTERVAL = 5000; // 5 секунд

  setInterval(() => {
    const users = getAllUsersFromDB();
    if (users.length !== lastUserCount) {
      lastUserCount = users.length;

      // Отправляем всем клиентам актуальный список пользователей
      io.emit("users_list", users.map(toSafeUser));
    }
  }, POLLING_INTERVAL);

  // -------- CONNECTION --------
  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    console.log("Connected:", socket.id, userId);

    // =====  Получаем пользователя из БД =====
    const dbUser: ServerUser | null = getUserById(userId);
    if (!dbUser) return socket.disconnect();

    // ==== Запрос фронта: юзер логинится =====
    socket.on("user_login", () => {
      const onlineUser = setUserOnlineStatus(userId, true);
      console.log("User loggined:", onlineUser?.username);

      // всем сообщаем, что этот юзер онлайн
      io.emit(
        "user_status_updated",
        onlineUser ? toSafeUser(onlineUser) : null,
      );

      const allUsers: SafeUser[] = getAllUsersFromDB().map(toSafeUser);
      socket.emit("users_list", allUsers);
    });

    // ==== Запрос фронта: юзер разлогинился =====
    socket.on("user_logout", () => {
      const offlineUser = setUserOnlineStatus(userId, false);
      console.log("User logged out:", offlineUser?.username);

      // всем сообщаем, что этот юзер оффлайн
      io.emit(
        "user_status_updated",
        offlineUser ? toSafeUser(offlineUser) : null,
      );

      // можно сразу закрыть сокет, если нужно
      socket.disconnect(true);
    });

    // ===== Запрос фронта: отдать список пользователей =====
    socket.on("get_users", () => {
      const users: SafeUser[] = getAllUsersFromDB().map(toSafeUser);
      socket.emit("users_list", users);
    });

    // =====  DISCONNECT =====
    socket.on("disconnect", () => {
      const offlineUser = setUserOnlineStatus(userId, false);
      console.log("User offline:", offlineUser?.username);

      io.emit(
        "user_status_updated",
        offlineUser ? toSafeUser(offlineUser) : null,
      );
    });
  });
};
