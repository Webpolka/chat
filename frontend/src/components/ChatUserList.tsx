import React, { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuth } from "@/app/providers/auth/useAuth";
import type { UserID } from "@/types/types";

interface Props {
  selectedUserId?: UserID;                  // текущий выбранный чат
  onSelectDialog?: (userId: UserID) => void; // коллбек для мобильного
}

export const ChatUserList: React.FC<Props> = ({ selectedUserId, onSelectDialog }) => {
  const users = useChatStore((s) => s.users);
  const { user } = useAuth();
  const { setCurrentUserId } = useChatStore();

  // ---------------- set current user ----------------
  useEffect(() => {
    if (user?.id) setCurrentUserId(user.id);
  }, [user?.id]);

  // ---------------- сортировка ----------------
  const sortedUsers = Object.values(users)
    .filter((u) => u.id !== user?.id) // не показываем самого себя
    .sort((a, b) => {
      // онлайн сверху
      if (a.online === b.online) return 0;
      return a.online ? -1 : 1;
    });

  return (
    <div className="mt-5 p-3 w-full bg-gray-300 rounded-2xl shadow-sm overflow-y-auto">
      {sortedUsers.map((u) => {
        const isSelected = selectedUserId === u.id;

        return (
          <div
            key={u.id}
            onClick={() => onSelectDialog?.(u.id)}
            className={`flex items-center justify-between px-4 py-3 mb-2 cursor-pointer rounded-2xl border transition-colors
              ${u.online
                ? `bg-green-50 border-green-200 hover:bg-green-100 ${isSelected ? "ring-2 ring-green-400" : ""}`
                : `bg-gray-100 border-gray-300 hover:bg-gray-200 ${isSelected ? "ring-2 ring-gray-400" : ""}`
              }
            `}
          >
            {/* Слева имя пользователя */}
            <span
              className={`text-lg font-medium truncate ${
                u.online ? "text-green-600" : "text-gray-700"
              }`}
            >
              {u.username}
            </span>

            {/* Справа аватарка с статусом */}
            <div className="relative">
              {u.photo_url ? (
                <img
                  src={u.photo_url}
                  alt={u.username}
                  className="w-12 h-12 rounded-full object-cover border border-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                  ?
                </div>
              )}

              {/* Статус */}
              <span
                className={`absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white ${
                  u.online ? "bg-green-500" : "bg-gray-400"
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
