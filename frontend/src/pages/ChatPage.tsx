import React, { useState } from "react";

import { ChatUserList } from "@/components/ChatUserList";
import { MessageList } from "@/components/MessageList";
import Header from "@/components/Header";
import type { DialogID } from "@/types/types";

export const ChatPage: React.FC = () => {
  const [activeDialog, setActiveDialog] = useState<DialogID | null>(null);

  return (
    <div className="layout h-[calc(100vh-10px)] flex flex-col pb-5 rounded-b-4xl shadow-pink-700 bg-white/25">
      <Header />

      <div className="flex flex-1 overflow-hidden relative gap-5">

        {/* ---------------- DESKTOP SIDEBAR ---------------- */}
        <div className="hidden md:flex md:flex-col md:w-[320px]">
          <ChatUserList onSelectDialog={(id) => setActiveDialog(id)} />
        </div>

        {/* ---------------- DESKTOP MESSAGE PANEL ---------------- */}
        <div className="hidden md:flex flex-1 mt-5 ">
          <MessageList onBack={() => setActiveDialog(null)} />
        </div>

        {/* ---------------- MOBILE SIDEBAR ---------------- */}
        <div
          className={`
            md:hidden absolute top-0 left-0 w-full h-full transition-all duration-300 ease-in-out
            ${activeDialog ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"}
          `}
        >
          <ChatUserList onSelectDialog={(id) => setActiveDialog(id)} />
        </div>

        {/* ---------------- MOBILE MESSAGE PANEL ---------------- */}
        <div
          className={`
            md:hidden fixed top-0 left-0 w-full h-full z-50 bg-gray-100
            transition-transform duration-300 ease-in-out
            ${activeDialog ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <MessageList onBack={() => setActiveDialog(null)} />
        </div>

      </div>
    </div>
  );
};
