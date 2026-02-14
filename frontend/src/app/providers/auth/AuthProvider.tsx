// src/app/providers/auth/AuthProvider.tsx
import { type ReactNode, useState, useEffect } from "react";
import { AuthContext, type AuthContextType } from "./useAuth";
import { api } from "@/shared/api/axios"; // axios с baseURL настроенным
import type { User } from "@/types/types";
import { AxiosError } from "axios";

type Props = { children: ReactNode };
/**
 * AuthProvider - оборачивает приложение и предоставляет данные о состоянии авторизации
 * и методы для работы с авторизацией (login, logout, checkAuth, updateProfile)
 */
export const AuthProvider = ({ children }: Props) => {
  // Стейт авторизации
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); // true пока проверяем токен
  const [user, setUser] = useState<User | null>(null);

  /**
   * Проверяем авторизацию при монтировании провайдера
   * Для этого вызываем /auth/refresh
   */
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * checkAuth - проверяет refresh токен и устанавливает состояние isAuth
   */

  //  helper для проверки
  function isAxiosError(err: unknown): err is AxiosError {
    return (err as AxiosError).isAxiosError !== undefined;
  }

  const checkAuth = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/auth/refresh");

      if (data.ok) {
        setUser(data.user);
        setIsAuth(true);
      } else {
        setUser(null);
        setIsAuth(false);
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Не логируем 401 — это нормальный случай
          setUser(null);
          setIsAuth(false);
        } else {
          console.error("Auth check failed:", err);
        }
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setLoading(false);
    }
  };



  /**
   * login - делает POST /auth/login
   * После успешного login автоматически обновляет состояние и можно подключать сокет
   */

  const login = async (loginData: { username: string; password: string }) => {
    try {
      const { data } = await api.post("/auth/login", loginData, { withCredentials: true });

      if (data.ok && data.user) {
        setUser(data.user);  // сохраняем пользователя
        setIsAuth(true);
        console.log("Login success ! Data of current User :", data.user);
      } else {
        setUser(null);
        setIsAuth(false);
        console.warn("Login failed:", data.error);
        throw new Error(data.error || "Login failed");
      }

    } catch (err) {
      console.error("Login error:", err);
      setUser(null);
      setIsAuth(false);
      throw err;
    }
  };

  /**
 * REGISTER - делает POST /auth/register
 * После успешного login автоматически обновляет состояние и можно подключать сокет
 */
  const register = async (registerData: { username: string; password: string; avatar: File }) => {
    try {
      const formData = new FormData();
      formData.append("username", registerData.username);
      formData.append("password", registerData.password);
      formData.append("avatar", registerData.avatar);

      const { data } = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUser(data.user);
      setIsAuth(true);
    } catch (err) {
      setIsAuth(false);
      setUser(null);
      throw err;
    }
  };


  /**
   * logout - делает POST /auth/logout
   * Сбрасывает локальное состояние авторизации
   */
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      setIsAuth(false);
      setUser(null);
      console.log("User logged out");
    }
  };


  // Контекст передаем детям
  const value: AuthContextType = {
    isAuth,
    loading,
    checkAuth,
    login,
    logout,
    register,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
