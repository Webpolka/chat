import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import type { ServerUser } from "../types.js";

/*================================================================
AUTH
================================================================*/

// ================== Инициализация БД ==================
const db = new Database("./src/db/app.db");

// Создание таблицы users, если её нет
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    photo_url TEXT,
    bio TEXT DEFAULT '',
    createdAt INTEGER NOT NULL,
    online INTEGER DEFAULT 0,
    last_seen INTEGER
)
`,
).run();

/**
 * Создание нового пользователя с хэшированием пароля
 */
export const createUser = (data: {
  username: string;
  password: string;
  createdAt: number;

  first_name?: string;
  last_name?: string;
  bio?: string;

  email?: string;
  photo_url?: string;
}): ServerUser => {
  const id = uuidv4();

  const stmt = db.prepare(`
  INSERT INTO users (
    id, username, password, first_name, last_name, email, photo_url, bio, createdAt
  ) VALUES (
    @id, @username, @password, @first_name, @last_name, @email, @photo_url, @bio, @createdAt
  )
`);

  const now = Date.now();

  stmt.run({
    id,
    username: data.username,
    password: data.password,
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || null,
    photo_url: data.photo_url || "",
    bio: data.bio || "",
    createdAt: data.createdAt || now,
  });

  return {
    id,
    username: data.username,
    password: data.password,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    photo_url: data.photo_url,
    bio: data.bio,
    createdAt: data.createdAt || now,
    sockets: new Set(),
    online: false,
    lastSeen: 0,
  };
};

/**
 * Смена пароля пользователя
 */
export const changePassword = (data: {
  id: string;
  currentPassword: string;
  newPassword: string;
}): ServerUser => {
  const user = getUserById(data.id);
  if (!user) throw new Error("Пользователь не найден");

  // ===== 1. Проверяем текущий пароль =====
  const isMatch = bcrypt.compareSync(
    data.currentPassword.trim(),
    user.password.trim(),
  );

  if (!isMatch) {
    throw new Error("Неверный текущий пароль");
  }

  // ===== 3. Обновляем в базе =====
  db.prepare(
    `
    UPDATE users
    SET password=@password
    WHERE id=@id
  `,
  ).run({
    id: data.id,
    password: data.newPassword,
  });

  // ===== 4. Возвращаем обновленного юзера =====
  return getUserById(data.id)!;
};

/**
 * Обновление пользователя
 */
export const updateUser = (data: {
  id: string; // обязательный для идентификации
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  bio?: string;
  photo_url?: string;
}): ServerUser => {
  const user = getUserById(data.id);
  if (!user) throw new Error("Пользователь не найден");

  // Формируем объект для обновления
  const updated = {
    username: data.username ?? user.username,
    first_name: data.first_name ?? user.first_name,
    last_name: data.last_name ?? user.last_name,
    email: data.email ?? user.email,
    bio: data.bio ?? user.bio,
    photo_url: data.photo_url ?? user.photo_url,
  };

  // Выполняем UPDATE в базе
  db.prepare(
    `
    UPDATE users
    SET username=@username,
        first_name=@first_name,
        last_name=@last_name,
        email=@email,
        bio=@bio,
        photo_url=@photo_url
    WHERE id=@id
  `,
  ).run({
    id: data.id,
    ...updated,
  });

  // Возвращаем обновленного пользователя
  return getUserById(data.id)!;
};

/**
 * Удаление пользователя (с проверкой пароля)
 */
export const deleteUser = (data: { id: string; password: string }): boolean => {
  const user = getUserById(data.id);
  if (!user) throw new Error("Пользователь не найден");

  // Проверяем пароль
  const isValid = bcrypt.compareSync(data.password, user.password);
  if (!isValid) {
    throw new Error("Неверный пароль"); // если пароль не совпадает — false через исключение
  }

  // Удаляем пользователя
  db.prepare(`DELETE FROM users WHERE id = ?`).run(data.id);

  // Если дошли сюда — значит удаление прошло
  return true;
};


/**
 * Проверка пароля пользователя
 */
export const verifyPassword = (
  username: string,
  plainPassword: string,
): boolean => {
  const user = getUserByUsername(username);
  if (!user) return false;

  return bcrypt.compareSync(plainPassword, user.password);
};

/*================================================================
CHAT
================================================================*/

/**
 * Преобразуем строки из базы в ServerUser
 */
const rowToServerUser = (row: any): ServerUser => ({
  id: row.id,
  username: row.username,
  password: row.password ?? "", // хэш
  email: row.email,
  first_name: row.first_name,
  last_name: row.last_name,
  bio: row.bio ?? "",
  createdAt: row.createdAt ?? row.created_at ?? Date.now(),
  photo_url: row.photo_url,
  sockets: new Set(),
  online: !!row.online,
  lastSeen: row.last_seen ?? 0,
});

/**
 * Получение пользователя по username
 */
export const getUserByUsername = (username: string): ServerUser | null => {
  const row = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username);
  return row ? rowToServerUser(row) : null;
};

/**
 * Получение пользователя по ID
 */
export const getUserById = (id: string): ServerUser | null => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  return row ? rowToServerUser(row) : null;
};

/**
 * Получение всех пользователей
 */
export const getAllUsersFromDB = (): ServerUser[] => {
  const rows = db.prepare("SELECT * FROM users").all();
  return rows.map(rowToServerUser);
};

/**
 * Установка online статуса пользователя
 */
export const setUserOnlineStatus = (
  id: string,
  online: boolean,
): ServerUser | null => {
  const now = Date.now();

  // Сначала получаем текущего пользователя
  const user = getUserById(id);
  if (!user) return null; // если нет такого пользователя

  // Вычисляем lastSeen: если онлайн — оставляем прошлое значение, если offline — ставим сейчас
  const lastSeen = online ? user.lastSeen : now;

  // Обновляем БД
  db.prepare(
    `
    UPDATE users
    SET online=@online,
        last_seen=@lastSeen
    WHERE id=@id
  `,
  ).run({
    id,
    online: online ? 1 : 0,
    lastSeen,
  });

  // Возвращаем обновленного пользователя
  return getUserById(id);
};
