// src/pages/NotFoundPage.tsx
import { useNavigate } from "react-router-dom";
import React from "react";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // возвращаем на главную
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8 text-center">
        Страница не найдена. Возможно, ссылка устарела или вы ошиблись с URL.
      </p>
      <button
        onClick={handleGoHome}
        className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-lg text-lg font-medium transition-colors"
      >
        Вернуться на главную
      </button>
    </div>
  );
};
