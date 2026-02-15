import React from "react";
import { useChatStore } from "@/store/chatStore";

export const MessageList: React.FC = () => {
  const messages = useChatStore((s) => s.messages);
  const currentDialogId = useChatStore((s) => s.currentDialogId);

  if (!currentDialogId) return null;

  const dialogMessages = messages[currentDialogId] || [];

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {dialogMessages.map((msg) => (
        <div key={msg.id} className="my-1">
          <div>{msg.text}</div>
        </div>
      ))}
    </div>
  );
};
