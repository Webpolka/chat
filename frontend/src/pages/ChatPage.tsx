import React, { useState } from "react";

import { ChatUserList } from "@/components/ChatUserList";
import { MessageList } from "@/components/MessageList";
import Header from "@/components/Header";
import type { DialogID } from "@/types/types";

export const ChatPage: React.FC = () => {
  const [activeDialog, setActiveDialog] = useState<DialogID | null>(null);


  return (    
      <div className="layout h-[calc(100vh-10px)] flex flex-col pb-5 rounded-b-4xl shadow-pink-700  bg-white/25">
        <Header />

        <div className="flex flex-1 overflow-hidden relative gap-5">

          {/* ---------------- САЙДБАР ---------------- */}
          <div
            className={`
            flex flex-col flex-shrink-0
            w-full md:w-[320px]
            transition-transform duration-300 ease-in-out

            ${activeDialog ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
          `}
          >
            <ChatUserList onSelectDialog={(id) => setActiveDialog(id)} />
          </div>

          {/* ---------------- MESSAGE PANEL ---------------- */}
          <div
            className={`
            flex flex-col flex-1           
            absolute md:relative
            top-0 left-0 w-full h-full md:h-auto

            transition-transform duration-300 ease-in-out

            ${activeDialog ? "translate-x-0" : "translate-x-full md:translate-x-0"}
          `}
          >
            <MessageList onBack={() => setActiveDialog(null)} />
          </div>

        </div>
      </div>    
  );
};
