# TRAINING 2.0 DECISIONS

Статус: DECISION LOG
Последнее обновление: 2026-09-19

## Назначение

Этот файл фиксирует architecture/product решения для Training 2.0.
Он не является канонической implementation specification.

## Decision-001: Использование Template и protocol основано на копировании

Статус: ACCEPTED

Контекст:

- Для Training нужны переиспользуемые источники template/program.

Решение:

- Использование template или protocol создаёт независимую копию workout.
- Существующие копии workout не auto-mutate после изменений source.

Обоснование:

- Сохраняет историческую корректность и избегает скрытых side effects.

Последствия:

- Требует явной copy semantics и snapshot handling в implementation.

## Decision-002: Programs и templates — это разные концепции

Статус: ACCEPTED

Контекст:

- Ответственность Template и program/protocol различается.

Решение:

- Templates остаются переиспользуемыми blueprint workout.
- Programs выступают структурированными контейнерами для protocol flows.

Обоснование:

- Уточняет границы lifecycle и исключает неоднозначность model.

Последствия:

- Требует выделенных persistence и API contracts для entities program/protocol.

## Decision-003: Date/time относятся к конкретным workouts, а не к templates/protocols

Статус: ACCEPTED

Контекст:

- Runtime execution context должен быть instance-specific.

Решение:

- Данные template/protocol исключают metadata конкретного времени выполнения.

Обоснование:

- Предотвращает случайную связность между blueprint и execution records.

Последствия:

- Экземпляры workout должны генерировать/хранить собственные schedule timestamps.

## Decision-004: Ожидание исторического snapshot для program-origin workouts

Статус: ACCEPTED (design target)

Контекст:

- Изменения Program со временем не должны переписывать исторический контекст workout.

Решение:

- История workout должна сохранять snapshot-semantics исходного контекста.

Обоснование:

- Это требуется для auditability и пользовательской исторической согласованности.

Последствия:

- В будущей implementation требуются дополнительные data и persistence contracts.

## Decision-005: Повторное использование TrainingPage в разных режимах

Статус: ACCEPTED (implementation target)

Контекст:

- Несколько параллельных builders повышают риск drift.

Решение:

- Переиспользовать patterns TrainingPage/editor в contexts workout/template/protocol там, где это возможно.

Обоснование:

- Снижает UX drift и стоимость сопровождения.

Последствия:

- Требует mode-aware поведения editor и явных contracts route/state.

## Decision-006: Program protocols имеют scope program, а не global templates

Статус: ACCEPTED

Контекст:

- Program protocols и global templates имеют разные границы lifecycle.

Решение:

- Protocols, созданные внутри program, являются program-local entities.
- Program protocols не должны автоматически появляться в global templates list.

Обоснование:

- Предотвращает смешение entity-types и сохраняет чистые domain boundaries.

Последствия:

- Требуются отдельные границы persistence/query для templates и program protocols.

## Decision-007: Program-origin workouts должны сохранять immutable source snapshot

Статус: ACCEPTED (design target)

Контекст:

- Состояние Program может изменяться после создания workout.

Решение:

- Workout, созданный из program/protocol, должен сохранять source-context snapshot для истории.

Обоснование:

- Исторические записи должны оставаться стабильными и auditable.

Последствия:

- В будущей implementation требуются snapshot persistence и contracts history-link.

## Decision-008: Изменения Program влияют только на будущие runs

Статус: ACCEPTED

Контекст:

- Сущности Program являются текущими рабочими структурами и могут редактироваться со временем.

Решение:

- Изменения program/protocol применяются только к созданию будущих workouts.
- Уже созданные исторические workouts остаются неизменными.

Обоснование:

- Предотвращает ретроактивную мутацию исторических пользовательских данных.

Последствия:

- Runtime orchestration должна отделять текущее состояние program от исторических snapshots.

## Decision-009: Существующий baseline persistence workout должен оставаться неизменным

Статус: ACCEPTED

Контекст:

- Core persistence для workout уже работает в production baseline.

Решение:

- Новые entities template/program/protocol являются additive и не должны ломать baseline workouts/workout_exercises/workout_sets.

Обоснование:

- Стабильность текущей persisted истории training обязательна.

Последствия:

- Последовательность migration и rollout должна сохранять backward compatibility.

## Decision-010: Calendar binding и assignment UX остаются deferred/open

Статус: DEFERRED / OPEN

Контекст:

- Calendar scheduling и coach-client assignment UX ещё не финализированы.

Решение:

- Пока не фиксировать финальные контракты calendar-binding и assignment UX.

Обоснование:

- Это предотвращает преждевременные ограничения до полного согласования permissions и product flow.

Последствия:

- Implementation должна считать эти flows planned и держать extension points явными.

## Pending / Open

- Финальные UX и contracts coach-client assignment для program flows.
- Полный UX scope scheduling/version для protocols.

## Источники

- docs/modules/Training/TRAINING_2_0_DECISIONS.md
- docs/modules/Training/TRAINING_TEMPLATES_SPEC.md
- docs/modules/Training/TRAINING_TEMPLATES.md
