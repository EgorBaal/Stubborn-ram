# TRAINING

Статус документа: CURRENT CANONICAL ENTRY POINT  
Статус домена: PARTIALLY IMPLEMENTED  
Фактическая полнота текущего core: CURRENT / VERIFIED  
Последняя актуализация документа: 2026-09-20  
Фактическая база состояния: подтверждённые сведения по состоянию на 2026-09-19

> Правило актуальности: при конфликте между ранними Training-документами и более поздними подтверждёнными runtime/remediation evidence приоритет имеет более позднее подтверждённое состояние. Planned и design-level решения не считаются реализованными.

---

## 1. Назначение

Training — основной рабочий раздел приложения, связанный с созданием, проведением и сохранением тренировок.

В его области находятся:

- история тренировок;
- создание новой тренировки;
- открытие и редактирование сохранённой тренировки;
- упражнения внутри тренировки;
- отдельные подходы и их параметры;
- системный каталог упражнений;
- материалы, относящиеся к конкретным подходам;
- база данных, из которой в дальнейшем могут строиться отчёты и аналитика;
- будущие шаблоны, программы и протоколы.

Историческая концепция также предусматривала самостоятельную работу пользователя без тренера и возможность работы в контексте тренера. При этом принадлежность пользовательских данных остаётся у пользователя; доступ тренера относится к authorization/relationship layer и не должен менять ownership.

---

## 2. Текущее состояние

### 2.1 Core

CURRENT / VERIFIED:

- Training history;
- открытие сохранённой тренировки;
- создание новой тренировки;
- обновление существующей тренировки;
- удаление тренировки;
- вложенные WorkoutExercise и WorkoutSet;
- системный список упражнений;
- ownership checks на backend;
- сохранение workout data в PostgreSQL;
- read/write API для Training Materials;
- loading/error/empty states основных экранов.

### 2.2 Частично реализовано

PARTIALLY IMPLEMENTED:

- пользовательские упражнения;
- Training Materials как полный пользовательский media flow внутри всего Training UX;
- Training 2.0 templates/programs;
- полноценная relationship-aware authorization для coach/client;
- будущие отчёты и аналитика, использующие Training;
- расширенная история отдельного упражнения;
- некоторые будущие UI/interaction capabilities.

### 2.3 Не считается текущим runtime

Не считать CURRENT implementation:

- полноценную persistence-модель шаблонов;
- полноценную persistence-модель программ и протоколов;
- calendar-bound scheduling;
- coach/client assignment subsystem;
- исторический snapshot program/protocol;
- marketplace/продажу программ;
- расширенную автоматическую аналитику недельного объёма.

---

## 3. Основной пользовательский flow

```text
/app/training
      ↓
История
      ↓
Создать тренировку
      ↓
Новая тренировка
      ↓
TrainingPage
      ↓
упражнения
      ↓
подходы
      ↓
параметры / комментарии / материалы
      ↓
сохранение
      ↓
История
```

Для существующей тренировки:

```text
История
   ↓
выбор workout
   ↓
/app/training/:id
   ↓
TrainingPage
   ↓
редактирование
   ↓
PUT /api/training/workouts/:id
```

Удаление:

```text
History
   ↓
DELETE /api/training/workouts/:id
   ↓
удаление workout и зависимых workout_exercises / workout_sets
   ↓
обновление списка History
```

---

## 4. Основная навигация Training

В концепции раздела зафиксированы три вкладки:

- История;
- Шаблоны;
- Упражнения.

По умолчанию открывается History.

Основные current routes:

- `/app/training`
- `/app/training/create`
- `/app/training/new`
- `/app/training/:id`
- `/app/training/template/:id`
- `/app/training/templates`
- `/app/training/templates/create`
- `/app/training/exercises`
- `/app/training/exercises/create`
- `/app/training/programs`

При этом наличие route/screen не означает наличие backend persistence.

В частности, UI ссылается на `/app/training/programs/create`, но отдельного route mapping для него в текущем router нет.

---

## 5. Core domain model

Основная модель:

```text
USER
  ↓
WORKOUT
  ↓
WORKOUT_EXERCISE
  ↓
WORKOUT_SET

WORKOUT_EXERCISE
  ↓
EXERCISE
```

Для контекстных заметок и материалов:

```text
WORKOUT_SET
  ├── TrainingSetNote
  └── Media / MediaLink
```

PostgreSQL является canonical source of truth для структурированных сохранённых Training данных.

Training не должен создавать отдельные копии одного и того же workout только для History, Reports или Analytics.

---

## 6. Workout

Workout — конкретный экземпляр тренировки пользователя.

Он имеет собственные:

- идентификатор;
- владельца;
- название;
- дату;
- время начала;
- время окончания;
- тип;
- комментарий;
- статус;
- `completed_at`;
- timestamps.

Workout является исторической записью конкретного выполнения.

Дата и время относятся к конкретному workout, а не к reusable template/protocol.

---

## 7. WorkoutExercise

WorkoutExercise представляет упражнение в рамках конкретной тренировки.

Он хранит:

- `exercise_id`;
- принадлежность к workout;
- порядок;
- комментарий упражнения;
- состояние/связи для superset.

Порядок в persistence задаётся через `position`.

Историческая архитектура предусматривала возможность свободной перестановки упражнений; текущий UI baseline не должен описывать такую перестановку как уже реализованную capability без отдельной verification.

---

## 8. WorkoutSet

WorkoutSet — минимальная структурированная единица фактического результата подхода.

В наборе поддерживаются, в зависимости от exercise:

- `weight`;
- `repetitions`;
- `difficulty`;
- `distance`;
- `calories`;
- `speed`;
- `power`;
- `incline`;
- `time`;
- `rir`;
- `rpe`;
- `rest`;
- `intensity_methods`.

Один set хранится как отдельная запись, а не как строка текста.

Архитектура допускает расширение набора параметров без превращения исторических данных в текстовый blob.

---

## 9. Методы выполнения и интенсивности

Методы относятся к конкретному подходу.

Исторический Training source предусматривает примеры:

- Drop-set;
- Rest-pause;
- Cluster;
- изометрия;
- темповый метод;
- частичные повторения;
- Superset;
- будущие методы.

Один подход может иметь несколько методов одновременно.

Текущая data-model использует `intensity_methods` как структурируемое поле.

---

## 10. Exercise library

Training использует единый каталог упражнений.

Current baseline:

- системные упражнения находятся в PostgreSQL;
- endpoint Training возвращает системные упражнения (`user_id IS NULL`);
- UI списка упражнений существует;
- ExercisePickerOverlay использует тот же domain source для выбора упражнения в workout.

Историческая концепция требует единого источника данных:

```text
Exercise Library
      ↓
Exercise List
      +
Exercise Picker
      +
Workout references
```

Нельзя поддерживать отдельные hardcoded-каталоги в разных частях Training.

---

## 11. Пользовательские упражнения

User-specific exercise CRUD не является завершённой current capability.

Target semantics:

1. пользователь вводит/создаёт личное упражнение;
2. система проверяет существование личного exercise;
3. при отсутствии создаёт его;
4. получает `exercise_id`;
5. WorkoutExercise ссылается на этот `exercise_id`.

Цель такого устройства — сохранить корректную историю упражнения и подготовить основу для будущей аналитики.

Эта модель относится к PLANNED / PARTIALLY IMPLEMENTED и не должна документироваться как действующий полный CRUD.

---

## 12. Редактор тренировки

Основной редактор — `TrainingPage`.

Он используется для:

- новой тренировки;
- открытия существующей тренировки;
- редактирования workout-level полей;
- добавления и удаления упражнений;
- работы с карточками упражнений;
- работы с подходами;
- комментариев;
- параметров;
- сохранения/обновления workout.

Архитектурным решением Training 2.0 также закреплено повторное использование паттернов TrainingPage/editor для template/protocol modes, когда соответствующие режимы будут реализованы.

---

## 13. Exercise card

`TrainingExerciseCard` отвечает за локальную работу с упражнением и его sets.

Current UI capabilities include:

- ExercisePickerOverlay;
- выбор exercise;
- управление sets;
- set-level parameters;
- difficulty;
- intensity methods;
- comments;
- collapse/expand;
- copy/delete действий над sets через существующий interaction pattern;
- отображение материалов/заметок.

---

## 14. Materials и TrainingSetNote

Материалы конкретного set являются необязательными.

Пользователь может:

- не добавлять ничего;
- добавить комментарий;
- добавить media;
- использовать комбинацию.

Отсутствие материала не является ошибкой.

TrainingSetNote — отдельная domain entity.

Для одного workout_set предусмотрена модель:

```text
0..1 CLIENT_NOTE
0..1 TRAINER_FEEDBACK
```

Это не Chat.

Feedback/Note относится к историческому тренировочному объекту, а Chat остаётся самостоятельным коммуникационным каналом.

---

## 15. Reports, Analytics и Chat

Исторически закреплённый архитектурный принцип:

- Reports агрегируют и ссылаются на существующие Training entities;
- Analytics вычисляются из persisted workout data;
- Chat ссылается на training context, когда это необходимо;
- Training payload не должен дублироваться в каждой другой системе.

Поэтому не следует строить:

```text
Workout
 ├── копия для History
 ├── копия для Reports
 ├── копия для Analytics
 └── копия для Chat
```

Канонической остаётся исходная persistence-модель Training.

---

## 16. Ownership

Current backend training access ограничивается authenticated user и ownership filters.

Базовый принцип:

```text
workouts.user_id = authenticated user
```

Текущая модель не является полноценной coach/client relationship-aware authorization system.

Если в будущем тренер получит доступ к данным клиента, это должно происходить через отдельную relationship/permission model, не через перенос ownership.

Различие:

```text
Owner ≠ Viewer
Author ≠ Owner
```

---

## 17. Training Materials write path — актуальное состояние

Ранние документы Training содержали устаревшее описание, согласно которому frontend materials write path отсутствовал.

Это состояние больше не является актуальным.

По последующим remediation evidence:

```text
TrainingExerciseCard
    ↓
trainingMaterialsService.saveSetMaterials
    ↓
apiClient
    ↓
PUT /api/training/sets/:setId/materials
```

Write path был реализован и проверен; отдельно проверялись PUT, последующий GET, persistence после reload и ownership/deny behavior.

При этом это не следует расширять до утверждения, что вся будущая Training media UX полностью реализована.

---

## 18. Training 2.0

Training 2.0 вводит отдельные понятия:

```text
Template
Program
Protocol
Workout
History
```

Главный принцип:

```text
SOURCE
  ↓ COPY
INDEPENDENT WORKOUT
  ↓
HISTORY
```

Использование template или protocol не создаёт live link.

Изменение source не изменяет уже созданную тренировку.

---

## 19. Template

Template — reusable blueprint конкретной тренировки.

Целевая модель template содержит:

- название;
- комментарий;
- упражнения;
- порядок;
- подходы;
- веса;
- повторы;
- RIR/RPE;
- отдых;
- intensity methods;
- другие сохраняемые параметры.

Template:

- не является выполненной тренировкой;
- не попадает автоматически в History;
- при использовании создаёт независимую копию;
- после копирования не изменяется от редактирования workout.

Текущая persisted template lifecycle не реализована end-to-end.

---

## 20. Program и Protocol

Program — отдельная сущность-контейнер.

Protocol — конкретная тренировочная структура внутри конкретной program.

Protocol:

- не является глобальным template;
- не должен автоматически появляться в global Templates;
- может быть создан из global template;
- может быть собран с нуля;
- должен использовать copy semantics;
- не должен автоматически менять уже созданные workouts.

Calendar scheduling и окончательный assignment UX остаются deferred/open.

---

## 21. Historical snapshot

Для program-origin workout принято design-level решение: история должна сохранять независимый snapshot исходного program/protocol context.

Цель:

- изменение текущей программы не переписывает историю;
- исторический workout остаётся auditable;
- из History можно будет открыть historical representation исходного состояния.

Это пока design target и не current runtime persistence.

---

## 22. Видео и media processing — target

Product roadmap содержит target requirements для training media:

- до 8 видео на тренировку;
- до 45 секунд каждое;
- compression/optimization;
- после успешной обработки хранится оптимизированная версия;
- оригинал может удаляться после успешной обработки.

Эти ограничения относятся к целевому media-processing pipeline, а не к утверждению, что соответствующий FFmpeg/worker flow полностью реализован в текущем Training runtime.

---

## 23. Важные архитектурные ограничения

Training должен:

- хранить фактические workout records как отдельные сущности;
- использовать stable IDs;
- ссылаться на Exercise через `exercise_id`;
- хранить sets отдельно;
- не превращать domain feedback в Chat messages;
- использовать Backend API как boundary;
- использовать PostgreSQL как canonical source of truth для structured Training data;
- использовать shared Media architecture для files;
- сохранять ownership на стороне backend;
- не смешивать planned Training 2.0 с текущим baseline.

---

## 24. Источники и разрешение конфликтов

При подготовке этого документа сверены:

- legacy Training source;
- legacy Training 2.0 decisions;
- legacy Templates spec;
- current Training family;
- DATABASE_SCHEMA;
- CURRENT_MVP;
- ROADMAP;
- current SYSTEM_STATE;
- Full Audit;
- Foundation Remediation Log;
- Remediation Roadmap.

Критическая корректировка текущего Training family:

- старое описание materials write gap superseded последующим remediation closure;
- текущий state должен описывать write path как verified, а не как stash-only;
- template/program UI remains partial;
- `5918` template migration не доказывает production template runtime.

---

## 25. Каноническое семейство документов

```text
modules/Training/
├── TRAINING.md
├── TRAINING_DATA_MODEL.md
├── TRAINING_UI.md
├── TRAINING_API.md
└── TRAINING_TEMPLATES.md

DECISIONS/
└── TRAINING_2_0_DECISIONS.md
```

Детали вынесены в дочерние документы, чтобы этот файл оставался entry point, а не второй системой истины.
