import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";

import { FRONT_URLS, SERVER_PORT } from "./config.js";
import { authRouter } from "./auth/auth.routes.js";
import { initChatServer } from "./chat/server.js";

// ---------------------- Настройка сервера ----------------------
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: FRONT_URLS, methods: ["GET", "POST", "DELETE"] },
});

// ---------------------- MIDDLEWARE ----------------------
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONT_URLS,
    credentials: true,
  }),
);

// ---------------------- AUTH ROUTES ----------------------
app.use("/auth", authRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------- Open UPLOADS ----------------------
const uploadsPath = path.join(__dirname, "../../uploads");
const avatarsPath = path.join(uploadsPath, "avatars");

fs.mkdirSync(avatarsPath, { recursive: true });
app.use("/uploads", express.static(uploadsPath));

// ---------------------- Статика фронтенда ----------------------
const frontendPath = path.join(__dirname, "../../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.use((req, res) => {
    const file = path.join(frontendPath, "index.html");
    res.sendFile(file, (err) => {
      if (err) {
        console.error("Failed to send index.html:", err);
        res.status(500).send("Server error");
      }
    });
  });
} else {
  // фронт не собран → dev режим
  console.warn(
    `Frontend dist folder not found at ${frontendPath}. Skipping static serving.`,
  );
}

// ---------------------- Инициализация сервера ----------------------

try {
  initChatServer(io); // модуль 
} catch (err) {
  console.error("Checkers module failed:", err);
}

// ------------------ LISTEN SERVER ------------------
try {
  httpServer.listen(SERVER_PORT, () =>
    console.log(`Server running on http://localhost:${SERVER_PORT}`),
  );
} catch (err) {
  console.error("Server failed:", err);
}
