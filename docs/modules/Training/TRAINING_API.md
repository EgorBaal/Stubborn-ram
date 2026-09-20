# TRAINING_API

## Граница API

Статус: CURRENT

Граница Training API:

Frontend training screens/services
-> HTTP API under /api/training/\*
-> backend/modules/training/training.routes.js
-> PostgreSQL persistence.

## Endpoints

Статус: CURRENT (реализованный список)

- GET /api/training/exercises
- GET /api/training/workouts
- GET /api/training/workouts/:id
- POST /api/training/workouts
- PUT /api/training/workouts/:id
- DELETE /api/training/workouts/:id
- GET /api/training/sets/:setId/materials
- PUT /api/training/sets/:setId/materials

## Methods

- Read: перечисленные выше GET endpoints.
- Write: перечисленные выше POST/PUT/DELETE endpoints.

## Данные Запроса

### Workout create/update

Поля body, используемые backend:

- title
- trainingDate
- startTime
- endTime
- trainingType
- comment
- exercises[]
  - exerciseId
  - position
  - exerciseComment
  - supersetAfter
  - sets[] with per-set metrics and intensityMethods

### Set materials update

Поля body:

- comment
- mediaIds[]

## Данные Ответа

Примеры по группам endpoints:

- список workouts: массив workouts с id/title/createdAt.
- детали workout: поля workout + вложенные workout_exercises + workout_sets.
- create/update/delete: id или status object.
- чтение set materials: массив materials.
- запись set materials: подтверждение setId/type/comment/mediaIds.

## Контракты Ошибок

Текущий стиль backend-ошибок (неполный перечень):

- 400 INVALID\_\* payload/ids/validation errors
- 401 UNAUTHENTICATED
- 404 WORKOUT_NOT_FOUND / SET_NOT_FOUND
- 409 conflict-style material state errors

## Authentication

Статус: CURRENT

- Все перечисленные endpoints требуют authenticated session.
- Unauthenticated доступ возвращает 401.

## Ownership Checks

Статус: CURRENT

Реализованные ограничения ownership включают:

- операции workout ограничены scope `workouts.user_id = authenticated user`.
- доступ/обновление set materials ограничены через связанную ownership-модель workout.

## Materials API

Статус: CURRENT backend, PARTIALLY IMPLEMENTED интеграция frontend

Backend:

- GET /api/training/sets/:setId/materials
- PUT /api/training/sets/:setId/materials

Состояние frontend:

- trainingMaterialsService сейчас предоставляет getSetMaterials.
- явный write helper для PUT отсутствует в текущем service file.

## Текущее Реализованное API

- Endpoints, перечисленные в документе, реализованы в training.routes.js.
- Базовые backend routes для workout CRUD + списка exercises + чтения/записи materials активны в коде repository.

## Planned API

Статус: PLANNED

Ожидаемые architecture/spec docs endpoints lifecycle для template/program (например /api/training/templates\*) отсутствуют в текущем backend training.routes.js.
Их следует считать planned, а не current.

## Известные Пробелы

- Frontend trainingService использует hardcoded absolute API host и direct fetch, а не shared abstraction apiClient.
- API contracts template/program существуют в specs, но не реализованы в текущих backend training routes.
- Некоторые UI paths ссылаются на будущие routes, которые сейчас не настроены.

## Текущая ветка vs защищённые рабочие изменения

Статус: VERIFIED (QA-2)

- Current branch baseline оставляет trainingService на direct fetch + hardcoded host.
- Stash read-only comparison (stash@{0}) показывает service-вариант на apiClient/request и должен трактоваться как последние защищённые изменения.
- Документация сохраняет статус CURRENT, привязанный к branch snapshot, а не к stash-only deltas.

## Связанные Документы

- docs/modules/Training/TRAINING.md
- docs/modules/Training/TRAINING_DATA_MODEL.md
- docs/modules/Training/TRAINING_UI.md
- docs/modules/Training/TRAINING_TEMPLATES.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
