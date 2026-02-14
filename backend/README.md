
# Chat Backend Server

Сервер чата
Реализован на **Node.js**, **Express** и **Socket.IO**.  

установи типы для JWT если линтер будет ругать !

```
npm install --save-dev @types/jsonwebtoken
```

---

## Структура проекта

```
/server
│
├─ /auth
│   ├─ auth.controller.ts      # REST контроллеры: login, refresh, logout, updateProfile
│   ├─ auth.service.ts         # Сервис: loginService, refreshService, updateProfileService
│   └─ auth.routes.ts          # Express маршруты: /login, /refresh, /logout, /profile
│
├─ /chat
│   ├─ chat.store.ts           # Singleton chatStore, вся логика: users, dialogs, messages, typing
│   └─ server.ts               # Socket.io сервер с JWT auth и событиями
│
├─ /users
│   └─ user.store.ts           # Создание пользователей через REST и обновление профиля
│
├─ config.ts                   # Настройки сервера и JWT secrets
├─ index.ts                    # Точка входа сервера: Express + Socket.io + статика
└─ types.ts                    # Типы: User, Dialog, Message, SocketID, Events


## Детали структуры
### `index.ts` в корне - основной серверный файл:
- Подключает **Express** и **Socket.IO**
- Обрабатывает события сокетов и подключение модулей


config.ts

Порт сервера, URL фронта, JWT секреты, время жизни токенов

Поддержка .env

2️⃣ types.ts

Все типы:
User, UserID, SocketID
Dialog, DialogID
Message, MessageID, FileAttachment
TypingState, Presence
ClientToServerEvents, ServerToClientEvents

3️⃣ /users/user.store.ts

createUser() → создаёт пользователя через REST, без сокета
updateUserProfile() → обновление имени, фамилии, ник, аватар, email
getUserById() → получить пользователя по ID

4️⃣ /auth/auth.service.ts

loginService() → создаёт пользователя + генерирует JWT токены
refreshService() → проверяет refreshToken и выдаёт новые токены
updateProfileService() → обновление профиля пользователя

5️⃣ /auth/auth.controller.ts

REST контроллеры:

loginController → POST /login
refreshController → GET /refresh
logoutController → POST /logout
updateProfileController → PATCH /profile
Работа с cookies: httpOnly, secure (для продакшена)

6️⃣ /auth/auth.routes.ts
Express Router подключает все контроллеры
/login, /refresh, /logout, /profile

7️⃣ /chat/chat.store.ts
Singleton store для пользователей, диалогов, сообщений, typing

Полная логика:

create/update user, disconnect user socket
dialogs: get, create, getUserDialogs
messages: add, delete, mark seen
typing: set, stop, getTypingUsers

8️⃣ /chat/server.ts

Socket.io сервер с JWT middleware: проверка accessToken на подключение

Все события:
get_dialogs, open_dialog, send_message, delete_message
typing_start, typing_stop, message_seen
update_user → обновление профиля через сокет
disconnect → offline notification

9️⃣ index.ts

Express + Socket.io сервер
Middleware: JSON, cookie-parser, CORS
Статика фронтенда
Подключение authRouter и chatServer