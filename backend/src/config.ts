import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const SERVER_PORT = Number(process.env.PORT) || 3000;

export const FRONT_URLS = (
  process.env.FRONT_URLS || "http://localhost:5173,https://chat.wtemu.ru"
)
  .split(",")
  .map((url) => url.trim());

export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
export const ACCESS_EXPIRES = process.env.ACCESS_EXPIRES || "15m";
export const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES || "7d";
