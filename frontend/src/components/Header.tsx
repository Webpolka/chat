// src/components/Header.tsx
import React from "react";
import { ProfileDropdown } from "./ProfileDropdown";
import { useChatStore } from "@/store/chatStore";
import { useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
  pageTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { users, currentUserId } = useChatStore();
  const profileUser = currentUserId ? users[currentUserId] : null;

  const profile = profileUser
    ? {
        nickname: profileUser.username,
        avatarUrl: profileUser.photo_url || "",
      }
    : null;

  const location = useLocation();
  const navigate = useNavigate();

  // Если на профиле → показываем кнопку «назад»
  const isProfilePage = location.pathname === "/profile";

  return (
    <header className="rounded-b-2xl flex justify-between items-center p-4 bg-white shadow-[0_4px_25px_rgba(100,149,237,0.25)] px-4 sm:px-6 md:px-8">
      <div className="flex items-center gap-3">
        {isProfilePage && (
          <button
            onClick={() => navigate("/chat")}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        <span className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
          {pageTitle || (
            <>
              <span className="text-3xl text-indigo-700">W</span>
              <span className="text-3xl text-pink-700">Temu</span>
              <span className="text-3xl text-green-700"> CHAT</span>
            </>
          )}
        </span>
      </div>

      {/* Профиль */}
      <ProfileDropdown profile={profile} />
    </header>
  );
};

export default Header;
