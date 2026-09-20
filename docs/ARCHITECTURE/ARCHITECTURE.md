# ARCHITECTURE

Статус: CURRENT (с явно отмеченными ограничениями)
Последнее обновление: 2026-09-19

## Назначение

Этот документ является канонической технической архитектурой Stubborn Ram.
Он определяет runtime-слои, границы интеграций и системные контракты между frontend, backend, database и storage.

## Runtime-Цепочка (Каноническая)

```text
User
  -> React App (PWA)
  -> Module/UI layer
  -> Service layer
  -> shared apiClient
  -> Backend API (Fastify)
  -> PostgreSQL + Object Storage
  -> External adapters (email, payments, AI/OCR)
```

## Границы Слоёв

### Frontend (CURRENT)

- React + Vite + React Router.
- UI-модули не получают прямой доступ к PostgreSQL, private Object Storage и секретам провайдеров.
- Полномочия безопасности и бизнес-авторитет находятся на server-side.

### Services + apiClient (CURRENT)

- Frontend services являются единственным контрактом между UI и backend API.
- `apiClient` централизует HTTP-поведение и транспорт ошибок.
- Module UI не должен встраивать логику API-инфраструктуры.

### Backend API (CURRENT)

- Fastify является единой серверной точкой входа.
- Backend обеспечивает authentication, access checks, permissions и бизнес-правила.
- Backend владеет всем доступом к DB/storage и внешними интеграциями.

### Слой Данных (CURRENT)

- PostgreSQL является каноническим источником структурированных данных.
- Object Storage является каноническим источником media/file.
- DB хранит metadata/references для media, файлы остаются в storage.

### Фоновая/Тяжёлая Обработка (PARTIALLY IMPLEMENTED)

- Тяжёлые media-операции спроектированы под worker-style обработку.
- Текущая работа возможна в shared runtime, выделенное worker-масштабирование запланировано.

### Адаптеры Внешних Сервисов (CURRENT / PARTIALLY IMPLEMENTED)

- Email, payments и AI/OCR интегрируются через backend-адаптеры.
- Frontend не получает секреты провайдеров.
- Production-зрелость различается по зонам интеграции и отслеживается на основе verified evidence.

## Интеграционные Контракты

### Media/Storage Integration (CURRENT)

- Upload/download выполняется через backend и signed URLs.
- Политика private bucket access остаётся обязательной.
- Прямой unsigned client access не является допустимым runtime-путём.

### Интеграция Auth Session (CURRENT)

- Session/token lifecycle управляется backend.
- Frontend auth state является UX-зеркалом, а не источником истины для безопасности.

### Интеграция Permissions (PARTIALLY IMPLEMENTED)

- Permissions на уровне действий обеспечиваются на backend-side.
- Часть hardening-задач остаётся deferred (см. system state и security architecture docs).

### Интеграция Training Data (CURRENT CORE PERSISTENCE)

- Core training persistence chain (workouts/exercises/materials) verified для текущего architecture baseline.
- Дальнейшие зоны расширения training остаются module-specific и отслеживаются отдельно от core persistence status.

## Runtime-Контексты

### Local (CURRENT)

```text
Windows dev host
  -> React dev server
  -> Fastify backend
  -> Local PostgreSQL
```

### Production (CURRENT)

```text
stubbornram.ru / api.stubbornram.ru
  -> Nginx (TLS)
  -> Fastify backend
  -> Production PostgreSQL
  -> Private S3-compatible storage
```

## Сводка Архитектурного Статуса

- Core path frontend -> service -> backend -> PostgreSQL: CURRENT.
- Backend -> private Object Storage через signed URL flow: CURRENT.
- Training core persistence chain: CURRENT (VERIFIED baseline).
- Полное worker-разделение для тяжёлого media pipeline: PARTIALLY IMPLEMENTED.
- Расширенный security hardening (selected controls): DEFERRED.

## Связанные Канонические Документы

- Модель платформы: `docs/ARCHITECTURE/PLATFORM.md`
- Структура codebase/app: `docs/ARCHITECTURE/APP_STRUCTURE.md`
- Layout-контракты: `docs/ARCHITECTURE/LAYOUT.md`
- Общесистемный индекс current state: `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`
