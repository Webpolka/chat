// src/app/providers/auth/RequireAuth.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/auth/useAuth";
import { PageLoader } from "@/components/PageLoader";

/**
 * Защищённый маршрут
 * Если пользователь не авторизован — редирект на главную
 * Пока идёт проверка токена — показываем PageLoader2
 */
export const RequireAuth = () => {
  const { isAuth, loading } = useAuth();

  if (loading) return <PageLoader />; // сплэш пока проверяем refresh токен

  if (!isAuth) return <Navigate to="/" replace />; // не авторизован → на главную

  return <Outlet />; // всё ок → рендерим дочерние маршруты
};
