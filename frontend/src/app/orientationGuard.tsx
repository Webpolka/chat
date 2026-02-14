import { useEffect, useState,type ReactNode } from "react";
import { motion } from "framer-motion";

interface OrientationGuardProps {
  children: ReactNode;
}

export default function OrientationGuard({ children }: OrientationGuardProps) {
  const [isLandscapePhone, setIsLandscapePhone] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const shortSide = Math.min(width, height);
      const isLandscape = width > height;

      // телефон: короткая сторона < 600px
      const isPhoneSize = shortSide < 600;

      // проверка устройства по userAgent (TypeScript-friendly)
      const ua = (navigator.userAgent || "") + (navigator.vendor || "");
      const isMobileDevice = /android|iphone|ipod|windows phone/i.test(ua);

      const shouldShowOverlay = isLandscape && isPhoneSize && isMobileDevice;

      setIsLandscapePhone(shouldShowOverlay);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  if (!isLandscapePhone) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center px-4 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600">
       {/* ===== Фоновое изображение ===== */}
      <img
        src="/images/splashscreen-bg.webp"
        alt="Фон шашек"
        className="fixed inset-0 w-full h-full object-cover"
      />

      {/* ===== Полупрозрачный градиент сверху ===== */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/40 via-blue-600/40 to-indigo-700/40"></div>
    
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 bg-blue-200/20 backdrop-blur-md rounded-xl p-6 flex flex-col items-center text-center shadow-lg max-w-sm w-full"
      >
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-white text-2xl md:text-3xl font-bold mb-2">
          Поверни телефон вертикально
        </h2>
        <p className="text-white/90 text-base md:text-lg">
          Игра работает только в вертикальном режиме на телефоне
        </p>
      </motion.div>
    </div>
  );
}
