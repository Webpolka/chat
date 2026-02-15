import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

import type { User } from "../types.js";

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
    online INTEGER DEFAULT 0,
    last_seen INTEGER
  )
`,
).run();

// ================== Функции ==================

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
}): User => {
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
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    photo_url: data.photo_url,
  };
};

/**
 * Получение пользователя по ID
 */
export const getUserById = (id: string): User | null => {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | User
    | undefined;
  return row || null;
};

/**
 * Получение пользователя по username
 */
export const getUserByUsername = (username: string): User | null => {
  const row = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as User | undefined;
  return row || null;
};

/**
 * Обновление профиля пользователя
 */
export const updateUserProfile = (
  id: string,
  data: Partial<Omit<User, "id" | "password">>,
): User | null => {
  const user = getUserById(id);
  if (!user) return null;

  const updated = { ...user, ...data };

  const stmt = db.prepare(`
    UPDATE users SET
      first_name=@first_name,
      last_name=@last_name,
      email=@email,
      username=@username,
      photo_url=@photo_url
    WHERE id=@id
  `);

  stmt.run({
    id,
    first_name: updated.first_name || "",
    last_name: updated.last_name || "",
    email: updated.email || null,
    username: updated.username,
    photo_url: updated.photo_url || "",
  });

  return updated;
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

// ================== ЧАТ: ВСЕ ПОЛЬЗОВАТЕЛИ ==================
/**
 * Получение всех пользователей из базы для чата
 */
export const getAllUsersFromDB = (): User[] => {
  const rows = db.prepare("SELECT * FROM users").all() as User[];
  return rows;
};

export const setUserOnlineStatus = (
  id: string,
  online: boolean,
): User | null => {
  const now = Date.now();
  const stmt = db.prepare(`
    UPDATE users SET online=@online, last_seen=@lastSeen WHERE id=@id
  `);
  stmt.run({
    id,
    online: online ? 1 : 0,
    lastSeen: online ? null : now, // online=true → lastSeen=null, offline → ставим время выхода
  });

  return getUserById(id);
};
