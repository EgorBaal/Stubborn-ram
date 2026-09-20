# TRAINING_DATA_MODEL

## Сущности

Статус: CURRENT (реализованный baseline) + PLANNED extensions

Текущие core entities:

- users
- exercises
- workouts
- workout_exercises
- workout_sets
- training_set_notes
- media
- media_links

Template entities в migrations repository:

- training_templates
- training_template_exercises
- training_template_sets

## Связи

Текущие реализованные relationships:

- workouts.user_id -> users.id
- workout_exercises.workout_id -> workouts.id
- workout_exercises.exercise_id -> exercises.id
- workout_sets.workout_exercise_id -> workout_exercises.id
- training_set_notes.workout_set_id -> workout_sets.id
- training_set_notes.author_id -> users.id
- media_links.media_id -> media.id

## Workout

Статус: CURRENT / VERIFIED

Назначение:

- persisted completed instance workout.

Ключевые поля:

- id, user_id, title, training_date, start_time, end_time, training_type, comment, status, completed_at, created_at, updated_at.

## WorkoutExercise

Статус: CURRENT / VERIFIED

Назначение:

- упорядоченные строки exercise внутри workout.

Key fields:

- id, workout_id, exercise_id, position, exercise_comment, superset_after.

## WorkoutSet

Статус: CURRENT / VERIFIED

Назначение:

- метрики на уровне set и параметры нагрузки.

Key fields:

- id, workout_exercise_id, position,
- weight, repetitions,
- distance, calories, speed, power, incline, time,
- rir, rpe, rest,
- intensity_methods.

## Exercise

Статус: CURRENT / VERIFIED baseline

Назначение:

- строки словаря exercises, используемые редактором workout.

Текущее поведение endpoint возвращает system exercises, где user_id IS NULL.
User-specific CRUD для exercise не реализован как complete current feature.

## Ownership

Статус: CURRENT

- Workout data принадлежит пользователю через workouts.user_id.
- Доступ к training на уровне route в backend ограничен authenticated user id и ownership filters.
- Training set notes привязаны к ownership-контексту workout.

## Persistence

Статус: CURRENT / VERIFIED baseline

Реализованные persistence-цепочки:

- create workout + nested exercises/sets;
- read workouts list;
- read workout details;
- update workout with set/exercise diff behavior;
- delete workout;
- set materials read/write routes in backend.

## Текущая реализованная схема

Статус: CURRENT

Реализованная training schema сосредоточена на:

- workouts
- workout_exercises
- workout_sets
- exercises
- training_set_notes

Production inventory snapshot (2026-09-19) подтверждает таблицы workout/exercise/set/note в public schema.

## Planned Schema

Статус: PLANNED / DECISION-LEVEL

- Полная model template/program/protocol, как описано в training templates и decision docs.
- Дополнительные domain entities для assignment/scheduling/version-like поведения.

Важное разделение:

- Само наличие migration file для template tables не подтверждает использование в production runtime.

## Известные Пробелы

- Сущности training templates присутствуют в определениях migrations репозитория, но не подтверждены как активная часть production baseline inventory в audit snapshot.
- Lifecycle user exercises неполный (нет полного flow create/edit/delete).
- Relationship-aware permission model для training objects реализована не полностью.

## Связанные Документы

- docs/modules/Training/TRAINING.md
- docs/modules/Training/TRAINING_API.md
- docs/SYSTEMS/DATABASE.md
- docs/architecture/DATABASE_SCHEMA.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/DECISIONS/TRAINING_2_0_DECISIONS.md
