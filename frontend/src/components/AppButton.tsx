import React from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "accent" | "danger";
  className?: string;
  disabled?: boolean;
};

export const AppButton = ({
  children,
  onClick,
  variant = "primary",
  className,
  disabled = false,
}: ButtonProps) => {
  const baseClasses =
    "cursor-pointer tracking-[0.05em] px-4 py-3 rounded-xl font-extrabold shadow-2xl transition transform active:scale-95 hover:scale-105 text-white/95 drop-shadow-md flex items-center justify-center gap-2";

  const variantClasses = {
    // Основные действия: присоединиться, создать игру
    accent:
      "bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:from-green-500 hover:via-green-600 hover:to-green-700 shadow-inner shadow-black/30",
    secondary:
      "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:from-purple-600 hover:via-purple-700 hover:to-purple-800 shadow-inner shadow-black/30",
    // Акцент: кнопки, которые привлекают внимание, типа конфетти-эффект
    primary:
      "bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 hover:from-orange-500 hover:via-red-500 hover:to-pink-600 shadow-inner shadow-black/30",
    // Опасные действия: выйти, удалить
    danger:
      "bg-gradient-to-r from-red-500/80 via-red-600/80 to-red-700/80 hover:from-red-600/80 hover:via-red-700/80 hover:to-red-800/80 shadow-inner shadow-black/30",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        className,
        disabled && "opacity-50 cursor-not-allowed hover:scale-100"
      )}
    >
      {children}
    </button>
  );
};
