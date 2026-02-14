import type { User } from "../types.js";
import {
  createUser,
  getUserByUsername,
  getUserById,
} from "../db/user.store.js";
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
    });
    const tokens = generateTokens(user.id);

    const { password, ...safeUser } = user;
    return { user: safeUser, tokens };
  } catch (err: any) {
    console.error("[registerService] Error:", err.message || err);
    throw new Error("Ошибка при регистрации !");
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
