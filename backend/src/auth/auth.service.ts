import {
  createUser,
  getUserByUsername,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
} from "../db/user.db.js";
import { generateTokens, verifyRefresh } from "./token.service.js";
import { SafeUser, Tokens } from "../types.js";
import bcrypt from "bcryptjs";

// ------------------- Регистрация -------------------
export const registerService = (data: {
  username: string;
  password: string;
  avatarUrl: string;
}): {
  user: SafeUser;
  tokens: Tokens;
} => {
  try {
    const existing = getUserByUsername(data.username);
    if (existing) throw new Error("Пользователь с таким ником уже существует");

    const hashedPassword = bcrypt.hashSync(data.password.trim(), 10);

    const user = createUser({
      username: data.username,
      password: hashedPassword,
      photo_url: data.avatarUrl,
      createdAt: Date.now(),
    });
    const tokens = generateTokens(user.id);

    const { password, ...safeUser } = user;
    return { user: safeUser, tokens };
  } catch (err: any) {
    console.error("[registerService] Error:", err.message || err);
    throw err;
  }
};

// ------------------- Обновление юзера -------------------
export const updateService = (data: {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  avatarUrl?: string;
}): {
  user: SafeUser;
  tokens: Tokens;
} => {
  try {
    const user = updateUser({
      id: data.id,
      username: data.username,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      bio: data.bio,
      photo_url: data.avatarUrl,
    });
    const tokens = generateTokens(user.id);

    const { password, ...safeUser } = user;
    return { user: safeUser, tokens };
  } catch (err: any) {
    console.error("[registerService] Error:", err.message || err);
    throw err;
  }
};

// ------------------- Обновление пароля -------------------
export const changePasswordService = (data: {
  id: string;
  currentPassword: string;
  newPassword: string;
}): {
  user: SafeUser;
  tokens: Tokens;
} => {
  try {
    console.log(data.newPassword);
    const user = changePassword({
      id: data.id,
      newPassword: bcrypt.hashSync(data.newPassword.trim(), 10),
      currentPassword: data.currentPassword.trim(),
    });
    const tokens = generateTokens(user.id);

    const { password, ...safeUser } = user;
    return { user: safeUser, tokens };
  } catch (err: any) {
    console.error("Update password Error:", err.message || err);
    throw err;
  }
};



// ------------------- Удаление аккаунта -------------------
export const deleteAccountService = (data: { id: string; password: string }): { ok: boolean } => {
  try {
    // вызов функции удаления пользователя
    const deleted = deleteUser({
      id: data.id,
      password: data.password.trim(),
    });

    return { ok: deleted }; // true если успешно
  } catch (err: any) {
    console.error("Delete account Error:", err.message || err);
    throw err;
  }
};

// ------------------- Логин -------------------
export const loginService = (data: {
  username: string;
  password: string;
}): { user: SafeUser; tokens: Tokens } => {
  const user = getUserByUsername(data.username);

  if (!user) {
    console.log(`[loginService] Пользователь "${data.username}" не найден`);
    throw new Error("Пользователь не найден");
  }

  const passwordMatches = bcrypt.compareSync(
    (data.password || "").trim(),
    (user.password || "").trim(),
  );

  if (!passwordMatches) {
    console.log(`[loginService] Неверный пароль для "${data.username}"`);
    throw new Error("Неверный пароль");
  }

  const tokens = generateTokens(user.id);
  const { password, ...safeUser } = user;
  return { user: safeUser, tokens };
};

// ------------------- Логаут -------------------
export const logoutService = (): { ok: boolean } => {
  try {
    // Если будем хранить refresh токены, можно инвалидировать здесь
    return { ok: true };
  } catch (err: any) {
    console.error("[logoutService] Error:", err.message || err);
    return { ok: false };
  }
};

// ------------------- Refresh -------------------

type RefreshResponse = {
  user: SafeUser;
  tokens: Tokens;
};

export const refreshService = (refreshToken: string): RefreshResponse => {
  try {
    const payload = verifyRefresh(refreshToken);

    const user = getUserById(payload.userId);
    if (!user) throw new Error("User not found");

    const tokens = generateTokens(payload.userId);

    const { password, ...safeUser } = user;
    return {
      user: safeUser,
      tokens,
    };
  } catch (err: any) {
    console.error(
      "[refreshService] Invalid refresh token:",
      err.message || err,
    );
    throw new Error("Invalid refresh token");
  }
};
