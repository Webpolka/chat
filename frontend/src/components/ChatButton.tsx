// src/components/ChatButton.tsx
import { type FC, type ReactNode, type MouseEventHandler } from "react";
import clsx from "clsx";

type ChatButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "green" | "orange" | "purple" | "danger";
  className?: string;
  disabled?: boolean;
};

export const ChatButton: FC<ChatButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className,
  disabled = false,
}) => {
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-blue-600/70 to-blue-400/70 border border-blue-300/50 shadow-[0_0_15px_rgba(0,123,255,0.5)] hover:shadow-[0_0_25px_rgba(0,123,255,0.8)]",
    secondary:
      "bg-gradient-to-r from-gray-700/70 to-gray-500/70 border border-gray-400/50 shadow-[0_0_15px_rgba(128,128,128,0.5)] hover:shadow-[0_0_25px_rgba(128,128,128,0.8)]",
    green:
      "bg-gradient-to-r from-green-500/70 to-green-300/70 border border-green-300/50 shadow-[0_0_15px_rgba(72,187,120,0.5)] hover:shadow-[0_0_25px_rgba(72,187,120,0.8)]",
    orange:
      "bg-gradient-to-r from-orange-500/70 to-orange-300/70 border border-orange-300/50 shadow-[0_0_15px_rgba(255,165,0,0.5)] hover:shadow-[0_0_25px_rgba(255,165,0,0.8)]",
    purple:
      "bg-gradient-to-r from-purple-600/70 to-purple-400/70 border border-purple-300/50 shadow-[0_0_15px_rgba(128,0,128,0.5)] hover:shadow-[0_0_25px_rgba(128,0,128,0.8)]",
    danger:
      "bg-gradient-to-r from-red-600/80 to-red-400/80 border border-red-300/50 shadow-[0_0_15px_rgba(255,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,0,0,0.8)]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "px-4 md:px-8 py-3 text-sm sm:text-lg text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300",
        
        // если не disabled → hover эффекты
        !disabled && "hover:scale-105 cursor-pointer",
        
        // disabled стиль
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 shadow-none",

        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
};
