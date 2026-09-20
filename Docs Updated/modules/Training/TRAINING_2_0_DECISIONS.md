# TRAINING 2.0 DECISIONS

Статус: DECISION LOG  
Последняя актуализация: 2026-09-20

> Этот документ фиксирует только решения и design-level правила, которые присутствуют в источниках Training 2.0. Он не должен превращаться в implementation specification.

---

## Decision-001 — Template и Protocol используются через копирование

Статус: ACCEPTED

Использование Template или Protocol создаёт независимую копию Workout.

Уже созданные Workout не должны автоматически изменяться при изменении source.

Последствие:

- требуется явная copy semantics;
- source и resulting workout должны иметь независимый lifecycle.

---

## Decision-002 — Template и Program являются разными концепциями

Статус: ACCEPTED

Template:

- reusable workout blueprint.

Program:

- structured container для Protocol flows.

Они не должны смешиваться в одной domain model только ради упрощения UI.

---

## Decision-003 — Date/time принадлежат concrete Workout

Статус: ACCEPTED

Template/Protocol не хранят metadata конкретного выполнения.

Конкретная дата и время появляются у созданного Workout.

---

## Decision-004 — Program-origin Workout должен иметь historical snapshot

Статус: ACCEPTED DESIGN TARGET

История должна сохранять исходный source context, чтобы последующие изменения Program не переписывали прошлое.

Это требует отдельной future persistence model.

---

## Decision-005 — Повторное использование TrainingPage/editor

Статус: ACCEPTED IMPLEMENTATION TARGET

TrainingPage/editor patterns следует повторно использовать в разных Training 2.0 режимах:

- workout;
- template;
- protocol.

Цель — избежать drift между параллельными builders.

---

## Decision-006 — Protocol имеет Program-local scope

Статус: ACCEPTED

Protocol внутри Program не является global Template.

Он:

- принадлежит конкретной Program;
- не должен автоматически появляться в global Templates;
- имеет отдельный persistence/query scope.

---

## Decision-007 — Program-origin Workout должен сохранять immutable source snapshot

Статус: ACCEPTED DESIGN TARGET

Workout, созданный из Program/Protocol, должен сохранять source-context snapshot.

Это отдельное решение от простой ссылки на текущую Program.

---

## Decision-008 — Изменения Program влияют только на будущие runs

Статус: ACCEPTED DESIGN TARGET

После изменения Program:

- существующие historical workouts не меняются;
- будущие runs используют новое состояние Program.

---

## Decision-009 — Существующая Workout persistence является baseline

Статус: ACCEPTED

Текущая рабочая модель:

```text
workouts
 ↓
workout_exercises
 ↓
workout_sets
```

не должна ломаться ради внедрения Templates/Programs.

Новые сущности должны добавляться поверх существующей рабочей части.

---

## Decision-010 — Calendar/assignment не входят в текущую Training 2.0 baseline

Статус: DEFERRED / PLANNED

Пока не реализуются как current:

- calendar-bound protocol scheduling;
- сложная версия Program;
- marketplace готовых программ;
- продажа программ;
- расширенный weekly volume;
- окончательный coach/client assignment UX;
- визуальный UX reorder protocols.

---

## Decision-011 — Personal exercise lifecycle должен сохранять стабильную ссылку

Статус: DESIGN TARGET

При создании personal exercise система должна получить собственный `exercise_id`, после чего WorkoutExercise ссылается на него.

Цель:

- корректная история exercise;
- future analytics;
- отсутствие зависимости history от текста названия.

---

## Decision-012 — Set является отдельной исторической сущностью

Статус: ACCEPTED ARCHITECTURE PRINCIPLE

Set не является просто текстовой строкой.

Поддерживаемые metrics хранятся отдельно и структурированно.

Новые metrics не должны разрушать исторические записи.

---

## Decision-013 — Training feedback не превращается в Chat

Статус: ACCEPTED ARCHITECTURE PRINCIPLE

Контекстный feedback для training object является отдельной domain data.

Chat остаётся самостоятельным коммуникационным каналом.

---

## Decision-014 — Reports и Analytics не дублируют Workout data

Статус: ACCEPTED ARCHITECTURE PRINCIPLE

Reports/Analytics используют существующие Training entities и вычисляют/агрегируют данные из них.

Не создавать второй canonical copy workout только для другого модуля.

---

## Decision-015 — Media является отдельным shared subsystem

Статус: ACCEPTED ARCHITECTURE PRINCIPLE

Training хранит metadata/linkage контекста media, а физические файлы обслуживаются общей Media/Object Storage архитектурой.

---

## Decision-016 — Ownership остаётся у владельца данных

Статус: ACCEPTED ARCHITECTURE PRINCIPLE

Тренерский доступ не переносит ownership.

```text
Owner = user
Access = отдельное permission/relationship rule
```

Полная relationship-aware authorization остаётся будущим слоем.

---

## Decision-017 — Template и Program persistence не следует считать current только по migration/spec

Статус: ACCEPTED

Наличие:

- migration file;
- UI shell;
- API specification

не является доказательством runtime implementation.

Current status должен опираться на фактический backend/database evidence.

---

## Decision-018 — Не изменять применённые migrations задним числом

Статус: ACCEPTED

Training 2.0 entities должны вводиться additive-образом.

Существующее persistence поведение не должно ломаться или переписывать уже применённую историю migrations.

---

## Decision-019 — 5918 остаётся controlled divergence

Статус: ACCEPTED CURRENT FOUNDATION DECISION

Migration:

```text
1788859125918_training_templates
```

не применяется автоматически.

Пересмотр происходит при:

- включении Templates в implementation scope;
- появлении реальной dependency.

---

## Decision-020 — Current runtime и protected working changes должны различаться

Статус: ACCEPTED DOCUMENTATION RULE

Изменение в stash или иной защищённой рабочей области не считается CURRENT implementation, пока оно не влито и не подтверждено.

При документации сначала фиксируется current branch/runtime baseline, затем отдельно — planned/protected change.

---

## Источники решений

Решения сверены с:

```text
TRAINING_2_0_DECISIONS.md (legacy)
TRAINING_TEMPLATES_SPEC.md
current TRAINING_2_0_DECISIONS.md
current TRAINING_TEMPLATES.md
TRAINING.md
DATABASE_SCHEMA
CURRENT_MVP
ROADMAP
SYSTEM_STATE_FINAL
PROJECT_FULL_AUDIT_2026-09-19
PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19
PROJECT_REMEDIATION_ROADMAP_2026-09-19
```

Не добавлять новые design decisions без отдельной фиксации.
