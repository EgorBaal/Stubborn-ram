# TRAINING_UI

Статус: CURRENT CANONICAL  
Состояние: CURRENT screens + PARTIALLY IMPLEMENTED Training 2.0 UI  
Актуальность фактов: 2026-09-19

---

## 1. UI scope

Training UI покрывает:

- History;
- Create;
- New Workout;
- Workout editor;
- Exercises;
- Templates;
- Template builder shell;
- Programs shell;
- Exercise builder shell;
- set-level interactions;
- materials context.

Наличие экрана или route не означает завершённую backend persistence.

---

## 2. Screen map

Current screens:

```text
TrainingHistoryPage
TrainingCreatePage
TrainingPage
TrainingTemplatesPage
TrainingExercisesPage
TrainingTemplateBuilderPage
TrainingExerciseBuilderPage
TrainingProgramsPage
```

Основные компоненты:

```text
TrainingPage
TrainingExerciseCard
ExercisePickerOverlay
ExerciseList
TrainingHistoryList
TrainingCreateList
```

---

## 3. Routes

Current configured routes:

```text
/app/training
/app/training/create
/app/training/new
/app/training/:id
/app/training/template/:id
/app/training/templates
/app/training/templates/create
/app/training/exercises
/app/training/exercises/create
/app/training/programs
```

UI navigation также предусматривает:

```text
/app/training/programs/create
```

но dedicated route mapping для него нет.

---

## 4. Главный экран

В текущей концепции верхняя навигация:

```text
История | Шаблоны | Упражнения
```

Default:

```text
История
```

Исторически главным CTA был:

```text
▶ Начать тренировку
```

Главный раздел должен позволять быстро перейти к текущему workout flow, не смешивая его с административными будущими сущностями.

---

## 5. History

Статус: CURRENT / VERIFIED

History:

- загружает сохранённые workouts;
- показывает список;
- открывает конкретную тренировку;
- поддерживает удаление;
- содержит loading/error/empty states;
- после delete обновляет локальный список.

Flow:

```text
/app/training
    ↓
GET /api/training/workouts
    ↓
TrainingHistoryPage
```

Открытие:

```text
History item
    ↓
/app/training/:id
    ↓
GET /api/training/workouts/:id
    ↓
TrainingPage
```

---

## 6. Create

Статус: PARTIALLY IMPLEMENTED

Current create screen предлагает:

- New Workout;
- template-oriented cards/UI.

Важно:

template collection не имеет verified end-to-end persisted backend source.

Поэтому нельзя описывать current create page как работающий DB-backed templates list.

New Workout:

```text
/app/training/create
    ↓
/app/training/new
    ↓
TrainingPage
```

---

## 7. Workout editor

Статус: CURRENT / VERIFIED core

`TrainingPage` поддерживает:

- title;
- training date;
- start/end time;
- training type;
- workout comment;
- add/remove exercises;
- load existing workout by id;
- edit exercise data;
- edit sets;
- save/update.

Save new:

```text
TrainingPage
 ↓
trainingService
 ↓
apiClient
 ↓
POST /api/training/workouts
```

Update:

```text
TrainingPage
 ↓
trainingService
 ↓
apiClient
 ↓
PUT /api/training/workouts/:id
```

---

## 8. Exercise picker

Статус: CURRENT

Exercise selection uses:

```text
ExercisePickerOverlay
      ↓
ExerciseList
      ↓
Training exercise source
```

Главный принцип:

- picker и Exercises screen используют один source;
- не создаются независимые hardcoded dictionaries;
- selection приводит к `exercise_id`.

---

## 9. Exercise list

Статус: CURRENT / VERIFIED baseline

Capabilities:

- loading state;
- error state;
- search;
- filtering;
- backend system exercise list.

Current limitation:

- full user-specific create/edit/delete lifecycle absent.

---

## 10. TrainingExerciseCard

Статус: CURRENT

Карточка поддерживает:

- номер exercise;
- название;
- ExercisePickerOverlay;
- sets;
- parameters;
- difficulty;
- intensity methods;
- comments;
- collapse/expand;
- copy/delete interactions для sets;
- material context.

---

## 11. Set UI

Статус: CURRENT

Set-level UI поддерживает:

- numeric/performance fields;
- intensity methods;
- ordering;
- add set;
- copy set;
- delete set;
- difficulty;
- RIR/RPE;
- rest;
- time/distance и другие предусмотренные metrics.

Set is a structured record, а не текстовое поле.

---

## 12. Exercise order

В persistence order хранится через:

```text
position
```

Историческая архитектура предусматривала drag/reorder workflow.

Current documentation не должна считать свободную drag-reorder capability реализованной, если конкретный current UI flow этого не подтверждает.

---

## 13. Swipe interaction

В current TrainingExerciseCard есть interaction pattern для работы с set actions через горизонтальный swipe:

- свайп влево открывает action state;
- обратный swipe закрывает state;
- vertical movement не должен ошибочно интерпретироваться как horizontal action.

Это UI interaction detail, который относится к текущему card behavior и не следует удалять из canonical documentation.

---

## 14. Materials UI

Статус: PARTIALLY IMPLEMENTED domain flow, write path FIXED / VERIFIED

Current UI:

- показывает materials context для persisted set;
- может читать set materials;
- write path подключён через `saveSetMaterials`;
- backend PUT используется;
- после записи может быть выполнено повторное чтение для refresh.

Актуальная цепочка:

```text
TrainingExerciseCard
   ↓
trainingMaterialsService
   ↓
apiClient
   ↓
PUT /api/training/sets/:setId/materials
```

Последующая remediation verification проверяла:

- UI PUT;
- GET refresh;
- persistence after reload;
- ownership/deny path.

При этом полная будущая Training media UX с расширенной обработкой видео не считается полностью реализованной.

---

## 15. Comments / Notes

Workout-level comment и exercise-level comment участвуют в workout persistence.

Set-level note/feedback относится к отдельной domain model.

Не смешивать:

```text
TrainingSetNote
```

и:

```text
Chat message
```

---

## 16. Loading / Error / Empty

Current baseline содержит:

History:

- loading;
- error;
- empty.

Editor:

- loading;
- saving;
- basic error handling.

Exercises:

- loading;
- error;
- search/filter states.

Templates/Programs:

- shell/placeholder states.

---

## 17. Templates UI

Статус: PARTIALLY IMPLEMENTED

Существуют:

- Templates screen;
- Create Template route;
- Template builder shell;
- integration points в Create UI.

Не подтверждены как current end-to-end:

- persistent template list;
- backend CRUD;
- DB-backed template lifecycle.

Поэтому UI existence ≠ implementation.

---

## 18. Programs UI

Статус: PLACEHOLDER / PLANNED

`TrainingProgramsPage` существует как UI shell.

Program create path в router не завершён.

Program persistence/API отсутствуют в current training backend baseline.

---

## 19. Exercise builder

Статус: PLACEHOLDER / PARTIAL

UI route exists, но полноценный personal exercise lifecycle не является current complete feature.

---

## 20. Target template UX

Зафиксированная target logic:

```text
Training
 ↓
Templates
 ↓
Create Template
 ↓
тот же TrainingPage/editor pattern
 ↓
Save Template
```

Template:

- не является workout;
- не попадает в History;
- хранит blueprint;
- при запуске копируется в новый workout.

---

## 21. Target program UX

Зафиксированная target logic:

```text
Program
 ↓
Protocol
 ↓
Copy
 ↓
New Workout
 ↓
History
```

Program protocols не являются global templates.

Assignment and calendar scheduling остаются future scope.

---

## 22. Visual / structural principle

Training editor должен оставаться единым, а не развиваться через независимые полностью разные builders для каждого будущего режима.

Это соответствует принятому Training 2.0 решению о повторном использовании TrainingPage/editor patterns.

---

## 23. Current vs target matrix

| UI area | Current state |
|---|---|
| History | CURRENT / VERIFIED |
| Open workout | CURRENT / VERIFIED |
| Create new workout | CURRENT |
| Workout editor | CURRENT / VERIFIED |
| Exercise list | CURRENT / VERIFIED |
| Exercise picker | CURRENT |
| Set interactions | CURRENT |
| Loading/error/empty | CURRENT |
| Materials read | CURRENT / VERIFIED |
| Materials write | FIXED / VERIFIED path |
| Templates screen | PARTIAL |
| Template persistence UI | PLANNED |
| Program screen | PLACEHOLDER |
| Program create route | NOT COMPLETE |
| Personal exercise CRUD UI | PLANNED / PARTIAL |
| Drag reorder | TARGET / NOT CURRENT |
| Advanced T2.0 modes | PLANNED |

---

## 24. Legacy content preserved

Из legacy Training source сохранены как documentation-relevant principles:

- единый Exercise Library;
- same source for picker/list;
- set as minimal data unit;
- structured parameters;
- optional media;
- contextual feedback separate from Chat;
- reports/analytics refer to persisted training records;
- historical independence;
- user ownership;
- future personal exercise lifecycle.

Это не означает, что все перечисленные capabilities реализованы.

---

## 25. Связанные документы

```text
TRAINING.md
TRAINING_DATA_MODEL.md
TRAINING_API.md
TRAINING_TEMPLATES.md
DECISIONS/TRAINING_2_0_DECISIONS.md
SYSTEMS/MEDIA.md
SYSTEMS/PERMISSIONS.md
SYSTEMS/DATABASE.md
```
