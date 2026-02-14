import type {
  User,
  UserID,
  Dialog,
  DialogID,
  Message,
  MessageID,
  SocketID,
} from "../types.js";

// ================== STORE ==================
export type ChatStore = {
  users: Map<UserID, User>;
  dialogs: Map<DialogID, Dialog>;
  messages: Map<DialogID, Message[]>;

  socketToUser: Map<SocketID, UserID>;
  userSockets: Map<UserID, Set<SocketID>>;

  typing: Map<DialogID, Set<UserID>>;
};

export const chatStore: ChatStore = {
  users: new Map(),
  dialogs: new Map(),
  messages: new Map(),

  socketToUser: new Map(),
  userSockets: new Map(),

  typing: new Map(),
};

// ================== USER LOGИКА ==================
/**
 * Создает нового пользователя или обновляет существующего в сторе
 */
export const createOrUpdateUser = (
  userData: User,
  socketId?: SocketID
): User => {
  let user = chatStore.users.get(userData.id);
  const now = Date.now();

  if (!user) {
    user = {
      ...userData,
      online: true,
      lastSeen: now,
      sockets: socketId ? new Set([socketId]) : new Set(),
      typingIn: null,
    };
    chatStore.users.set(user.id, user);
  } else {
    Object.assign(user, userData);
    user.online = true;
    user.lastSeen = now;
    if (socketId) user.sockets?.add(socketId);
  }

  // Сопоставление сокета с пользователем
  if (socketId) {
    chatStore.socketToUser.set(socketId, user.id);

    let userSockets = chatStore.userSockets.get(user.id);
    if (!userSockets) {
      userSockets = new Set();
      chatStore.userSockets.set(user.id, userSockets);
    }
    userSockets.add(socketId);
  }

  return user;
};

/**
 * Получение пользователя по сокету
 */
export const getUserBySocket = (socketId: SocketID): User | null => {
  const userId = chatStore.socketToUser.get(socketId);
  if (!userId) return null;
  return chatStore.users.get(userId) || null;
};

/**
 * Получение пользователя по ID
 */
export const getUser = (userId: UserID): User | null => {
  return chatStore.users.get(userId) || null;
};

/**
 * Отключение сокета пользователя
 */
export const disconnectUserSocket = (socketId: SocketID): User | null => {
  const userId = chatStore.socketToUser.get(socketId);
  if (!userId) return null;

  const user = chatStore.users.get(userId);
  if (!user) return null;

  user.sockets?.delete(socketId);
  chatStore.socketToUser.delete(socketId);

  const sockets = chatStore.userSockets.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) chatStore.userSockets.delete(userId);
  }

  // Если больше нет активных сокетов, ставим оффлайн
  if (!user.sockets || user.sockets.size === 0) {
    user.online = false;
    user.lastSeen = Date.now();
    return user;
  }

  return null;
};

// ================== DIALOG LOGИКА ==================
/**
 * Найти диалог между двумя пользователями
 */
export const findDialogBetweenUsers = (
  userA: UserID,
  userB: UserID
): Dialog | null => {
  for (const dialog of chatStore.dialogs.values()) {
    const [p1, p2] = dialog.participants;
    if (
      (p1 === userA && p2 === userB) ||
      (p1 === userB && p2 === userA)
    ) {
      return dialog;
    }
  }
  return null;
};

/**
 * Получить или создать диалог между двумя пользователями
 */
export const getOrCreateDialog = (userA: UserID, userB: UserID): Dialog => {
  if (userA === userB) throw new Error("Cannot create dialog with yourself");

  const existing = findDialogBetweenUsers(userA, userB);
  if (existing) return existing;

  const id = crypto.randomUUID();
  const now = Date.now();

  const dialog: Dialog = {
    id,
    participants: [userA, userB],
    createdAt: now,
    updatedAt: now,
    lastMessageId: undefined,
  };

  chatStore.dialogs.set(id, dialog);
  chatStore.messages.set(id, []);

  return dialog;
};

/**
 * Получение диалога по ID
 */
export const getDialog = (dialogId: DialogID): Dialog | null => {
  return chatStore.dialogs.get(dialogId) || null;
};

/**
 * Получение всех диалогов пользователя
 */
export const getUserDialogs = (userId: UserID): Dialog[] => {
  const dialogs = Array.from(chatStore.dialogs.values()).filter(d =>
    d.participants.includes(userId)
  );
  return dialogs.sort((a, b) => b.updatedAt - a.updatedAt);
};

// ================== MESSAGE LOGИКА ==================
/**
 * Добавление нового сообщения
 */
export const addMessage = (data: {
  dialogId: DialogID;
  senderId: UserID;
  type: "text" | "image" | "file";
  text?: string;
  attachments?: {
    id: string;
    url: string;
    name: string;
    size: number;
    mime: string;
  }[];
}): Message => {
  const dialog = chatStore.dialogs.get(data.dialogId);
  if (!dialog) throw new Error("Dialog not found");

  const messageId = crypto.randomUUID();
  const now = Date.now();

  const message: Message = {
    id: messageId,
    dialogId: data.dialogId,
    senderId: data.senderId,
    type: data.type,
    text: data.text,
    attachments: data.attachments,
    createdAt: now,
    deleted: false,
    seenBy: [data.senderId],
  };

  const messages = chatStore.messages.get(data.dialogId);
  if (!messages) throw new Error("Messages array not found");

  messages.push(message);

  dialog.lastMessageId = message.id;
  dialog.updatedAt = now;

  return message;
};

/**
 * Получение всех сообщений диалога
 */
export const getDialogMessages = (dialogId: DialogID): Message[] => {
  const messages = chatStore.messages.get(dialogId);
  return messages ? [...messages] : [];
};

/**
 * Удаление (логическое) сообщения
 */
export const deleteMessage = (messageId: MessageID, dialogId: DialogID) => {
  const messages = chatStore.messages.get(dialogId);
  if (!messages) return;

  const msg = messages.find(m => m.id === messageId);
  if (msg) msg.deleted = true;
};

/**
 * Отметка сообщений как прочитанных
 */
export const markMessageSeen = (dialogId: DialogID, userId: UserID) => {
  const messages = chatStore.messages.get(dialogId);
  if (!messages) return;

  for (const msg of messages) {
    if (!msg.seenBy.includes(userId)) {
      msg.seenBy.push(userId);
    }
  }

  const dialog = chatStore.dialogs.get(dialogId);
  if (dialog) dialog.updatedAt = Date.now();
};

// ================== TYPING LOGИКА ==================
/**
 * Пользователь начал печатать
 */
export const setTyping = (dialogId: DialogID, userId: UserID) => {
  let typingSet = chatStore.typing.get(dialogId);
  if (!typingSet) {
    typingSet = new Set();
    chatStore.typing.set(dialogId, typingSet);
  }
  typingSet.add(userId);

  const user = chatStore.users.get(userId);
  if (user) user.typingIn = dialogId;
};

/**
 * Пользователь перестал печатать
 */
export const stopTyping = (dialogId: DialogID, userId: UserID) => {
  const typingSet = chatStore.typing.get(dialogId);
  if (typingSet) {
    typingSet.delete(userId);
    if (typingSet.size === 0) chatStore.typing.delete(dialogId);
  }

  const user = chatStore.users.get(userId);
  if (user && user.typingIn === dialogId) user.typingIn = null;
};

/**
 * Получение списка пользователей, печатающих в диалоге
 */
export const getTypingUsers = (dialogId: DialogID): UserID[] => {
  const typingSet = chatStore.typing.get(dialogId);
  return typingSet ? Array.from(typingSet) : [];
};
