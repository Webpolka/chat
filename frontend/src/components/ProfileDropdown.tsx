// src/components/ProfileDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/providers/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/shared/api/axios";

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

    const { checkAuth } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            // вызываем logout на сервере
            await api.post("/auth/logout");

            // обновляем состояние auth
            await checkAuth();

            // редирект на страницу входа
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

    // Hover intent таймер
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => setOpen(false), 800);
    };
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* Кнопка аватар + ник (только десктоп для ник и стрелки) */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-xl transition-all cursor-pointer"
            >
                {profile?.avatarUrl ? (
                    <img
                        src={profile.avatarUrl}
                        alt="avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white outline-green-300 outline-2"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                        ?
                    </div>
                )}

                {/* Ник и стрелка только для десктопа */}
                <span className="hidden md:inline text-lg md:text-xl font-semibold truncate">
                    {profile?.nickname || "Игрок"}
                </span>
                <svg
                    className="hidden md:inline w-5 h-5 transition-transform duration-200"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] z-50 overflow-hidden"
                >
                    {/* Ник внутри dropdown для мобильной версии */}
                    <div className="block md:hidden w-full px-5 py-4 text-gray-700 font-semibold border-b border-gray-200 text-lg text-green-500">
                        {profile?.nickname || "Игрок"}
                    </div>

                    <button className="block w-full text-left px-5 py-4 hover:bg-gray-100 transition-colors text-lg font-medium">
                        Личный кабинет
                    </button>
                    <button onClick={handleLogout} className="block w-full text-left px-5 py-4 hover:bg-gray-100 transition-colors text-lg font-medium">
                        Выйти
                    </button>
                </div>
            )}
        </div>
    );
};
