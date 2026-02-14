// src/components/Header.tsx
import React from "react";
import { ProfileDropdown, type UserProfile } from "./ProfileDropdown";

interface HeaderProps {
  profile?: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ profile }) => {
  return (
    <header className="rounded-b-2xl flex justify-between items-center p-4 bg-white shadow-[0_4px_25px_rgba(100,149,237,0.25)] px-4 sm:px-6 md:px-8">
      {/* Логотип */}
      <div className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
        <span className="text-3xl text-indigo-700">W</span>
        <span className="text-3xl text-pink-700">Temu</span>
        <span className="text-3xl text-green-700"> CHAT</span>
      </div>

      {/* Профиль */}
      <ProfileDropdown profile={profile} />
    </header>
  );
};

export default Header;
