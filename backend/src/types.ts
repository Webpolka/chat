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

// ================= SERVER STORE =================
export type ServerStore = {
  users: Map<UserID, User>;
  dialogs: Map<DialogID, Dialog>;
  messages: Map<DialogID, Message[]>;

  socketToUser: Map<SocketID, UserID>;
  userSockets: Map<UserID, Set<SocketID>>;

  typing: Map<DialogID, Set<UserID>>;
};

// ================= SOCKET EVENTS =================
export type ClientToServerEvents = {
  register_user: (user: {
    id: string;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    email?: string; // добавляем email
    password?: string;
  }) => void;

  get_dialogs: () => void;
  open_dialog: (otherUserId: string) => void;

  send_message: (data: {
    dialogId: string;
    text?: string;
    attachments?: FileAttachment[];
    type: MessageType;
  }) => void;

  get_messages: (dialogId: string) => void;
  delete_message: (messageId: string, dialogId: string) => void;

  typing_start: (dialogId: string) => void;
  typing_stop: (dialogId: string) => void;

  message_seen: (dialogId: string) => void;

  // ---- Новое событие для обновления профиля ----
  update_user: (data: {
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    email?: string;
    password?: string;
  }) => void;
};

export type ServerToClientEvents = {
  user_online: (userId: string) => void;
  user_offline: (userId: string, lastSeen: number) => void;
  user_updated: (user: User) => void;

  dialogs_list: (dialogs: Dialog[]) => void;

  new_message: (message: Message) => void;
  messages_list: (dialogId: string, messages: Message[]) => void;

  message_deleted: (messageId: string, dialogId: string) => void;

  user_typing: (data: { dialogId: string; userId: string }) => void;
  user_stop_typing: (data: { dialogId: string; userId: string }) => void;

  messages_seen: (dialogId: string, userId: string) => void;
};
