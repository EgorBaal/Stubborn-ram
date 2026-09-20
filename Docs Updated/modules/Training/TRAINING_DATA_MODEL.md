# TRAINING_DATA_MODEL

Статус: CURRENT CANONICAL  
Фактическая база: подтверждённые runtime/DB сведения по состоянию на 2026-09-19

---

## 1. Назначение

Документ описывает data model Training: сущности, связи, ownership, persistence и границы между current и planned model.

При конфликте с ранними документами приоритет имеет более позднее подтверждённое состояние.

---

## 2. Current core entities

```text
users
exercises
workouts
workout_exercises
workout_sets
training_set_notes
media
media_links
```

Training core:

```text
USER
 ↓
WORKOUT
 ↓
WORKOUT_EXERCISE
 ↓
WORKOUT_SET
```

Exercise reference:

```text
WORKOUT_EXERCISE
 ↓
EXERCISE
```

Set context:

```text
WORKOUT_SET
 ├── TRAINING_SET_NOTE
 └── MEDIA / MEDIA_LINK
```

---

## 3. Workout

Статус: CURRENT / VERIFIED

Назначение:

Конкретный сохранённый экземпляр тренировки пользователя.

Основные поля:

```text
id
user_id
title
training_date
start_time
end_time
training_type
comment
status
completed_at
created_at
updated_at
```

Ownership:

```text
workouts.user_id -> users.id
```

Основные индексы current schema:

```text
(user_id, training_date)
(user_id, created_at)
```

Workout является source of truth для конкретного исторического workout instance.

---

## 4. WorkoutExercise

Статус: CURRENT / VERIFIED

Назначение:

Упорядоченное exercise внутри конкретного workout.

Поля:

```text
id
workout_id
exercise_id
position
exercise_comment
superset_after
created_at
updated_at
```

Связи:

```text
workout_id  -> workouts.id
exercise_id -> exercises.id
```

Delete semantics:

```text
workout -> workout_exercises = CASCADE
```

История workout не должна зависеть от того, что exercise невозможно удалить из-за исторической ссылки; соответствующее поведение задаётся DB constraints.

---

## 5. WorkoutSet

Статус: CURRENT / VERIFIED

Назначение:

Отдельный фактический подход.

Поля:

```text
id
workout_exercise_id
position
weight
repetitions
difficulty
distance
calories
speed
power
incline
time
rir
rpe
rest
intensity_methods JSONB
```

Связь:

```text
workout_exercise_id -> workout_exercises.id
```

Индекс:

```text
(workout_exercise_id, position)
```

Delete semantics:

```text
workout_exercise -> workout_sets = CASCADE
```

---

## 6. Exercise

Статус: CURRENT / VERIFIED baseline

Exercise является самостоятельной сущностью каталога.

Current endpoint возвращает системные exercises, где:

```text
user_id IS NULL
```

Системный каталог хранится в PostgreSQL.

Production snapshot содержит 232 system exercises.

User-specific exercise CRUD не является завершённой current feature.

Target user exercise semantics:

```text
user input
 ↓
find personal exercise
 ↓
create if absent
 ↓
exercise_id
 ↓
WorkoutExercise
```

Это PLANNED / PARTIAL capability.

---

## 7. TrainingSetNote

Статус: CURRENT / VERIFIED

Назначение:

Контекстная запись, относящаяся к конкретному workout set.

Возможные типы:

```text
CLIENT_NOTE
TRAINER_FEEDBACK
```

Связи:

```text
training_set_notes.workout_set_id -> workout_sets.id
training_set_notes.author_id      -> users.id
```

Для одного set:

```text
0..1 CLIENT_NOTE
0..1 TRAINER_FEEDBACK
```

TrainingSetNote не является Chat message.

---

## 8. Media и MediaLink в Training context

Media является общей системой, а Training только использует её для context-specific attachments.

Концептуально:

```text
WORKOUT_SET
   ↓
MEDIA_LINK
   ↓
MEDIA
   ↓
private Object Storage
```

PostgreSQL хранит metadata/linkage.

Файл не должен становиться публичным постоянным URL.

Access к media определяется backend permission/ownership layer и shared Media architecture.

---

## 9. Ownership

Current workout ownership:

```text
workouts.user_id = owner
```

Training backend ограничивает операции authenticated user.

Set materials access/update проходит через ownership context workout.

Полная coach/client relationship-aware authorization пока не реализована.

Следовательно, data model не должна притворяться, будто trainer access уже выражается отдельными relationship tables.

---

## 10. Current persistence chains

Verified core:

```text
create workout
 → workouts
 → workout_exercises
 → workout_sets
```

```text
read workout list
 → workouts
```

```text
read workout
 → workouts
 → workout_exercises
 → workout_sets
```

```text
update workout
 → workout
 → child exercise/set state
```

```text
delete workout
 → workout
 → cascade child records
```

Materials:

```text
read set materials
 → training/media tables
```

```text
write set materials
 → TrainingSetNote / MediaLink relationships
```

---

## 11. Transaction / consistency boundary

Core workout create/update operation writes structured DB data as one backend operation.

Важный принцип:

- UI state не является source of truth;
- PostgreSQL является source of truth после persistence;
- frontend после save должен получать server result;
- historical data не должно зависеть от ephemeral UI state.

---

## 12. Template tables

Repository содержит migration:

```text
training_templates
training_template_exercises
training_template_sets
```

Наличие migration-файла не означает, что template runtime является Production current state.

Production baseline snapshot 2026-09-19 не подтверждает active template runtime tables.

5918 признана controlled divergence и не применяется в текущем foundation baseline, пока Templates не войдут в implementation scope или не появится реальная dependency.

---

## 13. Planned Program / Protocol model

Training 2.0 design определяет:

```text
PROGRAM
  ↓
PROTOCOL
  ↓ copy
WORKOUT
```

Program/protocol entities пока не являются current production implementation.

Целевые свойства:

- program name;
- description/comment;
- author;
- ordered protocols;
- protocol-local scope;
- reusable source semantics;
- future assignment/scheduling;
- historical source snapshot.

---

## 14. Snapshot semantics

Для program-origin workout принят design target:

```text
CURRENT PROGRAM/PROTOCOL
          ↓
       COPY
          ↓
HISTORICAL WORKOUT SNAPSHOT
```

После создания workout:

- дальнейшие изменения Program не должны переписывать historical workout;
- следующий run использует новое состояние Program;
- старый workout остаётся исторически стабильным.

Snapshot persistence ещё не current baseline.

---

## 15. No duplicated domain records

Training не должен создавать вторую копию workout исключительно для:

- History;
- Reports;
- Analytics;
- Chat.

Каждый downstream domain должен ссылаться или вычислять данные из canonical Training persistence.

---

## 16. Data evolution principles

Training data model должна:

- использовать stable IDs;
- хранить sets отдельно;
- сохранять historical values;
- расширять set metrics без переписывания history;
- не использовать Email как foreign key;
- не переносить ownership на secondary entities без явного domain rule.

### Historical child-ID preservation - DESIGN TARGET

При редактировании существующей тренировки целевая модель должна сохранять идентификаторы уже существующих дочерних сущностей.

Целевая семантика:

- существующий `workout_exercise` -> `UPDATE`;
- новый `workout_exercise` -> `INSERT`;
- удалённый пользователем `workout_exercise` -> `DELETE`;
- существующий `workout_exercise.id` сохраняется.

Для `workout_set`:

- существующий `workout_set` -> `UPDATE`;
- новый set -> `INSERT`;
- удалённый set -> `DELETE`;
- существующий `workout_set.id` сохраняется.

Это целевая модель сохранения исторической идентичности объектов.

Критично: этот блок не является утверждением о текущем runtime implementation.

Статус: DESIGN TARGET.

---

## 17. Current vs planned matrix

| Область                          | Статус                                      |
| -------------------------------- | ------------------------------------------- |
| Workouts                         | CURRENT / VERIFIED                          |
| WorkoutExercise                  | CURRENT / VERIFIED                          |
| WorkoutSet                       | CURRENT / VERIFIED                          |
| System Exercises                 | CURRENT / VERIFIED                          |
| Personal Exercises               | PARTIAL / PLANNED                           |
| TrainingSetNote                  | CURRENT / VERIFIED                          |
| Media linkage                    | CURRENT / PARTIAL depending on UX flow      |
| Template persistence             | PLANNED / deferred by controlled divergence |
| Program                          | PLANNED                                     |
| Protocol                         | PLANNED                                     |
| Assignment                       | PLANNED                                     |
| Calendar scheduling              | DEFERRED / PLANNED                          |
| Historical program snapshot      | PLANNED                                     |
| Relationship-aware authorization | PARTIALLY IMPLEMENTED                       |

---

## 18. Связанные документы

```text
TRAINING.md
TRAINING_UI.md
TRAINING_API.md
TRAINING_TEMPLATES.md
DECISIONS/TRAINING_2_0_DECISIONS.md
SYSTEMS/DATABASE.md
SYSTEMS/PERMISSIONS.md
SYSTEMS/MEDIA.md
```
