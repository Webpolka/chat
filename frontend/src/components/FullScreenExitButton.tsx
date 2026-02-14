import React from "react";
import { useFullscreen } from "@/hooks/useFullScreen";

type FullscreenExitButtonProps = {
  className?: string;
};

export const FullscreenExitButton: React.FC<FullscreenExitButtonProps> = ({
  className = "",
}) => {
  const { isFullscreen, closeFullscreen } = useFullscreen();

  if (!isFullscreen) return null;

  return (
    <button
      onClick={closeFullscreen}
      className={`
        absolute top-5 right-5 sm:top-10 sm:right-10
        flex items-center justify-center
        rounded-full
        cursor-pointer
        bg-gradient-to-br from-blue-400 to-blue-600
        shadow-2xl shadow-black/50
        hover:scale-110 hover:from-blue-300 hover:to-blue-500
        transition-all duration-300
        w-12 h-12 md:w-20 md:h-20   /* десктоп */        
        ${className}
      `}
    >
      <svg className="w-7 h-7 md:w-12 md:h-12 flex-shrink-0 text-white drop-shadow-md transition-transform duration-200">
        <use xlinkHref={`/sprite/sprite.svg#close`} />
      </svg>

    </button>
  );
};
