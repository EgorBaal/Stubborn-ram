# Структура проекта Stubborn Ram

Версия: 1.3

Последнее обновление: сентябрь 2026

---

# Назначение документа

Этот документ описывает структуру frontend-проекта Stubborn Ram и правила зависимостей между его слоями.

Целевая архитектура backend после миграции:

```text
Frontend
↓
Services / API Client
↓
Backend API
↓
PostgreSQL / Object Storage / Workers
```

Frontend не работает напрямую с PostgreSQL, Object Storage или внешними backend-сервисами.

Supabase является legacy-частью текущего проекта и используется только в рамках миграции. Новая функциональность не должна строиться на Supabase.

---

# Общая структура проекта

```text
Stubborn Ram/
├── database/
├── design/
├── docs/
├── public/
├── src/
├── supabase/              ← LEGACY, только на время миграции
├── backend/               ← целевой backend после создания
├── index.html
├── package.json
├── README.md
├── vite.config.js
└── .gitignore
```

Примечание:

`backend/` может находиться в отдельном репозитории или в отдельной директории проекта в зависимости от принятой реализации. Это не меняет архитектурный принцип: frontend взаимодействует с backend только через API.

---

# Текущее дерево frontend

```text
src/
├── App.jsx
├── app/
├── assets/
├── components/
│   ├── auth/
│   ├── common/
│   ├── landing/
│   ├── questionnaire/
│   └── ui/
├── contexts/
│   └── AuthContext.jsx
├── data/
│   └── supportSlides.js
├── debug/
├── features/
├── hooks/
├── loading/
├── modules/
│   ├── activity/
│   ├── analytics/
│   ├── chat/
│   ├── comments/
│   ├── home/
│   ├── library/
│   ├── nutrition/
│   ├── photos/
│   ├── profile/
│   ├── report/
│   ├── training/
│   └── weight/
├── pages/
│   ├── auth/
│   ├── landing/
│   └── questionnaire/
├── services/
│   ├── auth/
│   └── leads/
├── shared/
│   └── lib/
│       └── apiClient.js
├── styles/
├── utils/
├── index.css
├── main.jsx
└── ...
```

Примечание:

`src/modules/training/services/trainingService.js` пока остаётся модульным сервисом Training.

Часть целевых service-файлов появится в процессе миграции. Их наличие в целевых разделах ниже описывает будущую структуру, а не утверждает, что они уже реализованы.

---

# Состояние структуры

Документ различает три состояния:

## CURRENT

Фактически существующий код на момент начала миграции.

## MIGRATION TARGET

Структура, к которой frontend должен прийти после миграции.

## LEGACY

Временный код, который сохраняется для совместимости во время миграции и должен быть удалён после успешного завершения миграции и rollback-периода.

Новые функции должны разрабатываться согласно MIGRATION TARGET.

---

# src/app

Назначение:

- корневая инфраструктура внутреннего приложения.

Основные части:

- `layouts/` — общая оболочка приложения;
- `router/` — централизованная маршрутизация.

Основные правила:

- `AppLayout` является владельцем общего shell;
- маршрутизация находится в `src/app/router/appRoutes.jsx`;
- модули не создают собственный AppLayout;
- модули не создают собственную BottomTabBar.

---

# src/modules

Назначение:

- основной слой функциональных экранов приложения.

Текущие модули:

- activity
- analytics
- chat
- home
- library
- nutrition
- photos
- profile
- report
- training
- weight

Каждый модуль должен по возможности содержать:

```text
module/
├── Page.jsx
├── Page.css
├── components/
├── hooks/
└── services/
```

Локальные `components`, `hooks` и `services` используются только для логики конкретного модуля.

Модуль не должен изменять общий shell ради локальной задачи.

---

# src/components

Назначение:

- переиспользуемые UI-компоненты и общие интерфейсные блоки.

Общие компоненты могут использоваться несколькими модулями.

Предметная логика конкретного модуля не должна переноситься сюда только ради удобства.

---

# src/features

`src/features` является переходным/legacy-доменным слоем.

Он сохраняется во время миграции существующего проекта, чтобы не создавать отдельную массовую реорганизацию frontend одновременно с backend-миграцией.

Новые крупные пользовательские модули по возможности создаются в `src/modules`.

Удаление или перенос существующих `features` выполняется отдельной задачей и не входит в текущую backend-миграцию.

---

# src/loading

Назначение:

- единая runtime-инфраструктура загрузки уже запущенного приложения.

Содержит:

- LoadingProvider;
- LoadingContext;
- useLoading;
- LoadingOverlay;
- LoadingScreen.

Startup Screen и Loading Overlay являются независимыми подсистемами.

Модули не создают собственные глобальные полноэкранные loader-системы, если подходит общий механизм.

---

# src/pages

`src/pages` является legacy/transition-слоем.

`src/pages/app` содержит старые страницы и placeholder-файлы.

Основная разработка новых внутренних экранов выполняется в `src/modules`.

Существующие legacy-страницы не удаляются во время backend-миграции без отдельной проверки маршрутов и зависимостей.

---

# src/services

Назначение:

- единый frontend-слой для работы с Backend API и внешними интеграциями.

Текущее состояние на 13.09.2026:

- `src/services/auth/authService.js` — текущий frontend auth layer;
- `src/services/leads/leadService.js` — текущий сервис заявок;
- `src/shared/lib/apiClient.js` — текущий общий API client;
- `src/modules/training/services/trainingService.js` — текущий модульный сервис Training.

Целевая структура:

```text
src/services/
├── api/
│   └── apiClient.js
├── auth/
│   └── authService.js
├── chatService.js
├── reportService.js
├── mediaService.js
├── trainingService.js
├── coachClientService.js
└── leadService.js
```

## api

`apiClient` отвечает за базовое взаимодействие frontend с Backend API:

- HTTP-запросы;
- обработку ответов;
- передачу авторизационного состояния;
- единый формат ошибок;
- базовую конфигурацию API.

## authService

Отвечает за frontend-вызовы Authentication API:

- регистрация;
- вход;
- выход;
- проверка сессии;
- подтверждение email;
- восстановление пароля;
- обновление состояния аккаунта.

## chatService

Работает с Backend Chat API.

WebSocket используется для realtime-доставки, но PostgreSQL остаётся источником истины.

## reportService

Работает с Weekly Reports API.

## mediaService

Работает с Media API и подписанными URL.

Frontend не получает прямой доступ к приватному Object Storage.

## trainingService

Работает с Training API.

Training UI использует canonical backend data после реализации persistence.

## coachClientService

Работает с отношениями пользователь–тренер и связанными действиями.

---

# Supabase

`supabase/` и `supabaseService.js` являются LEGACY.

Они:

- не являются целевой backend-архитектурой;
- не должны использоваться для новых функций;
- сохраняются только до завершения миграции;
- удаляются после успешной миграции, проверки данных и окончания rollback-периода.

Прямой доступ React-компонентов к Supabase запрещён.

---

# src/contexts

Назначение:

- глобальное frontend-состояние.

`AuthContext.jsx` может оставаться frontend-контекстом авторизации, но не должен самостоятельно обращаться к базе данных или Supabase.

Целевая цепочка:

```text
AuthContext
↓
authService
↓
apiClient
↓
Backend API
```

---

# src/assets, src/data, src/styles, src/utils

Используются для:

- статических ресурсов;
- локальных данных;
- общих стилей;
- вспомогательных функций.

Они не должны содержать:

- маршрутизацию;
- backend-доступ;
- page-specific бизнес-логику;
- прямой доступ к PostgreSQL;
- прямой доступ к Object Storage.

---

# Маршрутизация

Основной router:

```text
src/app/router/appRoutes.jsx
```

Внутренние маршруты MVP:

```text
/app/home
/app/chat
/app/chat/:chatId
/app/report
/app/report/:reportId
/app/training
/app/training/create
/app/training/new
/app/training/:id
/app/profile
```

Дополнительные модули сохраняются согласно текущему продуктово-техническому roadmap.

Новые маршруты добавляются централизованно.

Модули не содержат независимых глобальных router-конфигураций.

---

# Общий shell приложения

Архитектура:

```text
App
↓
Router
↓
AppLayout
↓
Outlet
↓
Module Page
```

BottomTabBar принадлежит AppLayout/shell.

Правила:

- AppLayout отвечает за общий shell;
- BottomTabBar не рендерится напрямую внутри модулей;
- модуль не изменяет shell ради локальной задачи;
- вертикальная прокрутка остаётся ответственностью соответствующего page/scroll-контекста;
- архитектура Layout и `--app-bottom-offset` не изменяются в рамках backend-миграции.

---

# Архитектурный слой проекта

Целевая схема:

```text
App
↓
Router
↓
AppLayout
↓
Module Page
↓
Local Components / Hooks
↓
Services
↓
Backend API
↓
PostgreSQL / Object Storage / Workers
```

Для realtime:

```text
Chat UI
↓
chatService
↓
Backend API / WebSocket
↓
PostgreSQL
```

Для файлов:

```text
UI
↓
mediaService
↓
Backend API
↓
Private Object Storage
↓
Signed URL
```

Frontend не взаимодействует напрямую с PostgreSQL или приватным Object Storage.

---

# Backend

Backend является отдельным серверным слоем.

Целевая MVP-структура backend концептуально включает:

```text
Backend API
├── Auth
├── Permissions
├── Coach / Client Relationship
├── Chat
├── Reports
├── Media
├── Training
├── Email Service
└── System Operations
        ↓
PostgreSQL
        ↓
Object Storage
        ↓
Workers / FFmpeg
```

На MVP используется один backend application.

Микросервисы, Kubernetes и Redis не вводятся без отдельной архитектурной необходимости.

---

# Данные и внешние системы

## PostgreSQL

Канонический источник структурированных данных.

## Object Storage

Каноническое хранилище пользовательских файлов.

Файлы приватные.

Доступ выдаётся через backend и signed URLs.

## Workers

Используются для фоновых операций, включая обработку видео.

## Email

Frontend не отправляет email напрямую.

Цепочка:

```text
Frontend
↓
Backend
↓
emailService
↓
Unisender Go
```

## AI

AI не является MVP-функцией.

При добавлении AI используется provider adapter, а frontend не зависит от конкретного AI-провайдера.

## Payments

Payments не являются MVP-функцией.

Будущие платёжные интеграции вызываются только через backend service/adapter.

---

# Правила зависимостей

| Слой      | Может зависеть от              | Запрещено                         |
| --------- | ------------------------------ | --------------------------------- |
| Router    | Layout, Pages                  | бизнес-логика модуля              |
| Layout    | Shared UI, Router              | page-specific логика              |
| Page      | Components, Hooks, Services    | другая Page, прямой DB/API client |
| Component | UI, Hooks                      | Page, прямой backend              |
| Hook      | Services                       | Page, прямой DB                   |
| Service   | API client, другие Services    | UI, Page, CSS                     |
| Context   | Services                       | прямой DB/Supabase                |
| Backend   | DB, Storage, Workers, adapters | frontend UI                       |

---

# Основные правила разработки

## 1. Модули

Новые функциональные экраны создаются в `src/modules`.

## 2. Router

Новый маршрут добавляется только через `src/app/router/appRoutes.jsx`.

## 3. Shell

AppLayout и BottomTabBar изменяются только для действительно глобальных задач.

## 4. Services

Взаимодействие с backend выполняется через services.

## 5. Backend API

Frontend не содержит SQL и не подключается напрямую к PostgreSQL.

## 6. Storage

Frontend не использует постоянные публичные ссылки на приватные пользовательские файлы.

## 7. Auth

Frontend работает с Auth API через `authService`.

## 8. Permissions

Критические permissions проверяются backend.

Frontend-проверки являются только UX-слоем.

## 9. Legacy

Legacy-код не используется для создания новых функций, если для задачи существует целевой слой.

## 10. Минимальность изменений

Не следует одновременно менять shell, router, модули и backend, если задача требует изменения только одного слоя.

---

# Алгоритм разработки новой задачи

1. определить модуль;
2. определить страницу;
3. проверить существующие локальные компоненты;
4. определить, нужен ли новый hook;
5. определить, нужен ли service/API-вызов;
6. реализовать локальную UI-часть;
7. подключить service;
8. при необходимости добавить backend endpoint;
9. проверить permissions;
10. проверить loading/error/empty состояния;
11. выполнить build;
12. провести функциональную проверку.

AppLayout меняется только при подтверждённой глобальной необходимости.

Router меняется только при добавлении или изменении маршрута.

---

# Статус основных модулей

| Модуль    | Статус                                      |
| --------- | ------------------------------------------- |
| Home      | реализован                                  |
| Profile   | в разработке                                |
| Training  | UI существует, persistence после data layer |
| Chat      | MVP                                         |
| Report    | MVP                                         |
| Nutrition | после MVP                                   |
| Library   | после MVP                                   |
| Analytics | после MVP                                   |
| Photos    | после MVP                                   |
| Weight    | после MVP                                   |
| Activity  | после MVP                                   |

---

# MVP-фокус

Текущий приоритет разработки:

### P0

- Backend foundation;
- Authentication;
- Coach/Client relationship;
- Chat;
- Reports;
- Media;
- Coach feedback;
- persistent storage.

### P1

- Training persistence.

### После MVP

- Food;
- Activity;
- Weight;
- Photos & Measurements;
- Analytics;
- Notifications;
- Payments;
- AI integrations;
- marketplace и расширенные specialist roles.

---

# Legacy migration

Во время миграции:

```text
Supabase
   ↓
backup
   ↓
Target PostgreSQL / Object Storage
   ↓
Backend API
   ↓
Frontend Services
   ↓
Verification
   ↓
Production switch
   ↓
Rollback window
   ↓
Supabase removal
```

До окончания rollback-периода legacy Supabase не удаляется.

После успешного завершения миграции:

- новые функции используют Backend API;
- Supabase-код удаляется отдельной проверенной задачей;
- документация обновляется;
- выполняется финальный build и функциональная проверка.

---

# Итог

Структура Stubborn Ram строится вокруг модульного frontend, централизованного router и общего AppLayout.

Frontend взаимодействует с данными только через Services и Backend API.

PostgreSQL является каноническим источником структурированных данных.

Object Storage является каноническим хранилищем файлов.

Supabase является временным legacy-слоем миграции и не является частью целевой архитектуры.

Архитектура Layout, BottomTabBar и scroll-контракт не изменяются в рамках backend-миграции.
