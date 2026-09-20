# PROJECT FULL AUDIT — 2026-09-19

## ТОЛЬКО ЭТАП 1: АРХИТЕКТУРА + ИНФРАСТРУКТУРА

Рамки, действующие в этом обновлении:

- Без изменений кода/config/db/deploy.
- Только аудит на основе доказательств.
- Только словарь статусов: ПРОВЕРЕНО / ПРОВЕРЕНО ЧАСТИЧНО / НЕ ПРОВЕРЕНО / РАСХОЖДЕНИЕ.

Использованные источники доказательств:

- Код/config/migrations в репозитории.
- Публичные runtime-проверки (DNS/HTTPS headers/API responses).
- Read-only SSH/runtime inspection на production host.
- Read-only introspection production-схемы PostgreSQL через server env.

---

## ФУНДАМЕНТАЛЬНОЕ РЕШЕНИЕ: LOCAL VS PRODUCTION

Принятое архитектурное решение для текущего Foundation Remediation:

1. Localhost и Production должны быть функционально одинаковыми системами по итогам деплоя.
2. Localhost используется для разработки и проверки новых изменений до переноса в Production.
3. Localhost может временно опережать Production во время разработки.
4. После успешного переноса Production должен содержать тот же набор рабочих возможностей и архитектурных компонентов.
5. При этом Local и Production обязаны быть разделены по данным и инфраструктуре:
   - разные БД;
   - разные media/file storage;
   - разные секреты и env-переменные;
   - разные адреса/домены;
   - тестовые данные в Local и реальные данные в Production.

Статус решения: ПРОВЕРЕНО (как принятое управленческое правило этапа).

---

## MINI-CHECK DG-1/F1-ENV-01: ПРОИСХОЖДЕНИЕ РАСХОЖДЕНИЯ LOCAL/PRODUCTION (READ-ONLY)

ФАКТ (LOCAL):

- Локальный backend source включает `mediaRoutes` и `storagePlugin`.
- Локальный `backend/server.js` регистрирует `auth/leads/training/storage/media`.
- Локальный backend hash файла `server.js` отличается от production runtime hash.

ДОКАЗАТЕЛЬСТВА:

- local HEAD: `9fdc243d430cbfee5964871395fdc5740cdd15e4`.
- `backend/server.js` (local): присутствуют `await app.register(storagePlugin);` и `await app.register(mediaRoutes);`.
- local modules dir содержит `media` и `storage`.
- local route probe: `POST /api/media/upload` -> `401` (route существует, требует auth).

СТАТУС: ПРОВЕРЕНО

ФАКТ (PRODUCTION):

- Реально запущенный backend process: PM2 `stubbornram-backend`, script path `/opt/stubbornram/backend/server/server.js`, cwd `/opt/stubbornram/backend/server`.
- Production `server.js` не содержит регистрации `storagePlugin` и `mediaRoutes`.
- Production modules dir содержит только `auth/db/email/leads/training` (без `media` и `storage`).
- Production runtime path не содержит `.git` metadata.

ДОКАЗАТЕЛЬСТВА:

- `pm2 show stubbornram-backend`: online, script path/cwd подтверждены.
- grep по `/opt/stubbornram/backend/server/server.js`: только `authRoutes/leadsRoutes/trainingRoutes`.
- `ls /opt/stubbornram/backend/server/modules`: нет `media`, нет `storage`.
- `sha256sum /opt/stubbornram/backend/server/server.js` != local `sha256sum backend/server.js`.
- API probe: `POST https://api.stubbornram.ru/api/media/upload` -> `404`.

СТАТУС: ПРОВЕРЕНО

ФАКТ (ПРИЧИНА РАСХОЖДЕНИЯ):

- Подтверждена причина уровня runtime-артефакта:
  Production запущен из backend-артефакта, который не содержит media/storage слой, присутствующий в текущем local/repository состоянии.

Что именно подтверждено:

- ПРОВЕРЕНО: используется другой фактический `server.js`/module-set относительно локального состояния.
- ПРОВЕРЕНО: production backend composition функционально урезан до `auth+leads+training`.
- НЕ ПОДТВЕРЖДЕНО: точный механизм происхождения drift (пропущенный деплой / деплой из другой ветки / ручная сборка).
- НЕВОЗМОЖНО ПРОВЕРИТЬ в текущем режиме: commit provenance production runtime по git (в runtime path отсутствует `.git`).

Итог mini-check:

- Причина расхождения LOCAL/PRODUCTION на уровне текущего факта: подтверждена (runtime artifact drift).
- Глубинная provenance-причина drift: недостаточно доказательств.

---

## DG-1 SAFE ALIGNMENT STUDY (READ-ONLY): КАК БЕЗОПАСНО ВЫРОВНЯТЬ PRODUCTION С LOCAL BACKEND

Рамки этого блока:

- Только исследование и план.
- Без deployment/копирования/рестартов/migrations.
- Только подтверждённые факты + явно помеченные ограничения.

### 1) Текущая operational-модель deployment (что реально подтверждено)

ПОДТВЕРЖДЕНО:

1. Production backend runtime path: `/opt/stubbornram/backend/server`.
2. Production process: PM2 `stubbornram-backend`, script `server.js`, cwd `/opt/stubbornram/backend/server`.
3. Nginx проксирует API на `127.0.0.1:3000`.
4. В репозитории нет backend CI/CD workflow, deploy-script, PM2 ecosystem-файла.
5. Единственный workflow в `.github/workflows/deploy.yml` относится к frontend GitHub Pages, не к backend.
6. `backend/package.json`:

- `start` = `node server.js`
- `migrate` = `node-pg-migrate -f database.cjs`
- автоматического запуска migrations в `start` нет.

НЕ ПОДТВЕРЖДЕНО:

1. Точный historical процесс, которым ранее обновляли backend runtime artifact в production.
2. Наличие отдельного внешнего (вне repo) deploy-скрипта на сервере.

### 2) Что именно является кодом и что является production-данными

ПОДТВЕРЖДЕНО (данные, которые не должны затрагиваться backend deployment):

1. PostgreSQL data (production DB) находится отдельно от backend source-кода.
2. Object Storage (Selectel S3 bucket) является отдельным data-plane от backend-каталога.
3. Secrets/env (`.env` в runtime path) являются конфигурацией production и не должны заменяться локальными значениями.

ПОДТВЕРЖДЕНО (код/runtime-артефакт):

1. `server.js`, `modules/*`, `migrations/*`, `package.json`, `package-lock.json`, `database.cjs`.
2. DG-1 drift относится именно к runtime artifact composition (absence of `media`/`storage` layers в active production artifact).

### 3) DB/migrations при backend deployment

ПОДТВЕРЖДЕНО:

1. Обычный запуск backend (`npm start`) не запускает миграции автоматически.
2. Миграции запускаются отдельной командой `npm run migrate`.
3. В production уже подтверждены `5919/5920/5921`, а `5918` отсутствует (controlled divergence).

ВЫВОД:

1. Выравнивание backend-кода технически можно выполнить БЕЗ изменения DB, если не запускать migrate-команды.
2. Любые migration-действия должны оставаться отдельным change-step, не смешанным с копированием backend-кода.

ТРЕБУЕТ РЕШЕНИЯ:

1. Подтверждение владельца: deployment DG-1 выполняется в режиме `NO MIGRATIONS`.
2. Отдельная policy на случай future schema changes (вне текущего DG-1).

### 4) Media/storage безопасность данных

ПОДТВЕРЖДЕНО:

1. Отсутствие media/storage в production связано с runtime backend composition mismatch.
2. Media-файлы физически не находятся в backend source-каталоге; они находятся в Object Storage.
3. Простое обновление backend source-файлов само по себе не должно удалять объекты из bucket.

НЕ ПОДТВЕРЖДЕНО:

1. Полная control-plane конфигурация production bucket (policy/ACL/lifecycle/versioning/encryption/CORS) в этом проходе.

РИСК:

1. При ошибочной замене `.env` или неправильных `S3_*` production media flow может перейти в нерабочее состояние.

### 5) Реально применимые варианты backend deployment (DG-1)

#### Вариант A — In-place runtime artifact update в `/opt/stubbornram/backend/server` (рекомендуемый)

Суть:

1. Обновляется только backend code/runtime artifact в текущем runtime path.
2. PM2 process перезапускается после обновления зависимостей.

Что изменяется:

1. `server.js`, `modules/*`, `migrations/*`, `package*.json`, сопутствующие backend source файлы.

Что НЕ изменяется:

1. Production DB data.
2. Object Storage objects.
3. Nginx конфиг.
4. PM2 process name/topology.

DB/media/secrets/migrations:

1. DB: не изменяется при `NO MIGRATIONS` discipline.
2. Media objects: не перезаписываются backend deployment-ом.
3. `.env`/secrets: должны быть сохранены как production-only и не заменены локальным `.env`.
4. Migrations: не требуются для текущего DG-1, если команды migrate не запускаются.

Restart/reload:

1. PM2 restart/reload: нужен.
2. Nginx reload: не нужен, если upstream path/port не меняется.

Rollback:

1. Возврат предыдущего backend artifact (из backup каталога/архива) + PM2 restart.

Риски:

1. Случайная перезапись production `.env`.
2. Случайный запуск `npm run migrate`.
3. Запуск без корректных production dependencies.

Статус применимости:

1. ПОДТВЕРЖДЕНО как наиболее совместимый с текущей архитектурой путь.

#### Вариант B — Git pull в production runtime path

Суть:

1. Обновление backend через git-операции прямо в runtime path.

Статус фактической применимости:

1. НЕ ПОДТВЕРЖДЕНО для текущего runtime path:

- в `/opt/stubbornram/backend/server` отсутствует `.git` metadata.

Ограничения:

1. Без восстановления git-репозитория в runtime path этот способ операционно недоступен.

Вывод:

1. Теоретически возможен как подход, но не подтверждён как доступный прямо сейчас.

#### Вариант C — Новый параллельный runtime path (blue/green-like)

Суть:

1. Разворачивается второй backend artifact в отдельный каталог и затем переключается PM2 script/cwd.

Статус:

1. НЕ ПОДТВЕРЖДЕНО как уже предусмотренный в проекте механизм.
2. В текущем evidence нет готовой инфраструктуры такого переключения.

Вывод:

1. Для текущего DG-1 рассматривать как теоретический вариант, требующий отдельного решения и подготовки.

### 6) Техническая рекомендация по DG-1

РЕКОМЕНДАЦИЯ:

1. Предпочтительный путь: Вариант A (in-place runtime artifact update + controlled PM2 restart).

Почему:

1. Он полностью соответствует текущей подтверждённой runtime-архитектуре (PM2 + fixed path + Nginx proxy).
2. Не требует изменения topology (Nginx/PM2 path/db host).
3. Позволяет выполнить выравнивание функционального состава backend с минимальным blast radius.

### 7) Безопасная последовательность (PRE-CHECK -> BACKUP -> DEPLOY -> RESTART -> VERIFY -> ROLLBACK)

#### PRE-CHECK

1. Зафиксировать текущий production runtime fingerprint:

- hash `server.js`;
- список `modules/`;
- `pm2 show stubbornram-backend`.

2. Проверить, что deployment scope = backend code only.
3. Явно зафиксировать rule: `NO MIGRATIONS` в этом deployment.
4. Проверить, что production `.env` остаётся на месте и не заменяется.

#### BACKUP

1. Снять backup текущего backend runtime каталога (как rollback-артефакт).
2. Снять backup production DB перед deployment.
3. Снять backup/экспорт metadata по критичным media таблицам (`media`, `media_links`) при необходимости операционной диагностики.
4. Зафиксировать точку отката (timestamp + file hash manifest).

#### DEPLOY

1. Обновить только backend code artifact.
2. Не копировать local `.env` в production.
3. Не выполнять `npm run migrate`.
4. Установить/обновить зависимости только в backend runtime контуре.

#### RESTART

1. Выполнить PM2 restart/reload процесса backend.
2. Nginx не трогать (если proxy topology неизменна).

#### VERIFY

1. `GET /health` = 200.
2. `GET /api/auth/session` (unauth) = 401 expected.
3. `GET /api/training/workouts` (unauth) = 401 expected.
4. `POST /api/media/upload`:

- больше не 404 route-not-found;
- ожидаемая auth/validation семантика.

5. Проверить, что existing training/auth функциональность не деградировала.
6. Проверить, что DB не изменилась миграциями (проверка `pgmigrations` unchanged в рамках шага).

#### ROLLBACK IF NEEDED

1. Вернуть backup backend artifact в runtime path.
2. PM2 restart процесса.
3. Подтвердить возврат baseline probes (`/health`, `/api/auth/session`, `/api/training/workouts`, route behavior).
4. DB rollback не требуется, если миграции не запускались.

### 8) Что требует решения владельца (перед фактическим deployment)

ТРЕБУЕТ РЕШЕНИЯ:

1. Подтверждение deployment policy: `code-only`, `NO MIGRATIONS`, `NO .env overwrite`.
2. Утверждение backup depth:

- backend artifact backup format;
- обязательный DB backup перед rollout.

3. Утверждение rollback SLA и максимального downtime окна для PM2 restart.
4. Проверка production S3 configuration readiness после включения media runtime (чтобы route не был 404, но и flow не падал из-за env/credentials).

Итог блока:

1. Безопасный путь выравнивания DG-1 определён.
2. Production в этом проходе не изменялся.
3. Решение о фактическом rollout остаётся за владельцем.

### 9) Практический состав безопасного deployment-пакета (DG-1)

Цель:

1. Выровнять backend runtime composition production до локального состояния с `media/storage`.
2. Не затронуть production-данные и production secrets.

ПОДТВЕРЖДЕНО: ЧТО КОПИРУЕМ (backend code-only пакет)

Минимально необходимое:

1. `backend/server.js`
2. `backend/modules/auth/`
3. `backend/modules/db/`
4. `backend/modules/email/`
5. `backend/modules/leads/`
6. `backend/modules/training/`
7. `backend/modules/media/`
8. `backend/modules/storage/`
9. `backend/package.json`
10. `backend/package-lock.json`

Разрешённо, но опционально для текущего code-only выравнивания:

1. `backend/database.cjs`
2. `backend/migrations/` (как часть parity-артефакта, без запуска migrate)

ПОДТВЕРЖДЕНО: ЧТО НЕ КОПИРУЕМ

Нельзя переносить из localhost в production:

1. `backend/.env`
2. Любые локальные `.env*` кроме шаблонов документации
3. `backend/node_modules/` (пересобирается в production)
4. Любые локальные SQL dumps/локальные данные
5. Любые локальные PostgreSQL data files/кластеры
6. Любые локальные media/files вне backend source
7. Любые временные/диагностические локальные артефакты, не относящиеся к runtime-коду

ПОДТВЕРЖДЕНО: DEPENDENCIES ПОСЛЕ COPY

1. После копирования backend-кода зависимости должны быть переустановлены в production runtime path `/opt/stubbornram/backend/server`.
2. Предпочтительно: `npm ci` (детерминированно по `package-lock.json`).
3. `npm install` только как fallback при невозможности `npm ci`.

ПОДТВЕРЖДЕНО: MIGRATIONS ДЛЯ ТЕКУЩЕГО DG-1

1. Для текущего выравнивания требуется `CODE-ONLY DEPLOYMENT`.
2. Migrations не запускать.
3. Команда `npm start` migrations не запускает; `npm run migrate` выполняется только вручную и в этот шаг не входит.

Минимальный BACKUP перед deployment:

1. Backup текущего production backend runtime каталога `/opt/stubbornram/backend/server` как rollback-артефакт.
2. Production DB dump (`pg_dump`) перед deployment.
3. Отдельный full backup Object Storage для этого code-only шага не обязателен, но требуется pre-check доступности и неизменности production `S3_*` env.

Где безопасно хранить backup:

1. На сервере в отдельном backup-каталоге с ограниченными правами доступа.
2. Предпочтительно дополнительно на внешнем защищённом хранилище (вне runtime path), чтобы rollback не зависел от одного диска.

Rollback (практически):

1. Вернуть сохранённый backend runtime backup в `/opt/stubbornram/backend/server`.
2. Выполнить PM2 restart процесса.
3. Проверить baseline probes (`/health`, `/api/auth/session`, `/api/training/workouts`, поведение `/api/media/upload`).
4. DB rollback не требуется, если migration-команды не запускались.

Итог practical package:

1. Deployment-пакет определён как backend code-only с обязательным исключением `.env` и любых локальных данных.
2. Production data-plane (PostgreSQL + Object Storage) остаётся неизменным в рамках этого шага.
3. Решение о запуске фактического rollout остаётся за владельцем.

### 10) DG-1 CONTROLLED DEPLOY EXECUTION (APPROVED)

BEFORE:

1. Production runtime composition: `auth/db/email/leads/training`.
2. `media/storage` отсутствовали в активном runtime.
3. `/api/media/upload` в production ранее возвращал `404`.

ACTION:

1. Выполнен минимальный rollback-backup текущего runtime:

- `/opt/stubbornram/backend/backups/server-20260919-124350`.

2. Перенесён code-only backend package (без `.env`, без локальных данных, без local media).
3. Установлены production dependencies (`npm ci`) по результату pre-check необходимости.
4. Миграции НЕ запускались (`npm run migrate` не выполнялся).
5. Выполнен только `pm2 restart stubbornram-backend`.
6. Nginx не изменялся.

AFTER:

1. Runtime modules: `auth db email leads media storage training`.
2. В production `server.js` присутствуют регистрации `storagePlugin` и `mediaRoutes`.
3. Production `.env` hash не изменился:

- `c66cd61d0adfd181a74da724e9400032d9a4cb0582d3b12d178c0a50c0f82717`.

VERIFICATION:

1. `GET https://api.stubbornram.ru/health` -> `200`.
2. `GET https://api.stubbornram.ru/api/auth/session` (unauth) -> `401`.
3. `GET https://api.stubbornram.ru/api/training/workouts` (unauth) -> `401`.
4. `POST https://api.stubbornram.ru/api/media/upload` (unauth, valid JSON) -> `401`.
5. PM2 process `stubbornram-backend` -> `online`.

Статус: 1. PASS. 2. DG-1 backend runtime alignment выполнен: production backend composition приведён к localhost composition в рамках текущего scope. 3. DB/schema changes: отсутствуют.

### 11) FINAL CLOSURE — DG-1 / F1-ENV-01

BEFORE:

1. Production runtime drift: отсутствовали `media/storage` модули в активном backend runtime.
2. `POST /api/media/upload` возвращал `404` (route отсутствовал в production runtime).
3. F1-ENV-01 имел блокирующий статус по линии DG-1.

PROBLEM:

1. Нарушен принцип функционального паритета Localhost/Production для backend runtime composition.

ACTION:

1. Выполнен controlled code-only deployment backend runtime по утверждённому DG-1 package spec.
2. Выполнен минимальный rollback backup runtime.
3. Выполнен restart только backend процесса через PM2.
4. Миграции не запускались.

AFTER:

1. Production runtime содержит `auth/db/email/leads/media/storage/training`.
2. `server.js` в production runtime регистрирует `storagePlugin` и `mediaRoutes`.
3. Route `/api/media/upload` существует и защищён.

VERIFICATION:

1. `/health` -> `200`.
2. `/api/auth/session` (unauth) -> `401`.
3. `/api/training/workouts` (unauth) -> `401`.
4. `/api/media/upload` (unauth, valid JSON) -> `401`.
5. PM2 `stubbornram-backend` -> `online`.
6. Production `.env` hash не изменён.

Статус: 1. DG-1: `FIXED — VERIFIED`. 2. F1-ENV-01: `FIXED — VERIFIED`. 3. Production data/DB/.env при deployment не изменялись.

---

## 1) АРХИТЕКТУРА FRONTEND (ФАКТИЧЕСКОЕ СОСТОЯНИЕ)

### 1.1 Структура и связность

ФАКТ:

- Entry points и React root реализованы через Vite + React.

ДОКАЗАТЕЛЬСТВА:

- `src/main.jsx`: `createRoot(...).render(...)`, `AuthProvider`, `LoadingProvider`.
- `src/App.jsx`: `RouterProvider`, `StartupScreenGate`, `LoadingOverlay`.
- `src/app/router/router.jsx`: объединяет `landingRoutes`, `authRoutes`, `questionnaireRoutes`, `appRoutes`.
- `src/app/layouts/AppLayout.jsx`: layout shell + `Outlet` + `BottomTabBar`.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Состояние auth/session централизовано в context и восстанавливается через backend session endpoint.

ДОКАЗАТЕЛЬСТВА:

- `src/contexts/AuthContext.jsx`: `refreshSession()` -> `getSession()`.
- `src/services/auth/authService.js`: `request("/auth/session")`.
- `src/app/router/guards/AuthGuard.jsx`: route gating по `session` + `loading`.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Глобальная инфраструктура loading существует, но feature-модули также используют локальные loading-состояния.

ДОКАЗАТЕЛЬСТВА:

- Глобально: `src/loading/LoadingProvider.jsx`, `src/loading/LoadingOverlay.jsx`.
- Локально по features: например `isLoading` в training/history, `isUploading*` в media/report flows.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

ФАКТ:

- Использование browser storage обнаружено только для сохранения черновика questionnaire.

ДОКАЗАТЕЛЬСТВА:

- `src/components/questionnaire/Questionnaire.jsx`: `localStorage.getItem/setItem/removeItem("sr-questionnaire")`.
- Использование `sessionStorage` в frontend-поиске не найдено.

СТАТУС: ПРОВЕРЕНО

### 1.2 Инвентаризация HTTP-механизмов (frontend)

ФАКТ:

- Основная архитектурная цепочка присутствует: `Component -> Service -> apiClient -> fetch`.

ДОКАЗАТЕЛЬСТВА:

- `src/shared/lib/apiClient.js`: `request(path, options)` с `fetch`, `credentials: "include"`, JSON/error wrapper.
- Используется в services:
  - `src/services/auth/authService.js`
  - `src/services/leads/leadService.js`
  - `src/modules/training/services/trainingService.js`
  - `src/modules/training/services/trainingMaterialsService.js`
  - `src/modules/media/services/mediaService.js`

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Архитектурные обходы присутствуют (прямой fetch вне цепочки apiClient).

ДОКАЗАТЕЛЬСТВА:

- `src/modules/report/ReportPlaceholderPage.jsx`:
  - hardcoded `const API_BASE_URL = "http://127.0.0.1:3000/api"`
  - прямые `fetch` на `/media/upload`, `/media/:id/complete`, `/media/:id`, delete.
- `src/modules/media/services/mediaService.js`:
  - прямой `fetch(uploadUrl, { method: "PUT" })` для signed S3 URL upload.
  - Этот конкретный прямой fetch ожидаем для presigned object upload и не направлен в backend API.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

### 1.3 Использование environment-based API URL

ФАКТ:

- Базовый URL API во frontend управляется через env в shared API client.

ДОКАЗАТЕЛЬСТВА:

- `src/shared/lib/apiClient.js`: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL`.
- `.env.development`: `VITE_API_BASE_URL=http://127.0.0.1:3000/api`
- `.env.production`: `VITE_API_BASE_URL=https://api.stubbornram.ru/api`
- `ReportPlaceholderPage.jsx` обходит env и использует hardcoded local URL.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

---

## 2) АРХИТЕКТУРА BACKEND (ФАКТИЧЕСКОЕ СОСТОЯНИЕ)

### 2.1 Entry/configuration/middleware

ФАКТ:

- Backend runtime представляет собой Fastify app с cookie/cors/rate-limit и регистрацией модулей.

ДОКАЗАТЕЛЬСТВА:

- `backend/server.js`:
  - регистрирует `@fastify/cookie`, `@fastify/cors`, `@fastify/rate-limit`
  - декорирует DB pool (`app.decorate("pg", pool)`)
  - регистрирует route-модули: auth, leads, training, storage plugin, media
  - bind: `127.0.0.1:3000`
- `backend/modules/db/database.js`: PG pool из env.

СТАТУС: ПРОВЕРЕНО

### 2.2 Группы routes и реальные execution chains

ФАКТ:

- Auth routes реализуют validation, session cookie flow, token workflows и DB transactions.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/auth/auth.routes.js`
- `backend/modules/auth/auth.schemas.js` (Zod)
- `backend/modules/auth/auth.session.js` (cookie/session)
- `backend/modules/auth/auth.tokens.js`

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Training routes реализуют auth check, workouts CRUD, exercises list, set materials read/write.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/training/training.routes.js`
- Цепочка в handlers: params/body checks -> auth (`getAuthenticatedUser`) -> SQL/transaction -> response.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Media routes реализуют auth, persistence object metadata, signed upload/download flow, object validation, deletion.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/media/media.routes.js`
- `backend/modules/storage/storage.service.js` + `storage.plugin.js`

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Leads route реализует Zod validation, DB insert, transactional email send attempt.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/leads/leads.routes.js`
- `backend/modules/leads/leads.schemas.js`
- `backend/modules/email/email.service.js`

СТАТУС: ПРОВЕРЕНО

### 2.3 Паттерны validation и error handling

ФАКТ:

- Стратегия validation смешанная: Zod в auth/leads; ручные проверки в training/media.

ДОКАЗАТЕЛЬСТВА:

- Zod: `auth.schemas.js`, `leads.schemas.js`.
- Ручные условные проверки: `training.routes.js`, `media.routes.js`.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

---

## 3) API-АРХИТЕКТУРА / СООТВЕТСТВИЕ КОНТРАКТОВ

### 3.1 Endpoint-ы, вызываемые frontend, и их наличие на backend

ФАКТ:

- Backend endpoint-ы, вызываемые frontend из services/components, присутствуют.

ДОКАЗАТЕЛЬСТВА (паритет frontend -> backend):

- `/api/auth/*`: register/login/session/logout/resend-verification/verify-email/reset-password/\*
- `/api/leads`
- `/api/training/exercises`
- `/api/training/workouts` (+ `/:id`)
- `/api/training/sets/:setId/materials` (GET)
- `/api/media/upload`, `/api/media/:id/complete`, `/api/media/:id` (GET/DELETE)

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Endpoint на backend существует, но не используется frontend write path для set materials.

ДОКАЗАТЕЛЬСТВА:

- Backend содержит `PUT /api/training/sets/:setId/materials` в `training.routes.js`.
- Frontend materials service содержит только `getSetMaterials()` (`GET`), без write call.
- `TrainingExerciseCard.jsx` содержит локальное UI-состояние редактирования, но без API persist call для materials.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

ФАКТ:

- Обработка query/path/body/status реализована, но глубина обработки на стороне клиента непоследовательна.

ДОКАЗАТЕЛЬСТВА:

- Используются path params: `/workouts/:id`, `/media/:id`, `/sets/:setId/materials`.
- Request body используется в create/update endpoint-ах (auth/training/leads/media upload init).
- Backend возвращает 400/401/403/404/409/503 и успешные 200/201.
- Явная обработка status на frontend выборочная (например отдельные ветки 401/404), многие коды обрабатываются общим сообщением.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

ФАКТ:

- Auth transport cookie-based, а не token header-based.

ДОКАЗАТЕЛЬСТВА:

- Frontend `apiClient` выставляет `credentials: "include"`.
- Backend session cookie устанавливается в `auth.session.js`.

СТАТУС: ПРОВЕРЕНО

---

## 4) СКВОЗНЫЕ ПОТОКИ ДАННЫХ (ОБЯЗАТЕЛЬНЫЙ НАБОР)

### Поток A: Login

UI -> Component -> Service -> API Client -> HTTP -> Backend -> DB -> Response -> Frontend state -> UI

- UI/Component: `src/components/auth/AuthModal.jsx` -> `handleSignIn()`
- Service: `signIn(email, password)` в `src/services/auth/authService.js`
- API client: `request("/auth/login", POST)` в `src/shared/lib/apiClient.js`
- Backend route: `POST /api/auth/login` в `backend/modules/auth/auth.routes.js`
- Auth/session: verify пароля + `createUserSession()`; cookie `stubbornram_session`
- DB: `users`, `sessions`
- Frontend state: `refreshSession()` в `AuthContext`, затем `navigate("/app/home")`

СТАТУС: ПРОВЕРЕНО

### Поток B: Получение данных dashboard

- UI: `src/modules/home/HomePage.jsx`
- Используется только объект пользователя `useAuth()` из session context.
- Dashboard-specific API/service request в home module не найден.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

Точка обрыва:

- Ожидаемая цепочка "dashboard data fetch" поверх session отсутствует в текущем frontend-коде.

### Поток C: Получение истории тренировок

- UI: mount effect в `TrainingHistoryPage`
- Service: `getCompletedWorkouts()`
- API client: `request("/training/workouts")`
- Backend route: `GET /api/training/workouts`
- Authorization: `getAuthenticatedUser()`
- DB: `workouts`
- Response mapping в UI cards/list

СТАТУС: ПРОВЕРЕНО

### Поток D: Создание/сохранение тренировки

- UI: `TrainingPage` -> `handleFinishWorkout()`
- Service: `saveCompletedWorkout()` или `updateWorkout()`
- API client: POST/PUT `/training/workouts` или `/training/workouts/:id`
- Backend routes: `POST/PUT /api/training/workouts...`
- Authorization: `getAuthenticatedUser()`
- Business logic: transactional insert/update со вложенными exercises/sets
- DB: `workouts`, `workout_exercises`, `workout_sets`
- Response: возвращается id -> navigate в history

СТАТУС: ПРОВЕРЕНО

### Поток E: Получение упражнений

- UI: mount effect в `ExerciseList`
- Service: `getExercises()`
- API client: `request("/training/exercises")`
- Backend route: `GET /api/training/exercises`
- DB: `exercises`, фильтрация `user_id IS NULL`
- Response: массив -> filtered/search UI rendering

СТАТУС: ПРОВЕРЕНО

### Поток F: Действие, связанное с media

Найдены две реальные цепочки:

1. Feature flow через service:

- UI: `src/modules/media/components/PhotoUploader.jsx`
- Service: `uploadMediaFile()` -> `createMediaUpload()` -> direct signed PUT -> `completeMediaUpload()` -> `getMedia()`
- Backend routes: `/api/media/upload`, `/api/media/:id/complete`, `/api/media/:id`
- Storage: signed S3 URL upload
- DB: `media`, опционально `media_links` при связке с сущностями

СТАТУС: ПРОВЕРЕНО

2. Прямая bypass-цепочка:

- UI+network в `src/modules/report/ReportPlaceholderPage.jsx`
- Direct fetch + hardcoded local API base

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

---

## 5) АРХИТЕКТУРА БАЗЫ ДАННЫХ

### 5.1 Локальная схема, определённая migrations

ФАКТ:

- Базовая схема определена через node-pg-migrate файлы `1788859125911`..`1788859125921`.

ДОКАЗАТЕЛЬСТВА:

- Таблицы/ограничения auth/session/user/profile.
- Таблица leads + indexes.
- Таблицы training + indexes.
- Media/media_links + status check.
- Training set notes + type check + unique `(workout_set_id, type)`.

СТАТУС: ПРОВЕРЕНО

### 5.2 Production schema (проверка в режиме read-only)

ФАКТ:

- Production schema проверена в read-only режиме через SSH + psql с использованием server env.

ДОКАЗАТЕЛЬСТВА:

- Наличие таблиц: `users`, `profiles`, `sessions`, `auth_tokens`, `leads`, `exercises`, `workouts`, `workout_exercises`, `workout_sets`, `media`, `media_links`, `training_set_notes`, `pgmigrations`.
- Таблица applied migrations (`pgmigrations`) включает:
  - `5911`, `5912`, `5913`, `5914`, `5915`, `5916`, `5917`, `5919`, `5920`, `5921`.
- Constraints/indexes для media/training/auth/session подтверждены в production metadata.

СТАТУС: ПРОВЕРЕНО

### 5.3 Выводы по паритету local vs production

ФАКТ:

- Локальный migration-файл `1788859125918_training_templates.js` существует, но в production отсутствует соответствующая запись о применении migration и отсутствуют таблицы `training_templates*`.

ДОКАЗАТЕЛЬСТВА:

- `backend/migrations/1788859125918_training_templates.js` существует.
- В production-списке `pgmigrations` отсутствует `5918`.
- В production-списке таблиц отсутствуют `training_templates`, `training_template_exercises`, `training_template_sets`.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

---

## 6) S3 / MEDIA INFRASTRUCTURE

### КОД: ПРОВЕРЕНО

ФАКТ:

- Реализованы S3 client и signed URL flow.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/storage/storage.service.js`:
  - `S3Client` из env vars
  - `getSignedUploadUrl`, `getSignedDownloadUrl`, `headObject`, `deleteObject`
- `backend/modules/media/media.routes.js`:
  - генерация object key `users/{userId}/media/{mediaId}.{ext}`
  - upload init -> signed PUT -> complete validation -> статус READY
  - delete media/object flow

СТАТУС: ПРОВЕРЕНО

### PRODUCTION INFRA: ПРОВЕРЕНО ЧАСТИЧНО

ФАКТ:

- Production API возвращает media workflow endpoint-ы, backend доступен.

ДОКАЗАТЕЛЬСТВА:

- Runtime API checks успешны по production host path и public endpoint.
- Media schema/constraints присутствуют в production DB.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

### НЕ ПРОВЕРЕНО

ФАКТ:

- Прямые authenticated S3 control-plane проверки bucket configuration не выполнены.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/storage/storage.service.js` использует только следующие env-ключи для `S3Client` и bucket:
  - `S3_ENDPOINT`
  - `S3_REGION`
  - `S3_BUCKET`
  - `S3_ACCESS_KEY`
  - `S3_SECRET_KEY`
- Альтернативные имена (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_DEFAULT_REGION`) в коде backend не используются как primary source.
- Runtime inspection (read-only) по PM2 process metadata:
  - `S3_*` в `pm2_env` и `pm2_env.env` = `EMPTY`
  - `AWS_*` в `pm2_env` и `pm2_env.env` = `EMPTY`
  - `DOTENV_CONFIG_PATH` = `EMPTY`
  - `pm2 cwd` = `/opt/stubbornram/backend/server`
- Runtime inspection production `.env` в `/opt/stubbornram/backend/server`:
  - `S3_ENDPOINT=EMPTY`
  - `S3_REGION=EMPTY`
  - `S3_BUCKET=EMPTY`
  - `S3_ACCESS_KEY=EMPTY`
  - `S3_SECRET_KEY=EMPTY`
- Финальная проверка окружения фактически работающего production process через `/proc/<PID>/environ`:
  - `pm2 pid stubbornram-backend` -> `PID=179119`
  - process executable: `/opt/stubbornram/.nvm/versions/node/v24.20.0/bin/node`
  - process script/cmdline: `node /opt/stubbornram/backend/server/server.js`
  - process cwd: `/opt/stubbornram/backend/server`
  - `S3_ENDPOINT=EMPTY`
  - `S3_REGION=EMPTY`
  - `S3_BUCKET=EMPTY`
  - `S3_ACCESS_KEY=EMPTY`
  - `S3_SECRET_KEY=EMPTY`
  - `AWS_ACCESS_KEY_ID=EMPTY`
  - `AWS_SECRET_ACCESS_KEY=EMPTY`
  - `AWS_REGION=EMPTY`
  - `AWS_DEFAULT_REGION=EMPTY`
  - `DOTENV_CONFIG_PATH=EMPTY`
- Следствие: отсутствуют доступные runtime credentials/config source для безопасных authenticated `GetBucket*`/`HeadBucket` запросов в этом проходе.
- Дополнительный публичный probe endpoint bucket:
  - `HEAD https://s3.ru-6.storage.selcloud.ru/stubbornram-media` -> `403 Forbidden`.
  - Это подтверждает сетевую достижимость endpoint, но не даёт полной control-plane конфигурации bucket.

СТАТУС: НЕ ПРОВЕРЕНО

---

## 7) NGINX / PM2 / PRODUCTION RUNTIME

ФАКТ:

- Production API domain проксируется nginx на локальный bind backend.

ДОКАЗАТЕЛЬСТВА:

- Runtime headers: `Server: nginx/1.24.0 (Ubuntu)` на `https://api.stubbornram.ru/*`.
- Read-only server config: `/etc/nginx/sites-available/stubbornram-api` -> `proxy_pass http://127.0.0.1:3000`.
- `ss -ltnp` показывает listener `127.0.0.1:3000` для node process.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- PM2 process management и startup service активны.

ДОКАЗАТЕЛЬСТВА:

- `pm2 ls`: `stubbornram-backend` online.
- `pm2 show stubbornram-backend`: script `/opt/stubbornram/backend/server/server.js`, cwd `/opt/stubbornram/backend/server`.
- `systemctl status pm2-stubbornram`: enabled + active.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Frontend production hosting не обслуживается через этот nginx host path.

ДОКАЗАТЕЛЬСТВА:

- Публичный `stubbornram.ru` резолвится в GitHub Pages IPs и отвечает GitHub/Fastly headers.
- Инвентарь nginx sites на сервере содержит API/admin vhosts, но не frontend domain vhost.

СТАТУС: ПРОВЕРЕНО

---

## 8) DNS / DEPLOYMENT / GITHUB

ФАКТ:

- Наблюдается DNS/runtime split: frontend на GitHub Pages edge, API на Selectel host.

ДОКАЗАТЕЛЬСТВА:

- DNS:
  - `stubbornram.ru` -> `185.199.108-111.153`
  - `api.stubbornram.ru` -> `161.104.49.107`
- Headers:
  - frontend: `Server: GitHub.com`, `Via: varnish`
  - API: `Server: nginx/1.24.0 (Ubuntu)`
- Repo deployment artifacts:
  - `.github/workflows/deploy.yml` (push в `main`, build `npm run build`, deploy Pages)
  - `public/CNAME` содержит `stubbornram.ru`

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- GitHub control-plane execution status/history для workflow runs на этом этапе не проверялись.

ДОКАЗАТЕЛЬСТВА:

- Не выполнялся запрос authenticated GitHub Actions run history.

СТАТУС: УСТАРЕЛО (СМ. НИЖЕ)

ФАКТ:

- GitHub Actions control-plane по workflow deployment фактически проверен через GitHub API.

ДОКАЗАТЕЛЬСТВА:

- Репозиторий: `EgorBaal/Stubborn-ram` (из `git remote -v`).
- Workflow list API вернул 1 активный workflow:
  - `Deploy Vite to GitHub Pages`
  - `.github/workflows/deploy.yml`
  - state: `active`
- Workflow runs API (последние 10 запусков) вернул фактические execution-данные:
  - run `277` — `success`, `main`, `2026-09-19T07:02:52Z`
  - run `276` — `success`, `main`, `2026-09-17T18:31:49Z`
  - run `275` — `success`, `main`, `2026-09-16T06:39:50Z`
  - run `268` — `failure`, `main`, `2026-09-12T14:11:15Z`
- Jobs API для run `277`:
  - job `deploy` завершён `success`
  - шаги `Checkout`, `Setup Node`, `Install dependencies`, `Build`, `Setup Pages`, `Upload artifact`, `Deploy` выполнены успешно.
- Runtime `https://stubbornram.ru/` продолжает отвечать с `Server: GitHub.com`, `Via: varnish`.
- Запрос GitHub Pages API `/pages` вернул `404 Not Found` (параметры Pages из данного endpoint недоступны в текущем доступе), при этом workflow execution и runtime-следы подтверждены.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

---

## 9) CORS / COOKIES / ENVIRONMENT

ФАКТ:

- CORS allowlist и credentials настроены на backend и частично подтверждены runtime-проверками.

ДОКАЗАТЕЛЬСТВА:

- allowlist в `backend/server.js`:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - `https://stubbornram.ru`
  - `credentials: true`
- Runtime-check с `Origin` header:
  - allowlisted origins получают `access-control-allow-origin`
  - non-allowlisted origin не получил allow-origin header

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Session cookie настроен с secure/httpOnly/sameSite none.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/auth/auth.session.js`:
  - name `stubbornram_session`
  - `httpOnly: true`
  - `secure: true`
  - `sameSite: "none"`
  - `path: "/"`
  - `maxAge: 30 * 24 * 60 * 60`

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Конфигурация environment смешанная: env-based API в shared client + hardcoded URL bypass в одном модуле; backend secret files присутствуют.

ДОКАЗАТЕЛЬСТВА:

- Frontend env files: `.env.development`, `.env.production`, пустой `.env.local`.
- Использование env: `src/shared/lib/apiClient.js` через `import.meta.env.VITE_API_BASE_URL`.
- Hardcoded URL bypass: `src/modules/report/ReportPlaceholderPage.jsx`.
- Шаблон backend env присутствует: `backend/.env.example`.
- Backend также использует заполненные env в production и локальные `.env` с секретами (значения намеренно не приводятся).

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

---

## 10) ДОКУМЕНТАЦИЯ VS ФАКТ (РАСШИРЕННАЯ МАТРИЦА)

| Документация                                                                                                                                                 | Фактическое состояние                                                                                | Статус      | Доказательства                                                  | Влияние                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | ----------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`: production-цепочка указана как `stubbornram.ru -> Nginx -> Fastify`                                        | Публичный frontend domain сейчас обслуживается через GitHub Pages edge; nginx обслуживает API domain | РАСХОЖДЕНИЕ | DNS + response headers + inspection nginx vhost                 | Некорректная infra-модель для frontend hosting              |
| `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`: `git push` указан как не production deployment path                                                        | В repo активен Pages workflow на push в main, runtime соответствует Pages serving                    | РАСХОЖДЕНИЕ | `.github/workflows/deploy.yml`, `public/CNAME`, runtime headers | Описание deployment-процесса устарело/неполно               |
| Раздел `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` о production migrations фиксирует local-only статус для 5918-5920 и более старый production baseline | В production `pgmigrations` сейчас включает `5919`, `5920`, `5921`; `5918` отсутствует               | РАСХОЖДЕНИЕ | Read-only запрос к production `pgmigrations`                    | Состояние migrations в docs устарело                        |
| `docs/SERVER/SERVER_STATE.md` утверждает production backend path и runtime через pm2/nginx                                                                   | Инспекция сервера подтверждает backend path, активный PM2 и nginx reverse proxy                      | ПРОВЕРЕНО   | `pm2 ls`, `pm2 show`, `systemctl status`, nginx config          | Документ server state в основном согласован для API runtime |

---

## 11) ТАБЛИЦА СТАТУСОВ ЭТАПА 1

| Область                   | Статус             | Доказательства                                                                                                       | Примечания                                                                                                                                                              |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend architecture     | ПРОВЕРЕНО ЧАСТИЧНО | Code wiring + HTTP inventory                                                                                         | В report module существует architectural bypass                                                                                                                         |
| Backend architecture      | ПРОВЕРЕНО          | Routes/modules/middleware/auth/storage code + runtime                                                                | Route chains подтверждены                                                                                                                                               |
| API architecture          | ПРОВЕРЕНО ЧАСТИЧНО | Frontend-backend path parity + review обработки status                                                               | Materials PUT route не используется frontend                                                                                                                            |
| End-to-end flows          | ПРОВЕРЕНО ЧАСТИЧНО | 6 обязательных flows прослежены от UI до DB/storage                                                                  | Dashboard data flow поверх session отсутствует                                                                                                                          |
| PostgreSQL                | ПРОВЕРЕНО          | Local migrations + introspection production schema                                                                   | `5918` отсутствует в prod при наличии `5919-5921`                                                                                                                       |
| S3                        | НЕ ПРОВЕРЕНО       | Проверен code-слой + runtime источники конфигурации (`.env`, PM2 env, `/proc/<PID>/environ`) + public endpoint probe | Production runtime не предоставляет доступный credentials/config source для authenticated control-plane проверки bucket policy/ACL/lifecycle/versioning/CORS/encryption |
| Nginx                     | ПРОВЕРЕНО          | Runtime headers + server config + ports                                                                              | API reverse proxy подтверждён                                                                                                                                           |
| PM2                       | ПРОВЕРЕНО          | `pm2 ls/show` + status systemd unit                                                                                  | Сервис restart-on-boot активен                                                                                                                                          |
| DNS                       | ПРОВЕРЕНО          | nslookup frontend/API domains                                                                                        | Split hosting подтверждён                                                                                                                                               |
| Deployment                | ПРОВЕРЕНО          | Workflow config + GitHub API runs + jobs + runtime signatures                                                        | Последний успешный deployment: run `277` (`2026-09-19T07:02:52Z`)                                                                                                       |
| CORS                      | ПРОВЕРЕНО          | Backend config + runtime tests по origin                                                                             | Поведение allowlist подтверждено                                                                                                                                        |
| Cookies                   | ПРОВЕРЕНО          | Cookie configuration в auth session module                                                                           | secure/httpOnly/sameSite none                                                                                                                                           |
| Environment configuration | ПРОВЕРЕНО ЧАСТИЧНО | env usage + hardcoded bypass detection                                                                               | Смешанный паттерн, присутствуют env files с секретами                                                                                                                   |

---

## ФИНАЛ ЭТАПА 1

СТАТУС ЭТАПА 1: НЕ ЗАВЕРШЁН

Причина (строго):

- Сохраняется существенный неизвестный факт: S3 bucket control-plane (policy status, public access block, lifecycle, ACL, CORS, encryption, versioning) не может быть подтверждён authenticated read-only запросами из production runtime из-за отсутствия доступного credentials/config source.

Подтверждённые architectural issues (bypass, неполная write-интеграция materials) зафиксированы как known issues и сами по себе не являются причиной незавершённости forensic-прохода.

Данный результат закрывает forensic-проход Этапа 1 без применения каких-либо исправлений.

---

## Правило Языка Для Дальнейшей Работы

Весь `PROJECT_FULL_AUDIT_2026-09-19.md` далее ведётся на русском языке.

Английский допустим только для технических идентификаторов, которые не должны переводиться: названия файлов, директорий, функций, переменных, компонентов, API endpoint-ов, URL, таблиц PostgreSQL, колонок БД, migration IDs, environment variables, npm-пакетов, workflow names и технологических терминов-идентификаторов.

---

## ЭТАП 2 — AUTH + AUTHORIZATION + DATA PERSISTENCE

Рамки Этапа 2:

- Только проверка.
- Без исправлений frontend/backend/API/DB/infra.
- Без destructive/exploit действий.

### 2.1 Registration

ФАКТ:

- Регистрация реализована через backend `POST /api/auth/register` с валидацией, проверкой duplicate email, транзакционным созданием `users` + `profiles` и генерацией verification token.

ДОКАЗАТЕЛЬСТВА:

- UI: `src/components/auth/RegisterModal.jsx` -> `signUp(email, password)`.
- Service: `src/services/auth/authService.js` -> `request("/auth/register", POST)`.
- Backend: `backend/modules/auth/auth.routes.js`:
  - `authCredentialsSchema.safeParse`.
  - duplicate check по `users.email` -> `409 EMAIL_ALREADY_EXISTS`.
  - транзакция `BEGIN/COMMIT/ROLLBACK` при создании `users` и `profiles`.
  - `createEmailVerificationToken()` -> запись в `auth_tokens` с `type='email_verification'`.
  - `sendVerificationEmail()`.
- Ответ: `201`, `authenticated: false`, `emailVerificationRequired: true`.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Начальная сессия на этапе регистрации не создаётся; вход возможен только после подтверждения email.

ДОКАЗАТЕЛЬСТВА:

- В `register` отсутствует `createUserSession()`.
- В `login` есть блок `if (!user.email_verified_at) return 403 EMAIL_NOT_VERIFIED`.

СТАТУС: ПРОВЕРЕНО

### 2.2 Login

ФАКТ:

- Login lifecycle реализован через `POST /api/auth/login`: валидация, lookup пользователя, verify password hash, проверка email verification, создание session.

ДОКАЗАТЕЛЬСТВА:

- UI: `src/components/auth/AuthModal.jsx` -> `handleSignIn()`.
- Backend: `backend/modules/auth/auth.routes.js`:
  - `400 INVALID_INPUT` при malformed input.
  - `401 INVALID_CREDENTIALS` при неверном email/пароле.
  - `403 EMAIL_NOT_VERIFIED` при неподтверждённой почте.
  - `createUserSession(app.pg, user.id, reply)` при успехе.
- Frontend после успеха: `refreshSession()` + `navigate("/app/home")`.

СТАТУС: ПРОВЕРЕНО

### 2.3 Session

ФАКТ:

- Session хранится в таблице `sessions`, а в cookie передаётся raw token; в БД хранится только `token_hash`.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/auth/auth.service.js`: `createSessionToken()` (`crypto.randomBytes(32).toString("base64url")`), `hashSessionToken()` (`sha256`).
- `backend/modules/auth/auth.session.js`:
  - `createUserSession()` -> insert в `sessions (user_id, token_hash, expires_at)`.
  - cookie `stubbornram_session` выставляется через `setSessionCookie()`.
- `backend/modules/auth/auth.routes.js` (`GET /api/auth/session`): берёт cookie token -> hash -> lookup по `sessions` с `expires_at > now()`.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Concurrent sessions допустимы (множественные устройства): уникален `token_hash`, но нет ограничения один session на пользователя.

ДОКАЗАТЕЛЬСТВА:

- Миграция `1788859125912_sessions.js`: unique только на `token_hash`; по `user_id` есть index, не unique.
- `createUserSession()` всегда создаёт новую запись, не удаляя существующие.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Поведение "старый session после logout" по коду: session текущего cookie удаляется, cookie очищается.

ДОКАЗАТЕЛЬСТВА:

- `deleteUserSession()` удаляет запись `sessions` по `token_hash` текущего cookie.
- `clearSessionCookie()` вызывается в logout.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Multi-device / multi-session дополнительная верификация завершена code-level способом.

ДОКАЗАТЕЛЬСТВА:

- UI/API просмотра активных sessions не обнаружены.
  - Frontend auth-service содержит только `getSession`, `signUp`, `signIn`, `signOut`, `resetPassword`, `updatePassword`, `verifyEmail`, `resendVerification`.
  - Backend auth-routes содержат только:
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `GET /api/auth/session`
    - `POST /api/auth/logout`
    - `POST /api/auth/resend-verification`
    - `POST /api/auth/verify-email`
    - `POST /api/auth/reset-password/request`
    - `POST /api/auth/reset-password/complete`
- Механизм `logout all devices` отдельным endpoint-ом отсутствует.
  - Единственная массовая инвалидация sessions выполняется в `reset-password/complete` через `DELETE FROM sessions WHERE user_id = $1`.
- Session cleanup job/process в backend-коде не обнаружен.
  - Нет scheduler/cron/worker логики для периодического удаления expired sessions.
- Поведение expired sessions:
  - На проверке auth используется условие `expires_at > now()`.
  - Expired записи не используются для auth, но отдельное автоматическое удаление по коду не выполняется.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Automated/integration tests для session state transitions (login -> session, restore, logout, expired, invalid, password reset invalidation) в текущем репозитории не обнаружены.

ДОКАЗАТЕЛЬСТВА:

- В `package.json` и `backend/package.json` отсутствуют test scripts.
- Поиск test framework markers (`vitest`, `jest`, `cypress`, `playwright`, `describe/it/test` как тестовых наборов) не выявил test suite для auth/session.

СТАТУС: ПРОВЕРЕНО

### 2.4 Logout

ФАКТ:

- Logout current device реализован; logout all devices отдельным endpoint-ом не реализован.

ДОКАЗАТЕЛЬСТВА:

- Frontend: `src/modules/profile/ProfilePage.jsx` -> `signOut()` -> `refreshSession()` -> redirect `/`.
- Backend: `POST /api/auth/logout` вызывает `deleteUserSession()`.
- Поиск по backend не выявил отдельного route для logout all devices.

СТАТУС: ПРОВЕРЕНО

### 2.5 Password Recovery

ФАКТ:

- Password recovery flow реализован: request reset -> token в `auth_tokens` -> email -> complete reset -> mark token used -> invalidate all sessions пользователя.

ДОКАЗАТЕЛЬСТВА:

- `POST /api/auth/reset-password/request`: находит пользователя, создаёт `password_reset` token, отправляет email.
- `POST /api/auth/reset-password/complete`:
  - проверяет token по `type='password_reset'`, `used_at IS NULL`, `expires_at > now()`.
  - обновляет `users.password_hash`.
  - выставляет `auth_tokens.used_at = now()`.
  - `DELETE FROM sessions WHERE user_id = $1`.
- Frontend: `src/pages/auth/ResetPasswordPage.jsx`.

СТАТУС: ПРОВЕРЕНО

### 2.6 Email Verification

ФАКТ:

- Email verification и resend verification реализованы через `auth_tokens` с single active token per user/type и сроком действия.

ДОКАЗАТЕЛЬСТВА:

- Token creation: `createEmailVerificationToken()` предварительно помечает старые активные токены `used_at = now()`.
- Проверка: `POST /api/auth/verify-email` ищет токен по hash + type + not used + not expired.
- Resend: `POST /api/auth/resend-verification`.
- Ограничение активных токенов: миграция `1788859125917_auth_tokens_active_unique.js` (`auth_tokens_one_active_per_user_type`, unique where `used_at IS NULL`).

СТАТУС: ПРОВЕРЕНО

### 2.7 Token Lifecycle

ФАКТ:

- Инвентарь token/session механизмов:

| Token/Session            | Где создаётся                                          | Где хранится                                            | Expiration                                  | Single-use | Invalidation                                                                            |
| ------------------------ | ------------------------------------------------------ | ------------------------------------------------------- | ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------- |
| Session token            | `createSessionToken()`                                 | Cookie `stubbornram_session` + DB `sessions.token_hash` | `SESSION_DAYS=30` + `maxAge` cookie 30 дней | Нет        | Logout удаляет текущий `token_hash`; reset password удаляет все `sessions` пользователя |
| Email verification token | `createAuthToken()` в `createEmailVerificationToken()` | DB `auth_tokens` (`type='email_verification'`, hash)    | 24 часа                                     | Да         | `used_at` при verify; старые активные закрываются при создании нового                   |
| Password reset token     | `createAuthToken()` в `createPasswordResetToken()`     | DB `auth_tokens` (`type='password_reset'`, hash)        | 1 час                                       | Да         | `used_at` при reset; старые активные закрываются при создании нового                    |

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/auth/auth.tokens.js`, `auth.routes.js`, `auth.session.js`.
- Миграции `1788859125912_sessions.js`, `1788859125913_auth_tokens.js`, `1788859125917_auth_tokens_active_unique.js`.

СТАТУС: ПРОВЕРЕНО

### 2.8 Authorization

ФАКТ:

- На основных защищённых ресурсах training/media реализован ownership-check через `authUser.userId` + SQL-фильтрацию.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/training/training.routes.js`:
  - workout чтение/изменение/удаление через `WHERE user_id = $authUser`.
  - set materials через joins до `workouts w` и фильтр `w.user_id = $2`.
- `backend/modules/media/media.routes.js`:
  - операции media фильтруют `owner_id = authUser.userId`.
- Общий auth gate: `getAuthenticatedUser()` возвращает `null` при отсутствии/истечении session.

СТАТУС: ПРОВЕРЕНО

ФАКТ:

- Для `POST /api/leads` ownership/authorization не применяется: endpoint публичный по дизайну текущего кода.

ДОКАЗАТЕЛЬСТВА:

- `backend/modules/leads/leads.routes.js` не вызывает `getAuthenticatedUser()`.

СТАТУС: ПРОВЕРЕНО

### 2.9 Trainer / Client Permissions

ФАКТ:

- В текущем backend-коде не найдена реализованная role-based model trainer/client с route-level checks.

ДОКАЗАТЕЛЬСТВА:

- В `users` (миграция `1788859125911_init.js`) отсутствует поле `role`.
- Поиск по backend не выявил действующих permission-check middleware/guards для trainer/client.
- В endpoint-ах опора идёт на authentication + ownership, а не на ролевую матрицу.

СТАТУС: ПРОВЕРЕНО

ФИНАЛЬНАЯ ФИКСАЦИЯ:

- `ROLE-BASED TRAINER/CLIENT AUTHORIZATION: NOT IMPLEMENTED`.

### 2.10 Data Persistence

ФАКТ:

- Основные жизненные циклы данных по auth/training/media подтверждены на уровне кода и схемы.

ДОКАЗАТЕЛЬСТВА:

- User/Profile: создаются транзакционно в registration.
- Auth/session: `sessions`, `auth_tokens` с hash/expiry/used_at.
- Workout/WorkoutExercise/WorkoutSet: create/update/delete в `training.routes.js`, связи через FK.
- TrainingSetNote/Media/MediaLink: create/read/update/delete через training/media routes и таблицы `training_set_notes`, `media`, `media_links`.
- FK/cascade подтверждены миграциями (`sessions.user_id` cascade, `workout_sets.workout_exercise_id` cascade, `training_set_notes.workout_set_id` cascade и др.).

СТАТУС: ПРОВЕРЕНО

### 2.11 Transactions / Consistency

ФАКТ:

- Multi-step операции классифицированы по фактическому коду (без домыслов о runtime-failure как о доказанном баге).

ДОКАЗАТЕЛЬСТВА:

| Операция                              | DB transaction                                                                          | External operation                                  | Partial state возможен                          | Cleanup / compensation                                                                                                                          | Основание          |
| ------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Registration + verification email     | Для `users` + `profiles`: да (`BEGIN/COMMIT`)                                           | Да (`sendVerificationEmail`) после DB commit        | Да (user создан, email не отправлен)            | Авто-rollback email отсутствует                                                                                                                 | Подтверждено кодом |
| Password reset + session invalidation | Да (`BEGIN/COMMIT`) для `users.password_hash`, `auth_tokens.used_at`, `DELETE sessions` | Нет (в complete-route внешних вызовов нет)          | Практически нет внутри одной DB-транзакции      | ROLLBACK при ошибке                                                                                                                             | Подтверждено кодом |
| Email verification                    | Да (`BEGIN/COMMIT`) для `users.email_verified_at` + `auth_tokens.used_at`               | Нет                                                 | Практически нет внутри одной DB-транзакции      | ROLLBACK при ошибке                                                                                                                             | Подтверждено кодом |
| Media upload init + S3 upload         | DB insert `media(UPLOADING)` без общей cross-system транзакции с S3 PUT                 | Да (signed URL upload во внешний storage)           | Да                                              | При ошибке получения signed URL выполняется `DELETE media`; при неуспешном/неполном upload объект/статус завершаются через `/complete` проверку | Подтверждено кодом |
| Media complete + DB                   | Нет явной DB-транзакции (последовательные операции)                                     | Да (`headObject`)                                   | Да (возможны расхождения на границе DB↔storage) | При mismatch ставится `FAILED`; при success ставится `READY`                                                                                    | Подтверждено кодом |
| Training materials                    | Да (`BEGIN/COMMIT`) в route записи materials/links                                      | Да (delete media object через storage при удалении) | Да на внешней границе DB↔storage                | DB-часть защищена транзакцией; для внешних вызовов атомарность межсистемно не гарантируется                                                     | Подтверждено кодом |

СТАТУС: ПРОВЕРЕНО

### 2.12 Error Scenarios

ФАКТ:

- Сопоставление `backend error code -> authService/apiClient -> AuthContext/UI` установлено по требуемому набору кодов.

ДОКАЗАТЕЛЬСТВА:

| Backend code               | Transport path                                                                | Frontend message behavior                                                              | Потеря важной информации                                                                                      | Sensitive details exposure                                   |
| -------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `INVALID_CREDENTIALS`      | backend -> `apiClient` error object -> `authService.signIn` -> `AuthModal`    | Отдельное сообщение: «Неверный email или пароль.»                                      | Нет критичной потери                                                                                          | Нет                                                          |
| `EMAIL_NOT_VERIFIED`       | backend -> `apiClient` -> `authService.signIn` -> `AuthModal`                 | Отдельное сообщение + UI-кнопка resend verification                                    | Нет                                                                                                           | Нет                                                          |
| `EMAIL_ALREADY_EXISTS`     | backend -> `apiClient` -> `authService.signUp` -> `RegisterModal`             | Отдельное сообщение о существующем email                                               | Нет                                                                                                           | Нет                                                          |
| `INVALID_OR_EXPIRED_TOKEN` | backend -> `apiClient` -> `verifyEmail/updatePassword` -> confirm/reset pages | Отдельное сообщение о недействительной/истекшей ссылке                                 | Нет                                                                                                           | Нет                                                          |
| `UNAUTHENTICATED`          | backend -> `apiClient` -> `getSession`/protected routes                       | Для session restore: `AuthContext` на `401` сбрасывает user/session; в UI маппинг есть | Нет                                                                                                           | Нет                                                          |
| Network/backend failure    | `fetch` exception -> `apiClient` формирует `NETWORK_ERROR`                    | Отдельное сообщение «Нет подключения к серверу.» + общий fallback для прочих случаев   | Возможна потеря детализации для неизвестных кодов (уходит в generic fallback), но это явное текущее поведение | Нет (сырые backend stack/error details в UI не показываются) |

СТАТУС: ПРОВЕРЕНО

### 2.13 Documentation vs Actual

ФАКТ:

- По auth/session часть документации подтверждается кодом, но отдельные утверждения требуют уточнений по полноте реализации permissions.

ДОКАЗАТЕЛЬСТВА:

- `docs/SERVER/SERVER_STATE.md` перечисляет текущие auth endpoints — соответствует `auth.routes.js`.
- `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` указывает потребность `logout from all devices` — в текущем API отдельного endpoint для этого нет.
- `docs/SERVER/SERVER_STATE.md` содержит формулировки про Permissions/Coach-Client как будущие/неполные области; в коде role-based checks действительно не обнаружены.

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО

### 2.14 Stage 2 Status

VERIFIED

- Registration/login/session/logout/password reset/email verification/token lifecycle подтверждены.
- Ownership-based authorization для текущих protected ресурсов подтверждена.
- Data persistence и ключевые DB/FK связи подтверждены.
- Multi-device/multi-session поведение подтверждено code-level анализом (включая expired-session semantics).
- Error-code mapping backend -> frontend подтверждён.

CONFIRMED ISSUES

- Frontend error handling использует общий fallback для части неизвестных/нестандартизированных ошибок (ограниченная детализация UX при редких ошибках).
- На границе DB ↔ external systems есть ожидаемые non-atomic windows (подтверждённая архитектурная особенность, не классифицирована как доказанный production bug).

NOT IMPLEMENTED

- `logout all devices` отдельным endpoint-ом/UI не реализован.
- UI/API списка активных sessions не реализован.
- `ROLE-BASED TRAINER/CLIENT AUTHORIZATION` не реализована (используется authentication + ownership model).
- Automated/integration test-suite для session state transitions не реализован в репозитории.

NOT VERIFIED

- Существенных неизвестных фактов по scope Этапа 2 после точечного прохода не осталось.

DOCUMENTATION CONFLICTS

- Документация фиксирует потребность `logout from all devices`; в текущем API это действительно отсутствует (расхождение между desired-state и actual-state подтверждено).

СТАТУС ЭТАПА 2: ЗАВЕРШЁН

Критерий:

- Forensic-описание фактического состояния по auth/session/authorization/data persistence является достаточным и завершённым; оставшиеся пункты относятся к confirmed issues или not implemented, а не к существенным неизвестным фактам.

---

## ЭТАП 3 — SECURITY + RELIABILITY (FORENSIC / READ-ONLY)

Рамки Этапа 3:

- Только forensic/read-only аудит.
- Без исправлений кода/infra/DB/S3/config.
- Без destructive действий и без exploit-attempts.

Использованные источники:

- Код backend/frontend и migrations.
- Документация в `docs/` (architecture/server/system state/media/database/security).
- Точечные read-only runtime проверки production API.

### 3.1 Authentication / Authorization Security

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Auth gate для защищённых endpoint-ов подтверждён (`getAuthenticatedUser()` + `401 UNAUTHENTICATED`) в training/media routes.
- Ownership checks подтверждены:
  - workouts: `WHERE id = $1 AND user_id = $2`;
  - media: `WHERE id = $1 AND owner_id = $2`;
  - set materials: доступ через join до `workouts.user_id = authUser.userId`.
- Серверные проверки ownership выполняются независимо от frontend.

NOT IMPLEMENTED

- Action-based trainer/client RBAC в текущем backend не реализован; фактическая модель — authentication + ownership.

RISK

- Для публичного `POST /api/leads` нет auth/ownership (дизайн-по-назначению), что увеличивает поверхность abuse и требует усилений anti-abuse (см. 3.8).

### 3.2 Session / Cookie Security

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Session token: `crypto.randomBytes(32)`; в БД хранится только `sha256(token)`.
- Cookie: `HttpOnly=true`, `Secure=true`, `SameSite=none`, `Path=/`, `maxAge=30d`.
- Logout удаляет текущую session по token hash.
- Password reset invalidates all sessions пользователя (`DELETE FROM sessions WHERE user_id = $1`).
- Expired sessions не проходят auth (`expires_at > now()`).

NOT IMPLEMENTED

- Logout all devices endpoint/UI отсутствует.
- Session listing/revocation UI/API отсутствует.
- Автоматический cleanup expired sessions отсутствует.

ISSUE

- CSRF-защита отдельным механизмом (token/origin enforcement на state-changing endpoint-ах) не реализована при cookie-auth и `SameSite=none`.

RISK

- Expired sessions остаются в таблице без планового удаления (рост мусорных данных/операционные риски).

### 3.3 Password Security

РЕЗУЛЬТАТ: VERIFIED

VERIFIED

- Password hashing через Argon2 (`argon2.hash`, `argon2.verify`).
- Plaintext password не хранится в схеме пользователей.
- Password reset flow: одноразовый token с expiry, `used_at`, затем смена пароля и invalidation sessions.
- Password recovery enumeration снижена:
  - `reset-password/request` возвращает `ok: true` и для несуществующего email.

PARTIAL

- Argon2 tuning-параметры (memory/time cost) явно не зафиксированы в коде (используются defaults библиотеки).

### 3.4 Email Verification / Recovery Tokens

РЕЗУЛЬТАТ: VERIFIED

VERIFIED

- Token entropy: `randomBytes(32)`.
- Token hashing: `sha256` до хранения в `auth_tokens`.
- Expiration: email verification 24h; password reset 1h.
- Single-use: `used_at` проверяется и выставляется при успешном использовании.
- Duplicate active tokens ограничены:
  - код pre-invalidate старых активных token-ов;
  - DB unique partial index `(user_id, type) WHERE used_at IS NULL`.
- User binding подтверждён через `auth_tokens.user_id`.

RISK

- Verification/reset token помещается в URL query для frontend pages; это стандартный паттерн, но несёт риск утечки через browser history/referrer в неблагоприятных клиентских условиях.

### 3.5 SQL Injection / Database Security

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- В рассмотренных backend routes SQL-вызовы параметризованы (`$1...$n`), прямой конкатенации user input в SQL не обнаружено.
- Динамические ORDER BY/LIMIT по user input не обнаружены.
- Production DB role privilege posture подтверждён read-only запросом:
  - `current_user=stubbornram_app`
  - `rolsuper=f`
  - `rolcreaterole=f`
  - `rolcreatedb=f`

RISK

- Centralized custom error-mapping для неожиданных DB ошибок отсутствует; при необработанных ошибках поведение зависит от стандартного Fastify error handling.

### 3.6 XSS / Input Handling

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- `dangerouslySetInnerHTML` / прямые DOM-sink-и в frontend коде не обнаружены.
- В React-компонентах в основном используется безопасный text rendering.
- В leads email HTML используется `escapeHtml()` для пользовательских значений.

RISK

- В media upload проверяется MIME/size, но отсутствует полноценный content sniffing (фактический тип файла не верифицируется независимо от заявленного MIME).

### 3.7 CSRF / CORS

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- CORS allowlist фиксированный, без wildcard.
- `credentials: true` согласован с cookie-auth.

ISSUE

- Отдельная CSRF защита (synchronizer/double-submit token или строгая origin verification для state-changing запросов) не реализована.
- `SameSite=none` расширяет поверхность CSRF при cookie-based auth.

RISK

- CORS сам по себе не защищает от классического CSRF (form-post/navigation сценарии).

### 3.8 Rate Limiting / Abuse Protection

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Route-specific rate limits есть на auth critical endpoints (register/login/resend/verify/reset request/reset complete).
- Leads endpoint ограничен (`max 10 / 1 minute`).
- Runtime подтверждён выдачей `x-ratelimit-*` headers на auth endpoint-ах.

NOT IMPLEMENTED

- Global rate limiting отключён (`global: false`) без универсального fallback.

RISK

- Для части потенциально дорогих authenticated endpoint-ов (training/media operations) явные route-level rate limits не обнаружены.

### 3.9 Media / S3 Security

РЕЗУЛЬТАТ: PARTIAL

VERIFIED (code-level)

- Ownership checks для media read/delete/complete присутствуют.
- Object key генерируется сервером (`users/{userId}/media/{mediaId}.{ext}`), произвольный storage path от клиента не задаётся.
- Signed URL upload/download используются с ограниченным TTL по умолчанию (`900s`).
- MIME whitelist и size limit реализованы.

RISK

- Cross-system окна DB ↔ S3 остаются (например object delete success/fail и последующий DB delete), полной межсистемной атомарности нет.
- Abandoned `UPLOADING` cleanup job отсутствует.

NOT VERIFIED

- S3 control-plane security attributes bucket (policy/ACL/public-access/lifecycle/versioning/CORS/encryption) остаются NOT VERIFIED согласно Этапу 1.

DOC CONFLICT

- Codebase содержит media routes/signed URL flow, но runtime production-check на `POST /api/media/upload` вернул `404 Route ... not found`.
- Read-only inspection текущего PM2 runtime подтверждает причину: у запущенного процесса (`/opt/stubbornram/backend/server/server.js`, cwd `/opt/stubbornram/backend/server`) не зарегистрированы `mediaRoutes`, а директория `modules/media` отсутствует в deployed path.
- Nginx vhost `api.stubbornram.ru` проксирует `location /` напрямую на `127.0.0.1:3000`, признаков route-level proxy-блокировки для `/api/media/upload` не обнаружено.
- Классификация: `DEPLOYED RUNTIME MISMATCH` (deployed backend state не соответствует текущему repository code по media/storage слою).

### 3.10 Sensitive Data / Secrets

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Frontend `VITE_*` содержит только API base URL (секреты frontend bundle-level не обнаружены в проверенных env-файлах).
- Tracked files не показывают явные хардкод-секреты значений (обнаружены только имена env-переменных и шаблоны).

RISK

- Локальный `backend/.env` содержит чувствительные ключи по именам (`DB_PASSWORD`, `UNISENDER_API_KEY`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`) с признаками заполненности (значения не раскрываются).
- Статус файла: `ignored` (`backend/.gitignore`), `not tracked` (`git ls-files` пусто), в `git status --short -- backend/.env` не отображается как tracked change.
- Текущий подтверждённый риск: локальное хранение чувствительных данных + потенциальный случайный commit только при явном обходе ignore-политики.
- Root `.gitignore` не покрывает `.env`-варианты глобально; reliance на `backend/.gitignore` локально повышает риск ошибочного коммита секретов в иных директориях.

NOT VERIFIED

- Полная проверка исторических утечек секретов в git history не выполнена в этом проходе.

### 3.11 Error Handling / Information Leakage

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Для auth базовые ошибки стандартизованы (`INVALID_INPUT`, `INVALID_CREDENTIALS`, `UNAUTHENTICATED`, и т.д.).
- Runtime: unauthenticated protected endpoint возвращает контролируемый `401` без stack trace.
- Reset request runtime возвращает нейтральный `{"ok":true}` для invalid/non-existing cases.

ISSUE

- Runtime production на несуществующем route возвращает framework-level detail (`Route POST:/api/media/upload not found`), что является лишней диагностической детализацией внешнему клиенту.

RISK

- Для некоторых route-цепочек при `throw error` без локального safe-mapping детализация 5xx зависит от дефолтного error handler.

### 3.12 Database Reliability

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Критичные multi-step DB операции в auth/training используют `BEGIN/COMMIT/ROLLBACK`.
- FK/unique/check constraints присутствуют в ключевых таблицах (sessions/auth_tokens/workouts/media/training_set_notes).
- Connection release в транзакционных блоках присутствует (`finally client.release()`).

RISK

- Не все multi-step операции межмодульного характера закрыты одной DB-транзакцией (особенно где есть внешний storage вызов).

NOT VERIFIED

- Runtime-поведение под реальными DB outage/timeout/failover сценариями в production не тестировалось (по ограничению safe read-only режима).

### 3.13 DB ↔ External Storage Consistency

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Подтверждены окна несогласованности:
  - DB row `UPLOADING` может существовать до завершения фактического upload;
  - на `complete` возможен переход в `FAILED` при mismatch;
  - в training materials есть post-commit внешние delete операции.
- Есть частичная компенсация:
  - rollback DB на транзакционных ошибках;
  - cleanup media row при ошибке генерации upload URL;
  - status fail-marking на mismatch.

RISK

- Полная атомарность PostgreSQL ↔ S3 недостижима текущим паттерном; остаётся риск orphan object / orphan metadata в edge-failure сценариях.

### 3.14 Availability / Failure Handling

РЕЗУЛЬТАТ: PARTIAL

VERIFIED

- Auth/session flows корректно отрабатывают invalid/expired state кодами `401/400/403`.
- Frontend API client имеет network fallback (`NETWORK_ERROR`) без краша.
- Backend startup проверяет DB connectivity (`SELECT 1`) до listen.

RISK

- Нет явной политики idempotency/retry keys для mutating endpoint-ов (например workout/media create/update).
- При временной недоступности внешних сервисов (email/S3) поведение зависит от текущих catch/throw веток и может приводить к частично завершённым бизнес-сценариям.

NOT VERIFIED

- Полноценные production chaos/failure сценарии (DB down, S3 hard timeout, массовые restart-циклы) в этом проходе не выполнялись по ограничениям безопасного режима.

---

## ЭТАП 3 — СВОДКА СТАТУСОВ ПО ОБЛАСТЯМ

| Область                                     | Статус   |
| ------------------------------------------- | -------- |
| 3.1 Authentication / Authorization Security | PARTIAL  |
| 3.2 Session / Cookie Security               | PARTIAL  |
| 3.3 Password Security                       | VERIFIED |
| 3.4 Email Verification / Recovery Tokens    | VERIFIED |
| 3.5 SQL Injection / Database Security       | PARTIAL  |
| 3.6 XSS / Input Handling                    | PARTIAL  |
| 3.7 CSRF / CORS                             | PARTIAL  |
| 3.8 Rate Limiting / Abuse Protection        | PARTIAL  |
| 3.9 Media / S3 Security                     | PARTIAL  |
| 3.10 Sensitive Data / Secrets               | PARTIAL  |
| 3.11 Error Handling / Information Leakage   | PARTIAL  |
| 3.12 Database Reliability                   | PARTIAL  |
| 3.13 DB ↔ External Storage Consistency      | PARTIAL  |
| 3.14 Availability / Failure Handling        | PARTIAL  |

---

## Confirmed Security Issues

- ISSUE: CSRF-specific защита не реализована при cookie-auth + `SameSite=none`.
- ISSUE: Runtime production возвращает framework-level route detail на 404 (`Route POST:/api/media/upload not found`).

## Security/Reliability Risks

- RISK: Expired sessions не очищаются фоновым cleanup job.
- RISK: Non-atomic окна на границе DB ↔ external systems (email/S3).
- RISK: Для части тяжёлых authenticated endpoint-ов нет явных route-level rate limits.
- RISK: Token-in-URL pattern для verification/reset ссылок несёт стандартные риски утечки на стороне клиента.
- RISK: Нет явной idempotency стратегии для mutating endpoints.
- RISK: MIME/size checks без полноценного content sniffing.
- RISK: Локальный `backend/.env` содержит чувствительные ключи; файл сейчас ignored/untracked, но сохраняется риск ошибочного включения в commit при явном override ignore.

## Not Verified

- S3 control-plane security attributes bucket (policy/ACL/public access/lifecycle/versioning/CORS/encryption).
- Полная проверка исторических утечек секретов в git history.
- Production chaos/failure сценарии (DB/S3 outage, restart storm behavior) не выполнялись.

## Documentation Conflicts

- `docs/SERVER/SERVER_STATE.md` содержит секцию `Object Storage / S3: PLANNED / NOT CONNECTED; Signed URLs пока не реализованы`, тогда как репозиторный backend-код содержит реализацию media routes + signed URL flow.
- Runtime production на момент проверки возвращает `404` для `POST /api/media/upload`, что подтверждает расхождение `docs ↔ repo code ↔ deployed runtime` по media/storage слою.

## Not Implemented

- Action-based trainer/client permissions layer (целевая модель есть в docs, фактическая реализация отсутствует).
- Logout all devices.
- Session list / selective revoke.
- Global rate limit fallback.
- Automated integration tests для critical auth/session security transitions.

## Зависимости между проблемами

- Cookie-auth + `SameSite=none` + отсутствие CSRF controls -> повышенная CSRF поверхность.
- Отсутствие trainer/client permission layer -> безопасность опирается на ownership-checks конкретных route-ов.
- Разрыв между repo code и deployed runtime по media -> часть security assertions media-flow остаётся только code-level.
- Отсутствие cleanup/idempotency механизмов -> reliability риски в долгоживущих и повторных операциях.

## Невыполнимые проверки в этом проходе и причины

- Authenticated S3 control-plane inspection невозможен: по Этапу 1 отсутствует доступный runtime credentials/config source.
- Полный outage/failover stress-тест production не выполнялся: запрещено создавать аварийные/изменяющие состояние сценарии.
- Полная git-history secret forensics не выполнялась в рамках текущего read-only scope и лимита этапа.

## ИТОГ ЭТАПА 3

СТАТУС ЭТАПА 3: ЗАВЕРШЁН

Критерий:

- Forensic-проход по всем областям 3.1–3.14 выполнен;
- подтверждённые ISSUE/RISK/NOT VERIFIED/NOT IMPLEMENTED/DOC CONFLICT классифицированы отдельно;
- неизвестные зоны явно ограничены и обоснованы.

---

## ЭТАП 4 — ALL MODULES + USER FLOWS (PASS 1: 8 MODULES)

Рамки этого прохода:

- Только forensic/read-only аудит.
- Без изменений frontend/backend/API/DB/S3/config/infra.
- Проверены только модули: Auth, Profile, Home/Dashboard, Questionnaire, Training History, Training Create/New Workout, Training Templates, Exercises.
- Остальные модули Этапа 4 (Reports/Media/Nutrition/Chat/Notifications/Trainer Dashboard/Programs/Analytics) в этот проход не включались.

### 4.0 Контроль неизменности рабочего дерева

Стартовый `git status --short` перед Этапом 4:

- `M src/app/router/appRoutes.jsx`
- `M src/modules/training/components/create/TrainingCreateList.jsx`
- `M src/modules/training/components/exercises/ExerciseList.jsx`
- `M src/modules/training/screens/TrainingTemplatesPage.jsx`
- `M src/modules/training/services/trainingService.js`
- `M src/shared/lib/apiClient.js`
- `?? .env.development`
- `?? .env.production`
- `?? PROJECT_FULL_AUDIT_2026-09-19.md`

Никакие из перечисленных рабочих изменений не откатывались и не редактировались в рамках Этапа 4.

### 4.1 Runtime read-only probes (без мутаций)

Проверки production API (неаутентифицированные GET, только факт доступности route/method):

- `GET /api/auth/session` -> `401`
- `GET /api/training/workouts` -> `401`
- `GET /api/training/exercises` -> `401`
- `GET /api/training/workouts/:id` -> `401`
- `GET /api/training/templates` -> `404`
- `GET /api/profile` -> `404`
- `GET /api/dashboard` -> `404`
- `GET /api/questionnaire` -> `404`
- `GET /api/leads` -> `404`
- `GET /api/auth/login` -> `404`
- `GET /api/auth/register` -> `404`

Вывод:

- protected training/auth session routes в runtime существуют и закрыты auth (`401` без cookie);
- profile/dashboard/questionnaire/templates read-endpoint-ы как отдельные backend модули не обнаружены;
- для mutation endpoint-ов `auth/login`, `auth/register`, `leads` GET-метод не обслуживается (что ожидаемо для method-specific POST routes).

### 4.2 Production runtime composition (re-check)

Read-only SSH inspection (PM2/nginx/deployed backend):

- PM2 process online: `stubbornram-backend`
- runtime script: `/opt/stubbornram/backend/server/server.js`
- runtime cwd: `/opt/stubbornram/backend/server`
- deployed register-chain: `authRoutes`, `leadsRoutes`, `trainingRoutes`
- в deployed path отсутствуют `modules/media` и registration `mediaRoutes`/`storagePlugin`.

Классификация для Этапа 4:

- `RUNTIME MISMATCH` подтверждён для media/storage слоя (наследуется из Этапа 3 и влияет на media-зависимые части training-экранов).

---

## 4.3 MODULE 1 — AUTH

Покрытые flows:

1. Registration
2. Login
3. Session restore
4. Logout
5. Password recovery
6. Email verification (+ resend)

### Flow: Registration

Цепочка:

- UI: `RegisterModal` -> `handleSignUp()`
- Service: `signUp(email, password)`
- API client: `request("/auth/register", POST)`
- Backend route: `POST /api/auth/register`
- Auth/Logic: validation, duplicate email check, transaction `users + profiles`, verification token creation, email send
- DB: `users`, `profiles`, `auth_tokens`
- Response/UI: success message в modal; session не создаётся

Детали проверки:

- validation: frontend (`password>=8`, confirm match) + backend Zod
- duplicate email: `409 EMAIL_ALREADY_EXISTS`
- profile creation: есть `INSERT INTO profiles`
- transaction: `BEGIN/COMMIT/ROLLBACK` для `users/profiles`
- verification requirement: `emailVerificationRequired: true`
- при ошибке email-send: DB уже закоммичен, route падает ошибкой (нет safe response-map), frontend видит generic auth error

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PARTIAL`

### Flow: Login

Цепочка:

- UI: `AuthModal` -> `handleSignIn()`
- Service: `signIn()`
- API client: `request("/auth/login", POST)`
- Backend route: `POST /api/auth/login`
- Auth: credentials verify + `email_verified_at` check + session creation + cookie
- DB: `users`, `sessions`
- Frontend state/UI: `refreshSession()` -> `navigate("/app/home")`

Детали:

- valid credentials -> `authenticated: true`
- invalid credentials -> `401 INVALID_CREDENTIALS`
- unverified email -> `403 EMAIL_NOT_VERIFIED` + resend action в UI

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

### Flow: Session restore

Цепочка:

- UI load: `AuthProvider` useEffect
- Service: `getSession()`
- API client: `request("/auth/session")`
- Backend route: `GET /api/auth/session`
- Auth: cookie token -> hash -> lookup `sessions`
- DB: `sessions`, `users`, `profiles`
- Frontend state/UI: `session/user/loading`, `AuthGuard`/`PublicRoute`

Детали:

- reload страницы запускает restore
- при `401` в `AuthContext` выполняется `setSession(null)` и `setUser(null)`
- AuthGuard редиректит на `/` при отсутствии session

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

### Flow: Logout

Цепочка:

- UI: `ProfilePage` -> `handleSignOut()`
- Service: `signOut()`
- API client: `request("/auth/logout", POST)`
- Backend route: `POST /api/auth/logout`
- Auth/DB: delete current session by token hash + clear cookie
- Frontend state/UI: `refreshSession()` + redirect `/`

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

### Flow: Password recovery

Цепочка:

- UI request: `ResetPasswordModal`
- Service/API: `resetPassword()` -> `POST /auth/reset-password/request`
- Backend: create reset token + send email
- UI reset page: `ResetPasswordPage` (token from query)
- Service/API: `updatePassword()` -> `POST /auth/reset-password/complete`
- Backend: verify token + update password + mark token used + delete all sessions user
- DB: `auth_tokens`, `users`, `sessions`

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

### Flow: Email verification

Цепочка:

- UI: `ConfirmEmailPage` (token from query)
- Service/API: `verifyEmail()` -> `POST /auth/verify-email`
- Backend: token verify + update user + mark token used
- DB: `auth_tokens`, `users`
- Resend: `AuthModal` -> `resendVerification()` -> `POST /auth/resend-verification`

expired/used token:

- backend возвращает `INVALID_OR_EXPIRED_TOKEN`
- UI показывает error-state

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

---

## 4.4 MODULE 2 — PROFILE

Фактическая цепочка данных:

- UI: `ProfilePage`
- Data source: только `useAuth().user` (session payload)
- Service calls: только `signOut()`
- Отдельного `profileService`/`/api/profile` consumer нет

Поля и persistence:

- `displayName`: вычисляется из `user.user_metadata.*` или email prefix
- `email`: из `user.email`
- `avatarUrl`: из `user.user_metadata.avatar_url`
- Editable fields (first_name/last_name/avatar/...): UI для сохранения не реализован
- Backend persistence для editable profile fields в module flow не подключён

Точки обрыва:

- `UI -> state` есть
- `state -> service -> API -> backend -> DB` для edit/save профиля отсутствует

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `FRONTEND-ONLY`, `PLACEHOLDER`, `PARTIAL`

---

## 4.5 MODULE 3 — HOME / DASHBOARD

Фактическое состояние:

- `HomePage` использует только `user` из `AuthContext`
- `HomeHeader`: дата/аватар/имя из session user
- `NotificationSection`: статический массив карточек
- `ModuleGrid`: статический массив модулей/route-links
- Dashboard-specific service/API endpoint в frontend не обнаружен
- Backend `/api/dashboard` endpoint не обнаружен (runtime `GET /api/dashboard -> 404`)

Вывод по данным:

- отображаются в основном session-derived данные и статический UI content
- DB-backed dashboard metrics не интегрированы
- есть loading/error state только на уровне auth/session restore, не на уровне dashboard data

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `FRONTEND-ONLY`, `PLACEHOLDER`, `PARTIAL`

---

## 4.6 MODULE 4 — QUESTIONNAIRE

Разделённые flows:

1. `CoachingQuestionnaire` (рабочая форма)
2. `ProgramQuestionnaire` (placeholder)

### Flow A: Coaching questionnaire

Цепочка:

- UI open: `/questionnaire/coaching`
- Component: `Questionnaire`
- Local state: multi-step answers
- Draft persistence: `localStorage["sr-questionnaire"]`
- Submit: `createLead(lead)`
- API client: `request("/leads", POST)`
- Backend route: `POST /api/leads`
- DB: insert в `leads`
- Side effect: send email to `TRAINER_EMAIL`
- Response/UI: success -> `/questionnaire/thank-you`; failure -> error message

Ключевые факты:

- local draft persistence реализован
- backend persistence есть (таблица `leads`)
- reload восстанавливает draft из localStorage, но не server-saved lead
- повторное открытие после успешного submit не загружает данные из backend
- редактирование уже отправленной анкеты как сущности backend отсутствует
- если email-send падает, backend отвечает `503 EMAIL_SEND_FAILED` после успешной записи lead; UI воспринимает как failure

СТАТУС: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PARTIAL`

### Flow B: Program questionnaire

Цепочка:

- UI: `/questionnaire/program`
- Component: `ProgramQuestionnaire`
- Реальный submit/API/backend/DB слой отсутствует

СТАТУС: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`

---

## 4.7 MODULE 5 — TRAINING HISTORY

### Flow: History list

Цепочка:

- UI: `TrainingHistoryPage`
- Service: `getCompletedWorkouts()`
- API client: `request("/training/workouts")`
- Backend: `GET /api/training/workouts`
- Auth/Ownership: `getAuthenticatedUser`, filter by `user_id`
- DB: `workouts`
- Response -> UI: map + list/group by month

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

### Flow: Open workout details `/app/training/:id`

Цепочка:

- UI nav: `TrainingCard` -> route
- Service: `getWorkoutById(id)`
- API client: `request(`/training/workouts/${id}`)`
- Backend: `GET /api/training/workouts/:id`
- Auth/Ownership: `user_id` constraint
- DB: `workouts`, `workout_exercises`, `workout_sets`, optional materials via `training_set_notes`/`media_links`
- Response -> UI: hydrate `TrainingPage` fields/exercises/sets

СТАТУС: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `VERIFIED`

### Дополнительно (delete/update/materials)

- delete из history: есть (`DELETE /training/workouts/:id`) + UI removal
- update при открытой тренировке: есть (`PUT /training/workouts/:id`)
- loading/error/empty states: реализованы
- materials read: `getSetMaterials()` (`GET /training/sets/:setId/materials`)
- materials write из этого UI-прохода не интегрирован (`PUT /training/sets/:setId/materials` frontend consumer не найден)

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PARTIAL`

---

## 4.8 MODULE 6 — TRAINING CREATE / NEW WORKOUT

Основной flow:

- Create entry: `/app/training/create` -> `/app/training/new`
- Component: `TrainingPage`
- Exercise selection: `ExercisePickerOverlay` + `ExerciseList`
- Local editor: exercises/sets/values/supersets/comments/time/type
- Save/Finish:
  - new: `saveCompletedWorkout()` -> `POST /training/workouts`
  - existing: `updateWorkout()` -> `PUT /training/workouts/:id`
- Backend: transactional write to `workouts` + nested `workout_exercises` + nested `workout_sets`
- Response: id
- UI: navigate to history

Проверка пунктов:

- create workout: есть
- update workout: есть
- nested exercises/sets: есть
- order exercises/sets: есть (`position`)
- duration/start/end: формируется из start/end
- workout type/comment: сохраняются
- empty workout: технически допустим (пустой `exercises` массив проходит)
- invalid values: строгой схемной валидации всех числовых полей нет
- повторное сохранение: защищено `isSaving` (UI lock)
- existing workout editing: есть
- ownership: backend `user_id` checks есть

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PARTIAL`

---

## 4.9 MODULE 7 — TRAINING TEMPLATES

Фактический пользовательский flow в текущем коде:

- `TrainingTemplatesPage`: UI tabs/buttons + empty-state тексты
- service для templates: отсутствует
- apiClient calls по templates: отсутствуют
- backend template endpoints: отсутствуют
- runtime probe: `GET /api/training/templates -> 404`
- `TrainingCreateList` принимает `templates` prop, но вызывается без данных (default `[]`), показывает empty state
- `TrainingTemplateBuilderPage`: визуальный shell без persistence

DB слой:

- local migration `1788859125918_training_templates.js` существует
- в ранее подтверждённых production schema evidence (Этап 1): `training_templates*` отсутствуют

Ключевая точка обрыва:

- `UI -> Service` обрыв (service отсутствует)
- `Frontend -> Backend` обрыв (template routes отсутствуют)
- `Backend -> DB (production)` для templates не активен

СТАТУС МОДУЛЯ: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`, `RUNTIME MISMATCH`, `DOC CONFLICT`

---

## 4.10 MODULE 8 — EXERCISES

Основной flow:

- UI: `ExerciseList`
- Service: `getExercises()`
- API client: `request("/training/exercises")`
- Backend: `GET /api/training/exercises`
- Auth: required (`401` без session)
- DB: `exercises` (`WHERE user_id IS NULL`)
- Response -> UI: search/filter rendering

Проверка требований:

- system exercises: есть
- user exercises: не реализованы в runtime flow
- search/filter: есть (frontend)
- pagination: нет
- create/edit/delete:
  - UI кнопка "Создать упражнение" ведёт на builder page
  - `TrainingExerciseBuilderPage` — placeholder без API persistence
  - backend exercise CRUD endpoint-ы отсутствуют
- empty/error states: есть

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PARTIAL`, `PLACEHOLDER`

---

## 4.11 Backend ↔ Frontend Parity (обязательная проверка)

### A) Frontend services и parity

`authService`:

- `POST /auth/register` <-> `POST /api/auth/register` : method/path совпадают
- `POST /auth/login` <-> `POST /api/auth/login` : совпадают
- `GET /auth/session` <-> `GET /api/auth/session` : совпадают
- `POST /auth/logout` <-> `POST /api/auth/logout` : совпадают
- `POST /auth/reset-password/request` <-> `POST /api/auth/reset-password/request` : совпадают
- `POST /auth/reset-password/complete` <-> `POST /api/auth/reset-password/complete` : совпадают
- `POST /auth/verify-email` <-> `POST /api/auth/verify-email` : совпадают
- `POST /auth/resend-verification` <-> `POST /api/auth/resend-verification` : совпадают

`trainingService`:

- `GET /training/workouts` <-> `GET /api/training/workouts` : совпадают
- `GET /training/workouts/:id` <-> `GET /api/training/workouts/:id` : совпадают
- `POST /training/workouts` <-> `POST /api/training/workouts` : совпадают
- `PUT /training/workouts/:id` <-> `PUT /api/training/workouts/:id` : совпадают
- `DELETE /training/workouts/:id` <-> `DELETE /api/training/workouts/:id` : совпадают
- `GET /training/exercises` <-> `GET /api/training/exercises` : совпадают

`trainingMaterialsService`:

- `GET /training/sets/:setId/materials` <-> `GET /api/training/sets/:setId/materials` : совпадают
- `PUT /api/training/sets/:setId/materials` backend endpoint есть, но frontend consumer в проверяемых flow не найден

`leadService`:

- `POST /leads` <-> `POST /api/leads` : method/path совпадают

Parity gaps:

- Profile module: frontend profile read/edit service отсутствует, backend `/api/profile*` endpoint-ы отсутствуют
- Home/Dashboard: frontend dashboard service отсутствует, backend `/api/dashboard*` endpoint-ы отсутствуют
- Training Templates: frontend service отсутствует, backend template endpoint-ы отсутствуют
- Exercises CRUD: frontend create-page placeholder, backend exercise CRUD endpoint-ы отсутствуют

### B) Важные backend endpoints без frontend consumer (в scope этого прохода)

- `PUT /api/training/sets/:setId/materials` — route есть, явный frontend call отсутствует

---

## 4.12 Обязательная таблица flow-цепочек

| Модуль              | Flow                        | UI                                            | Service                            | API Client                                                  | Backend                             | Auth                  | DB/S3                                         | Persistence                        | Response -> UI                        | Итоговый статус                                               |
| ------------------- | --------------------------- | --------------------------------------------- | ---------------------------------- | ----------------------------------------------------------- | ----------------------------------- | --------------------- | --------------------------------------------- | ---------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Auth                | Registration                | `RegisterModal`                               | `signUp`                           | `POST /auth/register`                                       | `POST /api/auth/register`           | public                | `users`, `profiles`, `auth_tokens`            | есть (transaction)                 | success message / error message       | ПРОВЕРЕНО ЧАСТИЧНО (`PARTIAL`)                                |
| Auth                | Login                       | `AuthModal`                                   | `signIn`                           | `POST /auth/login`                                          | `POST /api/auth/login`              | public->session       | `users`, `sessions`                           | есть                               | `refreshSession` + redirect           | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Auth                | Session restore             | `AuthProvider/AuthGuard`                      | `getSession`                       | `GET /auth/session`                                         | `GET /api/auth/session`             | cookie session        | `sessions`, `users`, `profiles`               | есть                               | auth state restored or reset on `401` | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Auth                | Logout                      | `ProfilePage`                                 | `signOut`                          | `POST /auth/logout`                                         | `POST /api/auth/logout`             | required              | `sessions`                                    | есть (current session)             | state reset + redirect                | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Auth                | Password recovery           | `ResetPasswordModal/ResetPasswordPage`        | `resetPassword`/`updatePassword`   | `POST /auth/reset-password/*`                               | `POST /api/auth/reset-password/*`   | public token flow     | `auth_tokens`, `users`, `sessions`            | есть                               | success/error message                 | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Auth                | Email verification          | `ConfirmEmailPage/AuthModal`                  | `verifyEmail`/`resendVerification` | `POST /auth/verify-email`, `POST /auth/resend-verification` | matching routes                     | public token flow     | `auth_tokens`, `users`                        | есть                               | success/error state                   | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Profile             | View profile                | `ProfilePage`                                 | нет (кроме `signOut`)              | нет profile call                                            | нет `/api/profile`                  | через session context | session payload only                          | частично (read only через session) | render static/profile card            | ПРОВЕРЕНО ЧАСТИЧНО (`FRONTEND-ONLY`,`PARTIAL`)                |
| Profile             | Edit/save profile           | UI control отсутствует                        | нет                                | нет                                                         | нет                                 | n/a                   | n/a                                           | нет                                | n/a                                   | РАСХОЖДЕНИЕ (`PLACEHOLDER`)                                   |
| Home/Dashboard      | Open home                   | `HomePage`                                    | нет dashboard service              | нет                                                         | нет `/api/dashboard`                | через `AuthGuard`     | нет dashboard DB chain                        | нет                                | static cards + session user           | ПРОВЕРЕНО ЧАСТИЧНО (`FRONTEND-ONLY`,`PLACEHOLDER`)            |
| Questionnaire       | Coaching submit             | `Questionnaire`                               | `createLead`                       | `POST /leads`                                               | `POST /api/leads`                   | public                | `leads` + email side-effect                   | есть (lead row)                    | thank-you / error                     | ПРОВЕРЕНО ЧАСТИЧНО (`PARTIAL`)                                |
| Questionnaire       | Draft/restore               | `Questionnaire`                               | local state                        | localStorage                                                | нет                                 | n/a                   | browser storage                               | только local draft                 | continue/start behavior               | ПРОВЕРЕНО (`FRONTEND-ONLY`)                                   |
| Questionnaire       | Program questionnaire       | `ProgramQuestionnaire`                        | нет                                | нет                                                         | нет                                 | n/a                   | нет                                           | нет                                | placeholder text                      | РАСХОЖДЕНИЕ (`PLACEHOLDER`)                                   |
| Training History    | List workouts               | `TrainingHistoryPage`                         | `getCompletedWorkouts`             | `GET /training/workouts`                                    | `GET /api/training/workouts`        | required              | `workouts`                                    | есть                               | list/empty/error                      | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Training History    | Open workout                | `TrainingPage` via `/app/training/:id`        | `getWorkoutById`                   | `GET /training/workouts/:id`                                | `GET /api/training/workouts/:id`    | required + ownership  | `workouts`,`workout_exercises`,`workout_sets` | есть                               | hydrated editor UI                    | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Training History    | Delete workout              | `TrainingHistoryPage`                         | `deleteWorkout`                    | `DELETE /training/workouts/:id`                             | `DELETE /api/training/workouts/:id` | required + ownership  | `workouts` cascade                            | есть                               | local list update                     | ПРОВЕРЕНО (`VERIFIED`)                                        |
| Training Create/New | Create workout              | `TrainingPage /new`                           | `saveCompletedWorkout`             | `POST /training/workouts`                                   | `POST /api/training/workouts`       | required              | `workouts`,`workout_exercises`,`workout_sets` | есть                               | navigate history                      | ПРОВЕРЕНО ЧАСТИЧНО (`PARTIAL`)                                |
| Training Create/New | Update workout              | `TrainingPage /:id`                           | `updateWorkout`                    | `PUT /training/workouts/:id`                                | `PUT /api/training/workouts/:id`    | required + ownership  | same tables                                   | есть                               | navigate history                      | ПРОВЕРЕНО ЧАСТИЧНО (`PARTIAL`)                                |
| Training Templates  | Templates list              | `TrainingTemplatesPage`, `TrainingCreateList` | нет                                | нет templates call                                          | нет templates routes                | n/a                   | local migration only                          | runtime persistence отсутствует    | empty states only                     | РАСХОЖДЕНИЕ (`PLACEHOLDER`,`RUNTIME MISMATCH`,`DOC CONFLICT`) |
| Exercises           | Exercises catalog           | `ExerciseList`                                | `getExercises`                     | `GET /training/exercises`                                   | `GET /api/training/exercises`       | required              | `exercises` (`user_id IS NULL`)               | есть (read)                        | filter/search UI                      | ПРОВЕРЕНО ЧАСТИЧНО (`PARTIAL`)                                |
| Exercises           | Create/edit/delete exercise | `TrainingExerciseBuilderPage`                 | нет CRUD service                   | нет                                                         | нет CRUD routes                     | n/a                   | нет                                           | нет                                | placeholder shell                     | РАСХОЖДЕНИЕ (`PLACEHOLDER`)                                   |

---

## 4.13 Классификация по модулям

| Модуль                        | Классификация                                                      |
| ----------------------------- | ------------------------------------------------------------------ |
| Auth                          | `VERIFIED` + `PARTIAL` (registration email side-effect window)     |
| Profile                       | `FRONTEND-ONLY`, `PLACEHOLDER`, `PARTIAL`                          |
| Home / Dashboard              | `FRONTEND-ONLY`, `PLACEHOLDER`, `PARTIAL`                          |
| Questionnaire                 | `PARTIAL`, `FRONTEND-ONLY`, `PLACEHOLDER`                          |
| Training History              | `VERIFIED` + `PARTIAL`                                             |
| Training Create / New Workout | `PARTIAL`                                                          |
| Training Templates            | `PLACEHOLDER`, `FRONTEND-ONLY`, `RUNTIME MISMATCH`, `DOC CONFLICT` |
| Exercises                     | `PARTIAL`, `PLACEHOLDER`                                           |

---

## 4.14 Точки обрыва (breakpoints)

1. Profile edit flow обрывается после UI отображения: нет profile edit service/API/backend persistence.
2. Home/Dashboard flow обрывается на UI/session-слое: нет dashboard data service/API/backend.
3. ProgramQuestionnaire — UI placeholder без submit/API/DB.
4. Training Templates — UI exists, но нет templates service/API/backend routes; данные не загружаются и не сохраняются.
5. Exercises create/edit/delete — UI-переход в builder есть, но нет CRUD service и backend CRUD endpoints.
6. Training materials write parity gap: backend `PUT /api/training/sets/:setId/materials` есть, frontend consumer отсутствует.

---

## 4.15 Frontend/Backend mismatches

1. `ProfilePage` ожидает поля формата `user.user_metadata.*`, тогда как backend session payload формируется из `users/profiles` (`email`, `first_name`, `last_name`) и не содержит `user_metadata` в текущей модели.
2. Templates docs/spec предполагают полноценный templates persistence flow, но фактический UI/API/runtime этого flow не реализует.
3. Runtime deployment содержит только `auth+leads+training` modules; media/storage repo-layer не задеплоен (`RUNTIME MISMATCH`), что важно для связанных media-функций вокруг тренировок.

---

## 4.16 Persistence gaps

1. Profile editable persistence отсутствует.
2. Dashboard metrics persistence chain отсутствует.
3. Program questionnaire persistence отсутствует.
4. Templates persistence отсутствует в runtime flow.
5. Exercises user CRUD persistence отсутствует.
6. Questionnaire lead: при email-send error lead уже сохранён, но UI получает failure — возможен duplicate submit при повторе.

---

## 4.17 Placeholders

1. `ProgramQuestionnaire`.
2. `TrainingTemplatesPage` (основной контент templates/programs).
3. `TrainingTemplateBuilderPage`.
4. `TrainingExerciseBuilderPage`.
5. Большая часть Profile sections (list items) без action/persistence.

---

## 4.18 Runtime mismatches

1. Подтверждённый `RUNTIME MISMATCH`: deployed backend не содержит media/storage модули из repository.
2. Для templates: repository содержит migration/table model (`5918`), но runtime user-flow templates отсутствует (нет deployed API flow).

---

## 4.19 Documentation conflicts (в scope 8 модулей)

1. `docs/modules/Training/TRAINING_TEMPLATES_SPEC.md` и `docs/modules/Training/TRAINING.md` описывают рабочий templates flow (создание/список/копирование/использование), но фактический код pass-1 показывает placeholder UI без templates service/API persistence.
2. `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` перечисляет `training_templates*` как часть сущностей, но в фактическом runtime flow templates API отсутствует.
3. Для Profile документ прямо помечает раздел как частично реализованный, что согласуется с кодом (конфликта нет).

---

## 4.20 NOT VERIFIED (этот проход)

1. Полная production DB introspection по templates таблицам в этом проходе не переисполнена повторно из-за технических ограничений SSH command quoting; использованы ранее подтверждённые forensic evidence Этапа 1.
2. Реальный end-user runtime happy-path для auth/training с валидной production session cookie не воспроизводился в этом проходе (ограничение: без mutating и без интерактивной авторизации в production).
3. Email delivery success-rate runtime (auth/leads) не проверялась активными отправками (ограничение non-mutating).

---

## 4.21 Stage 4 Pass-1 итог

Проверенные модули:

1. Auth
2. Profile
3. Home / Dashboard
4. Questionnaire
5. Training History
6. Training Create / New Workout
7. Training Templates
8. Exercises

Проверенные пользовательские flows:

1. Auth: registration/login/session restore/logout/password recovery/email verification
2. Profile: view/logout + проверка отсутствия edit/save persistence
3. Home: session-based render + отсутствие dashboard API chain
4. Questionnaire: coaching submit + local draft restore + program placeholder
5. Training History: list/open/delete
6. Training Create/New: create/update editor flow
7. Training Templates: templates list/create/use path validation
8. Exercises: list/filter/search + create placeholder validation

Общий статус pass-1:

- `Auth`: mostly working, registration has side-effect gap when email fails.
- `Training History/Create/Exercises`: рабочие core-чейн части подтверждены, но есть частичные/placeholder зоны.
- `Profile/Home/Templates/ProgramQuestionnaire`: неполные или placeholder/front-only участки с разрывами persistence.

СТАТУС ЭТАПА 4 (PASS 1, только этот блок): ОСТАНОВЛЕНО ПОСЛЕ АНАЛИЗА

Следующий блок Этапа 4 не начинался.

---

## 4.22 ЭТАП 4 PASS 2 — REPORTS / MEDIA / PROGRAMS / NUTRITION / CHAT / NOTIFICATIONS / TRAINER-CLIENT / PWA

Рамки PASS 2:

- Только forensic read-only аудит.
- Без изменений frontend/backend/API/DB/S3/config/infra.
- Никаких mutating production действий.

### UPDATE TO PREVIOUS PASS

Новых фактов, требующих пересмотра классификаций PASS 1 (Auth/Profile/Home/Questionnaire/Training History/Training Create/Training Templates/Exercises), не обнаружено.

Дополнительное усиление evidence:

- Production runtime по media подтверждён повторно: `GET /api/media/:id` возвращает `404` (route отсутствует в deployed runtime), при том что `GET /api/training/workouts -> 401` и `GET /health -> 200`.

### 4.22.1 Runtime read-only probes (PASS 2)

- `GET /health -> 200`
- `GET /api/training/workouts -> 401` (контрольная точка: training runtime существует)
- `GET /api/media/upload -> 404`
- `OPTIONS /api/media/upload -> 400`
- `GET /api/media/00000000-0000-0000-0000-000000000000 -> 404`
- `GET /api/leads -> 404`
- `OPTIONS /api/leads -> 400`
- `GET /api/report -> 404`
- `GET /api/chat -> 404`
- `GET /api/nutrition -> 404`
- `GET /api/notifications -> 404`
- `GET https://stubbornram.ru/manifest.json -> 200`
- `GET https://stubbornram.ru/sw.js -> 404`

Read-only SSH (production runtime composition):

- Deployed register-chain: `authRoutes`, `leadsRoutes`, `trainingRoutes`.
- Deployed modules dir: `auth`, `db`, `email`, `leads`, `training`.
- `media` и `storage` отсутствуют в deployed runtime path.

---

## 4.23 MODULE — REPORTS

### Фактически обнаруженный user flow

Route/UI:

- `/app/report` -> `src/modules/report/ReportPlaceholderPage.jsx`

Flow chain (реально существующий):

- UI: кнопки upload/delete в `ReportPlaceholderPage`
- Component/Page: `uploadMediaFile(file)`, `deleteMediaFile(mediaId)`
- Service: отсутствует (обход service-слоя)
- API Client: отсутствует (обход `apiClient`)
- HTTP: прямой `fetch` на hardcoded base
  - `POST http://127.0.0.1:3000/api/media/upload`
  - `PUT <signed uploadUrl>`
  - `POST http://127.0.0.1:3000/api/media/:id/complete`
  - `GET http://127.0.0.1:3000/api/media/:id`
  - `DELETE http://127.0.0.1:3000/api/media/:id`
- Backend/Auth/DB: только если локально доступен backend/media routes
  - expected repo route layer: `backend/modules/media/media.routes.js`
  - expected auth: cookie-session (`getAuthenticatedUser`)
  - expected DB: `media`
- Response -> UI: локальный state `photos/video/audioMedia`

Что не обнаружено:

- Нет `reportService`.
- Нет report-specific API (`/api/reports*`).
- Нет report submit/review lifecycle (`DRAFT/SUBMITTED/REVIEWED`) в коде.
- Нет report persistence table/route в backend migrations/modules.
- Нет `media_links` binding к `report` entity.
- Нет server restore flow после reload для report draft.

Вывод:

- Текущая страница отчёта — media upload test shell с bypass `apiClient` и hardcoded localhost endpoint.
- Это не полноценный production report flow.

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`, `RUNTIME MISMATCH`, `DOC CONFLICT`, `PARTIAL`

---

## 4.24 MODULE — MEDIA

### Repository-level flow (кодовая реализация)

UI/Components:

- `src/modules/media/components/PhotoUploader.jsx`
- `src/modules/report/ReportPlaceholderPage.jsx` (прямой fetch-вариант)
- `src/modules/photos/PhotosPlaceholderPage.jsx` (встраивает `PhotoUploader`)

Service/API client chain:

- `src/modules/media/services/mediaService.js`
  - `createMediaUpload` -> `POST /media/upload`
  - `completeMediaUpload` -> `POST /media/:id/complete`
  - `getMedia` -> `GET /media/:id`
  - `deleteMedia` -> `DELETE /media/:id`
- transport через `src/shared/lib/apiClient.js` (`credentials: include`, env base)
- upload binary выполняется прямым `fetch(uploadUrl, PUT)` к storage signed URL

Backend/Auth/Logic:

- `backend/modules/media/media.routes.js`
  - upload-init: validation + media row `UPLOADING` + signed upload URL
  - complete: `headObject` check size/content-type -> `READY`/`FAILED`
  - get: signed download URL для `READY`
  - delete: storage delete + DB delete
- auth: `getAuthenticatedUser` для всех media routes
- ownership: `owner_id = authUser.userId`

DB/S3:

- tables: `media`, `media_links` (`1788859125919_media.js`)
- status constraint: `1788859125920_media_status.js`
- storage: `backend/modules/storage/storage.service.js`

Связь с training/report:

- training: есть через `media_links` в `PUT /api/training/sets/:setId/materials`
- report: report-specific binding отсутствует (нет report entity/routes)

Reload behavior:

- `PhotoUploader`: хранит `items` только в component state, auto-reload списка после reload не реализован
- `ReportPlaceholderPage`: `photos/video/audioMedia/comment` local state only

Object URL lifecycle:

- `ReportPlaceholderPage` корректно делает `URL.revokeObjectURL` для voice blob в cleanup/reset
- `PhotoUploader` использует `downloadUrl` (signed URL), object URL не создаёт

### Deployed runtime

- Production runtime не содержит `mediaRoutes` и `storagePlugin`.
- Runtime probes показывают отсутствие media API route-ов (`404`).

### Классификация

- Repository: `VERIFIED` (media layer реализован в коде)
- Deployed runtime: `RUNTIME MISMATCH` (feature отсутствует в runtime)

СТАТУС МОДУЛЯ: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `VERIFIED` (repo), `RUNTIME MISMATCH` (prod), `PARTIAL`

---

## 4.25 MODULE — PROGRAMS

UI/Routes:

- Route: `/app/training/programs`
- Page: `src/modules/training/screens/TrainingProgramsPage.jsx`
- Entry points: buttons в `TrainingTemplatesPage`

Фактическая цепочка:

- UI -> `TrainingProgramsPage` render
- Service layer: отсутствует
- API client calls: отсутствуют
- Backend routes: отсутствуют (`/api/program*` не найден)
- DB tables for programs: отсутствуют в migrations
- Permissions/assignment model: отсутствует в runtime-коде

Вывод:

- Programs представлены UI shell без persistence chain.

СТАТУС МОДУЛЯ: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`, `DOC CONFLICT`

---

## 4.26 MODULE — NUTRITION

UI/Route:

- `/app/nutrition` -> `src/modules/nutrition/NutritionPlaceholderPage.jsx`

Фактическая цепочка:

- UI -> placeholder page
- Service: отсутствует
- API client calls: отсутствуют
- Backend routes `/api/nutrition*`: отсутствуют
- DB nutrition tables в migrations: отсутствуют

Вывод:

- Nutrition модуль на текущем этапе не реализован как data flow.

СТАТУС МОДУЛЯ: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`

---

## 4.27 MODULE — CHAT / COMMUNICATION

### Chat

UI/Route:

- `/app/chat` -> `src/modules/chat/ChatPage.jsx`

Цепочка:

- UI -> static shell
- Service: отсутствует (`chatService` не найден в src)
- API client calls: отсутствуют
- Backend chat routes: отсутствуют (`/api/chat*` не найден)
- DB chat tables в migrations: отсутствуют
- WebSocket/SSE/polling: отсутствуют

### Communication-related pages

- `/app/comments` -> `src/modules/comments/CommentsPage.jsx` (placeholder)

Вывод:

- Коммуникационный слой в runtime-коде ограничен UI-заглушками.

СТАТУС МОДУЛЯ: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`, `DOC CONFLICT`

---

## 4.28 MODULE — NOTIFICATIONS

Фактическое состояние:

- UI фрагмент: `src/modules/home/components/NotificationSection.jsx`
- Данные: hardcoded массив `notifications` (3 карточки)
- Service/API/backend/db/push: не обнаружены
- Runtime `/api/notifications -> 404`
- Browser Notification API/PushManager registration: не обнаружены

Вывод:

- Это in-home static navigation cards, не полноценная notification system.

СТАТУС МОДУЛЯ: РАСХОЖДЕНИЕ
КЛАССИФИКАЦИЯ: `PLACEHOLDER`, `FRONTEND-ONLY`

---

## 4.29 MODULE — TRAINER / CLIENT RELATIONSHIP

Проверка entities/API/DB/guards:

- Backend tables `coach_client_relationships`/аналог: отсутствуют в migrations.
- `users` role field для RBAC: отсутствует в текущей схеме.
- Backend routes по relationship/invitation/assignment: отсутствуют.
- Frontend flows для manage relationship: отсутствуют.

Что фактически есть вместо RBAC:

- ownership-based checks в реализованных модулях (`user_id`, `owner_id`).
- auth-only guard в frontend (`AuthGuard`).

Согласование с Этапом 2:

- Вывод `ROLE-BASED TRAINER/CLIENT AUTHORIZATION: NOT IMPLEMENTED` подтверждён, не переопределяется.

СТАТУС МОДУЛЯ: ПРОВЕРЕНО
КЛАССИФИКАЦИЯ: `NOT IMPLEMENTED` (фактический статус), `DOC CONFLICT` (концепт vs runtime)

---

## 4.30 MODULE — PWA / APPLICATION SHELL / CROSS-MODULE FLOWS

PWA/app shell evidence:

- `index.html` содержит `<link rel="manifest" href="/manifest.json">`
- `public/manifest.json` присутствует (`display: standalone`, icons)
- runtime `GET /manifest.json -> 200`
- service worker registration в `src` не найден
- runtime `GET /sw.js -> 404`
- `vite.config.js` не содержит PWA plugin

Routing/reload behavior:

- `public/404.html` делает redirect в `/?redirect=...`
- `index.html` script восстанавливает deep-link path через query param

Protected routes after reload:

- `AuthProvider` вызывает `getSession()` на старте
- `AuthGuard` блокирует protected routes без session

Offline/API behavior:

- `apiClient` возвращает `NETWORK_ERROR` на fetch exception
- модули, использующие `apiClient`, имеют базовый network fallback
- `ReportPlaceholderPage` обходит `apiClient`, поэтому общий fallback/shape там не унифицирован

Вывод:

- Есть PWA shell-элементы (manifest/meta/icons), но полноценного offline/PWA runtime слоя (SW caching/update/push) не обнаружено.

СТАТУС МОДУЛЯ: ПРОВЕРЕНО ЧАСТИЧНО
КЛАССИФИКАЦИЯ: `PARTIAL`, `PLACEHOLDER`

---

## 4.31 Frontend ↔ Backend parity matrix (PASS 2)

### Frontend calls (PASS 2 scope)

1. `ReportPlaceholderPage` (direct fetch, bypass `apiClient`, hardcoded localhost)

- `POST /media/upload` -> repo backend route есть, deployed runtime route отсутствует
- `POST /media/:id/complete` -> repo есть, runtime отсутствует
- `GET /media/:id` -> repo есть, runtime отсутствует
- `DELETE /media/:id` -> repo есть, runtime отсутствует

2. `mediaService` + `PhotoUploader`

- `POST /media/upload` -> repo есть, runtime отсутствует
- `POST /media/:id/complete` -> repo есть, runtime отсутствует
- `GET /media/:id` -> repo есть, runtime отсутствует
- `DELETE /media/:id` -> repo есть, runtime отсутствует

3. Programs/Nutrition/Chat/Notifications/Trainer-Client frontend

- API calls отсутствуют

### Backend endpoints in PASS 2 scope

- Repo-level присутствуют только media endpoints:
  - `POST /api/media/upload`
  - `POST /api/media/:id/complete`
  - `GET /api/media/:id`
  - `DELETE /api/media/:id`
- `report/chat/nutrition/notifications/programs/trainer-client` backend endpoints отсутствуют

### Parity classification

- `media` (repo): `VERIFIED`
- `media` (deployed runtime): `RUNTIME MISMATCH`
- `report` flow: `FRONTEND-ONLY` + `RUNTIME MISMATCH` (в production)
- `programs`: `FRONTEND-ONLY`
- `nutrition`: `FRONTEND-ONLY`
- `chat/communication`: `FRONTEND-ONLY`
- `notifications`: `FRONTEND-ONLY`
- `trainer/client relationship`: `NOT IMPLEMENTED`

### Backend-only endpoints (PASS 2 scope)

- Явных backend-only endpoint-ов в PASS 2 scope не выявлено.
  Media endpoints имеют frontend consumers, но runtime недоступны из-за deployment mismatch.

### Frontend calls without backend route

- В repository для media-вызовов route-ы есть.
- В deployed runtime эти route-ы отсутствуют (категория `RUNTIME MISMATCH`).
- Для reports/programs/nutrition/chat/notifications специализированные frontend API calls практически отсутствуют (UI placeholders).

---

## 4.32 Обязательная flow-таблица PASS 2

| Модуль                      | Flow                             | UI                                                                   | Service                        | API Client                                | Backend                                     | Auth                                        | Authorization               | DB/S3                                        | Persistence                           | Response -> UI                  | Статус                                                        |
| --------------------------- | -------------------------------- | -------------------------------------------------------------------- | ------------------------------ | ----------------------------------------- | ------------------------------------------- | ------------------------------------------- | --------------------------- | -------------------------------------------- | ------------------------------------- | ------------------------------- | ------------------------------------------------------------- |
| Reports                     | Media test upload in report page | `ReportPlaceholderPage`                                              | отсутствует (inline functions) | отсутствует (direct `fetch`)              | repo: `/api/media/*`; runtime: отсутствует  | expected cookie auth (repo)                 | expected owner-based (repo) | repo: `media` + signed URL S3                | report entity persistence отсутствует | local component state           | `PLACEHOLDER`, `FRONTEND-ONLY`, `RUNTIME MISMATCH`, `PARTIAL` |
| Reports                     | Report submit/review lifecycle   | route есть (`/app/report`)                                           | нет                            | нет                                       | нет `/api/reports*`                         | n/a                                         | n/a                         | нет report tables in migrations              | нет                                   | n/a                             | `NOT IMPLEMENTED`, `DOC CONFLICT`                             |
| Media                       | Photo upload via mediaService    | `PhotoUploader` / `PhotosPlaceholderPage`                            | `mediaService.uploadMediaFile` | `request("/media/*")` + direct signed PUT | repo media routes есть; runtime отсутствуют | repo auth required                          | repo `owner_id` checks      | `media`, `media_links`, S3 signed URL        | есть в repo, нет в deployed runtime   | items state update              | `VERIFIED` (repo), `RUNTIME MISMATCH` (runtime)               |
| Media                       | Training media materials read    | `TrainingExerciseCard`                                               | `getSetMaterials`              | `GET /training/sets/:setId/materials`     | `GET /api/training/sets/:setId/materials`   | required                                    | ownership via joins         | `training_set_notes`, `media_links`, `media` | read-only persistence chain есть      | materials badges/state          | `VERIFIED`                                                    |
| Programs                    | Open programs page               | `TrainingProgramsPage`                                               | нет                            | нет                                       | нет `/api/program*`                         | route protected by AuthGuard                | n/a                         | нет program tables                           | нет                                   | static shell                    | `PLACEHOLDER`, `FRONTEND-ONLY`                                |
| Nutrition                   | Open nutrition page              | `NutritionPlaceholderPage`                                           | нет                            | нет                                       | нет `/api/nutrition*`                       | route protected by AuthGuard                | n/a                         | нет nutrition tables                         | нет                                   | static shell                    | `PLACEHOLDER`, `FRONTEND-ONLY`                                |
| Chat/Communication          | Open chat                        | `ChatPage`                                                           | нет                            | нет                                       | нет `/api/chat*`                            | route protected by AuthGuard                | n/a                         | нет chat tables in migrations                | нет                                   | static shell                    | `PLACEHOLDER`, `FRONTEND-ONLY`, `DOC CONFLICT`                |
| Chat/Communication          | Open comments                    | `CommentsPage`                                                       | нет                            | нет                                       | нет comments API                            | route protected by AuthGuard                | n/a                         | нет                                          | нет                                   | static shell                    | `PLACEHOLDER`, `FRONTEND-ONLY`                                |
| Notifications               | Home notification cards          | `NotificationSection`                                                | нет                            | нет                                       | нет `/api/notifications*`                   | indirectly under app auth                   | n/a                         | нет notification tables                      | нет                                   | navigate to module routes       | `PLACEHOLDER`, `FRONTEND-ONLY`                                |
| Trainer/Client relationship | Relationship lifecycle           | UI/flows не обнаружены                                               | нет                            | нет                                       | нет relationship routes                     | n/a                                         | n/a                         | нет relationship tables                      | нет                                   | n/a                             | `NOT IMPLEMENTED`, `DOC CONFLICT`                             |
| PWA/App shell               | Install shell + routing recovery | `index.html`, `public/manifest.json`, `public/404.html`, `AppLayout` | n/a                            | n/a                                       | n/a                                         | auth restore via `AuthProvider`/`AuthGuard` | n/a                         | n/a                                          | partial (shell only)                  | deep-link restore + route guard | `PARTIAL`                                                     |

---

## 4.33 Breakpoints (PASS 2)

1. Reports: `UI -> Service` обрыв

- файл: `src/modules/report/ReportPlaceholderPage.jsx`
- причина: отдельный `reportService` отсутствует.

2. Reports: `Service/API Client -> HTTP` bypass

- файл: `src/modules/report/ReportPlaceholderPage.jsx`
- причина: прямой `fetch` на hardcoded `http://127.0.0.1:3000/api`, обход `src/shared/lib/apiClient.js`.

3. Reports: `Backend -> DB` report persistence обрыв

- backend routes `/api/reports*` отсутствуют;
- migrations report tables отсутствуют.

4. Media (production): `Repository -> Production` обрыв

- repo: `backend/server.js` регистрирует `mediaRoutes` и `storagePlugin`;
- deployed runtime: register-chain включает только `auth/leads/training`.

5. Programs: `UI -> Service` обрыв

- файл: `src/modules/training/screens/TrainingProgramsPage.jsx`
- service/API/backend отсутствуют.

6. Nutrition: `UI -> Service` обрыв

- файл: `src/modules/nutrition/NutritionPlaceholderPage.jsx`
- service/API/backend отсутствуют.

7. Chat: `UI -> Service` обрыв

- файл: `src/modules/chat/ChatPage.jsx`
- `chatService`/backend chat routes отсутствуют.

8. Notifications: `UI -> Data source` обрыв

- файл: `src/modules/home/components/NotificationSection.jsx`
- notifications hardcoded, backend/delivery отсутствуют.

9. Trainer/Client subsystem: `Concept -> Runtime implementation` обрыв

- docs описывают relationship/permissions;
- runtime entities/routes/guards не реализованы.

10. PWA offline: `Manifest -> Runtime SW/offline` обрыв

- manifest есть;
- service worker registration и `sw.js` отсутствуют.

---

## 4.34 4.xx Classification by module

| Module                        | Classification                                                                | Evidence                                                                                                   | Main breakpoint                                                           |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Reports                       | `PLACEHOLDER`, `FRONTEND-ONLY`, `RUNTIME MISMATCH`, `DOC CONFLICT`, `PARTIAL` | `ReportPlaceholderPage.jsx`, отсутствие report API/tables, runtime `GET /api/report -> 404`                | report lifecycle persistence отсутствует; media calls hardcoded localhost |
| Media                         | `VERIFIED` (repo), `RUNTIME MISMATCH` (prod), `PARTIAL`                       | `mediaService.js`, `media.routes.js`, `storage.service.js`, runtime media probes 404, SSH deployed modules | deployed runtime не содержит media/storage routes                         |
| Programs                      | `PLACEHOLDER`, `FRONTEND-ONLY`, `DOC CONFLICT`                                | `TrainingProgramsPage.jsx`, нет services/routes/tables                                                     | UI shell без data chain                                                   |
| Nutrition                     | `PLACEHOLDER`, `FRONTEND-ONLY`                                                | `NutritionPlaceholderPage.jsx`, нет services/routes/tables                                                 | модуль не реализован beyond page placeholder                              |
| Chat / Communication          | `PLACEHOLDER`, `FRONTEND-ONLY`, `DOC CONFLICT`                                | `ChatPage.jsx`, `CommentsPage.jsx`, нет chat backend/schema                                                | нет service/API/realtime/persistence                                      |
| Notifications                 | `PLACEHOLDER`, `FRONTEND-ONLY`                                                | `NotificationSection.jsx` hardcoded cards, `/api/notifications -> 404`                                     | нет notification generation/delivery/persistence                          |
| Trainer / Client relationship | `NOT IMPLEMENTED`, `DOC CONFLICT`                                             | отсутствие relationship tables/routes/role model в runtime, docs концепт присутствует                      | отсутствует subsystem implementation                                      |
| PWA / application shell       | `PARTIAL`, `PLACEHOLDER`                                                      | `manifest.json` present, `sw.js` missing, no SW registration, `404.html` redirect strategy                 | offline/update/push layer отсутствует                                     |

### Persistence gaps

1. Reports: нет canonical report persistence (`reports/report_feedback` отсутствуют).
2. Reports: нет связи report -> media_links.
3. Programs: нет program persistence tables/routes/services.
4. Nutrition: нет persistence chain.
5. Chat: нет message/conversation persistence chain.
6. Notifications: нет notification persistence/generation/delivery.
7. Trainer/Client: нет relationship persistence model в runtime.
8. Media UI: нет общего user media restore list flow после reload (component-local state).

### Placeholders

1. `src/modules/report/ReportPlaceholderPage.jsx`
2. `src/modules/training/screens/TrainingProgramsPage.jsx`
3. `src/modules/nutrition/NutritionPlaceholderPage.jsx`
4. `src/modules/chat/ChatPage.jsx`
5. `src/modules/comments/CommentsPage.jsx`
6. `src/modules/home/components/NotificationSection.jsx` (static cards only)

### Runtime mismatches

1. Media/storage: реализованы в repository, отсутствуют в deployed runtime.
2. Report media flow в production фактически недоступен:

- page использует localhost API base;
- deployed runtime не содержит media routes.

### Documentation conflicts

1. `docs/modules/REPORT.md` описывает полноценный weekly report lifecycle и persistence, но runtime-код содержит только placeholder media-test page.
2. `docs/modules/CHAT.md` описывает полноценный chat subsystem, но runtime-код содержит placeholder page.
3. `docs/modules/COACH_CLIENT_RELATIONSHIP.md` и related architecture docs описывают relationship/permissions subsystem, но runtime implementation отсутствует.
4. `docs/SERVER/SERVER_STATE.md` в части media/signed URLs противоречит repository code (media layer реализован), но в то же время ближе к deployed runtime (где media действительно отсутствует).

### Backend-only endpoints

1. В PASS 2 scope явных backend-only endpoint-ов не выявлено.
2. Media endpoints имеют frontend consumers, но недоступны в deployed runtime из-за mismatch.

### Frontend-only flows

1. Programs page flow.
2. Nutrition page flow.
3. Chat/comments page flows.
4. Notification cards flow.
5. Report page comment/draft UI without report backend persistence.

### NOT VERIFIED

1. Полный authenticated production happy-path для media/report (безопасно не воспроизводился из-за запрета mutating действий и отсутствия валидной сессии для активного UI testing).
2. Installability/offline UX в реальном браузерном сценарии (A2HS prompts, update lifecycle) не проверялись интерактивно в этом проходе.
3. Report/media long-term signed URL expiry behavior в production runtime не проверялся активными upload/download сценариями.

---

## 4.35 PASS 2 итог

Проверены модули PASS 2:

1. Reports
2. Media
3. Programs
4. Nutrition
5. Chat / Communication
6. Notifications
7. Trainer / Client relationship
8. PWA / application shell / cross-module flows

Итог PASS 2:

- Полноценно подтверждённый end-to-end data flow в этой группе обнаружен только для media на repository-уровне, но он не подтверждается deployed runtime.
- Остальные PASS 2 модули в текущем коде представлены преимущественно placeholder/front-only состоянием или концептом в документации.

ЭТАП 4 PASS 2: ЗАВЕРШЁН (ТОЛЬКО FORENSIC READ-ONLY)

Следующий блок (PASS 3 / ЭТАП 5) не начинался.

---

## 4.36 ЭТАП 4 PASS 3 — CROSS-STAGE CONSISTENCY CHECK

Рамки PASS 3:

- Только forensic read-only consistency check.
- Без изменения frontend/backend/API/DB/migrations/S3/nginx/PM2/env/deploy.
- Единственный изменяемый файл: этот audit.
- Цель: согласовать Stage 1 + Stage 2 + Stage 3 + Stage 4 (PASS 1/2) в единый непротиворечивый factual слой.

### 4.36.1 Проверка темы A — Media / S3 (межэтапное согласование)

Разделение уровней проверки (обязательно):

1. Repository implementation

- `backend/modules/media/media.routes.js` + `backend/modules/storage/storage.service.js` + `src/modules/media/services/mediaService.js` подтверждают реализацию media/signed-URL цепочки.
- Статус: `VERIFIED (repository)`.

2. Production route availability

- Runtime probes и read-only SSH показывают, что deployed runtime не содержит `mediaRoutes/storagePlugin`; media endpoints в production недоступны (`404`).
- Статус: `RUNTIME MISMATCH (production)`.

3. S3 control-plane verification

- Bucket-level control-plane attributes (policy/ACL/public access/lifecycle/versioning/CORS/encryption) не проверены authenticated runtime способом.
- Статус: `NOT VERIFIED`.

4. Authenticated end-to-end media flow

- Полный production happy-path upload/download с валидной сессией и mutating-действиями в этом forensic проходе не воспроизводился.
- Статус: `NOT VERIFIED`.

Consistency verdict:

- Утверждение «media полностью VERIFIED в production» не используется как unified статус.
- Unified формулировка: `VERIFIED (repository) + RUNTIME MISMATCH (production) + S3 control-plane NOT VERIFIED + authenticated E2E NOT VERIFIED`.

### 4.36.2 Проверка темы B — Training / Templates / Materials

Согласованные факты:

- History/Create/Exercises read-path и workout CRUD подтверждены как рабочие по training routes.
- `PUT /api/training/sets/:setId/materials` backend endpoint существует.
- Явный frontend write consumer для materials PUT в проверенных flow не найден (известный parity gap).
- Local migration `1788859125918_training_templates.js` существует.
- Production `pgmigrations` не содержит `5918`; tables `training_templates*` в production отсутствуют.
- Production содержит `5919`, `5920`, `5921`.

Consistency verdict:

- Templates не классифицируются как production-backed feature.
- Unified статус templates: `PLACEHOLDER + FRONTEND-ONLY + RUNTIME MISMATCH + DOC CONFLICT`.

### 4.36.3 Проверка темы C — Auth / Authorization

Согласованные факты:

- Registration/login/session/logout/password reset/email verification flows подтверждены.
- Ownership checks подтверждены на training/media routes.
- `ROLE-BASED TRAINER/CLIENT AUTHORIZATION: NOT IMPLEMENTED` подтверждён и не ослаблен PASS 1/PASS 2.
- `logout all devices` как отдельный endpoint/UI отсутствует.
- Session cleanup job отсутствует.
- Отсутствие automated auth/session tests зафиксировано отдельно и не подменяет runtime/code-level verification.

Consistency verdict:

- Unified статус auth/session security: `VERIFIED core flows + PARTIAL (security/reliability gaps)`.
- Unified статус RBAC: `NOT IMPLEMENTED`.

### 4.36.4 Проверка темы D — Frontend API architecture

Базовое правило:

- Каноническая цепочка: `Component -> Service -> apiClient -> Backend`.

Согласованные exceptions:

1. `src/modules/report/ReportPlaceholderPage.jsx`

- hardcoded localhost API base.
- direct backend fetch.
- Классификация: архитектурный bypass (`PLACEHOLDER`, `FRONTEND-ONLY`, `RUNTIME MISMATCH`).

2. `src/modules/media/services/mediaService.js`

- direct `PUT` на signed S3 URL.
- Это ожидаемая часть signed-URL object upload и НЕ эквивалентно direct backend fetch bypass.
- Классификация: допустимый transport pattern в рамках media architecture.

Consistency verdict:

- Audit явно различает «некорректный backend bypass» (report page) и «валидный signed storage PUT» (mediaService).

### 4.36.5 Проверка темы E — Production runtime consistency

Согласованные факты:

- Production backend process: PM2 `stubbornram-backend`, script `/opt/stubbornram/backend/server/server.js`.
- Nginx proxy `api.stubbornram.ru -> 127.0.0.1:3000`.
- Deployed modules: `auth`, `db`, `email`, `leads`, `training`.
- Media/storage modules в deployed path отсутствуют.

Unified runtime conclusion:

- `repository server.js != deployed server.js` по фактическому route-composition (repo регистрирует media/storage, deployed runtime — нет).
- Media mismatch трактуется как подтверждённый runtime факт, а не theoretical risk.

### 4.36.6 Проверка темы F — Database cross-stage consistency

Согласованные факты:

- Local migrations: `5911..5921` существуют.
- Production `pgmigrations`: `5911,5912,5913,5914,5915,5916,5917,5919,5920,5921`.
- `5918` отсутствует production.
- Production tables по auth/training/media подтверждены.
- `training_templates*` production tables отсутствуют.

Unified DB conclusion:

- Нет межэтапного конфликта по `5918`/templates: более поздние PASS не переопределяют этот факт.

---

## 4.37 Status consistency matrix (Stage 1–4)

| Topic              | Stage 1                                        | Stage 2          | Stage 3                      | Stage 4                      | Unified status                                                                | Conflict? |
| ------------------ | ---------------------------------------------- | ---------------- | ---------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | --------- |
| Auth               | VERIFIED/PARTIAL                               | VERIFIED         | PARTIAL                      | VERIFIED/PARTIAL             | `VERIFIED core + PARTIAL security gaps`                                       | No        |
| Sessions           | VERIFIED                                       | VERIFIED         | PARTIAL                      | VERIFIED                     | `VERIFIED core + NOT IMPLEMENTED (all-devices/session-list) + RISK (cleanup)` | No        |
| RBAC               | PARTIAL                                        | NOT IMPLEMENTED  | NOT IMPLEMENTED              | NOT IMPLEMENTED              | `NOT IMPLEMENTED`                                                             | No        |
| Training           | VERIFIED                                       | VERIFIED         | PARTIAL                      | VERIFIED/PARTIAL             | `VERIFIED core + PARTIAL edge validation/reliability`                         | No        |
| Training Materials | PARTIAL                                        | VERIFIED         | PARTIAL                      | VERIFIED + gap               | `VERIFIED read/write backend + frontend write gap`                            | No        |
| Exercises          | VERIFIED                                       | PARTIAL          | PARTIAL                      | PARTIAL                      | `PARTIAL (read verified, CRUD not implemented)`                               | No        |
| Templates          | PARTIAL                                        | n/a              | n/a                          | RUNTIME MISMATCH/PLACEHOLDER | `PLACEHOLDER + FRONTEND-ONLY + RUNTIME MISMATCH + DOC CONFLICT`               | No        |
| Media repository   | VERIFIED                                       | VERIFIED         | PARTIAL(code-level verified) | VERIFIED(repo)               | `VERIFIED (repository)`                                                       | No        |
| Media production   | PARTIAL (есть ранняя конфликтная формулировка) | n/a              | RUNTIME MISMATCH             | RUNTIME MISMATCH             | `RUNTIME MISMATCH (production)`                                               | Yes       |
| S3 control plane   | NOT VERIFIED                                   | n/a              | NOT VERIFIED                 | NOT VERIFIED                 | `NOT VERIFIED`                                                                | No        |
| Reports            | n/a                                            | n/a              | n/a                          | PLACEHOLDER                  | `PLACEHOLDER + FRONTEND-ONLY + DOC CONFLICT + RUNTIME MISMATCH`               | No        |
| Programs           | n/a                                            | n/a              | n/a                          | PLACEHOLDER                  | `PLACEHOLDER + FRONTEND-ONLY`                                                 | No        |
| Nutrition          | n/a                                            | n/a              | n/a                          | PLACEHOLDER                  | `PLACEHOLDER + FRONTEND-ONLY`                                                 | No        |
| Chat               | n/a                                            | n/a              | n/a                          | PLACEHOLDER                  | `PLACEHOLDER + FRONTEND-ONLY + DOC CONFLICT`                                  | No        |
| Notifications      | n/a                                            | n/a              | n/a                          | PLACEHOLDER                  | `PLACEHOLDER + FRONTEND-ONLY`                                                 | No        |
| Trainer/Client     | PARTIAL                                        | NOT IMPLEMENTED  | NOT IMPLEMENTED              | NOT IMPLEMENTED              | `NOT IMPLEMENTED + DOC CONFLICT`                                              | No        |
| PWA                | PARTIAL                                        | n/a              | n/a                          | PARTIAL                      | `PARTIAL (manifest есть, SW/offline layer отсутствует)`                       | No        |
| API architecture   | PARTIAL                                        | VERIFIED/PARTIAL | PARTIAL                      | PARTIAL                      | `PARTIAL with explicit exceptions`                                            | No        |
| PostgreSQL         | VERIFIED/PARTIAL                               | VERIFIED         | PARTIAL                      | PARTIAL                      | `VERIFIED schema core + template migration divergence`                        | No        |
| Production runtime | PARTIAL                                        | n/a              | PARTIAL                      | RUNTIME MISMATCH (media)     | `PARTIAL overall + CONFIRMED media runtime mismatch`                          | No        |

---

## 4.38 Обнаруженные противоречия и unified resolution

### CONTRADICTION 1 — Media production availability

1. Первое утверждение:

- Stage 1, раздел `6) S3 / MEDIA INFRASTRUCTURE`, подпункт `PRODUCTION INFRA: ПРОВЕРЕНО ЧАСТИЧНО`:
  формулировка «Production API возвращает media workflow endpoint-ы».

2. Второе утверждение:

- Stage 3 `3.9 Media / S3 Security` + Stage 4 PASS 1/2 runtime probes + read-only SSH:
  `POST/GET /api/media*` в production недоступны (`404`), deployed runtime не содержит media/storage registration.

3. Более сильное evidence:

- Stage 3/4 evidence сильнее: прямые runtime probes + deployed runtime composition inspection.

4. Unified status:

- `Media production = RUNTIME MISMATCH`.
- Ранняя формулировка Stage 1 трактуется как устаревшая/менее точная относительно более позднего и более сильного evidence.

Примечание по scope-конфликтам:

- `VERIFIED (repository)` vs `NOT VERIFIED/RUNTIME MISMATCH (production)` не считается логической ошибкой, если scope явно разделён.

---

## 4.39 Lost findings check (PASS 3)

Проверка сохранности обязательных findings:

1. S3 control-plane NOT VERIFIED — сохранено.
2. Media runtime mismatch — сохранено.
3. Templates migration `5918` absent in production — сохранено.
4. Dashboard-specific API отсутствует — сохранено.
5. Profile persistence gap — сохранено.
6. Program questionnaire placeholder — сохранено.
7. Materials frontend write gap (`PUT /training/sets/:setId/materials`) — сохранено.
8. RBAC отсутствует — сохранено.
9. Logout all devices отсутствует — сохранено.
10. Session cleanup отсутствует — сохранено.
11. CSRF protection отсутствует — сохранено.
12. Report hardcoded localhost/direct fetch — сохранено.
13. Report backend отсутствует — сохранено.
14. Chat backend отсутствует — сохранено.
15. Nutrition backend отсутствует — сохранено.
16. Notifications backend отсутствует — сохранено.
17. Trainer/client subsystem отсутствует — сохранено.
18. PWA service worker отсутствует — сохранено.

Итог:

- Потерянных findings не обнаружено.
- Для устранения дублирования и расфокуса findings собраны ниже в consolidated-секции.

---

## 4.40 Unified documentation conflicts (без дублирования)

### Architecture/documentation conflict

1. `docs/SERVER/SERVER_STATE.md`: фиксирует runtime без media/storage modules.
2. Repository backend содержит media/storage implementation.
3. Unified interpretation: `repo implementation` и `deployed runtime state` расходятся, что фиксируется как runtime mismatch, а не взаимоисключение модели.

### Feature maturity conflict

1. `docs/modules/REPORT.md` описывает mature report lifecycle/persistence, фактический runtime-код — placeholder media-test page.
2. `docs/modules/CHAT.md` описывает mature chat subsystem, фактический runtime-код — placeholder.
3. `docs/modules/Training/TRAINING_TEMPLATES_SPEC.md` описывает полноценные templates API/flows, фактический runtime — placeholder/no API.

### Production state conflict

1. `docs/SERVER/SERVER_STATE.md` частично согласован с текущим runtime (media/storage не задеплоены), но конфликтует с repository как source-of-code.
2. Внутри audit устранено противоречие в пользу фактического production evidence (runtime probes + SSH composition).

### Migration/documentation conflict

1. `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` как desired/current narrative не совпадает с фактическим production migration state по templates:
   local `5918` есть, production `5918` отсутствует, при наличии `5919-5921`.

### Security/documentation conflict

1. `docs/MEDIA.md` и security-oriented architecture описывают backend-mediated private-media model как целевую норму.
2. В deployed runtime media routes отсутствуют; часть security assertions по media в production остаётся неисполняемой до выравнивания deployment.

---

## 4.41 Classification consistency check

Проверка правила «не менять классификацию без evidence»:

- Используются только допустимые классы: `VERIFIED`, `PARTIAL`, `FRONTEND-ONLY`, `BACKEND-ONLY`, `RUNTIME MISMATCH`, `PLACEHOLDER`, `NOT VERIFIED`, `DOC CONFLICT`, `NOT IMPLEMENTED`.
- Комбинированные формулировки сохранены там, где нужны:
  - `VERIFIED (repository) + RUNTIME MISMATCH (production)` для media.
  - `PLACEHOLDER + FRONTEND-ONLY` для незавершённых UI-only модулей.
- PASS 3 не переопределяет старые статусы без нового stronger evidence, а только нормализует межэтапную согласованность.

---

## 4.42 CROSS-STAGE CONSISTENCY RESULT

### Consistent findings

1. Auth core flows реализованы и подтверждены.
2. Ownership-based authorization подтверждён как фактическая модель.
3. RBAC trainer/client layer отсутствует (`NOT IMPLEMENTED`).
4. Training core CRUD/read chains подтверждены.
5. Templates production-backed flow отсутствует.
6. Media repository implementation существует.
7. Media production availability отсутствует (runtime mismatch).
8. S3 control-plane verification остаётся NOT VERIFIED.
9. Report/chat/nutrition/notifications/programs — преимущественно placeholder/frontend-only на текущем этапе.
10. PWA shell частично реализован; SW/offline слой отсутствует.

### Resolved documentation contradictions

1. Уточнено разделение `repo state` vs `deployed runtime state` для media/storage.
2. Уточнено, что mature docs по report/chat/templates описывают целевую модель, а не текущую runtime-реализацию.

### Remaining contradictions

1. Историческая формулировка Stage 1 о production media availability противоречит более сильному Stage 3/4 evidence.
2. Считается закрытой как аналитическое противоречие через unified status (`RUNTIME MISMATCH`), но исходная текстовая формулировка Stage 1 сохранена как forensic trace.

### Lost findings restored

1. Потерянных findings не обнаружено.
2. Критичные findings консолидированы в единые списки ниже.

### Unified critical findings

1. `ROLE-BASED TRAINER/CLIENT AUTHORIZATION: NOT IMPLEMENTED`.
2. `logout all devices` endpoint/UI отсутствует.
3. Session cleanup job отсутствует.
4. CSRF-specific protection отсутствует при cookie-auth + `SameSite=none`.
5. Media production runtime mismatch подтверждён.
6. Templates production flow отсутствует (`5918` absent in production).
7. Report page использует hardcoded localhost и direct backend fetch bypass.

### Unified persistence gaps

1. Profile edit/save persistence.
2. Dashboard data persistence/API chain.
3. Program questionnaire persistence.
4. Training templates persistence/runtime API.
5. Exercises user CRUD persistence.
6. Reports canonical persistence + report-media binding.
7. Chat persistence.
8. Nutrition persistence.
9. Notifications persistence.
10. Trainer/client relationship persistence model.
11. Frontend materials write path to existing backend PUT endpoint.

### Unified runtime mismatches

1. Deployed backend module composition не совпадает с repository composition по media/storage.
2. Media/report-related production route availability не совпадает с repository expectations.
3. Templates docs/spec expectations не совпадают с фактическим runtime flow.

### Unified NOT VERIFIED

1. S3 control-plane security attributes bucket.
2. Full authenticated production E2E media/report scenarios в non-mutating режиме.
3. Full interactive PWA installability/update/offline behavior.
4. Полный production chaos/failure testing (по ограничению безопасного forensic режима).

---

ЭТАП 4 PASS 3: ЗАВЕРШЁН (ТОЛЬКО CROSS-STAGE CONSISTENCY CHECK, FORENSIC READ-ONLY)

ЭТАП 5 НЕ НАЧИНАЛСЯ.

---

## 5.1 Stage 5 — Codebase + Structure + Performance

Рамки Stage 5:

- Только forensic read-only audit.
- Без изменений frontend/backend/API/DB/migrations/env/nginx/PM2/production.
- Единственный изменяемый файл: этот audit.

Baseline перед Stage 5:

- `git status --short` зафиксирован до начала (см. секцию Stage 5 git baseline ниже).

### 5.1.1 Frontend structure (фактическое состояние)

Проверено:

- `src/app`, `src/modules`, `src/services`, `src/shared/lib/apiClient.js`, `src/components`, `src/pages`, `src/contexts`, `src/loading`, `src/assets`, `public/manifest.json`, `public/404.html`, `index.html`.

Факты:

1. Единый API layer есть: `src/shared/lib/apiClient.js`.
2. Service-слой используется в auth/leads/training/media/materials.
3. Модульные boundaries частично соблюдены, но есть явный bypass:

- `src/modules/report/ReportPlaceholderPage.jsx` выполняет direct backend `fetch` на hardcoded localhost base.

4. В `src/modules/training/components/cards/TrainingExerciseCard.jsx` (1321 lines) сосредоточен большой объём UI+state logic (high component complexity).
5. Placeholder-модули присутствуют как runtime shell without backend flow: chat/comments/nutrition/activity/weight/analytics/library/program questionnaire/templates/programs.
6. `src/api/` отсутствует как отдельный слой; роль API-слоя выполняет `src/shared/lib/apiClient.js`.
7. Маршруты загружаются eager-import'ами; `React.lazy/Suspense` не обнаружены.

Статус: `PARTIAL`

### 5.1.2 Backend structure (фактическое состояние)

Проверено:

- `backend/server.js`
- `backend/modules/{auth,db,email,leads,training,storage,media}`
- migrations

Факты:

1. Route registration в repository `server.js`:

- `authRoutes`, `leadsRoutes`, `trainingRoutes`, `storagePlugin`, `mediaRoutes`.

2. Явного repository/data-access layer нет: SQL в route handlers.
3. Крупные handlers (особенно `training.routes.js`, 941 lines) совмещают validation + business orchestration + SQL + external storage side-effects.
4. Транзакции (`BEGIN/COMMIT/ROLLBACK`) применяются на критичных multi-step write flow.
5. Validation strategy смешанная:

- auth/leads через Zod schemas;
- training/media преимущественно manual guards.

Статус: `PARTIAL`

### 5.1.3 API architecture inventory (полный access surface)

| Frontend location                                           | Operation                                       | Access path                                         | Expected architecture                          | Actual                                                   | Status                            |
| ----------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- | --------------------------------- |
| `src/services/auth/authService.js`                          | auth/session/register/login/logout/reset/verify | `request("/auth/*")`                                | `Component -> Service -> apiClient -> Backend` | соответствует                                            | `VERIFIED`                        |
| `src/services/leads/leadService.js`                         | lead submit                                     | `request("/leads")`                                 | `Component -> Service -> apiClient -> Backend` | соответствует                                            | `VERIFIED`                        |
| `src/modules/training/services/trainingService.js`          | workouts/exercises CRUD/read                    | `request("/training/*")`                            | `Component -> Service -> apiClient -> Backend` | соответствует                                            | `VERIFIED`                        |
| `src/modules/training/services/trainingMaterialsService.js` | set materials read                              | `request("/training/sets/:setId/materials")`        | `Component -> Service -> apiClient -> Backend` | read-path соответствует; write-path consumer отсутствует | `PARTIAL`                         |
| `src/modules/media/services/mediaService.js`                | media init/complete/get/delete                  | `request("/media/*")`                               | `Component -> Service -> apiClient -> Backend` | соответствует                                            | `VERIFIED`                        |
| `src/modules/media/services/mediaService.js`                | object upload                                   | direct `fetch(uploadUrl, PUT)`                      | signed URL upload exception                    | допустимый direct S3 PUT                                 | `VERIFIED (allowed exception)`    |
| `src/modules/report/ReportPlaceholderPage.jsx`              | media upload/complete/get/delete                | direct `fetch("http://127.0.0.1:3000/api/media/*")` | `Component -> Service -> apiClient -> Backend` | backend API bypass + hardcoded URL                       | `RUNTIME MISMATCH`, `PLACEHOLDER` |
| `backend/modules/email/email.service.js`                    | transactional email                             | direct `fetch(UNISENDER_API_URL)`                   | backend external adapter                       | соответствует adapter-модели                             | `VERIFIED`                        |

Вывод по direct calls:

1. Допустимый direct call: signed S3 `PUT` в `mediaService`.
2. Недопустимый архитектурный bypass: direct backend API fetch в `ReportPlaceholderPage`.
3. Third-party call: backend email provider (Unisender) через server-side adapter.

### 5.1.4 Import / dependency audit

#### A) Unused/legacy/dead classification

| Element                                                         | Type                     | Classification                                                  |
| --------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------- |
| `src/services/auth/authService.js:onAuthStateChange`            | exported stub            | `UNUSED`                                                        |
| `src/app/splash/index.js`                                       | barrel export            | `UNUSED` (в коде импортируется прямой путь `StartupScreenGate`) |
| `supabase/.temp/*`                                              | legacy artifact          | `UNUSED` (runtime imports не обнаружены)                        |
| `backend/check-db.cjs`, `check-fk.cjs`, `check-constraints.cjs` | local diagnostic scripts | `UNKNOWN` (не в npm scripts, возможен manual use)               |
| `backend/storage-check.txt`                                     | legacy note artifact     | `DEAD` (functional usage не обнаружена)                         |

#### B) Dependencies with evidence

`frontend package.json`:

- `USED`: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `swiper`, `react-datepicker`, `react-imask`, `react-icons`, `react-compare-image`, `yet-another-react-lightbox`.
- `UNUSED (repo-level evidence absent)`: `@floating-ui/react`, `embla-carousel-autoplay`, `embla-carousel-react`, `react-mobile-picker`.

`backend package.json`:

- `USED`: `fastify`, `@fastify/cookie`, `@fastify/cors`, `@fastify/rate-limit`, `argon2`, `pg`, `zod`, `node-pg-migrate`, `dotenv`, `@aws-sdk/*`, `fastify-plugin`.
- `UNUSED (repo-level evidence absent)`: `ws`.

Примечание:

- Классификация `UNUSED` основана на отсутствии usage references в repository code; runtime dynamic loading вне статического графа не обнаружен.

### 5.1.5 Error handling contract

Frontend:

1. `apiClient` централизует network fallback (`NETWORK_ERROR`) и возвращает `{data,error,status}`.
2. `trainingService` и `leadService` маппят статусы/сообщения в typed `Error` (частично единообразно).
3. `authErrors.js` нормализует user-facing auth messages.
4. Inconsistency:

- часть UI использует `window.alert` для mutation errors (`TrainingPage`, `TrainingHistoryPage`);
- часть показывает inline empty/error state;
- report page использует отдельные throw/error patterns и обходит общий apiClient.

Backend:

1. Для ожидаемых validation/auth/resource ошибок активно используются `reply.code(...).send({ error, message })`.
2. Transaction rollback присутствует в сложных write flow.
3. Единого глобального custom error mapper для неожиданных исключений не видно (поведение fallback зависит от Fastify).
4. Ранее подтверждено: production framework-level detail на 404 route может раскрывать внутреннюю деталь маршрутизации.

Stage 5 verdict:

- Error contract: `PARTIAL`.
- Previously identified -> Stage 5 re-confirmed:
  - отсутствует fully unified frontend error UX;
  - report bypass ломает единообразие contract-а.

### 5.1.6 Loading / empty / error states

Наблюдения:

1. `TrainingHistoryPage`/`ExerciseList` имеют loading + empty + error states.
2. `TrainingPage` использует mutation guard (`isSaving`) и предотвращает duplicate submit.
3. Questionnaire имеет `isSubmitting` и local draft restore.
4. Placeholder-модули имеют static state без data fetching (соответственно нет полноценного retry/error pipeline).
5. `ProfilePage` содержит тестовую кнопку `Проверить Loading Overlay` (debug-like UI behavior в production route).

Статус: `PARTIAL`

### 5.1.7 React async/state risks

Evidence:

1. В ряде экранов есть `isMounted/cancelled` guard (например history, exercises, confirm-email), что снижает риск setState-after-unmount.
2. `AbortController` для API calls не используется.
3. Есть lint warnings по `react-hooks/exhaustive-deps` (BottomTabBar/AuthContext/LoadingOverlay/Auth modals), что даёт риск stale closures/re-subscribe drift.
4. Таймеры/listeners в ключевых местах обычно имеют cleanup.
5. `ReportPlaceholderPage` использует `setInterval` для записи; cleanup присутствует.

Классификация:

- Confirmed: hook dependency warnings (`oxlint`) как concrete maintainability risk.
- Plausible risk: race/cancellation gaps при параллельных/быстро отменяемых запросах (нет AbortController).
- NOT VERIFIED: runtime memory leak under prolonged session (нет профилировочного evidence).

### 5.1.8 Performance / bundle risks

Build evidence (`vite build`):

1. JS chunk: `dist/assets/index-*.js` ~833 kB minified (gzip ~241 kB).
2. CSS chunk: ~160 kB.
3. В bundle попадает крупный медиа-asset: `obratnaya_svyaz*.mp4` ~43 MB.
4. Несколько image assets >1 MB.
5. Vite warning: chunks > 500 kB.
6. Route-level lazy loading не используется.

Риски:

- Large initial payload и slower first load, особенно mobile/slow network.
- Heavy media in landing flow без явных adaptive strategies.

Статус: `PARTIAL` (confirmed performance risks на repository/build уровне).

### 5.1.9 PWA / application shell

Проверено:

1. `manifest.json` присутствует (name/start_url/scope/display/icons).
2. `index.html` содержит manifest link и restore script.
3. `public/404.html` реализует deep-link redirect strategy.
4. Service worker registration в `src` не обнаружен.
5. `sw.js` в public runtime-shell коде не реализован.
6. Vite PWA plugin конфигурация отсутствует.

Статус: `PARTIAL`.

Previously identified -> Stage 5 re-confirmed:

- PWA shell есть, полноценный SW/offline/update слой отсутствует.

### 5.1.10 Configuration audit

Проверено:

- `.env.development`, `.env.production`, `backend/.env.example`, env usage в src/backend.

Факты:

1. Frontend использует только `VITE_API_BASE_URL` через `apiClient`.
2. Backend env usage соответствует `DB_*`, `UNISENDER_API_KEY`, `TRAINER_EMAIL`, `S3_*`.
3. В коде frontend не обнаружено backend secrets references.
4. Жёстко захардкоженный backend URL обнаружен только в `ReportPlaceholderPage` (localhost bypass).
5. Root `.gitignore` не покрывает `.env*` глобально; `backend/.env` игнорируется локальным `backend/.gitignore`.

Статус: `PARTIAL`.

### 5.1.11 Testing inventory

Repository-level inventory:

1. Unit tests (project code): `ABSENT`.
2. Integration tests (project code): `ABSENT`.
3. E2E tests (project code): `ABSENT`.
4. Auth/session automated tests: `ABSENT`.
5. Training tests: `ABSENT`.
6. Media tests: `ABSENT`.
7. Production smoke tests automation: `NOT VERIFIED` (manual forensic checks использовались в предыдущих этапах, не automated suite).

Примечание:

- Найденные `.test.js` относятся к зависимостям в `node_modules`, не к тестам проекта.

### 5.1.12 Codebase ↔ documentation alignment

Проверенные документы:

- `README.md`
- `docs/core/AGENTS.md`
- `docs/core/CODING_RULES.md`
- `docs/core/DESIGN_SYSTEM.md`
- `docs/ARCHITECTURE/APP_STRUCTURE.md`
- `docs/SERVER/SERVER_STATE.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`
- модульные спецификации (`REPORT.md`, `CHAT.md`, `COACH_CLIENT_RELATIONSHIP.md`, `TRAINING_TEMPLATES_SPEC.md`, `MEDIA.md`) использованы из предыдущих этапов и re-checked по consistency.

Новые/дополнительные для Stage 5 факты:

1. `README.md` пустой (project entry doc debt).
2. `APP_STRUCTURE.md` в секции current frontend tree упоминает `src/debug`, `src/features`, `src/hooks`, `src/utils`, `src/api` как часть структуры; фактически эти директории отсутствуют.
3. `CODING_RULES.md` требует service-layer architecture; `ReportPlaceholderPage` остаётся контрпримером.
4. `SERVER_STATE` и `SYSTEM_STATE` содержат migration/legacy narrative, частично отражающий runtime gaps; в части media/runtime mismatch требуется читать вместе с forensic evidences Stage 3/4.

Статус: `PARTIAL`, `DOC CONFLICT`.

### 5.1.13 Technical debt (evidence-based)

#### Confirmed technical debt

1. Report module backend bypass + hardcoded localhost API.
2. Incomplete module implementation layers (chat/nutrition/notifications/programs/report lifecycle).
3. Large hotspot components/routes with mixed responsibilities (`TrainingExerciseCard`, `training.routes.js`).
4. Missing automated tests in project code.
5. Large bundle/media payload risks.

#### Architectural debt

1. Partial deviation from `Component -> Service -> apiClient -> Backend`.
2. Backend lacks dedicated repository/service separation in heavy domains (training/media).
3. Mixed validation approach (Zod + manual), no single cross-module validation pattern.

#### Documentation debt

1. Empty root README.
2. `APP_STRUCTURE.md` tree drift against actual `src/`.
3. Mature module specs vs placeholder runtime modules (previously identified -> Stage 5 re-confirmed).

#### Runtime/deployment debt

1. Previously identified -> Stage 5 re-confirmed:
   repository media/storage implementation vs production deployed composition mismatch.
2. Templates migration/runtime divergence (`5918` absent in production) remains relevant for structure completeness.

#### Test debt

1. No unit/integration/E2E suite in project code.
2. No dedicated regression coverage for auth/session/training/media critical flows.

---

## 5.2 Stage 5 итоговая таблица областей

| Area                       | Status                    | Evidence                                                                                     | Risk/Impact                                    | NOT VERIFIED                                         |
| -------------------------- | ------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------- |
| Frontend structure         | `PARTIAL`                 | Centralized router + apiClient present; report bypass + many placeholders                    | Boundary drift, uneven module maturity         | Full import-graph cycle proof                        |
| Backend structure          | `PARTIAL`                 | Registered modules in `server.js`; large route handlers with embedded SQL                    | Maintainability/reliability complexity         | Runtime behavior under stress                        |
| API architecture           | `PARTIAL`                 | Services mostly use apiClient; report direct fetch bypass; signed PUT exception confirmed    | Inconsistent contract and env usage            | Full authenticated production parity for all modules |
| Imports/dependencies       | `PARTIAL`                 | Unused deps identified (`@floating-ui/react`, embla\*, `react-mobile-picker`, `ws`)          | Bundle bloat / maintenance overhead            | Dynamic runtime-only usage outside static graph      |
| Dead/legacy code           | `PARTIAL`                 | `supabase/.temp` legacy, unused stubs/barrels/scripts detected                               | Cognitive load / drift                         | Manual scripts real-world operational usage          |
| Error handling             | `PARTIAL`                 | `apiClient` error wrapper + backend error codes, but inconsistent UI handling patterns       | UX inconsistency, harder observability         | Global error-path behavior in production edge cases  |
| Loading/error/empty states | `PARTIAL`                 | Implemented in key training screens; placeholders lack full states                           | Uneven resilience across modules               | Real user behavior across all flows                  |
| React async/state          | `PARTIAL`                 | isMounted guards + cleanup in many spots; lint hook-deps warnings; no AbortController        | Stale closure / race risks                     | Leak confirmation without runtime profiling          |
| Performance                | `PARTIAL`                 | Build output: 833k JS chunk, 43MB video asset, >500k warning, no lazy routes                 | Slow first load / mobile impact                | Real RUM metrics in production                       |
| PWA                        | `PARTIAL`                 | Manifest+shell+404 redirect present; no SW registration/plugin                               | No offline/update strategy                     | Install/update behavior under real device matrix     |
| Configuration              | `PARTIAL`                 | Env usage mostly aligned; report hardcoded localhost; root `.gitignore` env coverage limited | Config drift / accidental secret handling risk | Full env hygiene across all local setups             |
| Testing                    | `ABSENT`                  | No project unit/integration/E2E suites found                                                 | Regression risk high                           | External/private CI suites not visible in repo       |
| Documentation alignment    | `PARTIAL`, `DOC CONFLICT` | README empty, structure doc drift, module specs ahead of runtime implementation              | Onboarding/decision friction                   | Whether unpublished docs compensate                  |
| Technical debt             | `CONFIRMED`               | Consolidated evidence above                                                                  | Increased cost/defect risk for next stages     | Debt payoff sequencing impact                        |

---

## 5.3 Confirmed findings severity

### Confirmed critical findings

1. `ReportPlaceholderPage` делает direct backend API fetch к hardcoded localhost (`Component -> Service -> apiClient` нарушен).
2. Testing layer в кодовой базе фактически отсутствует (unit/integration/E2E отсутствуют).
3. Production/runtime structural debt remains: repository media/storage implementation != deployed runtime composition (previously identified -> Stage 5 re-confirmed).
4. PWA offline layer отсутствует (нет service worker registration/strategy).

### Confirmed medium findings

1. Large monolithic files повышают сложность сопровождения:

- `TrainingExerciseCard.jsx` (1321 lines)
- `backend/modules/training/training.routes.js` (941 lines)
- `ReportPlaceholderPage.jsx` (481 lines)

2. Frontend error UX неоднороден (`window.alert` + inline states + custom report errors).
3. Unused dependencies присутствуют в frontend/backend packages.
4. `README.md` пустой.
5. `APP_STRUCTURE.md` не полностью совпадает с текущей структурой `src/`.

### Confirmed low findings

1. Unused exports/artifacts (`onAuthStateChange` stub, splash barrel, storage-check note).
2. Lint warnings по hook dependencies/unused vars/caught errors без использования.
3. Дублирующий `s3-cors.json` (root + backend) без единого source-of-truth пометки.

### Plausible risks

1. Race/cancellation риск в data-fetch слоях без `AbortController` при быстрых route transitions.
2. Memory/perf деградация на длинных сессиях в heavy interactive components (photo/materials/card flows) без профилировочного подтверждения.
3. Bundle growth risk при дальнейшем расширении без code-splitting.

### NOT VERIFIED

1. Полный граф import cycles (без специализированного dependency-graph инструмента в этом проходе).
2. Runtime impact unused dependencies в production bundle-tree (нужен deeper tree-shaking/profiling report).
3. End-to-end production behavior по всем placeholder->future modules.
4. Наличие внешних (закрытых) CI test suites вне этого repository.

---

## 5.4 Stage 5 git baseline and completion check

Baseline `git status --short` перед Stage 5:

- `M src/app/router/appRoutes.jsx`
- `M src/modules/training/components/create/TrainingCreateList.jsx`
- `M src/modules/training/components/exercises/ExerciseList.jsx`
- `M src/modules/training/screens/TrainingTemplatesPage.jsx`
- `M src/modules/training/services/trainingService.js`
- `M src/shared/lib/apiClient.js`
- `?? .env.development`
- `?? .env.production`
- `?? PROJECT_FULL_AUDIT_2026-09-19.md`

Финальный `git status --short` выполняется после завершения Stage 5 и сравнивается с baseline (см. финальный ответ).

---

## 5.5 Addendum — Frontend API Base / Auth-Session Remediation Closure (2026-09-19)

BEFORE:

1. Production frontend runtime использовал loopback API base `http://127.0.0.1:3000/api` для auth/session.
2. Это нарушало production behavior: зависимость от локального backend на клиентском устройстве.

FIX:

1. Приведен к архитектурному env-path frontend API client:

- `src/shared/lib/apiClient.js` -> `import.meta.env.VITE_API_BASE_URL`.
- `.env.development` -> `VITE_API_BASE_URL=http://127.0.0.1:3000/api`.
- `.env.production` -> `VITE_API_BASE_URL=https://api.stubbornram.ru/api`.

2. Выполнен production build frontend.
3. Выполнен штатный deploy через GitHub Pages workflow `.github/workflows/deploy.yml`.

AFTER:

1. Production frontend auth/session направляется на `https://api.stubbornram.ru/api`.
2. Localhost сохраняет `http://127.0.0.1:3000/api`.
3. Исходная проблема `127.0.0.1` в production frontend path закрыта.

VERIFICATION:

1. Deploy workflow для remediation commit завершен `success`.
2. Production browser network после deploy показывает `https://api.stubbornram.ru/api/auth/session`.
3. Production UI login и session persistence после reload подтверждены как PASS.

Статус: 1. Foundation Auth/Session remediation: PASS. 2. Production frontend API base mismatch: FIXED — VERIFIED.

SAFETY INVARIANTS:

1. DB CHANGE = NO
2. BACKEND CHANGE = NO
3. PRODUCTION BACKEND CHANGE = NO

## 5.6 Addendum — F1-TST-02 Minimal Smoke (Persistence / Ownership)

BEFORE:

1. Требовалась узкая runtime-проверка существующего persistence/ownership flow без архитектурных изменений.

VERIFICATION:

1. Использован только существующий training flow (`/app/training/*`, `TrainingPage` -> `updateWorkout` -> `apiClient` -> backend).
2. LOCALHOST:

- `PUT /api/training/workouts/:id` -> `200`.
- Значение comment сохранено и подтверждено после reload.
- PostgreSQL read check подтвердил сохранённый comment в `workouts`.

3. PRODUCTION:

- `PUT https://api.stubbornram.ru/api/training/workouts/:id` -> `200`.
- Значение comment сохранено и подтверждено после reload.
- PostgreSQL read check подтвердил сохранённый comment в `workouts`.

4. Проверено непосредственно в рамках F1-TST-02:

- собственные данные через реальный flow;
- persistence после reload;
- отклонение несуществующего UUID (`404`).

5. Nonexistent UUID rejection:

- `GET /api/training/workouts/00000000-0000-0000-0000-000000000000` -> `404` (local/prod).
- UI alert: `Тренировка не найдена.`

6. Этот проход НЕ является полноценным cross-user ownership test (второй пользователь отдельно не запускался в рамках F1-TST-02).
7. Общий ownership enforcement при этом уже подтверждался ранее в других существующих цепочках.

AFTER:

1. Minimal smoke подтвердил рабочий persistence/read-after-write на localhost и production.
2. В рамках F1-TST-02 подтверждён узкий ownership scope: собственные данные + reload persistence + nonexistent UUID rejection.

Статус: 1. F1-TST-02: PASS.

CHANGE FLAGS:

1. DB SCHEMA CHANGE: NO
2. DB MIGRATION: NO
3. BACKEND CODE CHANGE: NO
4. FRONTEND CODE CHANGE: NO
5. PRODUCTION INFRA/DEPLOY CHANGE: NO
6. PRODUCTION DATA CHANGE: YES — изменён только существующий `workouts.comment` синтетическим тестовым marker.

СТАТУС STAGE 5: ЗАВЕРШЁН (FORENSIC READ-ONLY AUDIT)

STAGE 6 НЕ НАЧИНАЛСЯ.

---

## 6.1 Documentation vs Actual Matrix

Проверенный inventory документов Stage 6:

1. `README.md`
2. `docs/core/AGENTS.md`
3. `docs/core/CODING_RULES.md`
4. `docs/core/DESIGN_SYSTEM.md`
5. `docs/ARCHITECTURE/APP_STRUCTURE.md`
6. `docs/SERVER/SERVER_STATE.md`
7. `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`
8. `docs/DOCS_UPDATE_MAP.md`
9. `docs/modules/REPORT.md`
10. `docs/modules/CHAT.md`
11. `docs/modules/COACH_CLIENT_RELATIONSHIP.md`
12. `docs/modules/Training/TRAINING_TEMPLATES_SPEC.md`
13. `docs/MEDIA.md`
14. Дополнительно существующие module specs в `docs/modules/*` (ACTIVITY/ANALYTICS/FOOD/HOME/LIBRARY/NOTIFICATIONS/PHOTO_AND_MEASUREMENTS/PROFILE/WEIGHT/TRAINING.md) инвентаризированы как часть documentation surface.

| Документ / утверждение                                                                                                                | Actual evidence                                                                                   | Actual status                                      | Classification     |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------ |
| `README.md` как entry документация проекта                                                                                            | Файл пустой                                                                                       | Entry-level project guidance отсутствует           | `DOC CONFLICT`     |
| `docs/core/CODING_RULES.md`: `Component -> Service -> Backend API` как правило                                                        | `src/modules/report/ReportPlaceholderPage.jsx` делает direct backend fetch на hardcoded localhost | Правило соблюдается не везде                       | `PARTIAL`          |
| `docs/core/CODING_RULES.md`: service-layer architecture как общий стандарт                                                            | `authService/leadService/trainingService/mediaService` существуют и используются                  | Базовый паттерн реализован                         | `PARTIAL`          |
| `docs/ARCHITECTURE/APP_STRUCTURE.md`: current frontend tree включает `src/debug`, `src/features`, `src/hooks`, `src/utils`, `src/api` | Эти директории отсутствуют в текущем `src`                                                        | Описание current tree устарело                     | `DOC CONFLICT`     |
| `docs/SERVER/SERVER_STATE.md`: Object Storage `PLANNED / NOT CONNECTED`, signed URLs не реализованы                                   | В repository есть `storage.service.js`, `media.routes.js`, signed upload/download flow            | Doc не соответствует repository implementation     | `DOC CONFLICT`     |
| `docs/SERVER/SERVER_STATE.md`: production infra (PM2/Nginx/API domain) verified                                                       | Stage 1–4 runtime evidence подтверждает PM2+Nginx+api domain availability                         | Согласовано                                        | `VERIFIED`         |
| `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`: production migrations до `5917`, локальные `5918-5920` не выполнены в production    | Stage 1–4 evidence: production имеет `5919`, `5920`, `5921`; `5918` отсутствует                   | Частично устаревшее migration state                | `DOC CONFLICT`     |
| `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`: media module частично реализован, production deployment storage/media не завершён   | Stage 3/4: repo media implemented; deployed runtime media/storage routes отсутствуют              | В целом согласовано с runtime mismatch             | `PARTIAL`          |
| `docs/modules/REPORT.md`: полноценный report lifecycle (DRAFT/SUBMITTED/REVIEWED + persistence + relationship checks)                 | Runtime: `ReportPlaceholderPage`, отсутствуют report backend routes/tables                        | Реализация отсутствует                             | `NOT IMPLEMENTED`  |
| `docs/modules/CHAT.md`: полноценный chat subsystem                                                                                    | Runtime: `src/modules/chat/ChatPage.jsx` placeholder, backend chat API отсутствует                | Реализация отсутствует                             | `NOT IMPLEMENTED`  |
| `docs/modules/COACH_CLIENT_RELATIONSHIP.md`: relationship/permissions subsystem                                                       | Runtime: no relationship tables/routes/role model; ownership-only checks                          | Реализация отсутствует                             | `NOT IMPLEMENTED`  |
| `docs/modules/Training/TRAINING_TEMPLATES_SPEC.md`: templates API `/api/training/templates*`                                          | Runtime: templates routes отсутствуют; UI placeholder; migration `5918` absent in production      | Реализация не доведена до runtime                  | `RUNTIME MISMATCH` |
| `docs/MEDIA.md`: media через backend + signed URL + private storage                                                                   | Repository code соответствует; production runtime не содержит media/storage deployment            | Repo и runtime расходятся                          | `RUNTIME MISMATCH` |
| `docs/core/DESIGN_SYSTEM.md`: dark minimal visual style, Comfortaa, карточная структура                                               | Текущий frontend использует указанное визуальное направление                                      | Согласовано                                        | `VERIFIED`         |
| `docs/DOCS_UPDATE_MAP.md`: migration-intent документ (план изменений docs/архитектуры)                                                | Текущий проект использует mixed state (часть migrated, часть legacy/placeholder)                  | Используется как planning-map, не как факт runtime | `PARTIAL`          |

---

## 6.2 FINAL ACTUAL SYSTEM MODEL

### Frontend

1. React + Vite SPA с `createBrowserRouter` и guarded app routes.
2. Канонический API-доступ: `src/shared/lib/apiClient.js` + service layer.
3. Реально рабочие user flows подтверждены в auth/questionnaire/training history/create/exercises read.
4. Существенная часть модулей остаётся placeholder/front-only: profile edit persistence, dashboard data, templates/programs, nutrition, chat/comments, notifications backend, analytics/library/deeper module logic.
5. Исключение архитектуры:

- `ReportPlaceholderPage` использует direct backend fetch с hardcoded localhost base.

### Backend

1. Repository backend modules: `auth`, `db`, `email`, `leads`, `training`, `storage`, `media`.
2. Repository registration в `backend/server.js`: auth + leads + training + storage plugin + media.
3. Business/data access в основном внутри route handlers (без выделенного repository-layer).
4. Validation mixed: Zod (auth/leads) + manual checks (training/media).

### Database

1. Local migrations присутствуют `5911..5921`.
2. Production confirmed migrations: `5911,5912,5913,5914,5915,5916,5917,5919,5920,5921`.
3. Divergence: `5918_training_templates` отсутствует в production.
4. Production tables auth/training/media подтверждены.
5. `training_templates*` production tables отсутствуют.

### Authentication

Реально реализовано:

1. registration
2. login
3. session restore
4. logout current session
5. password reset request/complete
6. email verification + resend verification
7. ownership-based authorization на training/media.

Реально отсутствует:

1. logout all devices endpoint/UI
2. session cleanup background job
3. role-based trainer/client authorization (RBAC).

### Training

Подтверждённые end-to-end flows:

1. workouts history list/read
2. create/update/delete workouts
3. exercises catalog read
4. materials read (`GET /api/training/sets/:setId/materials`).

Gap:

1. backend `PUT /api/training/sets/:setId/materials` существует, frontend write path не подтверждён в user flow.

### Media

Разделение обязательно:

1. Repository implementation:

- реализованы `POST /api/media/upload`, `POST /api/media/:id/complete`, `GET/DELETE /api/media/:id`, storage signed URL service.

2. Production runtime:

- deployed runtime не содержит media/storage modules; media endpoints в runtime отсутствуют (`RUNTIME MISMATCH`).

3. S3 control-plane verification:

- bucket policy/ACL/public-access/lifecycle/versioning/encryption/cors остаются `NOT VERIFIED` в authenticated control-plane scope.

### Other modules

Implemented / partial / placeholder / absent:

1. Profile: partial (view/logout есть, edit persistence отсутствует).
2. Dashboard/Home: partial shell, backend dashboard API отсутствует.
3. Questionnaire: coaching flow partial implemented; program questionnaire placeholder.
4. Exercises: read implemented, CRUD not implemented.
5. Templates: placeholder + runtime divergence (no templates API runtime flow).
6. Reports: placeholder + direct fetch bypass; report backend/persistence absent.
7. Programs: placeholder.
8. Nutrition: placeholder.
9. Chat: placeholder, chat backend absent.
10. Comments: placeholder.
11. Notifications: static cards only; backend absent.
12. Trainer/Client subsystem: not implemented.
13. Analytics: placeholder screen.

### PWA

1. Manifest/app-shell/reload route-recovery logic присутствуют.
2. Service Worker registration/offline/update strategy отсутствуют.

---

## 6.3 Remaining Documentation Conflicts

Только актуальные после Stage 5 конфликты:

| Conflict                            | Documentation says                                                                              | Actual says                                                                     | Status             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------ |
| Frontend entry docs                 | `README.md` должен быть базовым проектным guide                                                 | `README.md` пустой                                                              | `DOC CONFLICT`     |
| Frontend structure                  | `docs/ARCHITECTURE/APP_STRUCTURE.md` current tree включает `src/debug/features/hooks/utils/api` | Эти папки отсутствуют в текущем `src`                                           | `DOC CONFLICT`     |
| Migrations state                    | `SYSTEM_STATE_UPDATED_FULL.md` фиксирует production до `5917` и `5918-5920` как local-only      | Production содержит `5919/5920/5921`, `5918` отсутствует                        | `DOC CONFLICT`     |
| Media runtime                       | `MEDIA.md` + `SYSTEM_STATE` описывают backend media/storage foundation                          | Repository реализован, но deployed production runtime media/storage не содержит | `RUNTIME MISMATCH` |
| Reports                             | `REPORT.md` описывает полноценный weekly report lifecycle                                       | Runtime содержит report placeholder без report backend                          | `NOT IMPLEMENTED`  |
| Chat                                | `CHAT.md` описывает полноценный chat subsystem                                                  | Runtime chat page placeholder, backend chat API отсутствует                     | `NOT IMPLEMENTED`  |
| Trainer/Client                      | `COACH_CLIENT_RELATIONSHIP.md` описывает relationship/permissions subsystem                     | Runtime entities/routes/role model отсутствуют                                  | `NOT IMPLEMENTED`  |
| Templates                           | `TRAINING_TEMPLATES_SPEC.md` описывает templates API/runtime flow                               | Templates API/runtime flow отсутствует, `5918` not in production                | `RUNTIME MISMATCH` |
| PWA expectations                    | Док-слой позиционирует PWA roadmap/ready shell                                                  | Manifest/shell есть, SW/offline/update layer отсутствует                        | `PARTIAL`          |
| Architecture rule vs implementation | `CODING_RULES.md` требует service-layer path                                                    | `ReportPlaceholderPage` делает direct backend fetch bypass                      | `DOC CONFLICT`     |

---

## 6.4 SYSTEM_STATE UPDATE REQUIRED

Важно: `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` на Stage 6 не изменялся. Ниже только список требуемых update-пунктов.

| Section                     | Current text/state                                                  | Required factual state                                                                                     | Evidence                                               |
| --------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `#10 PRODUCTION MIGRATIONS` | Production до `5917`; `5918-5920` local-only                        | Production: `5919,5920,5921` применены; `5918` отсутствует                                                 | Stage 1/4 production migration evidence in audit       |
| Media deployment statements | Foundation/media routes описаны как реализованные в backend context | Явно разделить: repository implementation есть, deployed runtime media/storage routes отсутствуют          | Stage 3/4 runtime probes + deployed module composition |
| Storage rollout item        | Указан как незавершённый rollout                                    | Сохранить как незавершённый deployment mismatch, но обновить migration/runtime details до текущего факта   | Stage 3/4 consistency evidence                         |
| Templates rollout item      | Упоминание `5918` rollout как future item                           | Подчеркнуть, что production имеет `5919-5921` при отсутствии `5918`, templates runtime flow remains absent | Stage 1/4/5 consolidated DB+module evidence            |
| Module actual-state summary | Mixed planned/actual текст в ряде мест                              | Явно размечать: implemented vs partial vs placeholder vs not implemented per module                        | Stage 4 pass1/2 + Stage 5 module inventory             |
| PWA summary                 | PWA narrative без жесткого разделения shell/offline                 | Добавить явное разделение: manifest/shell present, SW/offline/update absent                                | Stage 4 pass2 + Stage 5 PWA checks                     |

---

## 6.5 FINAL UNIFIED STATUS

| Subsystem          | Actual status     | Production status  | Persistence                                            | Documentation                        | NOT VERIFIED                                   |
| ------------------ | ----------------- | ------------------ | ------------------------------------------------------ | ------------------------------------ | ---------------------------------------------- |
| Auth               | `VERIFIED`        | `VERIFIED`         | users/profiles/sessions/auth_tokens confirmed          | mostly aligned                       | none major in scope                            |
| Sessions           | `PARTIAL`         | `PARTIAL`          | core persistence confirmed                             | gaps acknowledged in docs            | cleanup job behavior under load                |
| RBAC               | `NOT IMPLEMENTED` | `NOT IMPLEMENTED`  | no role model tables/guards                            | desired-state docs exceed actual     | none                                           |
| Profile            | `PARTIAL`         | `PARTIAL`          | view via session only; edit persistence absent         | partially aligned                    | full profile edit lifecycle                    |
| Dashboard          | `PLACEHOLDER`     | `PLACEHOLDER`      | no dashboard API chain                                 | docs drift in maturity expectation   | none                                           |
| Questionnaire      | `PARTIAL`         | `PARTIAL`          | coaching lead persistence exists; program flow absent  | partially aligned                    | production email-delivery reliability at scale |
| Training           | `PARTIAL`         | `PARTIAL`          | workouts/exercises core persistence confirmed          | generally aligned for core           | failure-mode robustness under stress           |
| Exercises          | `PARTIAL`         | `PARTIAL`          | read persistence confirmed; CRUD absent                | docs ahead in some areas             | none                                           |
| Templates          | `PLACEHOLDER`     | `RUNTIME MISMATCH` | no production templates persistence flow               | spec ahead of actual                 | none                                           |
| Training Materials | `PARTIAL`         | `PARTIAL`          | read chain confirmed; frontend write gap               | partially aligned                    | full UX write path runtime                     |
| Media              | `PARTIAL`         | `RUNTIME MISMATCH` | repo persistence implemented                           | docs partially conflict with runtime | authenticated production E2E media flow        |
| S3                 | `PARTIAL`         | `PARTIAL`          | data-plane usage in repo                               | docs mixed planned/actual            | control-plane security attributes              |
| Reports            | `PLACEHOLDER`     | `PLACEHOLDER`      | report entity persistence absent                       | report doc ahead of actual           | full report lifecycle runtime                  |
| Programs           | `PLACEHOLDER`     | `PLACEHOLDER`      | absent                                                 | planned in docs                      | none                                           |
| Nutrition          | `PLACEHOLDER`     | `PLACEHOLDER`      | absent                                                 | planned in docs                      | none                                           |
| Chat               | `NOT IMPLEMENTED` | `NOT IMPLEMENTED`  | absent                                                 | chat spec ahead of actual            | none                                           |
| Comments           | `PLACEHOLDER`     | `PLACEHOLDER`      | absent                                                 | partially implied only               | none                                           |
| Notifications      | `PLACEHOLDER`     | `PLACEHOLDER`      | absent backend persistence                             | docs ahead/planned                   | none                                           |
| Trainer/Client     | `NOT IMPLEMENTED` | `NOT IMPLEMENTED`  | relationship persistence absent                        | concept docs ahead                   | none                                           |
| Analytics          | `PLACEHOLDER`     | `PLACEHOLDER`      | absent                                                 | planned docs                         | none                                           |
| PWA                | `PARTIAL`         | `PARTIAL`          | shell-level only                                       | partial alignment                    | install/offline/update real-device behavior    |
| API architecture   | `PARTIAL`         | `PARTIAL`          | mostly service-driven, one known bypass                | coding rules conflict in one module  | global consistency under all modules           |
| PostgreSQL         | `VERIFIED`        | `PARTIAL`          | production tables/migrations confirmed with divergence | migration docs partially outdated    | none                                           |
| Production runtime | `PARTIAL`         | `PARTIAL`          | core auth/training/leads live; media mismatch          | docs mixed                           | deeper runtime stress/observability            |
| Deployment         | `PARTIAL`         | `PARTIAL`          | pipeline exists but runtime parity gaps remain         | partially aligned                    | end-to-end release parity checks               |

---

## 6.7 F1-NV-01 ADDENDUM - PRODUCTION OBJECT STORAGE STATE (2026-09-19)

Scope: analysis + controlled production configuration + synthetic verification for F1-NV-01 only.

Confirmed factual state after step completion:

1. Production backend S3 config is present for required runtime variables:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`

2. Backend remained online after standard PM2 restart.
3. Existing signed URL flow is operational in production:

- authenticated upload initialization;
- upload to signed URL;
- complete;
- signed download;
- delete.

4. Private access behavior validated by synthetic object checks:

- unsigned direct read blocked (`403`);
- unsigned direct write blocked (`403`).

5. Control-plane API nuances in this provider context:

- `GetBucketAcl`: readable and verified;
- `GetBucketPolicy`: readable and verified;
- `GetPublicAccessBlock`/`GetBucketPolicyStatus`: returned `501 NotImplemented`.

6. No code changes were required for F1-NV-01 completion.
7. No DB schema changes and no migrations were performed.
8. Test artifacts were cleaned (synthetic media/user and temporary scripts).

Status impact:

1. F1-NV-01 is now operationally closed as FIXED - VERIFIED.
2. Previous production media/storage runtime mismatch is resolved for this scope.

---

## 6.6 FINAL AUDIT FINDINGS

### Confirmed implemented

1. Frontend React routing/auth shell and base service/apiClient architecture.
2. Backend auth/leads/training modules in repository.
3. Auth core flows: register/login/session/logout/reset/verify/resend.
4. Training core flows: workouts CRUD + exercises read + materials read.
5. Repository media implementation with signed URL flow.
6. Production PM2/Nginx/API domain runtime baseline.

### Confirmed partial

1. Profile (view/logout only, no full edit persistence flow).
2. Dashboard (session shell without dashboard data API chain).
3. Questionnaire (coaching flow implemented, program flow absent).
4. Training materials write UX parity gap.
5. PWA shell (manifest/deep-link restore) without SW offline layer.
6. Error handling and architecture consistency (one bypass module).

### Confirmed not implemented

1. Role-based trainer/client authorization.
2. Logout all devices.
3. Session cleanup background job.
4. Report backend/persistence lifecycle.
5. Chat backend/realtime layer.
6. Nutrition/programs/notifications/trainer-client backend subsystems.
7. Automated test layer (unit/integration/E2E) in project code.

### Confirmed runtime mismatches

1. Repository media/storage modules vs deployed production runtime composition.
2. Templates spec/runtime expectations vs actual deployed flow and migration `5918` absence.
3. Docs migration state vs confirmed production migration list.

### Confirmed documentation conflicts

1. Empty `README.md`.
2. `APP_STRUCTURE.md` current-tree drift.
3. `SERVER_STATE` media/storage planning statements vs current repository implementation.
4. `SYSTEM_STATE` migration/runtime assertions needing update.
5. Architecture rules vs report direct-fetch implementation.

### NOT VERIFIED

1. S3 control-plane security attributes.
2. Full authenticated production E2E media/report scenarios in non-mutating scope.
3. Full production chaos/failure/stress behavior.
4. External/private test suites outside repository.

---

## 6.7 OPEN ITEMS AFTER AUDIT

Фактически открытые после полного forensic-аудита пункты:

1. S3 control-plane verification remains NOT VERIFIED.
2. Migration divergence: `5918` absent in production.
3. Media runtime deployment mismatch (repo vs production).
4. RBAC trainer/client missing.
5. Logout-all-devices missing.
6. Session cleanup job missing.
7. CSRF-specific protection missing (previously identified, re-confirmed scope relevance).
8. Report architecture bypass (direct backend fetch + hardcoded localhost).
9. Automated test layer absent.
10. Service Worker/offline PWA layer absent.
11. Placeholder/absent module set (reports/chat/nutrition/programs/notifications/analytics/trainer-client/comments parts).
12. Documentation drift in system/state/structure files.

---

## 6.8 FINAL AUDIT COMPLETION

Этапный статус завершения:

1. Stage 1: **НЕ ЗАВЕРШЁН** (как и зафиксировано ранее) из-за `S3 control-plane NOT VERIFIED`; при этом forensic work Stage 1 выполнен.
2. Stage 2: **ЗАВЕРШЁН**.
3. Stage 3: **ЗАВЕРШЁН**.
4. Stage 4 PASS 1: **ЗАВЕРШЁН В РАМКАХ PASS 1 FORENSIC SCOPE** (статус блока сохранён: «остановлено после анализа»).
5. Stage 4 PASS 2: **ЗАВЕРШЁН**.
6. Stage 4 PASS 3: **ЗАВЕРШЁН**.
7. Stage 5: **ЗАВЕРШЁН**.
8. Stage 6: **ЗАВЕРШЁН**.

Итог Stage 6:

- финальная factual модель системы зафиксирована;
- documentation vs actual матрица добавлена;
- remaining conflicts и required System State updates перечислены без remediation;
- `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` на этом этапе не редактировался.

---

## 6.9 ADMIN PANEL ADDENDUM - HTTPS + PGADMIN UPDATE (2026-09-19)

Scope of this addendum:

1. Only `admin.stubbornram.ru` HTTPS remediation and pgAdmin stable update.
2. No Stubborn Ram frontend/backend/auth-session logic changes.
3. No PostgreSQL schema/migration changes and no S3 changes.

Confirmed outcomes:

1. HTTPS for `admin.stubbornram.ru` is now valid and hostname-matching:

- certificate subject `CN=admin.stubbornram.ru`;
- SAN includes `admin.stubbornram.ru`.

2. HTTP to HTTPS redirect is active:

- `http://admin.stubbornram.ru` -> `301` -> `https://admin.stubbornram.ru/...`.

3. pgAdmin upgraded from `9.17` to stable `9.18` (`pgadmin4-web`, `pgadmin4-server`).

4. pgAdmin service after update:

- active listener: `127.0.0.1:5050`;
- service: `pgadmin4.service` active.

5. Existing pgAdmin PostgreSQL server profile preserved in pgAdmin config DB:

- retained profile points to `127.0.0.1:5432` / db `stubbornram` / user `stubbornram_app`.

6. Public regression checks remained healthy:

- `https://api.stubbornram.ru/health` -> `200`;
- `https://stubbornram.ru/` -> `200`.

7. External direct exposure checks:

- `5432` direct external access: closed;
- `5050` direct external access: closed.

Operational note from this update:

1. Existing custom `pgadmin4.service` needed runtime command adjustment after package update (upstream venv binary layout difference), fixed in place with service backup.

2FA status (documentation-only in this task):

1. 2FA is DEFERRED/FUTURE.
2. Email MFA currently not operational due to absent validated SMTP path.
3. Authenticator-based MFA is not configured in this step.
4. Must be handled in a separate dedicated hardening task.

Status impact:

1. Admin-panel infrastructure subset of F1-NV-03 is FIXED - VERIFIED.
2. HTTPS / redirect / service / external port closure checks: VERIFIED.
3. Browser login and PostgreSQL connection via pgAdmin UI: VERIFIED.
4. No evidence of regression for `api.stubbornram.ru` and `stubbornram.ru` in performed checks.

---

## CURRENT PRODUCTION DATABASE INVENTORY (READ-ONLY, 2026-09-19)

Scope of this inventory:

1. Read-only PostgreSQL inspection only.
2. Executed through the already available pgAdmin connection for `stubbornram/stubbornram_app@Stubborn Ram PostgreSQL`.
3. No schema changes, no migrations, no writes, no data updates.

Database identity:

1. Confirmed database name: `stubbornram`.
2. Inventory scope used `public` schema objects only.
3. Confirmed application object set in `public`: 12 tables plus 1 sequence.

Confirmed public objects:

1. Tables:

- `auth_tokens`
- `exercises`
- `leads`
- `media`
- `media_links`
- `pgmigrations`
- `profiles`
- `sessions`
- `training_set_notes`
- `users`
- `workout_exercises`
- `workout_sets`

2. Sequence:

- `pgmigrations_id_seq`

Row volume snapshot:

1. `exercises`: 232 rows.
2. `auth_tokens`: 14 rows.
3. `sessions`: 7 rows.
4. `users`: 5 rows.
5. `profiles`: 4 rows.
6. `leads`: 3 rows.
7. `workout_exercises`: 3 rows.
8. `media`: 2 rows.
9. `workout_sets`: 2 rows.
10. `pgmigrations`: 10 rows.
11. `media_links`: 0 rows.
12. `training_set_notes`: 0 rows.

Volume summary:

1. Total rows across the 12 tables above: 272, excluding `pgmigrations`.
2. Total rows including `pgmigrations`: 282.
3. Data is concentrated in `exercises`; the remaining tables are small or sparse.

Confirmed relationships and constraints:

1. `auth_tokens.id` is the primary key.
2. `auth_tokens.user_id` references `users.id`.
3. `auth_tokens.token_hash` is unique.
4. `exercises.id` is the primary key.
5. `exercises.user_id` references `users.id`.
6. `leads.id` is the primary key.
7. `media.id` is the primary key.
8. `media.author_id` references `users.id`.
9. `media.owner_id` references `users.id`.
10. `media.object_key` is unique.
11. `media_links.id` is the primary key.
12. `media_links.media_id` references `media.id`.
13. `pgmigrations.id` is the primary key.

Data-shape observations:

1. The schema is application-centered and uses UUID primary keys in the confirmed tables.
2. Auth/session ownership is user-linked through `users.id`.
3. Media is modeled with explicit author/owner ownership plus a unique object key.
4. `media_links` and `training_set_notes` are currently empty.
5. `pgmigrations` is the only confirmed migration-tracking table in the public inventory.

Статус inventory:

1. Public-schema production inventory: VERIFIED.
2. Read-only constraint respected throughout.
3. No evidence of unintended writes or schema drift from this inspection path.

---

## FOUNDATION REMEDIATION CURRENT STATUS SYNCHRONIZATION

Статус Foundation Remediation:

1. COMPLETED WITH DOCUMENTED LIMITATIONS.
2. Closed items remain closed as already recorded in the roadmap and log.
3. F1-SEC-01 remains PARTIALLY VERIFIED because the production email-failure scenario is still not reproduced.
4. F1-NV-01 remains FIXED — VERIFIED.
5. F1-NV-02 remains VERIFIED.
6. F1-NV-03 remains FIXED — VERIFIED with documented admin-panel limitations.

Deferred items:

1. F1-API-02.
2. F1-SEC-04.
3. CSRF token enhancement.
4. pgAdmin 2FA/MFA.

Current blocked items:

1. 0.

Next phase:

1. Further product-development work proceeds under the main project roadmap rather than Foundation Remediation.
