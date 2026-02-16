import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { api } from "@/shared/api/axios";
import { useSocket } from "@/app/providers/socket/useSocket";
import { useAuth } from "@/app/providers/auth/useAuth";

export interface UserProfile {
  nickname: string;
  avatarUrl: string;
}

interface ProfileDropdownProps {
  profile?: UserProfile | null;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ profile }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation(); // <-- определяем текущий путь
  const { checkAuth } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      await checkAuth();
      socket?.emit("user_logout");
      navigate("/auth");
    } catch (err) {
      console.error("Ошибка при выходе:", err);
    }
  };

  // Закрытие при клике вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 800);
  };
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  // Определяем динамичный пункт
  const isProfilePage = location.pathname === "/profile";
  const linkPath = isProfilePage ? "/chat" : "/profile";
  const linkLabel = isProfilePage ? "В чат" : "Профиль";

  return (
    <div className="relative" ref={menuRef}>
      {/* Кнопка аватар + ник */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl transition-all cursor-pointer"
      >
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt="avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-white outline-green-300 outline-2 shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
            ?
          </div>
        )}
        <span className="hidden md:inline text-lg md:text-xl font-semibold truncate">
          {profile?.nickname || "Участник"}
        </span>
        <svg
          className="hidden md:inline w-5 h-5 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] z-50 overflow-hidden"
        >
          <div className="block md:hidden w-full px-5 py-4 text-gray-700 font-semibold border-b border-gray-200 text-lg text-green-500">
            {profile?.nickname || "Участник"}
          </div>

          {/* Динамичный пункт */}
          <Link
            to={linkPath}
            className="block w-full text-left px-5 py-4 hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            {linkLabel}
          </Link>

          <button
            onClick={handleLogout}
            className="cursor-pointer block w-full text-left px-5 py-4 hover:bg-gray-100 transition-colors text-lg font-medium"
          >
            Выйти из аккаунта
          </button>
        </div>
      )}
    </div>
  );
};
