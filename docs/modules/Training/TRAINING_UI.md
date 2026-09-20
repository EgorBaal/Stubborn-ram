# TRAINING_UI

## Карта Экранов

Статус: CURRENT (реализованные routes/screens) + PARTIALLY IMPLEMENTED placeholders

Реализованные training screens:

- TrainingHistoryPage
- TrainingCreatePage
- TrainingPage (new/edit workout)
- TrainingTemplatesPage
- TrainingExercisesPage
- TrainingTemplateBuilderPage
- TrainingExerciseBuilderPage
- TrainingProgramsPage

## Routes

Статус: CURRENT

Настроенные routes в app router:

- /app/training
- /app/training/create
- /app/training/new
- /app/training/:id
- /app/training/template/:id
- /app/training/templates
- /app/training/templates/create
- /app/training/exercises
- /app/training/exercises/create
- /app/training/programs

Примечание:

- /app/training/programs/create используется в UI navigation, но не имеет выделенного route mapping в текущем router.

## История Training

Статус: CURRENT

Реализованное поведение:

- загружает workouts через trainingService getCompletedWorkouts;
- поддерживает открытие деталей workout;
- поддерживает удаление workout из списка;
- отображает состояния loading и error/empty.

## Flow Создания Training

Статус: PARTIALLY IMPLEMENTED

Текущее поведение:

- create page предлагает New Workout и template cards.
- template cards рендерятся из коллекции `templates`, но current branch не подключает явный источник в `TrainingCreateList` (не verified как рабочий end-to-end).
- выбор new workout открывает TrainingPage.

## Редактор Training

Статус: CURRENT

TrainingPage поддерживает:

- workout title/date/time/type/comment;
- adding/removing exercises;
- loading existing workout by id;
- save/update via trainingService.

## Карточки Exercise

Статус: CURRENT

TrainingExerciseCard поддерживает:

- exercise selection overlay;
- set management;
- difficulty/parameter controls;
- comments;
- collapse/expand behavior;
- swipe actions for set copy/delete.

## Sets

Статус: CURRENT

UI на уровне set поддерживает:

- per-set metrics fields;
- intensity methods;
- order-driven numbering;
- add/copy/delete interactions.

## Materials

Статус: PARTIALLY IMPLEMENTED

Текущее поведение в card:

- читает set materials через getSetMaterials для persisted set ids;
- UI для отображения materials присутствует.

Пробел:

- trainingMaterialsService сейчас предоставляет только read method; явный frontend write contract не представлен в этом service file.
- read-only comparison stash (stash@{0}) содержит write-flow variant (saveSetMaterials + upload path), но это пока не часть current branch baseline.

## Comments/Notes

Статус: PARTIALLY IMPLEMENTED

- comments уровня workout и exercise реализованы в editor и сохраняются через workout save/update.
- linkage notes/material на уровне set поддерживается backend; write-интеграция frontend остаётся частичной.

## Templates UI

Статус: PARTIALLY IMPLEMENTED

- экран templates существует с navigation и placeholders.
- экраны template builder и programs сейчас являются shell-заглушками.
- полноценное поведение persisted списка templates в текущей UI-реализации не подтверждено.

## Состояния UI / Loading / Errors

Статус: CURRENT baseline

- history screen имеет состояния loading/error/empty.
- editor имеет флаги saving/loading и базовые error alerts.
- список exercises имеет loading/search/filter и обработку ошибок.

## Текущая Реализация

- Core flows истории workout и редактора workout активны.
- Список exercises получает данные из backend endpoint exercises.
- Несколько экранов template/program существуют как частичные placeholders.

## Planned UI

- Полностью persisted список templates и workflow template builder.
- UI flows program/protocol (включая lifecycle create/manage).
- Явное завершение маршрутизации для пути program create.

## Известные Пробелы

- Hardcoded использование API в trainingService обходит shared pattern apiClient.
- UX templates/programs опережает полную persistence-интеграцию.
- UX contract для записи materials не полностью представлен в текущем frontend service layer.
- Улучшения только в stash должны считаться protected working changes до их слияния в branch snapshot.

## Связанные Документы

- docs/modules/Training/TRAINING.md
- docs/modules/Training/TRAINING_API.md
- docs/modules/Training/TRAINING_TEMPLATES.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
