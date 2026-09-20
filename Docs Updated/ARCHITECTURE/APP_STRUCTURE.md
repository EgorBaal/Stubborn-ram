# Структура проекта Stubborn Ram

Версия: 2.0  
Статус: CURRENT — фактическая карта codebase с явно отмеченными legacy/transition зонами  
Последнее обновление: 2026-09-20

---

# 1. Назначение документа

Этот документ является канонической картой фактической структуры проекта.

Он отвечает на вопросы:

- где находятся основные части frontend и backend;
- какие зоны являются текущими, legacy или transition;
- какие слои могут зависеть друг от друга;
- где находится текущий API client и service layer;
- где находятся module-specific components, hooks и services.

Документ описывает фактическое состояние codebase. Целевая архитектура не должна выдаваться за CURRENT.

---

# 2. Верхнеуровневая структура проекта

```text
Stubborn Ram/
├── backend/
├── database/
├── design/
├── docs/
├── public/
├── src/
├── supabase/          ← LEGACY / migration residue
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

`supabase/` относится к legacy migration surface и не является целевой архитектурой новых функций.

---

# 3. Фактическая структура Frontend

Подтверждённый базовый tree:

```text
src/
├── app/
│   ├── layouts/
│   ├── router/
│   └── splash/
├── assets/
├── components/
├── contexts/
├── loading/
├── modules/
├── pages/
├── services/
├── shared/
│   └── lib/
│       └── apiClient.js
├── styles/
└── ...
```

Важно: отдельного `src/api/` слоя нет. Общий transport API layer реализован через `src/shared/lib/apiClient.js`.

---

# 4. `src/app`

`src/app` содержит корневую инфраструктуру приложения.

## `src/app/router/`

Отвечает за централизованную routing composition.

Канонический router:

```text
src/app/router/appRoutes.jsx
```

Основной принцип:

```text
Router
→ route/page mapping
```

Модули не создают независимые глобальные routing systems.

## `src/app/layouts/`

Содержит application shell/layout infrastructure.

`AppLayout` является владельцем общего shell.

`BottomTabBar` не должен создаваться повторно внутри module pages.

## `src/app/splash/`

Содержит startup/splash infrastructure.

Текущий audit зафиксировал наличие startup gate infrastructure; отдельный barrel `src/app/splash/index.js` классифицирован как неиспользуемый, тогда как непосредственная реализация startup gate остаётся частью текущего приложения.

---

# 5. `src/modules`

`src/modules` — основной функциональный слой frontend.

Подтверждённые module areas:

```text
src/modules/
├── activity/
├── analytics/
├── chat/
├── comments/
├── home/
├── library/
├── media/
├── nutrition/
├── photos/
├── profile/
├── report/
├── training/
└── weight/
```

Каждый module по возможности владеет:

- своей Page;
- своими components;
- своими hooks;
- своими module-specific services.

Module не должен менять global shell ради локальной задачи.

---

# 6. Статусы module layers

Наличие папки не означает наличие полностью реализованного backend flow.

По текущему verified baseline:

| Module | Фактическая зрелость |
|---|---|
| `home` | shell/navigation, partial |
| `profile` | partial |
| `training` | core persistence verified, domain partial |
| `media` | repository/runtime foundation verified, broader domain partial |
| `report` | placeholder |
| `chat` | placeholder / backend flow absent |
| `comments` | placeholder |
| `nutrition` | placeholder |
| `activity` | PLACEHOLDER / FRONT-ONLY |
| `weight` | PLACEHOLDER / FRONT-ONLY |
| `photos` | partial/product shell |
| `analytics` | placeholder |
| `library` | placeholder/partial |

Подробный runtime status хранится в `SYSTEM_STATE`.

---

# 7. `src/components`

`src/components` содержит переиспользуемые UI components и shared interface blocks.

Допустимо:

- использование несколькими modules;
- общая визуальная/interaction infrastructure;
- shared UI primitives.

Не следует переносить сюда module-specific business logic только ради удобства импорта.

Компонент из `src/components` не должен импортировать Page.

---

# 8. `src/contexts`

Основное глобальное frontend state infrastructure находится здесь.

Подтверждённый ключевой context:

```text
src/contexts/AuthContext.jsx
```

`AuthContext` может отражать session/auth state для UX, но не является security authority.

Каноническая цепочка auth:

```text
AuthContext
  ↓
authService
  ↓
apiClient
  ↓
Backend API
```

Прямой доступ `AuthContext` к DB/Supabase не допускается.

---

# 9. `src/loading`

`src/loading` содержит общую loading infrastructure.

В текущей архитектуре сюда относятся:

- `LoadingProvider`;
- `LoadingContext`;
- `useLoading`;
- `LoadingOverlay`;
- `LoadingScreen`.

Startup Screen и Loading Overlay остаются независимыми подсистемами.

Module не создаёт собственную глобальную fullscreen loader system, если задача решается существующей infrastructure.

---

# 10. `src/pages`

`src/pages` является transition/legacy zone для исторической page structure.

В старой frontend structure находятся:

- auth pages;
- landing pages;
- questionnaire pages;
- legacy app pages/placeholder surfaces.

Новая внутренняя функциональность по возможности развивается в `src/modules`.

Legacy pages нельзя удалять только по названию папки: перед удалением требуется проверить routes и imports.

---

# 11. `src/services`

`src/services` является общим frontend service layer.

Подтверждённые общие сервисы:

```text
src/services/auth/authService.js
src/services/leads/leadService.js
```

Ответственность:

- API calls;
- интеграционные операции;
- изоляция UI от backend implementation.

На текущем codebase часть service boundaries остаётся module-local, и перенос их в `src/services/` не следует считать уже выполненным.

---

# 12. Module-local services

Подтверждённые module-local service locations включают:

```text
src/modules/training/services/trainingService.js
src/modules/training/services/trainingMaterialsService.js
src/modules/media/services/mediaService.js
```

Это CURRENT состояние.

Архитектурное правило для них то же:

```text
Module UI
  ↓
Module Service
  ↓
apiClient
  ↓
Backend API
```

Не нужно автоматически переносить module-local services в global `src/services/` без отдельной структурной задачи.

---

# 13. `src/shared`

`src/shared` содержит cross-module infrastructure, не принадлежащую одному domain.

Ключевая текущая shared infrastructure:

```text
src/shared/lib/apiClient.js
```

`apiClient` является общей точкой transport behavior frontend → backend.

Shared layer не должен превращаться в контейнер для случайной module-specific логики.

---

# 14. `src/assets`, `src/styles` и прочие общие ресурсы

## `src/assets`

Статические frontend resources.

## `src/styles`

Общие style resources.

Module-specific styling по возможности остаётся ближе к module/component, а global styles не используются для компенсации локальной UI-задачи без необходимости.

---

# 15. Backend structure

Подтверждённая структура backend:

```text
backend/
├── migrations/
├── modules/
│   ├── auth/
│   ├── db/
│   ├── email/
│   ├── leads/
│   ├── media/
│   ├── storage/
│   └── training/
├── server.js
└── database.cjs
```

Backend module boundaries строятся по domain/API responsibility.

`backend/server.js` регистрирует основные текущие routes/plugins, включая auth, leads, training, storage и media.

---

# 16. Backend internal boundary

Текущая backend реализация не использует отдельный repository/data-access layer как самостоятельный обязательный уровень.

Фактическая схема во многих flows:

```text
Route Handler
  ↓
Validation / Orchestration
  ↓
SQL / Storage side-effect
```

Для критичных multi-step operations используются transactions, когда это необходимо.

Документ не должен заявлять отдельный repository layer как CURRENT, пока он фактически не введён в codebase.

---

# 17. Главные dependency boundaries

Каноническое основное направление:

```text
Page / Component
  ↓
Hook (при необходимости)
  ↓
Service
  ↓
apiClient
  ↓
Backend API
  ↓
Backend modules
  ↓
PostgreSQL / Object Storage
```

Допустимое media exception:

```text
mediaService
  ↓
signed upload URL
  ↓
PUT напрямую в S3 Object Storage
```

---

# 18. Что запрещено

Не допускается:

- прямой DB access из frontend;
- прямой access к private Object Storage из frontend без signed flow;
- SQL внутри UI components;
- security-critical permissions только на frontend;
- module page, который управляет global Router;
- module page, который изменяет global shell ради локальной задачи;
- самостоятельная global BottomTabBar внутри module;
- создание новой глобальной infrastructure system без необходимости.

---

# 19. Известное текущее отклонение

В `src/modules/report/ReportPlaceholderPage.jsx` подтверждён direct backend `fetch` с hardcoded localhost base.

Это нарушает service/API-client contract.

Статус:

```text
KNOWN BYPASS
DEFERRED
```

Этот pattern нельзя использовать в новой функциональности.

---

# 20. Legacy zones

## `supabase/`

`supabase/` относится к migration legacy.

Правила:

- не выбирать как основу новых функций;
- не расширять без отдельной причины;
- не удалять до отдельной проверки dependencies/rollback requirements.

## Historical frontend structure

Некоторые старые слои могут сохраняться до завершения controlled migration.

Их наличие не делает их target architecture.

---

# 21. Что намеренно НЕ является CURRENT

Следующие элементы не должны возвращаться в текущую карту только потому, что они встречались в старой документации:

- отдельный `src/api/` слой;
- `src/debug/`, если он отсутствует в фактическом tree;
- `src/features/`, если он отсутствует в фактическом tree;
- отдельный top-level `src/hooks/`, если соответствующая функция находится module-local;
- top-level `src/utils/`, если такой слой отсутствует;
- root-level service files для всех domains, если их фактически нет;
- полноценный Chat/Reports/Payments runtime только потому, что эти domains описаны архитектурно.

Это правило предотвращает повторное появление drift из старой documentation.

---

# 22. Layout boundary

Application shell строится концептуально так:

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

`BottomTabBar` находится в shell.

Layout-specific ownership подробно описан в `LAYOUT.md`.

---

# 23. Rule для новой функции

Перед добавлением новой функциональности:

1. определить module/domain;
2. проверить существующую Page/Component;
3. проверить существующий module/shared service;
4. проверить `apiClient`;
5. только после этого добавлять новый слой;
6. при необходимости добавить backend endpoint;
7. проверить ownership/permissions;
8. проверить loading/error/empty behavior;
9. выполнить build и функциональную проверку.

Не следует одновременно менять Router, global Layout и несколько modules, если задача локальная.

---

# 24. Source of Truth

| Область | Канонический документ |
|---|---|
| Codebase structure | `APP_STRUCTURE.md` |
| Runtime architecture | `ARCHITECTURE.md` |
| Platform model | `PLATFORM.md` |
| Layout contracts | `LAYOUT.md` |
| Current verified state | `../SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` |
| Development rules | `../PROCESS/CODING_RULES.md` |
| Security rules | `../SYSTEMS/SECURITY.md` |

---

# 25. Принцип актуальности

При конфликте между старым документом, текущим кодом и target architecture используется следующая иерархия:

```text
Verified current runtime evidence
        ↓
SYSTEM_STATE / current audit evidence
        ↓
Current canonical architecture docs
        ↓
Legacy / archive documentation
        ↓
Target ideas without implementation evidence
```

Старый документ не становится источником CURRENT только потому, что он более подробный.

---

# 26. Заключение

CURRENT структура Stubborn Ram разделяет:

```text
app infrastructure
        ↓
modules / pages
        ↓
services + apiClient
        ↓
backend modules
        ↓
data / storage
```

Legacy-зоны допускаются только как контролируемый переходный слой. Новая разработка должна следовать текущим dependency boundaries и не возвращать удалённые или неподтверждённые структурные элементы из старой documentation.
