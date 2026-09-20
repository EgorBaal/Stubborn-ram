# DATABASE

## Назначение

Каноническое описание слоя данных PostgreSQL, который сейчас реализован и verified, отдельно от planned-расширений схемы.

## Модель Окружений

### Local vs Production DB

Статус: CURRENT

Local:

- Локальный instance PostgreSQL 16 для development.
- Используется локальным backend на Fastify.

Production:

- PostgreSQL 16.15 на Selectel cloud host, используемом production runtime.
- Это не Selectel Managed PostgreSQL.
- Backend подключается локально через 127.0.0.1:5432.

## Runtime-Архитектура DB

Статус: CURRENT

Backend API является единственным runtime-путём к DB-операциям для app flows.
Параметры подключения передаются из backend environment variables через backend/modules/db/database.js.

## Текущий Production Inventory

Статус: VERIFIED SNAPSHOT (read-only, 2026-09-19)

Область snapshot:

- inventory схемы public через read-only inspection.
- Подтверждённый набор application objects: 12 tables + 1 sequence.

Таблицы в snapshot:

- auth_tokens
- exercises
- leads
- media
- media_links
- pgmigrations
- profiles
- sessions
- training_set_notes
- users
- workout_exercises
- workout_sets

Sequence в snapshot:

- pgmigrations_id_seq

Примечания по объёму snapshot:

- Всего строк в перечисленных business tables: 272 (без учёта pgmigrations).
- media_links и training_set_notes были пустыми в этом snapshot.

Важное примечание по scope:

- Этот раздел является фактическим production snapshot и не является полным описанием target-schema.

## Tables

Статус: CURRENT (ниже перечислены implemented tables) с оговоркой о production-snapshot

### users

- Назначение: auth account identity.
- Key columns: id, email, password_hash, email_verified_at, created_at, updated_at.
- PK: id.
- Ограничения: unique email.

### profiles

- Назначение: baseline профиля пользователя.
- Key columns: user_id, first_name, last_name, avatar_media_id, timestamps.
- PK: user_id.
- FK: user_id -> users.id (cascade delete).

### sessions

- Назначение: persistent login sessions.
- Key columns: id, user_id, token_hash, expires_at, last_used_at.
- PK: id.
- FK: user_id -> users.id (cascade delete).
- Constraints: unique token_hash; indexes on user_id and expires_at.

### auth_tokens

- Назначение: email verification и password reset tokens.
- Key columns: id, user_id, type, token_hash, expires_at, used_at, created_at.
- PK: id.
- FK: user_id -> users.id (cascade delete).
- Constraints: unique token_hash; unique active token per user+type where used_at is null.

### leads

- Назначение: данные questionnaire/lead capture.
- Key columns: id, created_at, status, full_name, age, goals and related details.
- PK: id.
- Constraints: indexes on created_at and status.

### exercises

- Назначение: записи каталога exercises.
- Key columns: id, name, muscle_group, user_id, timestamps.
- PK: id.
- FK: user_id -> users.id (cascade delete).

### workout_exercises

- Назначение: строки exercises внутри workout.
- Key columns: id, workout_id, exercise_id, position, exercise_comment, superset_after.
- PK: id.
- FK: workout_id -> workouts.id (cascade delete), exercise_id -> exercises.id (restrict delete).

### workout_sets

- Назначение: записи performance на уровне set для workout exercises.
- Key columns: id, workout_exercise_id, position, weight/repetitions and metrics fields.
- PK: id.
- FK: workout_exercise_id -> workout_exercises.id (cascade delete).

### training_set_notes

- Назначение: note/feedback для каждого workout set.
- Key columns: id, workout_set_id, author_id, type, comment, timestamps.
- PK: id.
- FK: workout_set_id -> workout_sets.id (cascade delete), author_id -> users.id.
- Constraints: type check (CLIENT_NOTE, TRAINER_FEEDBACK), unique on workout_set_id + type.

### media

- Назначение: media metadata для файлов в object storage.
- Key columns: id, owner_id, author_id, object_key, original_name, mime_type, size_bytes, status.
- PK: id.
- FK: owner_id -> users.id, author_id -> users.id.
- Constraints: unique object_key; status check includes UPLOADING/READY/PROCESSING/FAILED.

### media_links

- Назначение: связывать media entries с domain entities.
- Key columns: id, media_id, entity_type, entity_id, role, sort_order, created_at.
- PK: id.
- FK: media_id -> media.id (restrict delete).
- Indexes: entity_type+entity_id, media_id.

### pgmigrations

- Назначение: таблица отслеживания migrations, используемая node-pg-migrate.

## Migrations

Статус: CURRENT с известным расхождением

Файлы migrations в repository:

- 1788859125911_init.js
- 1788859125912_sessions.js
- 1788859125913_auth_tokens.js
- 1788859125914_leads.js
- 1788859125915_training.js
- 1788859125916_seed_exercises.js
- 1788859125917_auth_tokens_active_unique.js
- 1788859125918_training_templates.js
- 1788859125919_media.js
- 1788859125920_media_status.js
- 1788859125921_training_set_notes.js

Production snapshot/evidence:

- Количество строк pgmigrations в inventory: 10.
- Подтверждённый набор, применённый в production, включает 5911, 5912, 5913, 5914, 5915, 5916, 5917, 5919, 5920, 5921.
- Migration 5918 для training templates присутствует в repository, но не подтверждена как применённая в production.

## Ownership / Referential Integrity

Статус: CURRENT

- Core ownership model привязан к users.id.
- Сущности auth/session/token связаны FK с users.
- Граф workout использует FK-цепочки и поведение cascade/restrict.
- Media использует явные owner_id и author_id с уникальностью object_key.

## Текущая Реализованная Schema

Статус: CURRENT с границами частичной проверки

Подтверждённые реализованные зоны:

- Auth/session/token tables and constraints.
- Leads table and baseline indexes.
- Training core tables (exercises/workout_exercises/workout_sets/training_set_notes) and constraints.
- Media metadata and media_links tables with status constraints.

Оговорка по verification:

- Раздел production inventory следует рассматривать как point-in-time factual snapshot, а не как полную будущую schema.

## Planned Schema

Статус: PLANNED

Planned/target domain tables, не подтверждённые в текущем production snapshot, включают более широкие module entities из roadmap architecture (например domains reports/chat/nutrition/relationship).
Они остаются вне current implemented baseline в этом каноническом DB-документе.

## Пустые / Резервные Таблицы

Статус: CURRENT SNAPSHOT

In the 2026-09-19 production inventory snapshot:

- media_links: 0 rows.
- training_set_notes: 0 rows.

## Известные Пробелы / Ограничения

- Production inventory snapshot содержит 12 public tables; рассматривать это как фактический read-only snapshot.
- Таблицы training_templates из migration 5918 не подтверждены в production snapshot.
- Между старыми architecture docs и текущим production inventory возможен междокументный drift.
- Полные control-plane S3 security attributes находятся вне scope DB schema и отслеживаются в media/server evidence.

## Связанные Документы

- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/SYSTEMS/AUTH.md
- docs/SYSTEMS/MEDIA.md
- docs/ARCHITECTURE/APP_STRUCTURE.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- docs/architecture/DATABASE_SCHEMA.md
