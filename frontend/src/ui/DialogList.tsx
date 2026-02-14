import React from "react";
import { useChatStore } from "@/store/chatStore";
import type { Dialog } from "@/types/types";

/**
 * Левая панель диалогов (Telegram style)
 */
export const DialogList: React.FC = () => {
  const dialogsRecord = useChatStore((s) => s.dialogs);
  const messagesRecord = useChatStore((s) => s.messages);
  const currentDialogId = useChatStore((s) => s.currentDialogId);
  const setCurrentDialog = useChatStore((s) => s.setCurrentDialog);
  const usersRecord = useChatStore((s) => s.users);

  const myId = useChatStore((s) => s.currentUserId) || "me";

  // Преобразуем в массив
  const dialogs = Object.values(dialogsRecord);

  if (!dialogs.length) {
    return (
      <div className="w-[340px] h-screen bg-[#0f0f10] border-r border-[#1c1c1e] flex items-center justify-center text-gray-400">
        Нет диалогов
      </div>
    );
  }

  return (
    <div className="w-[340px] h-screen bg-[#0f0f10] border-r border-[#1c1c1e] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2a2a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0f0f10]/80 backdrop-blur border-b border-[#1c1c1e] px-4 py-3">
        <h2 className="text-lg font-semibold text-white tracking-tight">
          Chats
        </h2>
      </div>

      {/* Dialogs */}
      <div className="flex flex-col">
        {dialogs.map((dialog: Dialog) => {
          const isActive = dialog.id === currentDialogId;

          const otherUserId = dialog.participants.find((id) => id !== myId);
          const user = otherUserId ? usersRecord[otherUserId] : undefined;

          const dialogMessages = messagesRecord[dialog.id] || [];
          const lastMessage = dialogMessages[dialogMessages.length - 1];

          return (
            <div
              key={dialog.id}
              onClick={() => setCurrentDialog(dialog.id)}
              className={`
                group relative flex items-center gap-3 px-4 py-3 cursor-pointer
                transition-all duration-200
                ${isActive ? "bg-[#1d1d22]" : "hover:bg-[#17171a]"}
              `}
            >
              {/* active glow */}
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-[3px] bg-indigo-500 rounded-r-lg" />
              )}

              {/* avatar */}
              <div className="relative">
                <div className="
                  w-11 h-11 rounded-full flex items-center justify-center
                  bg-gradient-to-br from-indigo-500 to-purple-600
                  text-white font-semibold shadow-md
                ">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>

                {/* online */}
                {user?.online && (
                  <div className="
                    absolute bottom-0 right-0
                    w-3 h-3 bg-green-500 rounded-full
                    border-2 border-[#0f0f10]
                  " />
                )}
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium truncate">
                    {user?.username || "Диалог"}
                  </span>

                  {lastMessage?.createdAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>

                <div className="text-sm text-gray-400 truncate mt-[2px]">
                  {lastMessage?.text || "Нет сообщений"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
