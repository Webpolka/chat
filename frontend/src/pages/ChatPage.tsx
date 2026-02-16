import React from "react";

import { ChatUserList } from "@/components/ChatUserList";
import { MessageList } from "@/components/MessageList";
import Header from "@/components/Header";

export const ChatPage: React.FC = () => {

  return (
    <div className="layout h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Список диалогов + онлайн пользователей */}
        <ChatUserList />

        {/* Сообщения текущего диалога */}
        <div className="flex flex-col flex-1">
          <MessageList />
        </div>
      </div>
    </div>
  );
};
