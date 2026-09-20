# TRAINING

## Назначение

Training является ключевой workout-подсистемой Stubborn Ram.
Она охватывает создание workout, историю workout, использование exercises внутри workout, параметры на уровне set и связанный flow training materials.

## Статус

- В целом: PARTIALLY IMPLEMENTED.
- Baseline core persistence для Training (workouts/exercises/workout_sets): CURRENT / VERIFIED.
- Модель templates/programs Training 2.0: PLANNED / DECISION-LEVEL.

## Границы Системы

Включено в scope Training:

- domain objects workout;
- training UI screens для history/create/editor/exercises/templates;
- training API endpoints;
- workout persistence в PostgreSQL.

Не включено как полностью реализованное в текущем scope:

- полная program/assignment subsystem;
- полный слой coach-client training permissions;
- полная автоматизация lifecycle Training 2.0.

## Core Сущности (Высокий Уровень)

- Workout
- WorkoutExercise
- WorkoutSet
- Exercise
- TrainingSetNote
- MediaLink for set materials

Подробная schema и relationships: docs/modules/Training/TRAINING_DATA_MODEL.md

## Высокоуровневый Flow

1. User открывает историю Training.
2. User создаёт новый workout или открывает существующий.
3. User редактирует exercises и sets.
4. User сохраняет/обновляет workout через training API.
5. Workout появляется в history list.

Flows, связанные с template/program, в текущем состоянии частично реализованы или planned и задокументированы отдельно.

## Текущее Реализованное

- Routes и screens для history, create, workout editor, templates page, exercises page.
- Backend endpoints для CRUD по exercises/workouts и read/write для set materials.
- Персистентные workout data в PostgreSQL через workouts/workout_exercises/workout_sets.
- Authenticated доступ в границах ownership scope в training routes.

## PARTIALLY IMPLEMENTED

- Templates UI существует, но остаётся на уровне placeholder для persistence flow.
- Program UI существует, но остаётся на уровне placeholder.
- Frontend materials write-path не полностью отражён в текущем контракте trainingMaterialsService.
- End-to-end training permissions с интеграцией в relationship subsystem реализованы не полностью.

## Текущая ветка vs защищённые рабочие изменения

Статус: VERIFIED (QA-2)

- Current branch baseline: trainingService использует direct fetch с hardcoded host https://api.stubbornram.ru/api/training; trainingMaterialsService read-only (только getSetMaterials).
- Protected working changes в stash@{0} (read-only comparison): включают trainingService в стиле apiClient/request и write helper saveSetMaterials плюс расширенный UI flow сохранения materials.
- Пока содержимое stash не влито в branch snapshot, эти улучшения нельзя документировать как CURRENT implementation.

## PLANNED

- Полностью персистентный lifecycle templates.
- Lifecycle и assignment behavior для program/protocol.
- Расширенная интеграция training analytics/report.
- Полная relationship-aware политика доступа к training.

## DEFERRED

- Расширенные возможности Training 2.0, определённые как архитектурные решения, но ещё не вошедшие в implementation baseline.

## NOT VERIFIED

- Полный production parity для всех целевых template/program behaviors.

## Архитектурные Ограничения, Сохранённые Из Legacy Source

Статус: PARTIALLY IMPLEMENTED / PLANNED

- Feedback для training objects является контекстными domain data, а не вторичным chat-каналом.
- Chat остаётся каналом коммуникации и должен ссылаться на training entities, а не дублировать workout payloads.
- Reports должны агрегировать и ссылаться на существующие training entities, а не дублировать training records.
- История exercises и analytics должны вычисляться из persisted data workout/workout_exercise/workout_set.

## Каноническое Семейство Training

- docs/modules/Training/TRAINING_DATA_MODEL.md
- docs/modules/Training/TRAINING_UI.md
- docs/modules/Training/TRAINING_API.md
- docs/modules/Training/TRAINING_TEMPLATES.md
- docs/DECISIONS/TRAINING_2_0_DECISIONS.md

## Связанные Документы

- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/SYSTEMS/DATABASE.md
- docs/SYSTEMS/PERMISSIONS.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- docs/modules/Training/TRAINING_SOURCE_LEGACY_2026-09-19.md
