# PROJECT FOUNDATION REMEDIATION LOG — 2026-09-19

## Log Purpose

Этот файл фиксирует фактический ход Foundation Remediation:

- что реально проверено;
- что реально изменено;
- что подтверждено/не подтверждено;
- какие решения приняты;
- какие вопросы остаются открытыми.

Roadmap находится в отдельном файле:

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md

---

## ENTRY FR-00 — FOUNDATION REMEDIATION START

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-00

What was checked:

- Факт перехода проекта в режим Foundation Remediation (без разработки новых продуктовых модулей).
- Наличие и актуальность roadmap-файла.

Why:

- Зафиксировать baseline этапа до implementation.

Artifacts checked:

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md

Before:

- Remediation log отсутствовал.

Action:

- Подготовка framework для фиксации истории remediation.

After:

- Режим Foundation Remediation подтвержден как рабочий контекст.

Verification:

- Roadmap прочитан и подтвержден как active source для scope.

Code/DB/Prod impact:

- NO CODE CHANGE
- NO DB CHANGE
- NO PRODUCTION CHANGE

Files changed:

- none

Remaining limitations/questions:

- none

---

## ENTRY FR-01 — PHASE 0 BASELINE VERIFICATION (FD-01..FD-07)

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-01

What was checked:

- Phase 0 baseline для FD-01..FD-07.
- In-scope chain integrity на уровне фактов audit + code.

Why:

- Подтвердить, что backlog Foundation Remediation строится на доказательствах, а не на предположениях.

Checked scope details:

- auth/session chain;
- training core persistence chain;
- materials GET/PUT parity gap;
- report bypass existence;
- migration 5918 divergence;
- repository/runtime mismatch по media/storage;
- docs drift, влияющий на foundation decisions.

Artifacts checked:

- PROJECT_FULL_AUDIT_2026-09-19.md
- backend/server.js
- backend/modules/auth/\*
- backend/modules/training/training.routes.js
- src/modules/training/services/trainingMaterialsService.js
- src/modules/report/ReportPlaceholderPage.jsx
- backend/migrations/1788859125918_training_templates.js

Before:

- Phase 0 conclusions существовали в переписке, но не были внесены в отдельный log.

Action:

- Выполнена read-only верификация фактов и классификаций.

After:

- Baseline подтвержден и пригоден для decision-gated planning.

Verification:

- Route/flow evidence и code-path evidence сверены.

Code/DB/Prod impact:

- NO CODE CHANGE
- NO DB CHANGE
- NO PRODUCTION CHANGE

Files changed:

- none

Remaining limitations/questions:

- DG-1, DG-2, DG-3 требовали отдельной формализации.

---

## ENTRY FR-02 — DG-1 READ-ONLY PROVENANCE CHECK

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-02

What was checked:

- Какой backend artifact реально запущен в production.
- PM2 script path/cwd/env/startup state.
- Наличие deployed media/storage modules и register-chain.
- Runtime route availability через read-only probes.
- Сопоставление hash локального и deployed server.js.

Why:

- Установить фактическую природу repository/runtime mismatch без deployment действий.

Checked artifacts/endpoints/config:

- production path: /opt/stubbornram/backend/server/server.js
- production modules dir: /opt/stubbornram/backend/server/modules
- pm2 show/env/pid for stubbornram-backend
- systemctl pm2-stubbornram
- routes: /health, /api/training/workouts, /api/media/upload, /api/media/:id, /api/auth/login
- local backend/server.js hash vs deployed backend/server.js hash

Before:

- mismatch был подтвержден audit-ом, но требовалась актуальная provenance-проверка.

Action:

- Выполнены только read-only ssh + HTTP probes.

After:

- Подтверждено:
  - repository включает media/storage registration;
  - deployed production artifact не включает media/storage modules;
  - production media routes недоступны (404), training/auth маршруты присутствуют;
  - deployed artifact не содержит git metadata в runtime path;
  - hash server.js в repo и на production различаются.

Verification results:

- /health = 200
- /api/training/workouts = 401
- /api/media/upload = 404 (GET и POST)
- /api/media/:id = 404
- /api/auth/login POST = 401 (route exists)
- PM2 script path/cwd подтверждены
- Deployed modules: auth/db/email/leads/training
- Deployed media/storage: absent

Decision outcome:

- DG-1 classification: INSUFFICIENT EVIDENCE
- Media/storage deployment remediation: BLOCKED

Code/DB/Prod impact:

- NO CODE CHANGE
- NO DB CHANGE
- NO PRODUCTION CHANGE

Files changed:

- none

Remaining limitations/questions:

- Не доказан intent mismatch (deployment defect vs intentional non-rollout vs stale artifact) без дополнительной provenance metadata.

---

## ENTRY FR-03 — DG-2 READ-ONLY DEPENDENCY CHECK FOR 5918

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-03

What was checked:

- Полный состав объектов миграции 5918.
- Технические зависимости 5919/5920/5921 от объектов 5918.
- Repository references к template tables в backend SQL/API.
- Связь template tables с in-scope foundation flows.

Why:

- Принять безопасную позицию по 5918 без применения миграций.

Checked artifacts:

- backend/migrations/1788859125918_training_templates.js
- backend/migrations/1788859125919_media.js
- backend/migrations/1788859125920_media_status.js
- backend/migrations/1788859125921_training_set_notes.js
- backend/\*_ search for training_templates_

Before:

- В production отсутствует 5918 при наличии 5919/5920/5921.

Action:

- Выполнен read-only code/migration dependency analysis.

After:

- Подтверждено:
  - 5918 создает только template tables;
  - 5919/5920/5921 не имеют прямой технической зависимости от template tables;
  - active in-scope backend SQL/API не ссылается на template tables;
  - текущие in-scope foundation flows не требуют 5918.

Decision outcome:

- DG-2: CONTROLLED DIVERGENCE
- 5918 сейчас не применять.
- Пересмотр только при включении Templates в scope или появлении реальной dependency.

Code/DB/Prod impact:

- NO CODE CHANGE
- NO DB CHANGE
- NO PRODUCTION CHANGE

Files changed:

- none

Remaining limitations/questions:

- Необходим контроль, чтобы новые in-scope изменения случайно не внесли template dependency.

---

## ENTRY FR-04 — PHASE 1 BACKLOG NORMALIZATION + F1-SEC-01/F1-PST-01 RECHECK

Date: 2026-09-19
Статус: COMPLETED
Task ID: FR-04

What was checked:

- Нормализация Phase 1 backlog по категориям:
  A CONFIRMED REMEDIATION
  B VERIFICATION
  C NEEDS USER DECISION
  D DEFERRED / OUT OF CURRENT SCOPE
  E NOT VERIFIED
- Повторная проверка F1-SEC-01.
- Повторная проверка F1-PST-01.

Why:

- Подготовить implementation backlog без запуска implementation.

Checked files/modules:

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- backend/modules/auth/auth.routes.js
- backend/modules/auth/auth.session.js
- src/services/auth/authService.js
- backend/modules/training/training.routes.js
- src/modules/training/services/trainingMaterialsService.js
- src/modules/training/components/cards/TrainingExerciseCard.jsx

Before:

- Backlog существовал, но требовал нормализации классификаций и explicit фиксации DG-1/DG-2 решений.
- F1-SEC-01 был предварительно отмечен как потенциальный remediation-item без окончательной переоценки.

Action:

- Обновлен roadmap:
  - добавлена секция Phase 1 Normalized Backlog;
  - зафиксированы DG-1 и DG-2 outcomes;
  - F1-SEC-01 переоценен;
  - F1-PST-01 подтвержден как первый ready remediation candidate;
  - logout-all-devices исключен из обязательных Phase 3 задач.

After:

- F1-SEC-01 классифицирован как NEEDS USER DECISION (UX ambiguity с recovery path, не auto-confirmed defect).
- F1-PST-01 подтвержден как CONFIRMED REMEDIATION — READY.

Verification:

- Registration flow recheck:
  - users/profiles commit выполняется до sendVerificationEmail;
  - при send-fail возможна ошибка на frontend при уже созданном user;
  - recovery path существует через resend verification и repeat registration behavior.
- Materials write path recheck:
  - backend PUT endpoint существует;
  - frontend write service path отсутствует;
  - current UI загружает материалы, но не подтвержден persist write path.

Code/DB/Prod impact:

- NO CODE CHANGE
- NO DB CHANGE
- NO PRODUCTION CHANGE

Files changed:

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

Remaining limitations/questions:

- Требуется user decision по CSRF minimum baseline.
- Требуется user decision по session cleanup minimum baseline.
- DG-1 остается blocked until further provenance evidence or explicit policy decision.

---

## Текущий снимок состояния remediation

Date: 2026-09-19
Статус: VERIFIED

1. DG-2 resolved: CONTROLLED DIVERGENCE (5918 deferred).
2. DG-1 unresolved: INSUFFICIENT EVIDENCE; deployment remediation blocked.
3. First confirmed ready remediation candidate: F1-PST-01.
4. Out-of-scope modules remain deferred and untouched.
5. Текущий шаг включал только обновления документации.

Code/DB/Prod impact summary:

- NO CODE CHANGE
- NO DB CHANGE
- NO PRODUCTION CHANGE

---

## ENTRY FR-05 — F1-PST-01 TRAINING MATERIALS WRITE PATH

Date: 2026-09-19
Статус: IMPLEMENTED — NOT YET VERIFIED
Task ID: FR-05

TASK:

- F1-PST-01 — Training Materials Write Path

BEFORE:

- Frontend загружал материалы через `getSetMaterials`, но не имел frontend write method для `PUT /api/training/sets/:setId/materials`.
- В `TrainingExerciseCard` кнопка `Сохранить` только переключала локальный режим редактирования и не вызывала backend.
- Комментарий в modal не был связан с состоянием компонента (`textarea` без `value`/`onChange` для persistence-пути).
- Фото добавлялись только в локальный preview-state (`photoFiles`) без вызова upload+persist chain.

WHAT WAS CHECKED:

- Frontend component chain:
  - `src/modules/training/components/cards/TrainingExerciseCard.jsx`
  - `src/modules/training/services/trainingMaterialsService.js`
  - `src/shared/lib/apiClient.js`
- Backend endpoint chain:
  - `backend/modules/training/training.routes.js` (`GET/PUT /api/training/sets/:setId/materials`)
- Media upload contract, используемый в существующей архитектуре:
  - `src/modules/media/services/mediaService.js`
  - `backend/modules/media/media.routes.js`
- DB model, используемая endpoint:
  - `backend/migrations/1788859125921_training_set_notes.js`
  - `backend/migrations/1788859125919_media.js`
  - `backend/migrations/1788859125915_training.js`

ACTION:

- Добавлен frontend write method `saveSetMaterials` в существующий `trainingMaterialsService`.
- Подключен write-path в `TrainingExerciseCard`:
  - `Сохранить` теперь вызывает `saveSetMaterials`;
  - comment привязан к локальному state и передается в payload;
  - новые фото проходят через существующий `uploadMediaFile` и их `mediaId` включается в `mediaIds`;
  - после успешного PUT выполняется повторный GET `getSetMaterials` для актуализации UI;
  - добавлен минимальный UI error-state и блокировка кнопки во время сохранения.
- Изменения ограничены существующей архитектурой `Component -> Service -> apiClient -> Backend API -> Fastify -> PostgreSQL`.

AFTER:

- Frontend имеет рабочий кодовый write-path до существующего backend endpoint для материалов подхода.
- Service/apiClient/backend-method/endpoint/payload связаны в единую цепочку.
- После сохранения предусмотрен refresh материалов через повторный GET.

VERIFICATION:

1. Frontend build/type/lint:
   - `npm run build`: PASS
   - `npm run lint`: PASS (warnings only, без блокирующих ошибок)
   - type-check script: NOT VERIFIED (отдельный type script отсутствует в package scripts)
2. Корректный вызов service: PASS (code-path подтвержден)
3. Корректный вызов apiClient: PASS (`request(...)` используется в service)
4. Правильный HTTP method: PASS (`PUT`)
5. Правильный endpoint: PASS (`/training/sets/:setId/materials`)
6. Payload: PASS (`comment`, `mediaIds`)
7. Authentication: PASS (backend route содержит `getAuthenticatedUser`, code-level verification)
8. Ownership: PASS (backend ownership check через join до `workouts.user_id = authUser.userId`, code-level verification)
9. Backend response contract: PASS (обработан success/error путь, code-level verification)
10. Сохранение в PostgreSQL: NOT VERIFIED (runtime DB проверка не выполнена в этом шаге)
11. Повторное получение данных: PASS (после PUT вызывается GET в коде)
12. Сохранение после reload: NOT VERIFIED (не выполнена end-to-end runtime с авторизованной сессией)

FILES CHANGED:

- src/modules/training/services/trainingMaterialsService.js
- src/modules/training/components/cards/TrainingExerciseCard.jsx
- src/modules/training/components/cards/TrainingExerciseCard.css
- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- Нужна отдельная runtime E2E verification с авторизованной user-сессией для пунктов DB persistence и reload persistence.

---

## ENTRY FR-06 — F1-PST-01 RUNTIME VERIFICATION

Date: 2026-09-19
Статус: FIXED — VERIFIED
Task ID: FR-06

TASK:

- F1-PST-01 — Training Materials Write Path (runtime verification close-out)

BEFORE:

- В FR-05 статус был `IMPLEMENTED — NOT YET VERIFIED`.
- Причина: runtime-подтверждение сохранения в PostgreSQL и сохранения после reload отсутствовало.

WHAT WAS CHECKED:

- Runtime-проверка в локальном окружении через существующую инфраструктуру:
  - frontend runtime: `http://localhost:5173`
  - backend runtime: `http://127.0.0.1:3000/api`
  - авторизованная сессия подтверждена через `GET /api/auth/session` (200, authenticated user)
- Использован существующий persisted training set:
  - workoutId: `f2cae4b8-24c2-4f0d-afc9-0aeb861d0202`
  - setId: `609773e3-39eb-45a6-9fcf-b8d440924a07`
- Проверены шаги:
  1. изменение комментария материала через существующий UI modal;
  2. сохранение кнопкой `Сохранить` в UI;
  3. фактический PUT endpoint result;
  4. последующий GET result;
  5. page reload;
  6. повторный GET после reload;
  7. ownership/error contract deny path для non-owned/unknown setId.

ACTION:

- Выполнена только runtime verification.
- Изменений кода для этого verification step не выполнялось.

AFTER:

- F1-PST-01 подтверждён в runtime как закрытый.
- Статус обновлен на `FIXED — VERIFIED`.

VERIFICATION:

1. PUT (`/api/training/sets/:setId/materials`) через UI save:

- PASS
- status: 200
- response: `{"setId":"609773e3-39eb-45a6-9fcf-b8d440924a07","type":"CLIENT_NOTE","comment":"F1-PST-01 runtime via typed input 2026-09-19T11:55:30Z","mediaIds":[]}`

2. GET после UI save (`/api/training/sets/:setId/materials`):

- PASS
- status: 200
- materials содержит `CLIENT_NOTE.comment = "F1-PST-01 runtime via typed input 2026-09-19T11:55:30Z"`

3. Reload persistence:

- PASS
- после `page reload` повторный GET вернул тот же comment без изменений

4. Ownership/error contract:

- PASS (deny behavior)
- `PUT /api/training/sets/11111111-1111-4111-8111-111111111111/materials` => 404
- response: `{"error":"SET_NOT_FOUND","message":"Подход не найден."}`

FILES CHANGED (this verification step):

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- none for F1-PST-01 close-out.

---

## ENTRY FR-07 — F1-PST-02 MATERIALS WRITE ERROR/OWNERSHIP INTEGRATION CONSISTENCY

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-07

TASK:

- F1-PST-02 — Materials write error/ownership integration consistency

BEFORE:

- F1-PST-02 имел статус `READY`.
- Требовалось подтвердить runtime-поведение только целевой цепочки:
  `TrainingExerciseCard -> trainingMaterialsService.saveSetMaterials -> apiClient -> PUT /api/training/sets/:setId/materials`.

WHAT WAS CHECKED:

1. Error path в UI при неуспешном PUT:

- проверен backend-like ownership/validation ответ `404 { error: "SET_NOT_FOUND", message: "Подход не найден." }` через targeted runtime interception одного PUT-запроса;
- проверено, что UI остаётся в режиме редактирования (`Сохранить`), показывает текст ошибки и не переходит в ложное состояние «сохранено».

2. Success path после error path:

- проверен успешный PUT (200) на существующем setId;
- проверен существующий GET refresh (200) после PUT;
- проверено отсутствие ошибки в UI после успешного сохранения.

3. Persistence consistency:

- проверен GET после сохранения;
- проверен GET после reload страницы;
- comment остаётся неизменным после reload.

4. Ownership deny contract (фактический backend ответ):

- проверен `PUT /api/training/sets/11111111-1111-4111-8111-111111111111/materials`;
- получен deny-ответ `404 SET_NOT_FOUND`, что корректно отражает ownership/availability contract.

Runtime context:

- Авторизованная user-session подтверждена в локальном runtime.
- Проверяемый workoutId: `f2cae4b8-24c2-4f0d-afc9-0aeb861d0202`.
- Проверяемый setId: `609773e3-39eb-45a6-9fcf-b8d440924a07`.

ACTION:

- Код не изменялся.
- Выполнена только целевая runtime verification.

AFTER:

- Целевая цепочка error/success/refresh/reload/ownership работает консистентно.
- F1-PST-02 закрыт как `VERIFIED` без code fix.

VERIFICATION:

1. PUT error path (simulated backend-like ownership/validation response): PASS

- status: 404
- body: `{ "error": "SET_NOT_FOUND", "message": "Подход не найден." }`
- UI: остался в edit mode, ошибка показана (`Подход не найден.`)

2. PUT success path: PASS

- status: 200
- endpoint: `/api/training/sets/609773e3-39eb-45a6-9fcf-b8d440924a07/materials`

3. GET refresh после PUT: PASS

- status: 200

4. GET после сохранения: PASS

- status: 200
- сохранён comment: `F1-PST-02 success runtime 2026-09-19T11:58:20Z`

5. Reload persistence: PASS

- после reload повторный GET: 200
- comment совпадает с сохранённым значением

6. Ownership deny (backend factual check): PASS

- non-owned/unknown setId PUT -> 404 `SET_NOT_FOUND`

FILES CHANGED (this step):

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- none for F1-PST-02.

---

## ENTRY FR-08 — F1-API-01 IN-SCOPE API CONTRACT VERIFICATION

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-08

BEFORE:

- F1-API-01 имел статус `READY`.
- Требовалось подтвердить контракт только для in-scope цепочек:
  - auth/session;
  - user/profile (если существует);
  - questionnaire/coaching flow (если существует);
  - training (workouts/exercises/sets/materials);
  - media endpoints только в части, реально используемой in-scope flows.

ACTION:

- Выполнена узкая code-level + runtime verification без общего API/backend аудита.
- Out-of-scope модули не проверялись.
- Изменений кода не вносилось.

AFTER:

- In-scope API contract подтверждён по существующим цепочкам.
- Не выявлено дефектов, требующих правок в рамках F1-API-01.

VERIFICATION:

### 1) auth/session chain

Code-level:

- `AuthContext.refreshSession -> authService.getSession -> apiClient.request('/auth/session')`.
- `apiClient` использует `credentials: include`.
- Backend route: `GET /api/auth/session` возвращает `{ user, authenticated: true }` либо `401 UNAUTHENTICATED`.

Runtime:

- `GET /api/auth/session` => `200`, body содержит `user` и `authenticated: true`.

### 2) user/profile chain (existing scope)

Code-level:

- Отдельного profile API route/service в in-scope UI не используется.
- `ProfilePage` читает `user` из `AuthContext` (источник: `GET /api/auth/session`).

Runtime:

- Response shape `/auth/session` содержит профильные поля (`first_name`, `last_name`) и `email`.

### 3) questionnaire/coaching flow chain (existing scope)

Code-level:

- `Questionnaire -> createLead (leadService) -> apiClient.request('/leads', POST)`.
- Backend route: `POST /api/leads` с Zod validation (`VALIDATION_ERROR` + `details`).
- `leadService` не теряет backend error contract: прокидывает `error.message`, `error.error` как `code`, `error.details` в исключение.

Runtime:

- `POST /api/leads` с невалидным payload => `400`.
- Body: `error: VALIDATION_ERROR`, `message`, `details.fieldErrors` присутствуют.

### 4) training chain (workouts/exercises/sets/materials)

Code-level:

- `TrainingPage -> trainingService -> apiClient`:
  - `GET /training/workouts`
  - `GET /training/workouts/:id`
  - `POST /training/workouts`
  - `PUT /training/workouts/:id`
- `TrainingExerciseCard -> trainingMaterialsService -> apiClient`:
  - `GET /training/sets/:setId/materials`
  - `PUT /training/sets/:setId/materials`
- Backend маршруты и payload/method соответствуют frontend service-контрактам.

Runtime:

- `GET /api/training/workouts` => `200` (ожидаемый список `workouts`).
- `GET /api/training/workouts/:id` => `200` (ожидаемый workout detail shape).
- `GET /api/training/sets/:setId/materials` => `200` (ожидаемый `materials[]`).
- Ownership deny:
  - `PUT /api/training/sets/11111111-1111-4111-8111-111111111111/materials` => `404 SET_NOT_FOUND`.
  - Ошибка не теряется в frontend path (подтверждено ранее в F1-PST-02 runtime).

### 5) media endpoints used by in-scope flows

Code-level:

- `TrainingExerciseCard` использует `uploadMediaFile` (из `mediaService`) для файлов материалов подхода.
- `mediaService` использует `apiClient` для `POST /media/upload`, `POST /media/:id/complete`, `GET /media/:id`, `DELETE /media/:id`.

Runtime:

- Validation contract check:
  - `POST /api/media/upload` с invalid payload (`sizeBytes: 0`) => `400 INVALID_FILE_SIZE`.

Статус: - VERIFIED

FILES CHANGED (this step):

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- none for F1-API-01 in current in-scope chains.

---

## ENTRY FR-09 — F1-ENV-01 LOCAL / PRODUCTION CONSISTENCY CHECK (IN-SCOPE)

Date: 2026-09-19
Статус: BLOCKED
Task ID: FR-09

BEFORE:

- F1-ENV-01 имел статус `READY`.
- Требовалась узкая проверка согласованности local/prod окружения только для существующих foundation-цепочек.

ЧТО ПРОВЕРЕНО:

1. Frontend API URL:

- `.env.development`: `VITE_API_BASE_URL=http://127.0.0.1:3000/api`
- `.env.production`: `VITE_API_BASE_URL=https://api.stubbornram.ru/api`

2. Backend API base path:

- backend routes объявлены с префиксом `/api/...` (auth/leads/training/media).
- runtime probes по `/api/...` выполнены для local/prod.

3. Nginx -> Fastify -> PM2 в production:

- `systemctl is-active nginx`: `active`.
- `pm2 show stubbornram-backend`: process `online`, script path `/opt/stubbornram/backend/server/server.js`, cwd `/opt/stubbornram/backend/server`.
- `https://api.stubbornram.ru/health`: `200`.

4. Production frontend -> production API:

- CORS preflight к `https://api.stubbornram.ru/api/auth/session` с Origin `https://stubbornram.ru`: `204`, `Access-Control-Allow-Origin: https://stubbornram.ru`, `Access-Control-Allow-Credentials: true`.
- fetch с production frontend-страницы к production API: `401 UNAUTHENTICATED` (ожидаемо без active production session в текущем browser context).

5. Local frontend -> local backend:

- fetch с local frontend страницы к `http://127.0.0.1:3000/api/auth/session`: `200`, authenticated response получен.

6. Environment variables (in-scope only):

- code-level usage подтверждена для `DB_*`, `NODE_ENV`, `S3_*`.
- production runtime evidence по env keys: НЕДОСТАТОЧНО ДОКАЗАТЕЛЬСТВ для полного списка (безопасная проверка вывела неполные данные).

7. Cookie/session settings:

- `apiClient` использует `credentials: include`.
- backend CORS `credentials: true` + allowlist origins (`localhost:5173`, `127.0.0.1:5173`, `https://stubbornram.ru`).
- session cookie: `httpOnly`, `secure`, `sameSite: none`, `path: /`.
- local preflight к `/api/auth/session`: `204`, `ACAO: http://localhost:5173`, `ACAC: true`.

8. DB connection/config (environment correctness scope):

- backend DB pool использует `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`.
- `/health` local/prod = `200` (база доступна на runtime).

9. Production backend configuration actuality (runtime, не repo-only):

- production `server.js` runtime registration содержит `authRoutes`, `leadsRoutes`, `trainingRoutes`.
- `storagePlugin` и `mediaRoutes` в production runtime bootstrap отсутствуют.
- production probe `POST /api/media/upload` => `404`, при этом local media validation route отвечает `400 INVALID_FILE_SIZE`.

ЧТО ОБНАРУЖЕНО:

1. API URL и `/api` base path настроены ожидаемо для dev/prod.
2. Local и production auth/session chain сетево согласованы (CORS+credentials, expected 200/401 semantics).
3. Подтвержден production runtime composition mismatch: local backend включает media/storage цепочку, production runtime — нет.
4. Этот mismatch напрямую связан с ранее зафиксированным DG-1.
5. Полная верификация production env keyset: НЕ ПРОВЕРЕНО в полном объёме (недостаточно безопасно подтверждённых данных без расширенного доступа).

ACTION:

- Код/БД/production не изменялись.
- Выполнена только проверка и документирование фактического состояния.
- Вопрос вынесен в статус BLOCKED по линии DG-1 (без самостоятельного production remediation).

AFTER:

- F1-ENV-01 закрыть как PASS нельзя из-за подтверждённого runtime composition mismatch local vs production.
- F1-ENV-01 классифицирован как `BLOCKED (DG-1)` до отдельного решения по production media/storage composition.

VERIFICATION:

- Local `/health`: 200
- Prod `/health`: 200
- Local `/api/auth/session` (без cookie через terminal): 401
- Prod `/api/auth/session` (без cookie через terminal): 401
- Local frontend -> local API `/api/auth/session`: 200 authenticated
- Prod frontend origin preflight -> prod API `/api/auth/session`: 204 + ACAO/ACAC корректны
- Prod backend runtime routes:
  - `/api/training/workouts`: 401 (route exists)
  - `/api/auth/login` POST: 401 (route exists)
  - `/api/media/upload` POST: 404 (route absent in active runtime)

Статус: - BLOCKED

FILES CHANGED (this step):

- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- Для полного закрытия F1-ENV-01 требуется user decision по DG-1 (какая production backend composition считается целевой для текущего foundation scope).

---

## ENTRY FR-10 — F1-ENV-01 / DG-1 MINI-CHECK: ПРОИСХОЖДЕНИЕ РАСХОЖДЕНИЯ LOCAL VS PRODUCTION

Date: 2026-09-19
Статус: PASS
Task ID: FR-10

BEFORE:

- F1-ENV-01 уже был зафиксирован как `BLOCKED (DG-1)` из-за runtime composition mismatch.
- Требовалось узко установить происхождение расхождения LOCAL/PRODUCTION без исправления production.
- Принятое решение по процессу: Localhost и Production должны быть функционально одинаковыми после деплоя, при раздельных данных и инфраструктуре.

ЧТО ПРОВЕРЕНО:

1. LOCAL backend provenance и composition:

- local HEAD commit;
- local `backend/server.js` registrations;
- local modules directory;
- local route probe для media.

2. PRODUCTION runtime provenance и composition:

- `pm2 show stubbornram-backend` (script path/cwd/process state);
- фактический `/opt/stubbornram/backend/server/server.js` (registration lines);
- production modules directory;
- наличие/отсутствие `.git` metadata в runtime path;
- hash local `server.js` vs production `server.js`.

3. Runtime behavior parity probes:

- local `POST /api/media/upload`;
- production `POST /api/media/upload`;
- production `GET /api/training/workouts`.

ЧТО ОБНАРУЖЕНО:

LOCAL (ПОДТВЕРЖДЕНО):

- commit: `9fdc243d430cbfee5964871395fdc5740cdd15e4`.
- `backend/server.js` регистрирует `authRoutes`, `leadsRoutes`, `trainingRoutes`, `storagePlugin`, `mediaRoutes`.
- local modules: `auth`, `db`, `email`, `leads`, `media`, `storage`, `training`.
- local `POST /api/media/upload` -> `401` (route существует, требуется auth).

PRODUCTION (ПОДТВЕРЖДЕНО):

- active process: PM2 `stubbornram-backend`, script `/opt/stubbornram/backend/server/server.js`, cwd `/opt/stubbornram/backend/server`.
- production `server.js` регистрирует только `authRoutes`, `leadsRoutes`, `trainingRoutes`.
- production modules: `auth`, `db`, `email`, `leads`, `training` (без `media`, `storage`).
- production `POST /api/media/upload` -> `404` (route отсутствует в активном runtime).
- production runtime path: `.git` metadata отсутствует.
- hash `server.js` LOCAL и PRODUCTION различается.

Классификация причин (по главному вопросу):

1. Production просто не обновлён до локального функционального состава media/storage:

- ПОДТВЕРЖДЕНО ЧАСТИЧНО (по факту mismatch артефакта).

2. Production запущен из другой версии/commit:

- ПОДТВЕРЖДЕНО ЧАСТИЧНО (контент runtime-файла другой; git commit в runtime path недоступен).

3. Используется другой `server.js`:

- ПОДТВЕРЖДЕНО (фактический production `server.js` отличается по составу registrations и hash).

4. Другой deployment path:

- НЕ ПОДТВЕРЖДЕНО (pm2 path стабильно указывает на `/opt/stubbornram/backend/server/server.js`).

5. Иная причина:

- НЕДОСТАТОЧНО ДОКАЗАТЕЛЬСТВ.

ACTION:

- Выполнена только read-only forensic-проверка происхождения расхождения.
- Внесена документационная фиксация фундаментального решения LOCAL/PRODUCTION в audit.
- Никаких изменений runtime/деплоя не выполнялось.

AFTER:

- Происхождение расхождения на уровне фактов установлено: production runtime использует backend-артефакт без media/storage слоя, тогда как local/repository содержит этот слой.
- Глубинная provenance-причина (каким именно процессом возник drift) остаётся не полностью доказанной.
- Фундаментальный принцип Local/Production формально зафиксирован в audit как архитектурное решение.

VERIFICATION:

- LOCAL:
  - `git rev-parse HEAD` = `9fdc243d430cbfee5964871395fdc5740cdd15e4`
  - local `server.js` содержит `storagePlugin` и `mediaRoutes`
  - local modules dir содержит `media` и `storage`
  - local `POST /api/media/upload` = `401`
- PRODUCTION:
  - pm2 process `online`, script path/cwd подтверждены
  - production `server.js` без `storagePlugin`/`mediaRoutes`
  - production modules dir без `media`/`storage`
  - production `.git` metadata отсутствует
  - production `POST /api/media/upload` = `404`
  - production `GET /api/training/workouts` = `401`

Статус: - PASS (цель mini-подзадачи достигнута: происхождение расхождения установлено на фактическом уровне).

FILES CHANGED (this step):

- PROJECT_FULL_AUDIT_2026-09-19.md
- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- Для полного закрытия DG-1 как remediation action нужен отдельный user decision по способу controlled rollout выравнивания production к принятому принципу функционального паритета.

---

## ENTRY FR-11 — F1-ENV-01 / DG-1 SAFE ALIGNMENT PLAN (READ-ONLY)

Date: 2026-09-19
Статус: PASS
Task ID: FR-11

BEFORE:

- DG-1 artifact drift был подтверждён как факт (`FR-10`).
- Требовалось определить, как безопасно выровнять production backend с localhost по runtime composition без потери production-данных.
- Жёсткое ограничение шага: без deployment, без изменения production, без DB/migration действий.

ЧТО ПРОВЕРЕНО:

1. Документация:

- `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`
- `docs/SERVER/SERVER_STATE.md`
- `docs/INFRASTRUCTURE_MIGRATION.md`
- актуальные `PROJECT_FULL_AUDIT_2026-09-19.md`, `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`, `PROJECT_REMEDIATION_ROADMAP_2026-09-19.md`.

2. LOCAL backend deployment-surface:

- local HEAD;
- backend runtime files/modules;
- `backend/package.json` scripts (`start`, `migrate`);
- наличие/отсутствие backend deploy scripts/ecosystem configs.

3. PRODUCTION runtime facts (по уже зафиксированным read-only evidence):

- PM2 process path/cwd/script;
- Nginx proxy chain;
- deployed module composition;
- runtime `.git` metadata presence/absence.

4. DB/migrations safety:

- как migrations запускаются технически;
- возможен ли backend deployment без DB изменения.

5. Media/storage safety:

- какие сущности являются данными (вне backend code);
- может ли backend code deployment удалить production media.

ЧТО ОБНАРУЖЕНО:

ПОДТВЕРЖДЕНО:

1. Production backend работает из `/opt/stubbornram/backend/server` под PM2 `stubbornram-backend`.
2. Nginx проксирует API на `127.0.0.1:3000`.
3. В repo отсутствуют backend CI/CD workflow, deploy-script и PM2 ecosystem config.
4. Единственный workflow `.github/workflows/deploy.yml` относится к frontend GitHub Pages.
5. `npm start` не запускает migrations автоматически; migrations запускаются отдельной командой `npm run migrate`.
6. Выравнивание backend-кода возможно выполнить без изменения DB, если строго не запускать migrate-команды.
7. Production DB и production media/storage являются данными вне backend source-кода и не должны изменяться code deployment-ом.

НЕ ПОДТВЕРЖДЕНО:

1. Точный historical механизм, которым ранее выполняли backend deployment в production.
2. Наличие внешнего deploy-script вне текущего repository/runtime evidence.
3. Полная S3 control-plane конфигурация (policy/ACL/lifecycle/versioning/CORS/encryption).

ТРЕБУЕТ РЕШЕНИЯ:

1. Подтверждение policy deployment: `NO MIGRATIONS`, `NO .env overwrite`, `code-only`.
2. Утверждение обязательного pre-deploy backup объёма (backend artifact + production DB).
3. Утверждение rollback SLA и downtime окна.
4. Подтверждение readiness production S3 env/config для media runtime после выравнивания.

Сравнение deployment-вариантов (итог):

1. Вариант A: in-place update текущего runtime path + PM2 restart:

- ПОДТВЕРЖДЕНО как самый применимый и наименее рискованный для текущей архитектуры.

2. Вариант B: git pull в runtime path:

- НЕ ПОДТВЕРЖДЕНО как доступный сейчас (`.git` отсутствует в active runtime path).

3. Вариант C: параллельный path/blue-green-like:

- НЕ ПОДТВЕРЖДЕНО как уже предусмотренный механизм в текущей инфраструктуре.

Рекомендация:

1. Технически предпочтителен Вариант A (in-place artifact update) при строгой дисциплине:

- предварительные backup/checks;
- `NO MIGRATIONS`;
- сохранение production `.env`;
- post-restart verification;
- готовый rollback artifact.

ACTION:

- Выполнено только read-only исследование и документирование безопасной последовательности:
  PRE-CHECK -> BACKUP -> DEPLOY -> RESTART -> VERIFY -> ROLLBACK IF NEEDED.
- Production/runtime/DB/env/migrations не изменялись.

AFTER:

- Способ безопасного выравнивания DG-1 определён и формализован.
- Реально применимые варианты и их ограничения зафиксированы.
- Требуемые owner decisions перед фактическим rollout выделены отдельно.

VERIFICATION:

1. `backend/package.json` подтверждает раздельность `start` и `migrate`.
2. `.github/workflows/deploy.yml` подтверждает frontend-only deployment pipeline.
3. Runtime facts PM2/Nginx/path/deployed modules опираются на подтверждённые evidence FR-09/FR-10 и audit.
4. В audit добавлен отдельный DG-1 safe-alignment блок с вариантами, рисками и rollback-последовательностью.

Статус: - PASS (цель шага достигнута: безопасный план выравнивания сформирован без изменений production).

FILES CHANGED (this step):

- PROJECT_FULL_AUDIT_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- Фактический deployment по DG-1 остаётся BLOCKED до owner decision по policy и окну rollout/rollback.

---

## ENTRY FR-12 — F1-ENV-01 / DG-1 PRACTICAL DEPLOYMENT PACKAGE SPEC (READ-ONLY)

Date: 2026-09-19
Статус: PASS
Task ID: FR-12

BEFORE:

- FR-11 определил общий безопасный план DG-1.
- Требовалось выделить именно практический состав deployment-пакета: что переносить, что не переносить, backup минимум, rollback, migrations policy.
- Ограничение: только анализ/план, без deployment действий.

ЧТО ПРОВЕРЕНО:

1. Текущая backend-структура `backend/` (файлы и директории runtime).
2. Состав `backend/modules/` и `backend/migrations/`.
3. `backend/.gitignore` и `backend/package.json`.
4. Актуальные DG-1 факты из audit и System State (runtime path, PM2, Nginx, data separation).

ЧТО ОБНАРУЖЕНО:

ПОДТВЕРЖДЕНО — ЧТО КОПИРУЕМ (минимальный code-only пакет):

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

Опционально для parity (без запуска migrations):

1. `backend/database.cjs`
2. `backend/migrations/`

ПОДТВЕРЖДЕНО — ЧТО НЕ КОПИРУЕМ:

1. `backend/.env`
2. Любые локальные `.env*` с секретами
3. `backend/node_modules/`
4. Любые локальные DB dumps и data files
5. Любые локальные media/files как данные
6. Любые артефакты, не относящиеся к runtime backend code

ПОДТВЕРЖДЕНО — DEPENDENCIES:

1. После COPY нужен reinstall dependencies в production runtime path.
2. Предпочтительно: `npm ci`.
3. `npm install` только fallback.

ПОДТВЕРЖДЕНО — MIGRATIONS:

1. Для текущего шага: `CODE-ONLY DEPLOYMENT`.
2. Migrations не запускать.
3. Явно: `БЕЗ MIGRATIONS`.

ПОДТВЕРЖДЕНО — MINIMAL BACKUP:

1. Backup текущего `/opt/stubbornram/backend/server` как rollback artifact.
2. `pg_dump` production DB перед rollout.
3. Отдельный full-backup Object Storage для этого шага не обязателен при code-only policy; требуется контроль неизменности production `S3_*` env.

ПОДТВЕРЖДЕНО — ROLLBACK:

1. Вернуть сохранённый backend artifact backup в runtime path.
2. PM2 restart.
3. Проверка baseline probes.
4. DB rollback не требуется, если migrations не запускались.

НЕ ПОДТВЕРЖДЕНО:

1. Полная S3 control-plane конфигурация.
2. Исторический точный deploy-механизм, который использовался ранее.

ТРЕБУЕТ РЕШЕНИЯ:

1. Подтверждение владельца по policy: `NO MIGRATIONS` / `NO .env overwrite` / `code-only`.
2. Утверждение места хранения backup и rollback SLA.

ACTION:

- В audit добавлен practical deployment-package block.
- Изменений production/runtime/DB не выполнялось.

AFTER:

- Состав deployment-пакета и исключений формализован.
- Backup и rollback определены на практическом уровне для будущего controlled rollout.

VERIFICATION:

1. Backend tree и modules подтверждают состав code-only пакета.
2. `backend/package.json` подтверждает separate migrate command.
3. DG-1 runtime mismatch факты остаются неизменными.

Статус: - PASS (цель шага достигнута: practical package spec сформирован без изменения production).

FILES CHANGED (this step):

- PROJECT_FULL_AUDIT_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CHANGE:

- NO PRODUCTION CHANGE

Remaining limitations/questions:

- Фактический rollout остаётся BLOCKED до owner approval policy/backup window/rollback SLA.

---

## ENTRY FR-13 — F1-ENV-01 / DG-1 CONTROLLED DEPLOY EXECUTION

Date: 2026-09-19
Статус: PASS
Task ID: FR-13

BEFORE:

1. Production backend runtime не содержал `media/storage` модули.
2. `/api/media/upload` в production отсутствовал на route-уровне (`404` в прошлой проверке).
3. Владелец проекта подтвердил, что production пустой (без реальных пользовательских данных), разрешил controlled deploy с минимальной страховкой.

ACTION:

1. Собран и перенесён code-only package из localhost backend:

- `server.js`
- `modules/{auth,db,email,leads,training,media,storage}`
- `package.json`, `package-lock.json`
- `database.cjs`, `migrations/` (без запуска migrate)

2. `.env` не переносился, локальные данные/локальные media не переносились.
3. Создан rollback backup production runtime:

- `/opt/stubbornram/backend/backups/server-20260919-124350`

4. Выполнена установка зависимостей в production runtime path:

- `npm ci` (по необходимости)

5. Миграции НЕ запускались (`npm run migrate` не выполнялся).
6. Выполнен только `pm2 restart stubbornram-backend`.
7. Nginx не изменялся.

AFTER:

1. Production runtime modules:

- `auth`, `db`, `email`, `leads`, `media`, `storage`, `training`.

2. Production `server.js` содержит регистрации `storagePlugin` и `mediaRoutes`.
3. Production `.env` остался прежним (hash неизменен):

- `c66cd61d0adfd181a74da724e9400032d9a4cb0582d3b12d178c0a50c0f82717`

VERIFICATION:

1. `/health` -> `200`
2. `/api/auth/session` (unauth) -> `401`
3. `/api/training/workouts` (unauth) -> `401`
4. `/api/media/upload` (unauth, valid JSON) -> `401` (route существует и защищён)
5. PM2 `stubbornram-backend` -> `online`

Статус: 1. PASS 2. DEPLOY выполнен 3. Production backend теперь соответствует localhost по backend runtime composition в рамках текущего DG-1 scope

FILES CHANGED (this step):

- PROJECT_FULL_AUDIT_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md

CODE CHANGE:

- NO REPOSITORY CODE CHANGE (deploy/runtime action only)

DB CHANGE:

- NO DB CHANGE

PRODUCTION ENV CHANGE:

- NO (`.env` unchanged)

PRODUCTION RUNTIME CHANGE:

- YES (backend artifact updated, PM2 restarted)

Remaining limitations/questions:

- Рекомендуется отдельной задачей закрыть historical/устаревшие записи в docs, где rollout фигурирует как "ещё не выполнен".

---

## ENTRY FR-14 — DG-1 / F1-ENV-01 FINAL STATUS CLOSURE

Date: 2026-09-19
Статус: FIXED — VERIFIED
Task ID: FR-14

BEFORE:

1. DG-1 runtime drift: production backend не содержал `media/storage`.
2. `/api/media/upload` отсутствовал в production runtime (`404`).
3. F1-ENV-01 был blocked по линии DG-1.

PROBLEM:

1. Localhost и Production были функционально несогласованы по backend runtime composition.

ACTION:

1. Выполнен controlled code-only deployment актуального backend runtime.
2. Создан rollback backup runtime перед обновлением.
3. Выполнен `pm2 restart stubbornram-backend`.
4. Nginx не изменялся.
5. Миграции не запускались (`npm run migrate` не выполнялся).

AFTER:

1. Production backend composition выровнен с localhost в рамках DG-1 scope:

- `auth`, `db`, `email`, `leads`, `media`, `storage`, `training`.

2. Production route `/api/media/upload` существует и защищён.

VERIFICATION:

1. `/health` -> `200`
2. `/api/auth/session` (unauth) -> `401`
3. `/api/training/workouts` (unauth) -> `401`
4. `/api/media/upload` (unauth, valid JSON) -> `401`
5. PM2 `stubbornram-backend` -> `online`
6. Production `.env` hash unchanged

Статус: 1. DG-1 — `FIXED — VERIFIED` 2. F1-ENV-01 — `FIXED — VERIFIED`

INVARIANTS (DEPLOYMENT SAFETY):

1. Production data — НЕ ИЗМЕНЯЛИСЬ
2. Production DB/schema — НЕ ИЗМЕНЯЛИСЬ
3. Production `.env` — НЕ ИЗМЕНЯЛСЯ
4. Migrations — НЕ ЗАПУСКАЛИСЬ

FILES CHANGED (this step):

- PROJECT_FULL_AUDIT_2026-09-19.md
- PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- PROJECT_REMEDIATION_ROADMAP_2026-09-19.md

CODE CHANGE:

- NO CODE CHANGE

DB CHANGE:

- NO DB CHANGE

PRODUCTION CONFIG CHANGE:

- NO (`.env` unchanged)

---

## ENTRY FR-15 — FRONTEND API BASE / AUTH-SESSION PRODUCTION FIX CLOSURE

Date: 2026-09-19
Статус: FIXED — VERIFIED (PASS)
Task ID: FR-15

BEFORE:

1. Production frontend выполнял auth/session запросы на `http://127.0.0.1:3000/api`.
2. Из-за loopback API base production login был нестабилен на desktop и недоступен на mobile.
3. Backend/auth account path уже был подтвержден как рабочий (проблема была во frontend runtime config).

FIX:

1. Восстановлен архитектурный source-of-truth для frontend API base через environment configuration:

- `src/shared/lib/apiClient.js` использует `import.meta.env.VITE_API_BASE_URL`.
- Добавлены и зафиксированы environment файлы проекта:
  - `.env.development` -> `http://127.0.0.1:3000/api`
  - `.env.production` -> `https://api.stubbornram.ru/api`

2. Выполнен production frontend build.
3. Выполнен штатный frontend deployment через существующий GitHub Pages workflow (`.github/workflows/deploy.yml`).

AFTER:

1. Production frontend использует `https://api.stubbornram.ru/api` для auth/session.
2. Localhost frontend сохраняет локальный API base `http://127.0.0.1:3000/api`.
3. Drift `127.0.0.1` в production auth/session path закрыт.

VERIFICATION:

1. GitHub Pages deploy run для commit `0b05402` завершен `success`.
2. Production runtime запросы `auth/session` идут на `https://api.stubbornram.ru/api/...`.
3. Production login через UI: PASS.
4. Session persistence после reload: PASS.
5. Localhost auth/session API base: `http://127.0.0.1:3000/api` (сохранен).

Статус: 1. Foundation Remediation (Auth/Session, frontend API base): PASS. 2. Production API base mismatch устранен.

INVARIANTS (REQUIRED):

1. DB CHANGE = NO
2. BACKEND CHANGE = NO
3. PRODUCTION BACKEND CHANGE = NO

FILES/CONFIG CHANGED (this step):

1. `.env.development`
2. `.env.production`
3. `src/shared/lib/apiClient.js`
4. `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`
5. `PROJECT_FULL_AUDIT_2026-09-19.md`

---

## ENTRY FR-16 — F1-TST-02 MINIMAL SMOKE: PERSISTENCE / OWNERSHIP

Date: 2026-09-19
Статус: PASS
Task ID: FR-16

BEFORE:

1. Требовалась минимальная runtime-проверка существующего user-data persistence/ownership flow без новых архитектурных решений.
2. Scope ограничен только уже реализованным training flow (`/app/training/*`).

VERIFICATION:

LOCALHOST

1. Реальный frontend flow edit/save выполнен на существующей тренировке `f2cae4b8-24c2-4f0d-afc9-0aeb861d0202`.
2. Зафиксирована цепочка запроса сохранения:

- Component: `TrainingPage` (`handleFinishWorkout`)
- Service: `updateWorkout(...)` в `src/modules/training/services/trainingService.js`
- API client: `request(...)` в `src/shared/lib/apiClient.js`
- Backend endpoint: `PUT /api/training/workouts/:id`

3. Runtime network evidence (localhost):

- `PUT http://127.0.0.1:3000/api/training/workouts/f2cae4b8-24c2-4f0d-afc9-0aeb861d0202` -> `200`
- follow-up `GET /api/training/workouts` -> `200`

4. Persistence/read-after-write:

- comment сохранён как `F1TST02_LOCAL_SAVE_1789823534989`
- после reload comment остался тем же значением.

5. PostgreSQL proof (localhost backend DB):

- `workouts.id=f2cae4b8-24c2-4f0d-afc9-0aeb861d0202`
- `comment=F1TST02_LOCAL_SAVE_1789823534989`.

6. Проверено в рамках F1-TST-02 (ownership scope этого smoke):

- собственные данные через реальный flow (edit/save существующей тренировки текущего пользователя);
- persistence после reload;
- отклонение несуществующего UUID.

7. Nonexistent UUID rejection:

- `GET /api/training/workouts/00000000-0000-0000-0000-000000000000` -> `404`
- UI alert: `Тренировка не найдена.`

PRODUCTION

1. Реальный production frontend flow edit/save выполнен на существующей тренировке `0d2508ce-bb29-420e-942d-49fe990ee0d2`.
2. Runtime network evidence (production):

- `PUT https://api.stubbornram.ru/api/training/workouts/0d2508ce-bb29-420e-942d-49fe990ee0d2` -> `200`
- follow-up `GET /api/training/workouts` -> `200`

3. Persistence/read-after-write:

- comment сохранён как `F1TST02_PROD_SAVE_1789823606606`
- после reload comment остался тем же значением.

4. PostgreSQL proof (production DB):

- `workouts.id=0d2508ce-bb29-420e-942d-49fe990ee0d2`
- `comment=F1TST02_PROD_SAVE_1789823606606`.

5. Проверено в рамках F1-TST-02 (ownership scope этого smoke):

- собственные данные через реальный flow (edit/save существующей тренировки текущего пользователя);
- persistence после reload;
- отклонение несуществующего UUID.

6. Nonexistent UUID rejection:

- `GET https://api.stubbornram.ru/api/training/workouts/00000000-0000-0000-0000-000000000000` -> `404`
- UI alert: `Тренировка не найдена.`

AFTER:

1. Existing persistence flow работает на localhost и production в пределах F1-TST-02 scope.
2. Данные переживают reload (read-after-write подтверждён).
3. Непосредственно в этом smoke подтверждены: собственные данные через реальный flow, persistence после reload и rejection несуществующего UUID.
4. Этот проход НЕ является полноценным cross-user ownership test (второй пользователь отдельно не запускался в рамках FR-16).
5. При этом общий ownership enforcement ранее уже подтверждался в существующих цепочках проекта.

Статус: 1. LOCAL: PASS 2. PRODUCTION: PASS 3. F1-TST-02: PASS

CHANGE INVARIANTS:

1. DB SCHEMA CHANGE: NO
2. DB MIGRATION: NO
3. BACKEND CODE CHANGE: NO
4. FRONTEND CODE CHANGE: NO
5. PRODUCTION INFRA/DEPLOY CHANGE: NO
6. PRODUCTION DATA CHANGE: YES — изменён только существующий `workouts.comment` синтетическим тестовым marker.

---

## ENTRY FR-17 — F1-SEC-01 / F1-SEC-02 / F1-SEC-03 (ANALYSIS ONLY)

Date: 2026-09-19
Статус: DECISION ACCEPTED (IMPLEMENTATION PENDING)
Task ID: FR-17

Scope note:

1. Выполнен только анализ текущей реализации (code-level), без исправлений и без изменения архитектуры.
2. Login/session/environment проверки не повторялись.

### F1-SEC-01 — Registration / Email

ТЩ :

1. `POST /api/auth/register`:

- валидирует email/password;
- проверяет duplicate email;
- создаёт `users` + `profiles` в DB-транзакции;
- после COMMIT создаёт verification token;
- затем отправляет verification email;
- на успехе возвращает `201` + `emailVerificationRequired: true`.

2. Email verification:

- `POST /api/auth/verify-email` проверяет token (type/used/expiry), затем в транзакции выставляет `users.email_verified_at` и `auth_tokens.used_at`.

3. Resend verification:

- `POST /api/auth/resend-verification` для unverified user создаёт новый token и пытается отправить письмо.

VERIFIED FACTS:

1. В `register` DB commit выполняется до отправки email.
2. В `register` нет локального `try/catch` вокруг `sendVerificationEmail(...)`: provider/network ошибка поднимается наверх как server error.
3. Token lifecycle реализован: старые активные verification tokens помечаются `used_at = now()` перед созданием нового.
4. Если email/send падает после commit, пользователь уже существует в DB (unverified), а исходный HTTP-ответ не является успешным `201`.

ТЩ / :

1. Поведение при email-send failure после успешного создания пользователя неоднозначно с product/UX точки зрения:

- аккаунт фактически создан;
- пользователь может получить server error вместо ожидаемого успешного регистрационного статуса.

2. В коде отсутствует явная policy-декомпозиция outcome-ов для этого кейса (например, как именно нормализовать пользовательский response contract при partial success).

OWNER DECISION:

1. После успешного создания `users + profiles` в БД аккаунт считается созданным.
2. Если verification email не удалось отправить, аккаунт не откатывается.
3. Пользователь остаётся unverified.
4. Пользователь должен получить понятное сообщение о проблеме с отправкой письма.
5. Должна использоваться существующая возможность resend verification.
6. Ошибка отправки email должна фиксироваться server-side.
7. Существующую auth/session semantics не менять.
8. Полноценную очередь/worker для email сейчас не вводить.
9. Явно разделяются состояния account creation и email delivery.

CURRENT STATUS: DECISION ACCEPTED

СТТС : PENDING

WHAT IS IN SCOPE NOW:

1. Фиксация policy: account creation и email delivery рассматриваются как отдельные outcomes.
2. Фиксация policy: resend verification остаётся целевым recovery path.
3. Фиксация policy: server-side logging email delivery failure обязателен.

WHAT IS DEFERRED:

1. Введение отдельной email queue/worker.
2. Любые изменения текущей auth/session semantics.

### F1-SEC-02 — CSRF

ТЩ :

1. Auth model: cookie-based session (`stubbornram_session`), bearer-токены в frontend не используются.
2. Cookie attributes:

- `httpOnly: true`
- `secure: true`
- `sameSite: "none"`
- `maxAge: 30 days`.

3. CORS:

- allowlist origins: `http://localhost:5173`, `http://127.0.0.1:5173`, `https://stubbornram.ru`;
- `credentials: true`.

4. Frontend transport:

- `fetch(..., { credentials: "include" })` через `apiClient`.

VERIFIED FACTS:

1. В текущем backend отсутствует явная отдельная CSRF-token проверка для state-changing routes.
2. В текущем backend отсутствует отдельная custom CSRF origin/intent verifier beyond стандартный CORS allowlist.
3. Session cookie доступна для cross-site сценариев по атрибуту `sameSite: "none"`.

ТЩ / :

1. Текущая защита опирается на комбинацию cookie/CORS/runtime route behavior, но явный dedicated CSRF control layer в коде не выделен.
2. Следовательно, формальный security-позиционный статус по CSRF (достаточно/недостаточно для вашего threat model) не может считаться закрытым без owner-policy решения.

OWNER DECISION:

1. Сейчас внедряется только минимальная дополнительная защита.
2. Для state-changing запросов (`POST/PUT/PATCH/DELETE`) проверять источник запроса по разрешённому `Origin`.
3. Разрешённые production/local origins должны соответствовать существующей модели проекта.
4. Текущую cookie-based session модель не менять.
5. `SameSite` / `Secure` / `HttpOnly` без необходимости не менять.
6. Отдельный CSRF token сейчас НЕ внедрять.
7. Будущее усиление зафиксировать как DEFERRED/FUTURE: при необходимости можно добавить CSRF token поверх текущей защиты.
8. Текущий уровень не считать полноценной максимальной CSRF-защитой.

CURRENT STATUS: DECISION ACCEPTED

СТТС : PENDING

WHAT IS IN SCOPE NOW:

1. Фиксация минимального дополнительного контроля для state-changing запросов через проверку `Origin`.
2. Сохранение текущей cookie/session модели и текущих cookie-атрибутов как baseline.

WHAT IS DEFERRED:

1. Полноценный CSRF token mechanism (explicitly deferred/future).
2. Любые более широкие изменения auth/session transport модели.

### F1-SEC-03 — Session Cleanup

ТЩ :

1. Session lifetime:

- устанавливается `SESSION_DAYS = 30`;
- `expires_at` сохраняется в `sessions`.

2. Expiry enforcement:

- проверка `expires_at > now()` выполняется в `GET /api/auth/session` и в `getAuthenticatedUser(...)`.

3. Session removal (existing):

- logout удаляет текущий `token_hash`;
- reset-password/complete удаляет все sessions пользователя.

VERIFIED FACTS:

1. В текущем коде не найден периодический cleanup mechanism (cron/job/worker), который бы удалял истёкшие sessions из таблицы.
2. Истёкшие sessions не используются для auth, но могут оставаться как data residue до отдельного удаления.
3. Для session tokens нет `used_at` lifecycle-поля (в отличие от `auth_tokens`), используется только `expires_at` + deletion by flows.

ТЩ / :

1. Нет зафиксированного automatic cleanup policy для expired sessions на уровне runtime механизма.
2. Не зафиксирован owner-approved retention horizon для исторических session rows.

OWNER DECISION:

1. Срок жизни session оставить текущим — 30 дней.
2. Просроченные sessions должны автоматически удаляться.
3. Cleanup должен запускаться периодически, ориентир — примерно один раз в сутки.
4. Cleanup не должен менять существующую auth/session semantics.
5. Долгосрочное хранение expired session rows не требуется.
6. Cleanup фиксируется как отдельная housekeeping-задача и не меняет правила авторизации.

CURRENT STATUS: DECISION ACCEPTED

СТТС : PENDING

WHAT IS IN SCOPE NOW:

1. Фиксация policy: session lifetime остаётся 30 дней.
2. Фиксация policy: периодический purge expired sessions как housekeeping.
3. Фиксация policy: cleanup отделён от authorization semantics.

WHAT IS DEFERRED:

1. Любые расширенные retention/analytics сценарии поверх expired session rows.
2. Любые изменения действующих правил авторизации.

CHANGE FLAGS (FR-17):

1. DB CHANGE: NO
2. BACKEND CODE CHANGE: NO
3. FRONTEND CODE CHANGE: NO
4. PRODUCTION CHANGE: NO

---

## ENTRY FR-18 — F1-SEC-01 IMPLEMENTATION (REGISTRATION / EMAIL DELIVERY SPLIT)

Date: 2026-09-19
Статус: FIXED — VERIFIED (LOCALHOST)
Task ID: FR-18

BEFORE:

1. В `POST /api/auth/register` после успешного DB COMMIT выполнялась отправка verification email.
2. При ошибке email delivery backend отдавал server/provider error, несмотря на уже созданный аккаунт.
3. Frontend мог интерпретировать регистрацию как неуспешную, хотя `users + profiles` уже созданы.

FIX:

1. Backend (`backend/modules/auth/auth.routes.js`):

- после DB COMMIT сохранён прежний порядок (`createEmailVerificationToken` -> email attempt);
- отправка verification email обёрнута в локальный `try/catch`;
- при email failure аккаунт НЕ откатывается;
- техническая ошибка фиксируется server-side через `app.log.error(...)`;
- registration endpoint всегда возвращает `201` при успешном создании аккаунта;
- в response добавлен флаг `verificationEmailSent` (`true/false`).

2. Frontend (`src/components/auth/RegisterModal.jsx`):

- при `verificationEmailSent === false` показывается понятное success-сообщение:
  аккаунт создан, письмо не отправлено, использовать существующий resend verification.
- ложная интерпретация как "регистрация не произошла" исключена.

AFTER:

1. Account creation и email delivery разделены как независимые outcomes.
2. При email failure пользователь остаётся unverified и может использовать existing resend verification.
3. Auth/session semantics не изменены.

VERIFICATION (LOCALHOST ONLY):

1. Обычная регистрация:

- `POST /api/auth/register` -> `201`;
- `emailVerificationRequired=true`;
- `verificationEmailSent=true` (успешный delivery path).

2. Контролируемый email failure:

- локально запущен backend с невалидным `UNISENDER_API_KEY` (без изменений Production);
- `POST /api/auth/register` -> `201`;
- `verificationEmailSent=false`;
- server-side log зафиксировал `Verification email delivery failed after account creation`.

3. DB state при email failure:

- пользователь присутствует в `users`;
- `email_verified_at IS NULL` (unverified), подтверждено локальным DB read.

4. Frontend UX при email failure:

- в Register modal отображено понятное сообщение о созданном аккаунте и необходимости resend.
- error-message о "провале регистрации" не показан.

5. Existing resend verification:

- path проверен (`POST /api/auth/resend-verification`);
- при валидной email-конфигурации возвращает `200 { ok: true }`;
- в контролируемом failure-окружении (невалидный ключ) корректно отражает provider failure (это ожидаемо для тестового failure setup).

Статус: 1. F1-SEC-01: FIXED — VERIFIED (localhost scope). 2. Production deployment: НЕ выполнялся на этом шаге.

CHANGES (CODE FILES):

1. `backend/modules/auth/auth.routes.js`
2. `src/components/auth/RegisterModal.jsx`
3. `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`

CHANGE FLAGS:

1. DB SCHEMA CHANGE: NO
2. MIGRATION: NO
3. BACKEND CODE CHANGE: YES
4. FRONTEND CODE CHANGE: YES
5. PRODUCTION CHANGE: NO

---

## ENTRY FR-19 — F1-SEC-02 IMPLEMENTATION (MINIMAL ORIGIN CHECK)

Date: 2026-09-19
Статус: FIXED — VERIFIED (LOCALHOST)
Task ID: FR-19

BEFORE:

1. Проект использовал cookie-based session + CORS allowlist, но не имел отдельного общего server-side gate для state-changing `/api/*` запросов по `Origin`.
2. Owner decision для F1-SEC-02 требовал минимальный дополнительный control layer без CSRF token mechanism.

FIX:

1. В `backend/server.js` добавлен единый `onRequest` hook (общий архитектурный слой, без дублирования по routes).
2. Hook применяется только к `/api/*` и только к state-changing методам:

- `POST`
- `PUT`
- `PATCH`
- `DELETE`

3. Проверка `Origin` использует тот же allowlist, что и текущий CORS baseline:

- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `https://stubbornram.ru`

4. Для postороннего или отсутствующего `Origin` state-changing API request отклоняется до route handler:

- `403`
- `{ error: "INVALID_ORIGIN", message: "Источник запроса не разрешен." }`

5. `OPTIONS` preflight не затрагивается (hook не применяется к `OPTIONS`).
6. `GET/HEAD` поведение не изменяется.

AFTER:

1. Minimal CSRF hardening через Origin gate введён для state-changing API запросов.
2. Cookie/session semantics, cookie attributes (`SameSite/Secure/HttpOnly`) не изменены.
3. Frontend architecture и `apiClient` contract не изменены.
4. CSRF token mechanism остаётся DEFERRED/FUTURE (не внедрялся на этом этапе).

VERIFICATION (LOCALHOST ONLY):

1. Backend запущен из актуального кода: PASS.
2. State-changing request с разрешённым localhost origin:

- `POST /api/auth/logout` + `Origin: http://localhost:5173` -> `200` (PASS).

3. State-changing request с разрешённым production origin:

- `POST /api/auth/logout` + `Origin: https://stubbornram.ru` -> `200` (PASS).

4. State-changing request с postоронним origin:

- `POST /api/auth/register` + `Origin: https://evil.example` -> `403` (PASS).

5. Отклонённый запрос не дошёл до изменения данных:

- проверка `users` по тестовому email -> `count = 0` (PASS).

6. Обычный auth/session flow не сломан:

- `GET /api/auth/session` + allowed origin -> `401` (ожидаемый unauth contract, PASS);
- `POST /api/auth/login` + allowed origin -> route выполняется, возвращает обычный `401 INVALID_CREDENTIALS` для невалидных credentials (PASS).

7. CORS preflight:

- `OPTIONS /api/auth/register` с `Origin: http://localhost:5173` и `Access-Control-Request-Method: POST` -> `204` (PASS).

Статус: 1. F1-SEC-02: FIXED — VERIFIED (localhost scope). 2. Production deployment: НЕ выполнялся на этом шаге. 3. CSRF token mechanism: DEFERRED/FUTURE.

CHANGES (CODE FILES):

1. `backend/server.js`
2. `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`

CHANGE FLAGS:

1. DB SCHEMA CHANGE = NO
2. MIGRATION = NO
3. BACKEND CODE CHANGE = YES
4. FRONTEND CODE CHANGE = NO
5. PRODUCTION CHANGE = NO

---

## ENTRY FR-24 — FOUNDATION REMEDIATION CLOSURE

Date: 2026-09-19
Статус: COMPLETED WITH DOCUMENTED LIMITATIONS
Task ID: FR-24

BEFORE:

1. The Foundation record contained closed items, partial verification boundaries, deferred items, and historical BLOCKED entries that were later superseded by verified evidence.
2. The closure step needed to summarize the already recorded outcome without adding new validation or expanding scope.

COMPLETED WORK:

1. Consolidated the existing Foundation outputs into a final closure record.
2. Preserved the closed set already recorded in the log and roadmap: F1-PST-01, F1-PST-02, F1-API-01, F1-ENV-01, F1-MEDIA-DEPLOY, F1-NV-01, F1-NV-02, F1-NV-03, F1-SEC-02, F1-SEC-03.
3. Preserved F1-SEC-01 as partially verified because the production email-failure scenario was not reproduced.
4. Preserved deferred items exactly as documented: F1-API-02, F1-SEC-04, CSRF token enhancement, pgAdmin 2FA/MFA.
5. Confirmed that there is no current Foundation item remaining in a live BLOCKED state in the final closure view.

REMAINING LIMITATIONS:

1. F1-SEC-01 production email-failure scenario remains NOT VERIFIED by safe-policy.
2. Deferred items remain intentionally outside the current Foundation scope.
3. No new verification runs, migrations, code changes, or production changes were introduced by this closure step.

DEFERRED ITEMS:

1. F1-API-02 — report direct-fetch bypass remediation.
2. F1-SEC-04 — logout-all-devices.
3. CSRF token enhancement.
4. pgAdmin 2FA/MFA.

NEXT PHASE:

1. Phase 6 — Documentation Alignment for Foundation is the final named foundation phase in the roadmap.
2. The current roadmap does not define a later Foundation phase.

Статус: 1. Статус Foundation Remediation: COMPLETED WITH DOCUMENTED LIMITATIONS. 2. The stable baseline for further product work is the closed Foundation surface plus the explicitly deferred items.

---

## ENTRY FR-26 - ADMIN PANEL HTTPS FIX + PGADMIN STABLE UPDATE (F1-NV-03 TARGETED CLOSURE)

Date: 2026-09-19
Статус: FIXED - VERIFIED (admin infrastructure subset)
Task ID: FR-26

BEFORE:

1. `admin.stubbornram.ru` was served via HTTP-only config in `stubbornram-pgadmin`.
2. `https://admin.stubbornram.ru` returned certificate mismatch.
3. Installed pgAdmin version was `9.17`.
4. Existing custom `pgadmin4.service` depended on `/usr/pgadmin4/venv/bin/gunicorn` path.

FIX:

1. HTTPS enablement for admin domain (standard Certbot flow):

- backup created: `/etc/nginx/sites-available/stubbornram-pgadmin.bak-20260919-164523`;
- certificate issued/deployed for `admin.stubbornram.ru` via Certbot;
- active Nginx config now has `listen 443 ssl` with LE cert files;
- HTTP to HTTPS redirect preserved (`301`).

2. pgAdmin update to current stable:

- official stable verified from pgAdmin official channels: `9.18`;
- packages updated: `pgadmin4-web` and `pgadmin4-server` to `9.18`.

3. pgAdmin configuration backup before package upgrade:

- backup created: `/opt/stubbornram/backend/backups/pgadmin-config-backup-20260919-164721.tar.gz`;
- backed up existing paths: `/var/lib/pgadmin`, `/usr/pgadmin4/web/config_distro.py`.

4. Post-upgrade service compatibility fix (admin-panel scoped runtime fix only):

- problem after upgrade: old service command referenced missing venv binary `.../venv/bin/gunicorn`;
- installed compatibility packages: `gunicorn`, `python3-gunicorn`;
- updated service `ExecStart` to:
  `/usr/pgadmin4/venv/bin/python -m gunicorn --chdir /usr/pgadmin4/web --bind 127.0.0.1:5050 --workers 1 --threads 25 --timeout 120 pgAdmin4:app`;
- service backups created:
  - `/etc/systemd/system/pgadmin4.service.bak-20260919-165624`
  - `/etc/systemd/system/pgadmin4.service.bak-20260919-165743`
  - `/etc/systemd/system/pgadmin4.service.bak-20260919-165836`.

AFTER:

1. `admin.stubbornram.ru` serves valid HTTPS certificate for its own hostname.
2. `http://admin.stubbornram.ru` redirects to `https://admin.stubbornram.ru`.
3. pgAdmin version is `9.18` (`pgadmin4-web`/`pgadmin4-server`).
4. `pgadmin4.service` is active and listening on `127.0.0.1:5050`.
5. Existing pgAdmin server profile remains present in pgAdmin SQLite config:

- count: `1` server profile;
- preserved profile: `Stubborn Ram PostgreSQL`, host `127.0.0.1`, port `5432`, db `stubbornram`, user `stubbornram_app`.

VERIFICATION:

1. HTTPS and certificate:

- `curl -I https://admin.stubbornram.ru` -> `302` to `/login?next=/` (valid TLS handshake);
- certificate check: `Subject=CN=admin.stubbornram.ru`, SAN contains `admin.stubbornram.ru`.

2. Redirect and login page:

- `curl -I http://admin.stubbornram.ru` -> `301 Location: https://admin.stubbornram.ru/`;
- `GET https://admin.stubbornram.ru/login` -> `200`, HTML login page returned.

3. pgAdmin runtime:

- `systemctl is-active pgadmin4` -> `active`;
- listener bound: `127.0.0.1:5050`.

4. Non-regression checks:

- `https://api.stubbornram.ru/health` -> `200`;
- `https://stubbornram.ru/` -> `200`.

5. External exposure checks:

- external direct TCP `5432` -> CLOSED;
- external direct TCP `5050` -> CLOSED.

6. Browser login attempt:

- browser login succeeded with existing credentials entered manually by the user;
- pgAdmin browser session opened successfully at `/browser/`;
- saved server `Stubborn Ram PostgreSQL` was opened;
- PostgreSQL connection to `stubbornram` was reached via pgAdmin UI.

Статус: 1. Admin HTTPS fix: FIXED - VERIFIED. 2. pgAdmin stable update: FIXED - VERIFIED (`9.18`). 3. Browser login + PostgreSQL connection: FIXED - VERIFIED. 4. F1-NV-03 classification update (targeted admin hardening part): FIXED - VERIFIED.

PASSWORD/MFA CONSTRAINTS:

1. pgAdmin password changed: NO.
2. 2FA/MFA configured in this step: NO.

2FA DOCUMENTATION (DEFERRED):

CURRENT STATE:

1. pgAdmin 2FA is not implemented/completed in production runtime.
2. Email-based MFA is not operational in current setup.
3. Authenticator-based MFA is not configured.

REASON DEFERRED:

1. No validated working SMTP delivery path is currently configured for pgAdmin MFA email flow.
2. 2FA enablement was explicitly out of scope for this task to avoid auth-risk changes during HTTPS/version remediation.

FUTURE ACTION:

1. Run separate dedicated hardening task for pgAdmin 2FA rollout.
2. Validate SMTP path end-to-end before any email MFA enablement.
3. Decide and implement one MFA method (email or authenticator) with explicit operational runbook.

CHANGE FLAGS (THIS STEP):

1. FRONTEND APP CHANGE = NO
2. BACKEND APP CHANGE = NO
3. AUTH/SESSION SEMANTICS CHANGE = NO
4. POSTGRESQL SCHEMA CHANGE = NO
5. STUBBORN RAM MIGRATIONS = NO
6. S3 CHANGE = NO
7. FIREWALL CHANGE = NO
8. PRODUCTION ADMIN-PANEL/NGINX/PGADMIN CHANGE = YES

---

## ENTRY FR-23 - F1-NV-01 PRODUCTION S3/OBJECT STORAGE ENABLEMENT AND VERIFICATION

Date: 2026-09-19
Статус: FIXED - VERIFIED
Task ID: FR-23

BEFORE:

1. Production backend media/storage code path existed, but active runtime had no S3 configuration variables.
2. Required variables were absent in checked production sources:

- runtime `.env`
- PM2 process environment
- system environment

3. Because configuration was missing, control-plane verification previously returned `BLOCKED_MISSING_CONFIG`.

FIX / CONFIGURATION:

1. Existing project S3-compatible architecture was kept unchanged.
2. Existing Selectel-compatible endpoint/bucket profile was used (no new architecture).
3. Production `.env` was backed up before change.
4. Only required S3 variables were updated in production `.env`:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`

5. No other production settings were modified.
6. Backend restart mechanism used: `pm2 restart stubbornram-backend`.

AFTER:

1. Production backend runtime has all required S3 variables present.
2. PM2 process is online after restart.
3. Existing signed URL media flow works in production.
4. Bucket was not made public.

VERIFICATION:

1. Configuration presence check:

- all required `S3_*` variables are present in active production runtime source.

2. Control-plane security check (read-only):

- `GetBucketAcl`: VERIFIED, only owner canonical user grant with `FULL_CONTROL` observed.
- `GetBucketPolicy`: VERIFIED, policy is present.
- `GetPublicAccessBlock`: NOT VERIFIED (`501 NotImplemented` by provider API path).
- `GetBucketPolicyStatus`: NOT VERIFIED (`501 NotImplemented` by provider API path).

3. Full synthetic production media flow (no architecture changes):

- synthetic verified user created;
- authenticated `POST /api/media/upload`: `201`;
- signed upload URL returned by backend;
- upload to signed URL: `200`;
- `POST /api/media/:id/complete`: `200`;
- `GET /api/media/:id` returned signed download URL;
- download via signed URL: `200`;
- downloaded content matched uploaded content;
- unsigned direct object read attempts: blocked (`403`);
- unsigned direct object write attempt: blocked (`403`);
- delete via existing flow `DELETE /api/media/:id`: `200`.

4. Cleanup verification:

- synthetic media row removed;
- synthetic user removed;
- temporary local/remote verification scripts removed.

5. Auth/session compatibility:

- authenticated login/session path worked during media verification.

6. Frontend secret exposure check:

- frontend env files contain API base only, no S3 credentials.

Статус: 1. F1-NV-01: FIXED - VERIFIED. 2. Residual control-plane note:

- `PublicAccessBlock` and `PolicyStatus` endpoints are provider-API `501 NotImplemented` in this environment.
- Effective private behavior is verified by ACL evidence and blocked unsigned read/write tests.

OBJECT STORAGE USED:

1. Provider type: S3-compatible Selectel endpoint (production configured).
2. Bucket: existing configured production bucket (no additional bucket created).

CHANGE FLAGS:

1. DB SCHEMA CHANGE = NO
2. MIGRATION = NO
3. BACKEND CODE CHANGE = NO
4. FRONTEND CODE CHANGE = NO
5. PRODUCTION CONFIGURATION CHANGE = YES
6. PRODUCTION DATA CHANGE = TEMPORARY TEST DATA ONLY (CLEANED)

SAFETY CONSTRAINTS:

1. No secret values printed.
2. No `.env` committed.
3. No DB migrations executed.
4. No auth/session architecture changes.
5. No move to F1-NV-02/03.

---

## ENTRY FR-24 - F1-NV-02 MINIMAL PRODUCTION BASELINE (STABILITY / CONTROLLED FAILURES / SMALL BURST)

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-24

CURRENT BASELINE:

1. Scope: F1-NV-02 only (minimal production smoke baseline).
2. No production config changes performed in this step.
3. No code changes, no DB schema changes, no migrations.
4. Backend process pre-check: PM2 `stubbornram-backend` online.

TESTS:

1. BASIC STABILITY (small repeated checks):

- `GET /health`
- `GET /api/auth/session`
- `GET /api/training/workouts`
- `GET /api/media/:id` (existing media endpoint)

2. CONTROLLED FAILURES (existing safe error paths):

- non-existing UUID (authenticated media read): `GET /api/media/11111111-1111-4111-8111-111111111111`
- invalid input: `POST /api/auth/register` with invalid payload
- unauthenticated protected endpoint: `GET /api/training/workouts`
- controlled media/storage error: create upload record without object upload, then `POST /api/media/:id/complete`

3. SMALL BURST (controlled, not stress):

- 40 total GET requests (10 each) to:
  - `/health`
  - `/api/auth/session` (unauth)
  - `/api/training/workouts` (unauth)
  - `/api/media/00000000-0000-0000-0000-000000000000` (unauth)
- small parallelism (`concurrency = 8`)

4. Post-test health/process checks:

- `GET /health`
- `pm2 show stubbornram-backend`

RESULTS:

1. BASIC STABILITY:

- `GET /health` -> `200`
- `GET /api/auth/session` -> `401` (expected unauth)
- `GET /api/training/workouts` -> `401` (expected unauth)
- `GET /api/media/:id` -> `401` (expected unauth)
- response pattern stable; backend remained responsive.

2. CONTROLLED FAILURES:

- non-existing UUID -> `404 MEDIA_NOT_FOUND` (no 500)
- invalid input -> `400 INVALID_INPUT` (no 500)
- unauth protected -> `401 UNAUTHENTICATED` (no 500)
- controlled media/storage (`complete` without object) -> `409 MEDIA_OBJECT_NOT_FOUND` (no 500)
- post-error health check -> `200`
- cleanup of synthetic artifacts -> verified (`media row removed`, `synthetic user removed`).

3. SMALL BURST:

- total requests: `40`
- total 5xx: `0`
- network errors: `0`
- unexpected statuses: `0`
- post-burst health -> `200`

4. Process stability:

- PM2 process remained `online`, no crash evidence during step.

LIMITATIONS:

1. This step is a smoke baseline only, not a full performance benchmark.
2. No prolonged soak test, no high-RPS stress, no percentile latency profiling.
3. Control-plane/S3 policy hardening depth is not the target of this step (covered separately by F1-NV-01).

Статус: 1. F1-NV-02: VERIFIED. 2. No blocking failures found in this minimal production stability/failure baseline.

CHANGE FLAGS (THIS STEP ONLY):

1. DB SCHEMA CHANGE = NO
2. MIGRATION = NO
3. BACKEND CODE CHANGE = NO
4. FRONTEND CODE CHANGE = NO
5. PRODUCTION CONFIGURATION CHANGE = NO
6. PRODUCTION DATA CHANGE = TEMPORARY SYNTHETIC TEST DATA ONLY (CLEANED)

---

## ENTRY FR-25 - F1-NV-03 EXTERNAL AND PRIVATE INFRASTRUCTURE VISIBILITY CHECK (VERIFICATION-ONLY)

Date: 2026-09-19
Статус: VERIFIED
Task ID: FR-25

CURRENT STATE:

1. Scope: verification-only for external and internal accessibility of existing production infrastructure.
2. No changes allowed/performed to firewall, UFW, Nginx, SSH, PostgreSQL, pgAdmin, DNS, production config, code, or deploy.
3. Baseline architecture references used:

- production API via `api.stubbornram.ru`;
- pgAdmin via `admin.stubbornram.ru`;
- PostgreSQL local on same cloud server.

EXTERNAL VISIBILITY CHECK:

Safe checks executed from outside production:

1. TCP reachability (public IP `161.104.49.107`):

- `22` -> reachable
- `80` -> reachable
- `443` -> reachable
- `3000` -> not reachable
- `5432` -> not reachable
- `5050` -> not reachable
- `8080` -> not reachable
- sampled additional common service ports (`21`, `25`, `53`) -> not reachable

2. HTTP/HTTPS endpoints:

- `https://api.stubbornram.ru/health` -> `200`
- `http://api.stubbornram.ru` -> `301` (redirect to HTTPS)
- `http://admin.stubbornram.ru` -> `302` (externally reachable admin endpoint)
- `https://admin.stubbornram.ru` -> TLS/certificate mismatch from client perspective (endpoint does not present matching HTTPS config)

INTERNAL SERVICE CHECK:

Read-only checks on production server (`ss -tulpn`, Nginx site configs, PM2):

1. Listening TCP ports/processes:

- `0.0.0.0:80` / `[::]:80` -> Nginx public listener
- `0.0.0.0:443` / `[::]:443` -> Nginx public TLS listener
- `0.0.0.0:22` / `[::]:22` -> SSH listener
- `127.0.0.1:3000` -> Node/Fastify backend (internal-only)
- `127.0.0.1:5050` -> gunicorn/pgAdmin app (internal-only port)
- `127.0.0.1:5432` and `[::1]:5432` -> PostgreSQL local listener (internal-only)

2. Nginx publication map:

- `api.stubbornram.ru` -> proxies to `127.0.0.1:3000`; HTTPS enabled on `443`; HTTP server block present on `80` with redirect behavior.
- `admin.stubbornram.ru` -> proxies to `127.0.0.1:5050`; configured on `80` (HTTP) in active site config.

3. Backend process:

- PM2 `stubbornram-backend` remained `online` during checks.

Service visibility classification (port/service/external/expected):

1. `22` / SSH / external: YES / expected external by current ops model: YES / status: EXPECTED
2. `80` / Nginx HTTP / external: YES / expected external by current web ingress model: YES / status: EXPECTED
3. `443` / Nginx HTTPS / external: YES / expected external by current web ingress model: YES / status: EXPECTED
4. `3000` / Fastify Node / external: NO / should be internal-only: YES / status: EXPECTED
5. `5432` / PostgreSQL / external: NO / should be internal-only: YES / status: EXPECTED
6. `5050` / pgAdmin app port / external direct: NO / should be internal-only behind reverse proxy: YES / status: EXPECTED
7. `admin.stubbornram.ru` (via Nginx) / pgAdmin published endpoint / external: YES / current architecture references admin domain usage: YES / status: EXPECTED
8. `admin.stubbornram.ru` over HTTPS / external TLS-ready endpoint: NOT VERIFIED as expected service (certificate/name mismatch observed) / status: NOT VERIFIED

GAPS:

1. NOT VERIFIED: definitive UFW policy output (non-interactive sudo check unavailable in current access mode).
2. NOT VERIFIED: expected HTTPS posture for `admin.stubbornram.ru` (active config observed as HTTP listener with client-side HTTPS certificate mismatch).

Статус: 1. F1-NV-03 overall: VERIFIED. 2. No confirmed externally exposed internal-only raw service ports found (`3000`, `5432`, `5050` are not externally reachable). 3. Follow-up decision topic (non-blocking for this step): whether `admin.stubbornram.ru` should remain HTTP-only or be aligned to HTTPS in future hardening scope.

---

## ENTRY FR-22 - F1-NV-01 OBJECT STORAGE CONTROL-PLANE SECURITY CHECK (ANALYSIS/VERIFICATION ONLY)

Date: 2026-09-19
Task ID: FR-22

CURRENT STATE:

1. `storage.service.js` reads configuration only from `process.env`:

- `S3_ENDPOINT`
- `S3_REGION`
- `S3_BUCKET`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`

2. Backend bootstrap uses `import "dotenv/config"` in `server.js`, so `.env` from runtime cwd is one source for `process.env`.
3. Additional possible runtime source is inherited process environment (PM2 env/system env).
4. Production media DB currently has no media rows (`mediaByStatus=[]`, `readyWithObjectKey=0`) in performed read-only check.

VERIFIED FACTS:

1. VERIFIED: Backend code expects only the 5 variables above and calls `ensureConfigured()` before storage operations.
2. VERIFIED: Frontend checked env files (`.env.development`, `.env.production`) contain only API base URL and no S3/AWS credentials.
3. VERIFIED: Production runtime `.env` source matrix (name presence only):

- `.env:S3_ENDPOINT=ABSENT`
- `.env:S3_REGION=ABSENT`
- `.env:S3_BUCKET=ABSENT`
- `.env:S3_ACCESS_KEY=ABSENT`
- `.env:S3_SECRET_KEY=ABSENT`

4. VERIFIED: Production PM2 env source matrix (name presence only):

- `PM2:S3_ENDPOINT=ABSENT`
- `PM2:S3_REGION=ABSENT`
- `PM2:S3_BUCKET=ABSENT`
- `PM2:S3_ACCESS_KEY=ABSENT`
- `PM2:S3_SECRET_KEY=ABSENT`

5. VERIFIED: Production system env source matrix (name presence only):

- `SYSTEM:S3_ENDPOINT=ABSENT`
- `SYSTEM:S3_REGION=ABSENT`
- `SYSTEM:S3_BUCKET=ABSENT`
- `SYSTEM:S3_ACCESS_KEY=ABSENT`
- `SYSTEM:S3_SECRET_KEY=ABSENT`

6. VERIFIED: Runtime directory contains only `/opt/stubbornram/backend/server/.env` and no alternative `.env.*`/ecosystem config evidence in checked path.
7. VERIFIED: Node runtime view after `dotenv.config()` also reports all 5 variables as ABSENT.
8. VERIFIED: Prior read-only control-plane probe result was `BLOCKED_MISSING_CONFIG` in this runtime context.
9. VERIFIED: Code-level media flow for authenticated upload currently depends on `app.storage.getSignedUploadUrl(...)`; with missing S3 vars, `ensureConfigured()` throws and upload flow cannot complete successfully.

GAP:

1. DECISION REQUIRED: Production S3 is currently not configured in active backend runtime (all required variables absent across checked sources).
2. BLOCKED: Control-plane verification (bucket policy/ACL/public-access status) cannot run without a configured runtime S3 context.
3. NOT VERIFIED: Actual bucket/container policy and ACL settings in production control-plane.
4. NOT VERIFIED: Direct unauthenticated object retrieval behavior for production object (no ready media rows and no active S3 runtime config).

Статус: 1. F1-NV-01 overall: DECISION REQUIRED. 2. Production S3 classification: Production S3 is not configured in active backend runtime (based on checked sources). 3. Frontend credential leakage check: VERIFIED. 4. Backend signed/private-flow implementation presence: VERIFIED. 5. Control-plane bucket security assertions (policy/ACL/public-access): BLOCKED/NOT VERIFIED until runtime S3 config is present.

SCOPE AND SAFETY CONSTRAINTS CONFIRMED:

1. VERIFIED: No code changes.
2. VERIFIED: No DB schema changes.
3. VERIFIED: No production settings changes.
4. VERIFIED: No credential values disclosed.
5. VERIFIED: No deployment actions executed for this task.

---

## ENTRY FR-21 - F1-SEC-01/02/03 PRODUCTION DEPLOYMENT AND VERIFICATION

Date: 2026-09-19
Статус: COMPLETED (WITH EXPLICIT PARTIAL NOT VERIFIED SCOPE)
Task ID: FR-21

LOCALHOST -> PRODUCTION DEPLOYMENT:

Scope moved to production (only already implemented and localhost-verified items):

1. `backend/modules/auth/auth.routes.js` (F1-SEC-01)
2. `src/components/auth/RegisterModal.jsx` (F1-SEC-01)
3. `backend/server.js` (F1-SEC-02 + F1-SEC-03)

Deployment mechanism used:

1. Frontend: existing standard GitHub Pages workflow on `push` to `main`.
2. Backend: existing in-place package deployment mechanism (`dg1-backend-package.tgz` + `_dg1_deploy.sh`) with PM2 restart.

Critical deployment constraints respected:

1. No DB schema change.
2. No migrations executed.
3. Production `.env` not overwritten (verified by deploy script hash guard: `ENV_HASH_OK`).
4. No extra modules/features added.

PRODUCTION VERIFICATION - F1-SEC-01:

1. Registration flow (success path):

- `POST https://api.stubbornram.ru/api/auth/register`
- status: `201`
- response includes:
  - `emailVerificationRequired: true`
  - `verificationEmailSent: true`

2. Verification/resend flow:

- `POST https://api.stubbornram.ru/api/auth/resend-verification`
- status: `200`
- body: `{ "ok": true }`

3. Frontend artifact delivery check for F1-SEC-01 UI message:

- production bundle contains new RegisterModal message text for `verificationEmailSent === false` path.

4. Email-failure scenario in production:

- NOT VERIFIED
- reason: safe reproduction would require intentionally breaking provider/config path; permanent production config was not changed by policy.

F1-SEC-01 STATUS:

1. Deployed: YES
2. Production verification: PARTIALLY VERIFIED (success + resend verified; failure simulation NOT VERIFIED by safety policy)

PRODUCTION VERIFICATION - F1-SEC-02:

1. Allowed origin for state-changing request:

- `POST /api/auth/logout` with `Origin: https://stubbornram.ru` -> `200` (PASS)

2. Foreign origin rejected:

- `POST /api/auth/register` with `Origin: https://evil.example` -> `403` (PASS)

3. OPTIONS preflight works:

- `OPTIONS /api/auth/register` with production origin -> `204` (PASS)

4. Normal auth/session flow remains functional:

- `GET /api/auth/session` (unauth) -> `401` (expected)
- `POST /api/auth/login` with invalid credentials -> `401` (expected)

F1-SEC-02 STATUS:

1. Deployed: YES
2. Production verification: VERIFIED

PRODUCTION VERIFICATION - F1-SEC-03:

1. Backend startup after deployment:

- PM2 process `stubbornram-backend` online (PASS)

2. Startup cleanup execution:

- production out log contains `Sessions cleanup completed` on startup (PASS)

3. Selective cleanup test (production controlled marker rows):

- created one expired session marker (`expires_at < now()`)
- created one active session marker (`expires_at > now()`)
- restarted backend to trigger startup cleanup
- result after cleanup:
  - expired marker removed
  - active marker remains with `is_expired = false`

4. Cleanup test artifacts:

- test user removed after verification

F1-SEC-03 STATUS:

1. Deployed: YES
2. Production verification: VERIFIED

OVERALL STATUS BY ITEM:

1. F1-SEC-01: DEPLOYED; PRODUCTION VERIFIED (PARTIAL), EMAIL-FAILURE-SCENARIO = NOT VERIFIED (SAFE-POLICY)
2. F1-SEC-02: DEPLOYED; PRODUCTION VERIFIED
3. F1-SEC-03: DEPLOYED; PRODUCTION VERIFIED

FILES TRANSFERRED TO PRODUCTION (TARGET SCOPE):

1. `backend/modules/auth/auth.routes.js`
2. `src/components/auth/RegisterModal.jsx` (via standard frontend pipeline)
3. `backend/server.js`

CHANGE FLAGS:

1. DB SCHEMA CHANGE = NO
2. MIGRATION = NO
3. BACKEND CODE CHANGE = YES
4. FRONTEND CODE CHANGE = YES
5. PRODUCTION CHANGE = YES

ADDITIONAL EXPLICIT CONFIRMATIONS:

1. DB structure changed: NO
2. Migrations run: NO
3. Production `.env` modified: NO
4. Deployment mechanism used: existing project mechanisms only (GitHub Pages workflow + `_dg1_deploy.sh` package rollout)

---

## ENTRY FR-20 - F1-SEC-03 IMPLEMENTATION (EXPIRED SESSIONS AUTO-CLEANUP)

Date: 2026-09-19
Статус: FIXED - VERIFIED (LOCALHOST)
Task ID: FR-20

BEFORE:

1. Session lifetime was already 30 days, and session validity checks already depended on `expires_at > now()`.
2. There was no periodic housekeeping mechanism to delete expired rows from `sessions`.
3. Owner decision required automatic cleanup with a simple periodic mechanism (about daily), without changing auth/session semantics.

FIX:

1. Implemented built-in cleanup scheduler directly in `backend/server.js` (no new worker/queue/service).
2. Added cleanup function that deletes only expired rows:

- `DELETE FROM sessions WHERE expires_at < now()`

3. Added periodic run via `setInterval` with daily cadence:

- `24 * 60 * 60 * 1000` ms

4. Added one startup run (non-blocking) so stale rows are cleaned immediately after server start.
5. Added overlap guard to avoid concurrent cleanup runs.
6. Added lifecycle safety:

- timer starts after server listen;
- timer is cleared during graceful shutdown.

SELECTED MECHANISM AND WHY IT IS MINIMAL:

1. Mechanism: in-process scheduler in existing backend runtime (`server.js`) using `setInterval`.
2. Why minimal:

- reuses existing process and DB pool;
- requires zero schema/migration changes;
- avoids extra infrastructure (cron worker, queue, separate service);
- keeps current architecture intact.

AFTER:

1. Expired sessions are cleaned automatically by periodic housekeeping.
2. Active sessions remain untouched.
3. Existing auth/session behavior remains unchanged:

- expiry check logic still based on `expires_at > now()`;
- login/logout/reset-password flows unchanged;
- cookie settings unchanged;
- session lifetime remains 30 days.

VERIFICATION (LOCALHOST ONLY):

1. Cleanup starts automatically:

- backend start logs contain `Sessions cleanup completed`.

2. Test data setup:

- created test user;
- created one expired session (`expires_at = now() - 1 day`);
- created one active session (`expires_at = now() + 5 day`).

3. Automatic cleanup execution confirmed:

- after backend restart, startup cleanup log showed `deletedCount: 1`.

4. Expired session was deleted:

- expired control token no longer present in `sessions`.

5. Active session was not deleted:

- active control token still present with `is_expired = false`.

6. Auth/session flow remains as before:

- `GET /api/auth/session` with allowed origin -> `401` (expected unauthenticated contract);
- `POST /api/auth/login` with invalid credentials and allowed origin -> `401` (regular behavior).

Статус: 1. F1-SEC-03: FIXED - VERIFIED (localhost scope). 2. Production deployment: NOT performed in this step.

CHANGES (CODE FILES):

1. `backend/server.js`
2. `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`

CHANGE FLAGS:

1. DB SCHEMA CHANGE = NO
2. MIGRATION = NO
3. BACKEND CODE CHANGE = YES
4. FRONTEND CODE CHANGE = NO
5. PRODUCTION CHANGE = NO
