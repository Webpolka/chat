

// ================= TOKENS =================
export type Tokens = {
  accessToken: string;
  refreshToken: string;
};


// ================= USER =================
export type UserID = string;
export type SocketID = string;

export type ServerUser = {
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
