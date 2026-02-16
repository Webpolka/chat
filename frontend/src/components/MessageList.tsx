import React, { useState, useRef, useEffect } from "react";
import type { Message } from "@/types/types";
import { formatDistanceToNow, format } from "date-fns";

interface Props {
  onBack?: () => void; // пропс для кнопки назад
}

const currentUser = {
  id: "1",
  username: "Me",
  photo_url: "https://i.pravatar.cc/150?img=1",
  lastSeen: Date.now(),
};

const otherUser = {
  id: "2",
  username: "Alice",
  photo_url: "https://i.pravatar.cc/150?img=2",
  lastSeen: Date.now() - 1000 * 60 * 5,
};

const initialMessages: Message[] = [
  {
    id: "m1",
    dialogId: "d1",
    senderId: "2",
    type: "text",
    text: "Привет! Как дела?",
    createdAt: Date.now() - 1000 * 60 * 10,
    seenBy: ["1"],
  },
  {
    id: "m2",
    dialogId: "d1",
    senderId: "1",
    type: "text",
    text: "Привет! Всё ок, а у тебя?",
    createdAt: Date.now() - 1000 * 60 * 5,
    seenBy: ["1", "2"],
  },
  {
    id: "m3",
    dialogId: "d1",
    senderId: "1",
    type: "text",
    text: "Это сообщение ещё не доставлено",
    createdAt: Date.now() - 1000 * 30,
    seenBy: [],
  },
];

type MessageStatus = "sent" | "read" | "error";
const now = Date.now();

const getMessageStatus = (msg: Message): MessageStatus => {
  if (msg.senderId !== currentUser.id) return "read";
  if (msg.seenBy.includes(msg.senderId)) return "read";
  if (msg.seenBy.length === 0) return "error";
  return "sent";
};

export const MessageList: React.FC<Props> = ({ onBack }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      dialogId: "d1",
      senderId: currentUser.id,
      type: "text",
      text: input,
      createdAt: Date.now(),
      seenBy: [],
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div className="flex w-full flex-col h-full bg-gray-200 pb-5 md:pb-0 md:rounded-2xl overflow-hidden text-white">

      {/* ---------- Шапка ---------- */}
      <div className="flex items-center bg-gray-300 border-b border-gray-100 relative">
        {/* ---------- Кнопка назад для мобилки ---------- */}
        {onBack && (
          <div className="md:hidden p-2 ml-5">
            <button
              className="text-gray-700 cursor-pointer text-2xl hover:text-gray-500 transition-colors"
              onClick={onBack}
            >
              ←
            </button>
          </div>
        )}
        <div className="flex items-center gap-4 p-4 bg-gray-300 border-b border-gray-100 relative">
          <div className="relative">
            <img
              src={otherUser.photo_url}
              alt={otherUser.username}
              className="w-12 h-12 rounded-full"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-200 ${now - otherUser.lastSeen < 1000 * 60 * 10 ? "bg-green-400" : "bg-gray-400"
                }`}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-700">{otherUser.username}</span>
            <span className="text-sm text-gray-500">
              {otherUser.lastSeen
                ? `Last seen ${formatDistanceToNow(otherUser.lastSeen, { addSuffix: true })}`
                : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------- Список сообщений ---------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const status = getMessageStatus(msg);

          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`
                  max-w-[70%]
                  p-3
                  rounded-xl
                  ${isMe ? "bg-blue-500 text-white" : "bg-gray-600 text-white"}
                `}
              >
                <div>{msg.text}</div>
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>{format(msg.createdAt, "HH:mm")}</span>
                  {isMe && (
                    <span className={`ml-2 ${status === "error" ? "text-red-300" : "text-gray-300"}`}>
                      {status === "sent" && "✓"}
                      {status === "read" && "✓✓"}
                      {status === "error" && "no!"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ---------- Форма отправки ---------- */}
      <div className="p-4 flex gap-2 flex-wrap sm:flex-nowrap">
        <input
          type="text"
          placeholder="Написать сообщение..."
          className="flex-1 rounded-full px-3 py-3 md:px-6 sm:py-6 bg-white text-gray-700 placeholder:text-gray-400 text-lg focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="
            cursor-pointer
            px-3 shrink-0 sm:px-6 py-3
            rounded-full
            bg-gradient-to-r from-[#4ade80] to-[#16a34a]
            text-white
            font-semibold
            hover:brightness-110
            active:scale-95
            transition
            duration-200
            ease-in-out
          "
        >
          GO
        </button>
      </div>
    </div>
  );
};
