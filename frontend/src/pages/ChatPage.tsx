import React from "react";
import { DialogList } from "@/ui/DialogList";
import { MessageList } from "@/ui/MessageList";
import { useAuth } from "@/app/providers/auth/useAuth";
import Header from "@/components/Header";

export const ChatPage: React.FC = () => {
  const { user, loading } = useAuth();
 
  if (loading) return <div>loading...</div>;
  if (!user) return <div>Требуется авторизация</div>;

  return (

    <div className="h-screen flex flex-col bg-[#0b0b0c]">
      {/* Header */}
      <Header profile={{ nickname: user.username, avatarUrl: user.photo_url || "" }} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Список диалогов + онлайн пользователей */}
        <DialogList />

        {/* Сообщения текущего диалога */}
        <div className="flex flex-col flex-1">
          <MessageList />
        </div>
      </div>
    </div>

  );
};
