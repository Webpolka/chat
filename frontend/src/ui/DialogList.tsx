import React from "react";
import { useEffect } from "react";
import { useChatStore } from "@/store/chatStore";
import { useAuth } from "@/app/providers/auth/useAuth";

export const DialogList: React.FC = () => { 
  const users = useChatStore((s) => s.users);
  const { user } = useAuth();
  const { setCurrentUserId } = useChatStore();

  // ---------------- set current user ----------------
  useEffect(() => {
    if (user?.id) setCurrentUserId(user.id);
  }, [user?.id]);

 
  // const onlineOtherUsers = Object.values(users).filter(u => u.id !== currentUserId);

  return (
    <div className="users-list p-2 w-64 bg-[#111] text-white overflow-y-auto">
      {Object.values(users).map((user) => (
        <div key={user.id} className="flex items-center justify-between p-1 hover:bg-[#222] rounded">
          <span>{user.username}</span>
          <span className={`h-3 w-3 rounded-full ${user.online ? "bg-green-500" : "bg-gray-500"}`} />
        </div>
      ))}
    </div>
  );
};
