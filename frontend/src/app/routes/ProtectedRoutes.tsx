// src/app/routes/ProtectedRoutes.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/providers/auth/useAuth";
import { SocketProvider } from "@/app/providers/socket/SocketProvider";

export const ProtectedRoutes: React.FC = () => {
  const { isAuth, loading } = useAuth();

  // Ждём, пока авторизация загрузится
  if (loading) return null; // можно сделать спиннер

  if (!isAuth) return <Navigate to="/" replace />;

  return (
    <SocketProvider>
      <Outlet />
    </SocketProvider>
  );
};
