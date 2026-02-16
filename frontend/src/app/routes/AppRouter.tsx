// src/app/routes/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { MainPage } from "@/pages/MainPage";
import { ChatPage } from "@/pages/ChatPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProtectedRoutes } from "./ProtectedRoutes";

export const AppRouter = () => {
  return (
    <Routes>
      {/* Главная и регистрация доступны без авторизации */}
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<MainPage />} />
      <Route path="/register" element={<MainPage />} />

      {/* Защищённые маршруты */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Неизвестные пути */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
