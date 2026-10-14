# Production Training Incident — 2026-10-09

## Раздел A. Краткое описание инцидента

- Дата обнаружения: 2026-10-09
- Затронутый компонент: Training Backend / Training API / PostgreSQL schema / Production runtime
- Наблюдаемые пользователем симптомы: создание тренировки из Production UI завершается неуспешно; запрос к `POST /api/training/workouts/start` возвращает HTTP `404`; часть Training UI и catalog logic в Production остаётся частично рабочей, но операция старта новой тренировки не выполняется.
- Что работает: Production Backend отвечает на health-check; часть GET-endpoints Training вроде `/api/training/exercises` и `/api/training/workouts` доступны; ранее наблюдались успешные вызовы в runtime logs; API gateway и Nginx не являются очевидным точками отказа на уровне данного endpoint.
- Что не работает: `POST /api/training/workouts/start` в Production runtime не найден; схема `public.exercises` в Production не соответствует текущей локальной модели; миграции `1788859125924`, `1788859125925`, `1788859125926` отсутствуют в Production history.
- Проверки уже выполнены: подтверждён Production runtime PM2 process; подтверждён путь запуска Backend; подтверждён путь активного файла маршрутизатора; подтверждён факт отсутствия `POST /api/training/workouts/start` в Production `training.routes.js`; подтверждён факт `404` в backend logs; подтверждён факт divergence in `exercises` schema и `pgmigrations` history.
- Что ещё не выполнялось: исправление кода, развёртывание, миграции, изменение PostgreSQL и не выполнялся PM2 restart. Все действия в этом документе остаются read-only.

---

## Раздел B. Реестр проблем

| ID      | Краткое название                                                                        | Затронутый компонент                | Наблюдаемый симптом                                            | Подтверждённая непосредственная причина                                                                               | Предполагаемая первопричина                                                           | Доказательства и источник                                                                                                                                                                                            | Влияние на пользователей                                                     | Критичность | Зависимость                                                          | Статус                      | Следующий шаг                                                                              |
| ------- | --------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| INC-001 | Отсутствующий маршрут `POST /api/training/workouts/start` в Production                  | Production Backend / Fastify routes | `404` при старте новой тренировки                              | Route не найден в активном Production `training.routes.js`                                                            | Production runtime file отличается от текущего локального checkout / stale deployment | backend log: `Route POST:/api/training/workouts/start not found`; `pm2` launches `/opt/stubbornram/backend/server/server.js`; Production route file does not contain `app.post("/api/training/workouts/start", ...)` | Создание тренировки невозможно                                               | Критично    | Завязан на развертывание и состояние runtime                         | Подтверждено                | Синхронизировать Production route file с канонической версией и проверить после deployment |
| INC-002 | Расхождение схемы `exercises` между Production и локальной БД                           | PostgreSQL / Training schema        | Некорректная работа категорий и Training catalog               | Production `exercises` содержит `muscle_group`, но не содержит `category`, `primary_muscles`, `secondary_muscles`     | Production DB не обновлена до целевой Training schema                                 | Production `information_schema.columns` shows only `id`, `name`, `muscle_group`, `user_id`, `created_at`, `updated_at`                                                                                               | Категории и упражнения могут работать неправильно                            | Критично    | Зависит от миграций 5924/5925 и от кодовых ожиданий frontend/backend | Подтверждено                | Проверить фактическую схему, историю миграций и безопасный порядок миграций                |
| INC-003 | Отсутствующие миграции `1788859125924`, `1788859125925`, `1788859125926` в Production   | PostgreSQL / migration history      | Production history несогласована с локальной и с текущим кодом | `pgmigrations` in Production does not include these migrations                                                        | Production DB и локальная база были развернуты в разных состояниях                    | Local `pgmigrations` includes 5924/5925/5926; Production `pgmigrations` sample does not include them                                                                                                                 | Дальнейшее применение миграций без проверки опасно                           | Критично    | Зависит от фактического состояния схемы и от данных                  | Подтверждено                | Проверить фактическую схему и проводить миграции только после backup и staging validation  |
| INC-004 | Неустановленная причина расхождения Production `training.routes.js` с локальной версией | Deployment / runtime versioning     | Backend runtime differs from local source                      | Не доказано, что именно привело к divergence: stale deploy, неактуальный file, ручная правка, ветка без синхронизации | Production может быть запущен с файловой версией, отличной от Git checkout            | Local and Production hashes differ; route file contents differ; PM2 runs file on disk in Production, but exact deployment history not yet established                                                                | Риск повторения инцидента при следующем release                              | Высоко      | Условно связан с INC-001 и с процессом деплоя                        | Частично подтверждено       | Проверить Git state, deployment history и фактический source used by Production runtime    |
| INC-005 | Риск применения миграций без prior backup и verification                                | PostgreSQL / migration safety       | Неверная схема, потеря данных, частичный rollback              | Миграции 5924–5926 изменяют schema/data and may fail if partially applied                                             | Production history is out-of-sync and may have mixed state                            | Local migration scripts perform rename/alter/update; Production schema is not aligned; no verified backup procedure confirmed in current evidence                                                                    | Возможна потеря/искажение данных и нарушение существующих Training workflows | Критично    | Зависит от INC-002 и INC-003                                         | Подтверждено как риск       | Требуется отдельное permission перед применением миграций                                  |
| INC-006 | Несогласованность между runtime и repository state в Production                         | Deployment / source-of-truth        | Поведение Production не соответствует local repository         | Файлы на диске и версия кода, загруженная в процесс, могут отличаться                                                 | Stale deploy / partial sync / old artifact deployment                                 | `server.js` matches local hash, but `training.routes.js` differs; route missing in Production file                                                                                                                   | Повторение проблем на Production, невозможность надежного воспроизведения    | Высоко      | Зависит от deploy-process and file verification                      | Подтверждено как divergence | Следует проверить канонический source and deployment history before fixing                 |

---

## Раздел C. Доказательства и история диагностики

### C.1. Production runtime и маршрут

**Факт 1**: Production Backend запускается из `/opt/stubbornram/backend/server/server.js`.

- Источник: `pm2 show stubbornram-backend` и `ps -eo ... | grep node ...`.
- Утверждение: PM2 process is `node /opt/stubbornram/backend/server/server.js`.

**Факт 2**: Production route file exists and is named `/opt/stubbornram/backend/server/modules/training/training.routes.js`.

- Источник: `readlink -f /opt/stubbornram/backend/server/modules/training/training.routes.js`.

**Факт 3**: `server.js` in Production registers the module.

- Источник: `await app.register(trainingRoutes);` in active file.
- Файл: `/opt/stubbornram/backend/server/server.js`.

**Факт 4**: Production route file does not contain `POST /api/training/workouts/start`.

- Источник: `grep -nE "workouts/start|trainingRoutes|app.register\(trainingRoutes\)"` executed on Production files.
- Результат: route string absent in active file.

**Факт 5**: backend log says `Route POST:/api/training/workouts/start not found`.

- Источник: Production backend log, excerpt:
  - `msg":"incoming request"` with `url":"/api/training/workouts/start"`
  - `msg":"Route POST:/api/training/workouts/start not found"`
  - `res":{"statusCode":404}`

**Что установлено**:

- запрос доходит до backend;
- backend его обрабатывает и отвечает `404`;
- Nginx на данном этапе не является непосредственной причиной 404.

**Что не установлено**:

- точный historic deployment/push, который привёл к divergence;
- наличие вручную отредактированного файла без Git tracking;
- точный in-memory route table без instrumentation.

### C.2. Сравнение локального и Production файлов

**Факт 6**: Local checkout contains route definition in [backend/modules/training/training.routes.js](../../backend/modules/training/training.routes.js).

- Источник: local file and `Select-String -Pattern "workouts/start|trainingRoutes|app.register\(trainingRoutes\)"`.
- Evidence: local file includes `app.post("/api/training/workouts/start", ...)`.

**Факт 7**: Production file differs from local file.

- Источник: hash comparison and file diff between local and Production versions.
- Production file hash: `57640aec49bed7829ef9c0b41df43b7e7e7794944da2787aa364e8ac2e7d8977`
- Local file hash: `19183be84ec8f7379875ca26d1ac155d696b5f2b653a2a3c217c520cafee5b57`

**Вывод**:

- runtime source and local repository are not aligned for `training.routes.js`;
- this is a strong indicator of stale or divergent deployment state.

### C.3. Схема `exercises` в Production

**Факт 8**: Production schema `public.exercises` has only these columns:

- `id`
- `name`
- `muscle_group`
- `user_id`
- `created_at`
- `updated_at`

**Факт 9**: Production does not have:

- `category`
- `primary_muscles`
- `secondary_muscles`

**Факт 10**: Count of rows in `public.exercises` is 232.

- `COUNT(muscle_group) = 232`
- `NULL` rows = 0
- empty rows = 0

**Факт 11**: Distribution of `muscle_group` values in Production includes:

- `legs_glutes`
- `arms`
- `shoulders`
- `back`
- `yoga`
- `chest`
- `cardio`
- `abs`

**Вывод**:

- Production schema is older and structurally mismatched with the current local Training model.

### C.4. История миграций и локальное сравнение

**Факт 12**: Local migration history includes migrations 5924, 5925, 5926.

- Источник: local `pgmigrations` query.

**Факт 13**: Production migration history sample does not include those migrations.

- Источник: direct query against Production `pgmigrations`.

**Факт 14**: Migrations in repository:

- [backend/migrations/1788859125924_training_exercise_categories.js](../../backend/migrations/1788859125924_training_exercise_categories.js)
- [backend/migrations/1788859125925_training_category_values.js](../../backend/migrations/1788859125925_training_category_values.js)
- [backend/migrations/1788859125926_workout_lifecycle_isolation.js](../../backend/migrations/1788859125926_workout_lifecycle_isolation.js)

**Назначение миграций**:

- 5924 renames `muscle_group` to `category` and changes `primary_muscles` / `secondary_muscles` to arrays;
- 5925 updates system exercise categories from English values to Russian labels;
- 5926 makes `workouts.status` nullable by default.

### C.5. Источник истины и противоречия в документации

**Факт 15**: Current canonical documentation states that the Training module has current runtime and canonical core behavior, but it also says that runtime / remediation evidence has priority over design assumptions.

- Источник: [Docs Updated/SYSTEM_STATE/SYSTEM_STATE_FINAL.md](../SYSTEM_STATE/SYSTEM_STATE_FINAL.md), [Docs Updated/modules/Training/TRAINING.md](../Training/TRAINING.md), [Docs Updated/modules/Training/TRAINING_API.md](../Training/TRAINING_API.md).

**Противоречие / оговорка**:

- Документация определяет целевую и текущую модель, но не отменяет факт, что Production state differs from local repository state and migration history. Это является отдельной runtime divergence, а не contradiction in canonical docs.

---

## Раздел D. Карта причин и взаимосвязей

### D.1. Почему отсутствующий маршрут приводит к ошибке создания тренировки

- Frontend Training flow tries to start a workout via `POST /api/training/workouts/start`.
- Production Backend receives the request, but the route is absent in the active route file.
- Fastify responds with HTTP `404` and no workout is created.
- Result: user cannot create a new workout even though frontend and backend are otherwise reachable.

### D.2. Почему расхождение схемы `exercises` может нарушать работу категорий

- The local code expects `category`, `primary_muscles`, `secondary_muscles` to exist in `exercises`.
- Production still has the older `muscle_group` schema.
- If the backend code queries `category` but the database column is absent, Training catalog and exercise selection can fail or return incomplete data.
- This is separate from route mismatch, but it can affect the same feature area and may appear as a broader Training failure.

### D.3. Почему отсутствие миграций в `pgmigrations` требует проверки перед запуском

- `pgmigrations` is the source of truth for migration history.
- If the schema has a newer shape but history does not, subsequent migration execution becomes risky and can produce partial state.
- Without checking the actual schema and revision history, one cannot safely assume that no partial migration or manual change already happened.

### D.4. Почему проблема маршрута и проблема схемы БД — разные задачи

- Route issue is a runtime code/deploy mismatch.
- Schema issue is an environment/database drift.
- One is about missing endpoint registration; the other is about missing columns and missing migration records.
- They can coexist and amplify the same user-visible failure, but they should not be merged into a single “one fix” action before they are isolated and validated separately.

### D.5. Какие проверки нужны для установления причины расхождения Production и локальной версии

- Confirm actual deployed source on server and exact deployment history.
- Verify Git branch and file state at deploy time.
- Compare live backend file hashes and timestamps with repo.
- Confirm whether manual edits or stale artifacts exist on the server.
- Verify whether PM2 started from a different working directory or different repository checkout.

---

## Раздел E. План исправления

### Этап 0. Предварительная подготовка

- Входные условия:
  - Production environment confirmed as target environment.
  - Current diagnosis recorded.
  - Local repo and Production runtime are compared.
- Действия:
  - Подтвердить правильную Production БД и backend process.
  - Проверить Git state and actual deployment history.
  - Сверить state of `pgmigrations` and actual schema.
  - Убедиться, есть ли verified backup and restore procedure.
  - Проверить возможность isolated restore into a test database.
  - Зафиксировать stop conditions before scripts are executed.
- Критерии успеха:
  - подтвержден target environment;
  - известен список полей, таблиц и миграций;
  - обеспечена documented recovery path.
- Условия остановки:
  - wrong database or environment; no verifiable backup; no confirmed recovery method.
- Проверка:
  - evidence from PM2, config, DB metadata, migration history.
- Восстановление:
  - restore from backup into isolated copy, not on live DB until validated.

### Этап 1. Исправление Backend маршрута

- Входные условия:
  - route mismatch is isolated and confirmed.
  - canonical route file is identified.
- Действия:
  - выбрать каноническую версию `training.routes.js`;
  - убедиться, что route contract matches frontend API and current internal contract;
  - определить minimal safe sync with Production runtime;
  - выполнить controlled deployment only after validation.
- Критерии успеха:
  - route `POST /api/training/workouts/start` exists in runtime file;
  - no `Route ... not found` in logs;
  - endpoint returns expected response.
- Условия остановки:
  - route file differs again; incompatible API contract; cannot ensure safe deployment.
- Проверка:
  - backend request logs; HTTP status; server response payload.
- Восстановление:
  - revert to previous runtime file if route is broken after deployment.

### Этап 2. Согласование схемы PostgreSQL

- Входные условия:
  - Production DB schema is confirmed as older than local schema.
  - Migration history is known to be incomplete.
- Действия:
  - check every table and migration in full;
  - review 5924/5925/5926 and their `down` methods;
  - verify workload and constraints;
  - back up database and test restore path on isolated instance;
  - test migration sequence in a copy of Production data;
  - only then consider Production execution.
- Критерии успеха:
  - migration sequence is repeatable and safe;
  - row counts and FK integrity remain valid;
  - categories transform under expected rules.
- Условия остановки:
  - schema differs from migration assumptions; backup missing; unexpected row loss or FK breakage.
- Проверка:
  - DB metadata, counts, categories, FK constraints, logs.
- Восстановление:
  - restore from backup or revert migration sequence if it fails.

### Этап 3. Проверка пользовательских сценариев

- Входные условия:
  - route restored and schema validated in controlled copy.
- Действия:
  - создание новой тренировки;
  - получение списка упражнений;
  - выбор категории;
  - сохранение тренировки;
  - повторное открытие и проверка данных;
  - проверка существующих записей;
  - проверка ошибок и server logs.
- Критерии успеха:
  - новая тренировка создаётся,
  - list of exercises loads,
  - categories remain valid,
  - data persists after reload.
- Условия остановки:
  - not enough contract compatibility or schema mismatch remains.
- Проверка:
  - HTTP responses, DB inserts, UI behavior, logs.
- Восстановление:
  - remove or rollback newly created test objects in isolated environment only.

### Этап 4. Завершение инцидента

- Входные условия:
  - all checks pass in isolated environment and controlled rollout.
- Действия:
  - фиксировать результаты;
  - проверять отсутствие регрессий;
  - документировать residual risks;
  - определить критерии closure.
- Критерии успеха:
  - no route 404;
  - no schema regression;
  - consistent DB history,
  - documented recovery path.
- Условия остановки:
  - any verification fails or recovery path unverifiable.
- Проверка:
  - smoke tests, DB count checks, log review.
- Восстановление:
  - revert to last known good configuration if needed.

---

## Раздел F. Риски и ограничения

- Риск потери или некорректного преобразования данных: при миграции `5924` и `5925` data model changes are significant; subset of row values must be preserved.
- Риск несовместимости старого Backend с новой схемой БД: code expects newer columns and different types; older Production runtime may not support them.
- Риск несовпадения кода на диске и кода, загруженного процессом: confirmed for `training.routes.js`.
- Риск повторного выполнения миграций: if `pgmigrations` history is out-of-sync, re-running may fail or produce partial state.
- Риск небезопасного `down`: `down` methods in 5924/5925/5926 do destructive or data-changing conversions and should not be run without verification.
- Риск нарушения работы существующих тренировок: since `workouts.status` may be nullable and query assumptions may differ, current records may be affected.
- Риск частичного развертывания: route fix and DB migration can be out of sync if applied in wrong order.
- Важное ограничение: отсутствие миграций в Production history само по себе не доказывает, что их изменения не были выполнены вручную или частично. Фактическая схема должна проверяться до любого решения.

---

## Раздел G. Журнал выполнения работ

| Дата       | Этап        | ID проблемы | Выполненное действие                                  | Изменённые файлы / компоненты                         | Результат                                  | Доказательство проверки                                               | Отклонения | Остаточные риски                                         | Следующее действие                                        |
| ---------- | ----------- | ----------- | ----------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------- | ---------- | -------------------------------------------------------- | --------------------------------------------------------- |
| 2026-10-09 | Диагностика | INC-001     | Проверка Production backend logs и route registration | Production runtime, `server.js`, `training.routes.js` | Подтверждён `404` route missing            | backend logs show `Route POST:/api/training/workouts/start not found` | Нет        | route file difference still uncertain in deploy history  | Проверить deployment history and canonical source         |
| 2026-10-09 | Диагностика | INC-002     | Проверка `public.exercises` schema                    | PostgreSQL metadata                                   | Production table differs from local schema | column list from `information_schema.columns`                         | Нет        | unknown root cause of divergence                         | Validate recovery path and migration sequence             |
| 2026-10-09 | Диагностика | INC-003     | Проверка `pgmigrations` history                       | Production DB metadata                                | missing 5924/5925/5926                     | migration table sample and local history comparison                   | Нет        | incomplete migration history requires careful validation | Prepare migration review plan                             |
| 2026-10-09 | Диагностика | INC-004     | Сравнение local vs Production route files             | local + Production `training.routes.js`               | divergence confirmed                       | hash and route grep output                                            | Нет        | exact deployment cause unknown                           | Investigate deployment process                            |
| 2026-10-09 | Диагностика | INC-005     | Анализ миграций 5924–5926                             | repository migration files                            | data/schema change set identified          | file inspection of migration scripts                                  | Нет        | unverified compatibility with live DB                    | Validate on isolated copy before any production execution |

> На текущий момент ничего не отмечено как “исправлено”: выполнялась только read-only диагностика. Все изменения и исправления должны быть отдельным этапом после подтверждения.

---

## Раздел H. Шаблон для будущих переносов

### Чек-лист для Production deployment / rollback control

1. Проверка актуального System State и рабочих инструкций
   - Что проверять: актуальный `SYSTEM_STATE_FINAL`, AGENTS, WORKFLOW, coding/development rules.
   - Подтверждение: подтверждённый source-of-truth before editing or deploying.

2. Проверка Git-коммита и состояния рабочей ветки
   - Что проверять: branch, commit hash, changed files, staging state.
   - Подтверждение: exact revision is known before deployment.

3. Сверка локальной и Production-версий ключевых файлов
   - Что проверять: `server.js`, route files, major modules, migration files.
   - Подтверждение: hash or diff match across expected targets.

4. Сверка PM2 `cwd`, `script path`, аргументов запуска и реального пути Backend
   - Что проверять: `pm2 show`, `ps`, `readlink -f`, runtime process command.
   - Подтверждение: process running expected file and working directory.

5. Проверка регистрации маршрутов API
   - Что проверять: `app.register(...)` and route definitions for `GET/POST` endpoints.
   - Подтверждение: no route not found in logs after deployment.

6. Сверка API-контрактов frontend и Backend
   - Что проверять: request/response contract and required fields.
   - Подтверждение: frontend contract matches backend route payload expectations.

7. Сверка схемы PostgreSQL и истории `pgmigrations`
   - Что проверять: `information_schema.columns`, `pgmigrations`, FKs, indexes.
   - Подтверждение: schema and migration history match expected target state.

8. Проверка последовательности и повторяемости миграций
   - Что проверять: ordering, dependencies, `down` methods, idempotence assumptions.
   - Подтверждение: migration sequence is valid on isolated copy.

9. Проверка резервной копии и возможности восстановления
   - Что проверять: actual backup existence, restore path, retention, drift check.
   - Подтверждение: recovery procedure validated on a copy.

10. Тестирование на изолированной копии данных

- Что проверять: restore Production-like DB and run migration/test flow there.
- Подтверждение: no schema breakage or data loss in isolated environment.

11. Проверка совместимости старого и нового кода с БД

- Что проверять: column names, JSON/array fields, nullable fields, FKs, queries.
- Подтверждение: backend queries work against new schema and old data.

12. Контролируемое развёртывание с отдельным разрешением

- Что проверять: explicit authorization before any runtime or DB changes.
- Подтверждение: no unapproved deployment action.

13. Smoke-тесты после развёртывания

- Что проверять: health, route registration, create/read/update flows, logs.
- Подтверждение: endpoint returns expected success and data is persisted.

14. Проверка логов и реальных пользовательских сценариев

- Что проверять: `404`, `500`, DB errors, user flow from UI to persistence.
- Подтверждение: no regression in underlying user workflow.

15. Документирование результата и процедуры отката

- Что проверять: what changed, why, what succeeded, what failed, what was rolled back.
- Подтверждение: future diagnostics can rely on an auditable record.

---

## Итог по состоянию на 2026-10-09

- Подтверждено: Production route `POST /api/training/workouts/start` is missing from active runtime route file.
- Подтверждено: backend log records `404` for that endpoint.
- Подтверждено: `public.exercises` schema in Production differs from local schema and is older.
- Подтверждено: migration history in Production does not include 5924/5925/5926, while local history does.
- Не подтверждено: точная причина divergence between Production route file and local repository version.
- Не подтверждено: существование verified production backup / restore path.
- Не подтверждено: отсутствие частично выполненных manual schema changes.
- Не выполнялось: исправление кода, ПЗ и Production deployment.

Этот документ является основным рабочим source of truth для дальнейшего и отдельного исправления по этапам, без смешивания Backend route fix и PostgreSQL migration work в одну неразделённую операцию.
