// src/app/providers/auth/useAuth.ts
import { createContext, useContext } from "react";
import type { User } from "@/types/types";

/**
 * Тип контекста авторизации
 */
export type AuthContextType = {
  isAuth: boolean;
  loading: boolean;
  user?: User | null;
  checkAuth: () => Promise<void>;
  login: (loginData: { username: string; password: string }) => Promise<void>;
  register: (registerData: {
    username: string;
    password: string;
    avatar: File;
  }) => Promise<void>;
  logout: () => Promise<void>;
  update: (updateData: {
    id: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    bio?: string;
    avatar?: File | null;
  }) => Promise<void>;
  changePassword: (passwordData: {
    id: string;
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  deleteAccount: (passwordData: {
    id: string;
    password: string;
  }) => Promise<boolean>;
};

/**
 * Создаём контекст авторизации
 * null по умолчанию → будет ошибка если использовать вне провайдера
 */
export const AuthContext = createContext<AuthContextType | null>(null);

/**
 * useAuth - hook для доступа к контексту авторизации
 * Используем в компонентах для получения состояния и методов auth
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};
