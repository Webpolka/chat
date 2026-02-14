// import React, { useEffect } from "react";
// import { useChatStore } from "@/store/chatStore";
// import { useSocket } from "@/app/providers/socket/useSocket";
// import { DialogList } from "@/ui/DialogList";
// import { MessageList } from "@/ui/MessageList";
// import { useAuth } from "@/app/providers/auth/useAuth";


// // ---------------- ChatPage ----------------
// export const ChatPage: React.FC = () => {
//   const { socket } = useSocket();
//   const { user, isAuth, loading } = useAuth();
//   const setCurrentUserId = useChatStore((s) => s.setCurrentUserId);

//   // ---------------- set current user ----------------
//   useEffect(() => {
//     if (user?.id) setCurrentUserId(user.id);
//   }, [user?.id]);

//   // ---------------- register user ----------------
//   useEffect(() => {
//     if (socket && user?.id) {
//       socket.emit("register_user");
//     }
//   }, [socket, user?.id]);

//   if (loading) return <div>loading...</div>;
//   if (!isAuth) return <div>Требуется авторизация</div>;

//   return (
//     <div className="flex h-screen bg-[#0b0b0c]">
//       <DialogList />
//       <MessageList />
//     </div>
//   );
// };




// src/pages/ChatPage.tsx
import React, { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useSocket } from "@/app/providers/socket/useSocket";
import { DialogList } from "@/ui/DialogList";
import { MessageList } from "@/ui/MessageList";
import { useAuth } from "@/app/providers/auth/useAuth";
import Header from "@/components/Header";

export const ChatPage: React.FC = () => {
  const { socket } = useSocket();
  const currentDialogId = useChatStore((s) => s.currentDialogId);
  const setDialogs = useChatStore((s) => s.setDialogs);
  const setDialogsMessages = useChatStore((s) => s.setDialogsMessages);

  const { user, loading } = useAuth();

  // 📡 загрузка диалогов
  useEffect(() => {
    if (!socket) return;
    socket.emit("get_dialogs");

    socket.on("dialogs_list", (dialogs) => {
      setDialogs(dialogs);
    });

    return () => {
      socket.off("dialogs_list");
    };
  }, [socket]);

  // 📡 загрузка сообщений диалога
  useEffect(() => {
    if (!socket || !currentDialogId) return;
    socket.emit("get_messages", currentDialogId);

    socket.on("messages_list", (messages) => {
      setDialogsMessages(currentDialogId, messages);
    });

    return () => {
      socket.off("messages_list");
    };
  }, [socket, currentDialogId]);

  if (loading) return <div>loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-[#0b0b0c]">
      {/* Шапка */}
      <Header
        profile={
          user
            ? { nickname: user.username, avatarUrl: user.photo_url || ""}
            : null
        }
      />

      {/* Основной контент */}
      <div className="flex flex-1 overflow-hidden">
        <DialogList />

        <div className="flex flex-col flex-1">
          <MessageList />
        </div>
      </div>
    </div>
  );
};
