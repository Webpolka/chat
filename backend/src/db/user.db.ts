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
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    photo_url TEXT,
    online INTEGER DEFAULT 0,
    last_seen INTEGER
  )
`).run();

/**
 * Создание нового пользователя с хэшированием пароля
 */
export const createUser = (data: {
  username: string;
  password: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  photo_url?: string;
}): ServerUser => {
  const id = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO users (id, username, password, first_name, last_name, email, photo_url)
    VALUES (@id, @username, @password, @first_name, @last_name, @email, @photo_url)
  `);

  stmt.run({
    id,
    username: data.username,
    password: data.password,
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    email: data.email || null,
    photo_url: data.photo_url || "",
  });

  return {
    id,
    username: data.username,
    password: data.password,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    photo_url: data.photo_url,
    sockets: new Set(),
    online: false,
    lastSeen: 0,
  };
};

/**
 * Проверка пароля пользователя
 */
export const verifyPassword = (username: string, plainPassword: string): boolean => {
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
  photo_url: row.photo_url,
  sockets: new Set(),
  online: !!row.online,
  lastSeen: row.last_seen ?? 0,
});

/**
 * Получение пользователя по username
 */
export const getUserByUsername = (username: string): ServerUser | null => {
  const row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
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
export const setUserOnlineStatus = (id: string, online: boolean): ServerUser | null => {
  const now = Date.now();
  db.prepare(`
    UPDATE users SET online=@online, last_seen=@lastSeen WHERE id=@id
  `).run({
    id,
    online: online ? 1 : 0,
    lastSeen: online ? null : now,
  });

  return getUserById(id);
};
