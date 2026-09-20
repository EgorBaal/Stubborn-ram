# TRAINING_TEMPLATES

## Назначение

Канонический документ для training templates и связанной семантики template/program в Training 2.0.
Он отделяет current implementation от planned и decision-level design.

## Концепция Template

Статус: CURRENT concept, PARTIALLY IMPLEMENTED runtime

Template — это переиспользуемый blueprint workout.
Использование template должно создавать независимую копию workout, а не live link.

## Текущая Реализация

Статус: PARTIALLY IMPLEMENTED

Текущее наблюдаемое состояние:

- Экран Templates существует.
- Экраны builder/program, связанные с template, существуют как UI shells.
- Backend training routes сейчас не предоставляют endpoints /api/training/templates.
- TrainingCreateList ожидает входной список templates, но current branch не предоставляет verified end-to-end persisted source templates.

Поэтому model persistence для template не реализована полностью end-to-end.

## Lifecycle Template

Статус: PLANNED

Целевой lifecycle включает:

- create template;
- list templates;
- load template;
- update template;
- delete template;
- instantiate workout from template by copy.

Текущий codebase не предоставляет complete active lifecycle в backend routes.

## Правила Copy / Independence

Статус: DECISION-LEVEL / PLANNED ENFORCEMENT

Зафиксированный смысл решения:

- использование template создаёт detached-копию workout;
- редактирование скопированного workout не должно изменять source template;
- source template остаётся переиспользуемым.

## Связь с Program

Статус: PLANNED / DECISION-LEVEL

- Концепции program и protocol определены в discussions decisions/spec.
- Полная runtime subsystem program пока не реализована как current baseline.

## Assignment

Статус: PLANNED

Семантика coach-client assignment для templates/programs является архитектурной целью.
Полная runtime assignment subsystem сейчас не реализована.

## Scheduling

Статус: PLANNED

Scheduling program/protocol, привязанный к календарю, остаётся будущим поведением и не должен считаться current implementation.

## Планируемое поведение

- Persistent template API и DB-backed UI flow.
- Сущности program/protocol с copy semantics в конкретные workouts.
- Историческое snapshot-поведение для workouts, созданных из program context.

## Deferred

- Расширенные возможности Training 2.0 за пределами baseline template persistence.

## Открытые Решения

- Финальный UX и backend contract для полного lifecycle program assignment.
- Scope и порядок реализации поведения scheduling/version для protocol.

## Связанные Документы

- docs/modules/Training/TRAINING.md
- docs/modules/Training/TRAINING_UI.md
- docs/modules/Training/TRAINING_DATA_MODEL.md
- docs/modules/Training/TRAINING_API.md
- docs/modules/Training/TRAINING_TEMPLATES_SPEC.md
- docs/DECISIONS/TRAINING_2_0_DECISIONS.md
