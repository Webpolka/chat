import type { Request, Response } from "express";
import {
  loginService,
  registerService,
  refreshService,
  logoutService,
} from "./auth.service.js";
import { saveAvatar } from "../utils/saveAvatar.js";

/**
 * POST /auth/register
 * Регистрация нового пользователя и установка httpOnly cookies с токенами
 */
export const registerController = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Проверка обязательных полей
    if (!username || !password) {
      return res.status(400).json({ error: "username и password обязательны" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Аватар обязателен" });
    }

    //  сохраняем аватар
    const avatarUrl = await saveAvatar(req.file);

    const { user, tokens } = await registerService({
      username,
      password,
      avatarUrl,
    });

    // Установка httpOnly cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // Убираем пароль перед отправкой на фронт
    res.json({ ok: true, user });
  } catch (err: any) {
    console.error("Register error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /auth/login
 * Логин пользователя и установка httpOnly cookies с токенами
 */
export const loginController = (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username и password обязательны" });
    }

    const { user, tokens } = loginService({ username, password });

    // Установка httpOnly cookies
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    // Убираем пароль перед отправкой на фронт
    res.json({ ok: true, user });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(401).json({ ok: false, error: err.message });
  }
};

/**
 * GET /auth/refresh
 * Обновление access и refresh токенов через refreshToken
 */

export const refreshController = (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const { user, tokens } = refreshService(refreshToken);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.json({
      ok: true,
      user, // ← ВОТ ЭТО ГЛАВНОЕ
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.sendStatus(401);
  }
};

/**
 * POST /auth/logout
 * Очистка токенов и httpOnly cookies
 */
export const logoutController = (_req: Request, res: Response) => {
  logoutService(); // Можно расширить логику (например, инвалидировать refresh токены)

  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  res.json({ ok: true });
};
