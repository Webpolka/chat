// src/components/ChatButton.tsx
import { type FC, type ReactNode, type MouseEventHandler } from "react";
import clsx from "clsx";

type ChatButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "secondary" | "green" | "orange" | "purple";
  className?: string;
};

export const ChatButton: FC<ChatButtonProps> = ({
  children,
  onClick,
  variant = "primary",
  className,
}) => {
  // Классы по вариантам
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
  };

  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-8 py-3 text-white font-semibold rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </button>
  );
};
