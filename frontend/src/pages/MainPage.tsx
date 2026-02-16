// src/pages/MainPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/app/providers/auth/useAuth";
import { ChatButton } from "@/components/ChatButton";

export const MainPage = () => {
  const { isAuth, loading } = useAuth();
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (!loading && isAuth) {
      navigate("/chat");
    }
  }, [isAuth, loading, navigate]);

  return (
    <div className="layout relative h-screen w-full flex flex-col items-center justify-center bg-indigo-500 login-bg">

      {/* ===== Полупрозрачный градиент сверху ===== */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Верхние кнопки */}
      <div className="relative z-10 flex gap-6 mb-10">
        <ChatButton variant="green" onClick={() => setLoginOpen(true)}>
          Войти
        </ChatButton>

        <ChatButton variant="purple" onClick={() => setRegisterOpen(true)}>
          Регистрация
        </ChatButton>
      </div>


      {/* Здесь можно вставить слайдер или любой контент главной */}
      <div className="relative z-1 text-white text-center max-w-[600px] px-4">
        <h1 className="text-4xl text-white font-bold mb-4">Добро пожаловать в наш чат!</h1>
        <p className="text-lg">
          Чтобы продолжить, пожалуйста, войдите или зарегистрируйтесь.
          После авторизации вы сразу попадете в чат.
        </p>
      </div>

      {/* Модалки */}
      <AuthModal
        type="login"
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
      <AuthModal
        type="register"
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </div>
  );
};
