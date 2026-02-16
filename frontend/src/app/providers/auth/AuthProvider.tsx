// src/app/providers/auth/AuthProvider.tsx
import { type ReactNode, useState, useEffect } from "react";
import { AuthContext, type AuthContextType } from "./useAuth";
import { api } from "@/shared/api/axios"; // axios с baseURL настроенным
import type { User } from "@/types/types";
import { AxiosError } from "axios";
import { useChatStore } from "@/store/chatStore";
import { useMemo } from "react";

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

        // Добавляем в стор zustand данные текущего пользователя, чтобы можно было использовать их в чатах и при подключении сокета
        const store = useChatStore.getState();
        store.setCurrentUser(data.user);
        store.setCurrentUserId(data.user.id);
      }
      else {
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

        const store = useChatStore.getState();
        store.setCurrentUser(data.user);
        store.setCurrentUserId(data.user.id);
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

      const store = useChatStore.getState();
      store.setCurrentUser(data.user);
      store.setCurrentUserId(data.user.id);

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

      // Удаляем данные текущего пользователя из стора zustand, чтобы при отключении сокета не было данных о пользователе
      const store = useChatStore.getState();
      store.setCurrentUser(null);
      store.setCurrentUserId(null);
      store.setUsers([]); // очистить список

      console.log("User logged out");
    }
  };


  /**
 * update - обновляет профиль текущего пользователя
 * profileData может содержать любые поля: username, first_name, last_name, email, bio, avatar
 */
  const update = async (profileData: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    bio?: string;
    avatar?: File | null;
  }) => {
    if (!user) throw new Error("Нет авторизованного пользователя");

    try {
      const formData = new FormData();

      // Добавляем поля, если они есть
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // если это файл, просто append
          if (key === "avatar" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // ==== Запрос на сервер ====
      const { data } = await api.post(`/auth/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // ==== После успешного ответа обновляем локальный стейт и zustand ====
      setUser(data.user);

      const store = useChatStore.getState();
      store.setCurrentUser(data.user);

      const updatedUsers = {
        ...store.users,           // оставляем всех юзеров
        [data.user.id]: data.user // заменяем/добавляем текущего
      };
      store.setUsers(Object.values(updatedUsers));

      return data.user;
    } catch (err) {
      console.error("[AuthProvider] update profile error:", err);
      throw err;
    }
  };



  /**
* changePassword - меняет пароль текущего пользователя
* passwordData содержит id пользователя, текущий пароль и новый пароль
 */
  const changePassword = async (passwordData: {
    id: string;
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!user) throw new Error("Нет авторизованного пользователя");

    try {
      const { data } = await api.post("/auth/change-password", passwordData, {
        withCredentials: true,
      });

      if (!data.ok) {
        throw new Error(data.error || "Ошибка смены пароля");
      }

      return data.user;
    } catch (err) {
      console.error("[AuthProvider] change password error:", err);
      throw err;
    }
  };



  /**
* deleteAccount - удаляет аккаунт текущего пользователя
* deleteData содержит id пользователя и пароль для подтверждения  
 */
  const deleteAccount = async (deleteData: {
    id: string;
    password: string;
  }) => {
    if (!user) throw new Error("Нет авторизованного пользователя");

    try {
      const { data } = await api.post("/auth/delete-account", deleteData, {
        withCredentials: true,
      });

      if (!data.ok) {
        console.error("Ошибка удаления аккаунта:", data.error);
      }
      return true;
    } catch (err) {
      console.error("[AuthProvider] delete account error:", err);
      return false;
    } finally {
      setIsAuth(false);
      setUser(null);

      // Удаляем данные текущего пользователя из стора zustand, чтобы при отключении сокета не было данных о пользователе
      const store = useChatStore.getState();
      store.setCurrentUser(null);
      store.setCurrentUserId(null);
      store.setUsers([]); // очистить список
    }
  };



  // Контекст передаем детям
  const contextValue: AuthContextType = useMemo(() => ({
    isAuth,
    loading,
    user,
    checkAuth,
    login,
    logout,
    register,
    update,
    changePassword,
    deleteAccount
  }), [isAuth, loading, user]);


  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;

};
