
export type Tokens = {
  accessToken: string;
  refreshToken: string;
};


// ================= USER =================
export type UserID = string;
export type SocketID = string;

export type User = {
  id: UserID;
  username: string;
  password: string;

  first_name?: string;
  last_name?: string;
  photo_url?: string;
  avatar?: File;
  email?: string;

  sockets?: Set<SocketID>;
  online?: boolean;
  lastSeen?: number;
  typingIn?: string | null;
};

export type SafeUser = {
  id: UserID;
  username: string;

  first_name?: string;
  last_name?: string;
  photo_url?: string;
  avatar?: File;
  sockets?: Set<SocketID>;

  online?: boolean;
  lastSeen?: number;
  typingIn?: string | null;

  // нет email и пароль и сокета
};

// ================= DIALOG =================
export type DialogID = string;

export type Dialog = {
  id: DialogID;
  participants: [UserID, UserID];
  createdAt: number;
  updatedAt: number;
  lastMessageId?: string;
};

// ================= MESSAGE =================
export type MessageID = string;
export type MessageType = "text" | "image" | "file";

export type FileAttachment = {
  id: string;
  url: string;
  name: string;
  size: number;
  mime: string;
};

export type Message = {
  id: MessageID;
  dialogId: DialogID;
  senderId: UserID;
  type: MessageType;
  text?: string;
  attachments?: FileAttachment[];
  createdAt: number;
  editedAt?: number;
  deleted?: boolean;
  seenBy: UserID[];
};

// ================= TYPING =================
export type TypingState = {
  dialogId: DialogID;
  userId: UserID;
  isTyping: boolean;
};
