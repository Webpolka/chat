

// ================= TOKENS =================
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
  email?: string;

  first_name?: string;
  last_name?: string;
  photo_url?: string;
  avatar?: File;

  sockets: Set<SocketID>; // только сервер хранит
  online: boolean;
  lastSeen: number;
};


// ================= SAFE USER =================

export type SafeUser = {
  id: UserID;
  username: string;

  first_name?: string;
  last_name?: string;
  photo_url?: string;
  avatar?: File;

  online: boolean;
  lastSeen: number;
};


// ================= DIALOG =================
export type DialogID = string;

export type Dialog = {
  id: DialogID;

  participants: [UserID, UserID]; // всегда 2 человека

  createdAt: number;
  updatedAt: number;

  lastMessageId?: string;
};



// ================= MESSAGE =================
export type MessageID = string;

export type MessageType =
  | "text"
  | "image"
  | "file";

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

  text?: string;               // текст или подпись
  attachments?: FileAttachment[];

  createdAt: number;
  editedAt?: number;

  deleted?: boolean;           // удалено у всех
  seenBy: UserID[];            // кто прочитал
};



// ================= TYPING =================
export type TypingState = {
  dialogId: DialogID;
  userId: UserID;
  isTyping: boolean;
};
