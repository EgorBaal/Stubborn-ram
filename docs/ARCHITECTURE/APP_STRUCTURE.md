# APP_STRUCTURE

Статус: CURRENT (с явно отмеченными legacy-зонами периода миграции)
Последнее обновление: 2026-09-19

## Назначение

Этот документ является канонической картой фактической структуры проекта:

- структура папок frontend/backend;
- практические границы владения кодом;
- допустимые направления зависимостей между слоями.

## Структура Верхнего Уровня (CURRENT)

```text
project/
  backend/
  docs/
  public/
  src/
  supabase/ (legacy)
  package.json
  vite.config.js
```

## Структура Frontend (CURRENT)

```text
src/
  app/
    layouts/
    router/
    splash/
  components/
  contexts/
  loading/
  modules/
  pages/
  services/
  shared/
  assets/
  styles/
```

Ключевые зоны ответственности:

- `src/app/router/`: централизованная композиция маршрутов.
- `src/app/layouts/`: контракты оболочки приложения.
- `src/modules/`: функциональные модули и локальные для модуля components/hooks/services.
- `src/services/` + `src/shared/lib/apiClient.js`: межмодульный слой API/service.

## Структура Backend (CURRENT)

```text
backend/
  migrations/
  modules/
    auth/
    db/
    email/
    leads/
    training/
    media/
    storage/
  server.js
  database.cjs
```

Границы backend-модулей строятся по доменам и ориентированы на API.

## Границы Зависимостей (CURRENT)

Разрешённое основное направление:

```text
UI/module components
  -> module/shared services
  -> apiClient
  -> backend API
  -> backend modules
  -> PostgreSQL/Object Storage
```

Не допускается:

- прямой доступ к DB/storage из frontend;
- критически важный для бизнеса контроль прав только на стороне frontend;
- управление глобальной оболочкой или глобальным router из страниц модулей.

## Legacy/Миграционные Зоны

### `supabase/` (удаление DEFERRED)

- Рассматривается как legacy периода миграции.
- Новый функционал не должен выбирать его как каноническую архитектуру.

### Переходные frontend-зоны (очистка PARTIALLY IMPLEMENTED)

- Часть исторической структуры сохраняется, пока продолжается миграция module/service.
- Очистка/удаление запланированы как контролируемые задачи после проверки зависимостей.

## Сводка Статуса

- Базовая структура и runtime-размещение: CURRENT.
- Полная архитектурная очистка всех legacy-зон: PARTIALLY IMPLEMENTED.
- Финальное удаление чисто миграционных зон: DEFERRED.

## Связанные Канонические Документы

- Runtime-архитектура: `docs/ARCHITECTURE/ARCHITECTURE.md`
- Модель платформы/доменов: `docs/ARCHITECTURE/PLATFORM.md`
- Контракты layout-оболочки: `docs/ARCHITECTURE/LAYOUT.md`
