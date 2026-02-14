import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "@/store/chatStore";

/**
 * Центральная часть чата (сообщения + input)
 */
export const MessageList: React.FC = () => {
  const currentDialogId = useChatStore((s) => s.currentDialogId);
  const messagesRecord = useChatStore((s) => s.messages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const markSeen = useChatStore((s) => s.markMessageSeen);
  const startTyping = useChatStore((s) => s.startTyping);
  const stopTyping = useChatStore((s) => s.stopTyping);

  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = currentDialogId ? messagesRecord[currentDialogId] || [] : [];

  // ---------------- scroll вниз ----------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentDialogId]);

  // ---------------- seen ----------------
  useEffect(() => {
    if (currentDialogId) markSeen(currentDialogId);
  }, [currentDialogId]);

  if (!currentDialogId) {
    return (
      <div className="flex-1 h-screen bg-[#0b0b0c] flex items-center justify-center text-gray-500">
        Выбери чат
      </div>
    );
  }

  // ---------------- send ----------------
  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(currentDialogId, "text", text);
    setText("");
    stopTyping(currentDialogId);
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#0b0b0c]">
      {/* HEADER */}
      <div className="h-[60px] flex items-center px-6 border-b border-[#1c1c1e] bg-[#0f0f10]/80 backdrop-blur">
        <div className="text-white font-semibold">Диалог</div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin scrollbar-thumb-[#2a2a2a]">
        {messages.map((m) => {
          const currentUserId = useChatStore.getState().currentUserId || "me";
          const isMe = m.senderId === currentUserId;

          return (
            <div
              key={m.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`
                group relative max-w-[65%] px-4 py-2 rounded-2xl
                text-sm break-words shadow
                transition-all
                ${isMe
                  ? "bg-indigo-600 text-white rounded-br-md"
                  : "bg-[#1a1a1d] text-gray-200 rounded-bl-md"
                }
              `}>
                {/* текст */}
                {m.text}

                {/* time */}
                <div className="text-[10px] opacity-60 mt-1 text-right">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                {/* delete hover */}
                {isMe && (
                  <button
                    onClick={() => deleteMessage(currentDialogId, m.id)}
                    className="
                      absolute -right-6 top-1/2 -translate-y-1/2
                      opacity-0 group-hover:opacity-100
                      text-xs text-red-400 hover:text-red-500
                      transition
                    "
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* typing */}
        {/* <TypingIndicator dialogId={currentDialogId} /> */}

        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="px-6 py-4 border-t border-[#1c1c1e] bg-[#0f0f10]">
        <div className="flex items-center gap-3 bg-[#151518] rounded-2xl px-4 py-3">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              startTyping(currentDialogId);
            }}
            onBlur={() => stopTyping(currentDialogId)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Написать сообщение..."
            className="
              flex-1 bg-transparent outline-none
              text-sm text-white placeholder-gray-500
            "
          />

          <button
            onClick={handleSend}
            className="
              px-4 py-1.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-500
              text-white text-sm font-medium
              transition shadow
            "
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
