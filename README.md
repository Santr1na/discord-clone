# Discord Clone

Клон Discord с React фронтендом и NestJS бэкендом, использующий SQLite базу данных.

## Функции

- ✅ Система аутентификации (регистрация/вход)
- ✅ Система друзей (отправка заявок, принятие/отклонение)
- ✅ Личные сообщения между друзьями
- ✅ Создание и управление группами
- ✅ Сообщения в группах
- ✅ WebRTC звонки между друзьями
- ✅ Демонстрация экрана через WebRTC

## Установка

### Установка всех зависимостей

```bash
npm run install:all
```

Или отдельно:

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

## Запуск

### Запуск всего проекта

```bash
npm run dev
```

### Запуск отдельно

```bash
# Backend (порт 3001)
npm run dev:backend

# Frontend (порт 3000)
npm run dev:frontend
```

## Структура проекта

```
discord-clone/
├── backend/          # NestJS бэкенд
│   ├── src/
│   │   ├── auth/     # Аутентификация
│   │   ├── users/    # Пользователи
│   │   ├── friends/  # Система друзей
│   │   ├── messages/ # Сообщения
│   │   ├── groups/   # Группы
│   │   └── webrtc/   # WebRTC gateway
│   └── package.json
├── frontend/         # React фронтенд
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── App.tsx
│   └── package.json
└── package.json
```

## API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход

### Пользователи
- `GET /users/me` - Текущий пользователь
- `GET /users/search?query=...` - Поиск пользователей

### Друзья
- `GET /friends` - Список друзей
- `GET /friends/pending` - Входящие заявки
- `POST /friends/request` - Отправить заявку
- `POST /friends/accept/:friendId` - Принять заявку
- `POST /friends/reject/:friendId` - Отклонить заявку
- `DELETE /friends/:friendId` - Удалить друга

### Сообщения
- `POST /messages` - Отправить сообщение
- `GET /messages/direct/:friendId` - Личные сообщения
- `GET /messages/group/:groupId` - Сообщения группы

### Группы
- `POST /groups` - Создать группу
- `GET /groups` - Список групп пользователя
- `GET /groups/:id` - Информация о группе
- `POST /groups/:id/members` - Добавить участника
- `DELETE /groups/:id/members/:userId` - Удалить участника
- `DELETE /groups/:id` - Удалить группу

## WebSocket

- `/messages` - Namespace для сообщений в реальном времени
- `/` (default) - Namespace для WebRTC сигналинга

## База данных

Используется SQLite. База данных создается автоматически при первом запуске в файле `backend/discord-clone.db`.

## Примечания

- JWT секретный ключ установлен как `your-secret-key-change-in-production` - измените его в production!
- WebRTC использует Google STUN серверы для NAT traversal
- Для production рекомендуется использовать TURN серверы

