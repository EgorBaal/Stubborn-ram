# TRAINING_TEMPLATES

Статус: CURRENT CANONICAL DESIGN DOCUMENT  
Runtime status: PARTIALLY IMPLEMENTED / PLANNED  
Актуальность: 2026-09-20

---

## 1. Назначение

Документ фиксирует:

- semantics Templates;
- их copy lifecycle;
- связь Templates с Program/Protocol;
- current UI/runtime boundary;
- planned behavior.

Это не утверждение, что весь описанный lifecycle уже реализован.

---

## 2. Template concept

Template — сохранённая reusable заготовка тренировки.

Template:

- не является выполненным workout;
- не попадает в History;
- содержит configuration/source state;
- используется как источник для создания новой конкретной тренировки.

Цепочка:

```text
TEMPLATE
   ↓ COPY
NEW WORKOUT
   ↓
HISTORY
```

---

## 3. Создание template

Target flow:

```text
Training
  ↓
Templates
  ↓
Create Template
  ↓
TrainingPage / shared editor pattern
```

Template может содержать:

- название;
- комментарий;
- упражнения;
- порядок;
- подходы;
- веса;
- повторы;
- RIR/RPE;
- отдых;
- comments;
- supersets;
- intensity methods;
- другие поддерживаемые параметры.

Дата и время конкретного выполнения не являются свойствами template.

---

## 4. Template copy semantics

Ключевое принятое решение:

```text
Template
   ↓
COPY
   ↓
independent workout
```

При копировании переносятся:

- exercises;
- order;
- exercise comments;
- supersets;
- sets;
- weights;
- repetitions;
- RIR/RPE;
- rest;
- intensity methods;
- остальные сохраняемые параметры.

---

## 5. Independence

После COPY:

```text
Template ≠ Workout
```

Новая тренировка полностью независима от source.

Можно изменить:

- weight;
- repetitions;
- RIR/RPE;
- sets;
- exercises;
- comments;
- order;
- другие workout values.

Изменения workout не изменяют source template.

---

## 6. Повторное использование

Один template может использоваться многократно:

```text
Template
  ↓
Workout 1
Workout 2
Workout 3
...
```

Каждый workout — отдельная historical entity.

Изменение template влияет только на будущие копирования.

---

## 7. Current runtime status

Current Training runtime:

- Templates screen существует;
- Template-related builder/program screens существуют как UI shells;
- persistent template API lifecycle не реализован;
- current backend training routes не предоставляют complete template CRUD;
- Production baseline не подтверждает полноценный template persistence.

Поэтому:

```text
Template UI exists
≠
Template persistence exists
```

---

## 8. Template list semantics

Target behavior:

Один список сохранённых templates должен быть единым source для:

- Templates screen;
- Create Workout screen.

Не должно быть двух независимых hardcoded lists.

Это target architecture, а не current verified persistence behavior.

---

## 9. Program

Program — отдельная постоянная сущность-контейнер.

Target fields currently discussed/accepted:

- name;
- description/comment;
- author.

Author определяется системой через creator ID, а не как свободный текст.

Weekly volume не является обязательным вручным полем.

Будущий automatic weekly volume calculation относится к analytics/program expansion.

---

## 10. Protocol

Protocol — конкретная тренировочная структура внутри Program.

Target behavior:

- protocols are ordered;
- можно add;
- можно delete;
- можно менять order;
- protocol scope belongs to its Program.

Protocol не является global Template.

---

## 11. Protocol и Template

Допускается:

```text
Global Template
     ↓ COPY
Program Protocol
```

При этом:

- source template остаётся неизменным;
- protocol становится Program-local;
- protocol не должен автоматически появляться в global Templates.

Также protocol может быть собран с нуля.

---

## 12. TrainingPage reuse

Зафиксированное Training 2.0 решение:

использовать существующие TrainingPage/editor patterns для:

- обычной тренировки;
- protocol builder;
- template builder;
- запуска конкретной тренировки из source.

Не создавать бессвязные копии конструктора без необходимости.

Это implementation target.

---

## 13. Date/time semantics

Date/time принадлежат concrete Workout.

Они не являются обязательными properties:

- Template;
- Protocol.

При каждом запуске source создаётся новый workout с собственной датой/временем.

---

## 14. Program-origin workout

Target flow:

```text
PROGRAM
  ↓
PROTOCOL
  ↓ COPY
WORKOUT
  ↓
HISTORY
```

Конкретный workout может быть полностью изменён независимо от исходного protocol.

---

## 15. Historical snapshot

Accepted design target:

Program-origin workout должен сохранять immutable historical snapshot контекста source.

Snapshot должен относиться к состоянию source в момент создания конкретного workout.

Цель:

- историческая корректность;
- auditability;
- независимость History от будущих изменений Program.

Target snapshot может включать:

- program name;
- description;
- author;
- protocol context;
- exercises;
- parameters;
- другие данные source, имеющие историческое значение.

Snapshot persistence пока не current runtime.

---

## 16. Future runs

Изменение Program должно влиять только на будущие runs.

```text
OLD PROGRAM STATE
    ↓
OLD WORKOUT
```

не должен автоматически изменяться после:

```text
NEW PROGRAM STATE
```

Следующий новый run использует новое состояние.

---

## 17. Assignment

Coach/client assignment для Programs/Templates является PLANNED.

Полный runtime subsystem assignment не реализован.

Окончательный UX назначения программы клиенту не утверждён.

---

## 18. Scheduling

Calendar-bound scheduling для protocols/programs:

PLANNED / DEFERRED.

Пока не закреплена runtime semantics для:

- weekdays;
- calendar weeks;
- dates;
- automatic scheduling;
- future-run queue.

---

## 19. Data separation

Target persistence separation:

```text
workouts
workout_exercises
workout_sets
```

для concrete workouts

и отдельно:

```text
training_templates
training_template_exercises
training_template_sets
```

для reusable templates.

Не использовать `workouts` для хранения template objects.

Program/protocol storage также должна быть отдельной от global templates и concrete workout records.

---

## 20. 5918 divergence

Migration `5918` содержит template tables.

Current foundation decision:

```text
5918 = CONTROLLED DIVERGENCE
```

Не применять migration только потому, что она существует, пока:

- Templates не входят в implementation scope;
- либо не появляется реальная dependency.

Это предотвращает ложное объявление template persistence как current runtime.

---

## 21. Current / Planned matrix

| Объект | Статус |
|---|---|
| Templates UI | PARTIAL |
| Template persistent lifecycle | PLANNED |
| Template API | PLANNED |
| Template copy semantics | ACCEPTED DESIGN |
| Template independence | ACCEPTED DESIGN |
| Program entity | PLANNED |
| Protocol entity | PLANNED |
| Program assignment | PLANNED |
| Calendar scheduling | DEFERRED / PLANNED |
| Historical snapshot | ACCEPTED DESIGN TARGET |
| Program-origin runtime | PLANNED |

---

## 22. Related documents

```text
TRAINING.md
TRAINING_DATA_MODEL.md
TRAINING_UI.md
TRAINING_API.md
DECISIONS/TRAINING_2_0_DECISIONS.md
SYSTEMS/DATABASE.md
SYSTEMS/PERMISSIONS.md
ROADMAP/*
```
