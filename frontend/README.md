
# Frontend sheme


src/
 ├─ pages/
 │   ├─ ChatPage.tsx          # Основной чат
 │   ├─ LoginPage.tsx         # Страница авторизации
 │   ├─ ProfilePage.tsx       # Профиль пользователя
 │   └─ NotFoundPage.tsx      # 404 страница
 ├─ routes/
 │   ├─ AppRouter.tsx         # Главный роутер приложения
 │   └─ RequireAuth.tsx       # HOC / компонент для защиты маршрутов
 └─ app/
     └─ App.tsx               # Основной компонент приложения
















```
src/
├── app/
│   ├── App.tsx              # точка входа
│   ├── orientationGuard     # при горизонтальном повороте на мобилке
│   ├── routes/              # глобальные роуты
│   └── providers/           # провайдеры
│
├── components/  
│
├── constants/           
│   └── gameModes       # константы 
│
├── entities/           # сущности (DDD) 
│   ├── player/         # игрок
│   ├── game/           # базовые типы и сервисы игры
│   └── room/           # базовые типы комнаты, если нужны общие
│
├── games/              
│     ├── checkers/          # шашки
│     │     ├── components/  # Board, Piece, Captures, RoomCard, GameCard
│     │     ├── hooks/       # useCheckers, useRoomsCheckers
│     │     ├── logic/       # moves.ts, rules.ts, ai.ts
│     │     ├── types.ts
│     │     └── index.ts     # экспорт всего
│     │ 
│     └── chess/             # шахматы
│           └── ...       
│
├── hooks/
│   ├── useFullScreen       # хук для полноэкранного режима
│   ├── usePreloadImages    # хук для презагрузки фоновых изображений   
│   └── useSound            # хук для воспроизведения звуков
│
├── pages/              # глобальные страницы приложения
│
├── shared/             # переиспользуемы штучки
│
├── utils/              
│   ├── format          # форматы
│   └── generate        # генерация 
│
├── widgets/            # виджеты
│
├── index.css           # стили
└── main.tsx            # главная точка входа 
```