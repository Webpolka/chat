// src/app/providers/router/AppRouter.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { MainPage } from "@/pages/MainPage";
import { ChatPage } from "@/pages/ChatPage";
import { RequireAuth } from "./requireAuth";


import { SocketProvider } from "@/app/providers/socket/SocketProvider";


export const AppRouter = () => {

  return (
    <Routes>
      {/* Главная и регистрация доступны без авторизации */}
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<MainPage />} />
      <Route path="/register" element={<MainPage />} />

      {/* Защищённые маршруты */}
      <Route element={<RequireAuth />}>
        <Route path="/chat" element={
          <SocketProvider>            
            <ChatPage />
          </SocketProvider>
        } />
      </Route>

      {/* Неизвестные пути */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
