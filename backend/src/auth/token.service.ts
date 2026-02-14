import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  ACCESS_EXPIRES,
  REFRESH_EXPIRES,
} from "../config.js";

// payload токена
interface TokenPayload extends JwtPayload {
  userId: string;
}

// Опции для jwt
const accessOptions: SignOptions = { expiresIn: ACCESS_EXPIRES as SignOptions["expiresIn"] };
const refreshOptions: SignOptions = { expiresIn: REFRESH_EXPIRES as SignOptions["expiresIn"] };

// ------------------- Генерация токенов -------------------
export const generateTokens = (userId: string) => {
  try {
    if (!JWT_ACCESS_SECRET || !JWT_REFRESH_SECRET) {
      throw new Error("JWT secrets not defined in ENV");
    }

    const payload: TokenPayload = { userId };

    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, accessOptions);
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, refreshOptions);

    return { accessToken, refreshToken };
  } catch (err: any) {
    console.error("[generateTokens] Error:", err.message || err);
    throw err;
  }
};

// ------------------- Проверка refresh токена -------------------
export const verifyRefresh = (token: string): TokenPayload => {
  try {
    if (!JWT_REFRESH_SECRET) throw new Error("JWT refresh secret not defined");

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    return decoded as TokenPayload;
  } catch (err: any) {
    console.error("[verifyRefresh] Invalid token:", err.message || err);
    throw err;
  }
};
