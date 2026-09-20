# COACH CLIENT RELATIONSHIP

## Назначение

Канонический системный документ для домена coach-client relationship как сквозного контекста access и ownership.
Документ различает архитектуру домена и текущую зрелость runtime-реализации.

## Смысл Домена

Статус: CURRENT (архитектурное определение)

- Определяет контекст сотрудничества между user и coach.
- Предоставляет контекст access, а не передачу ownership.
- Предназначен влиять на то, какие actions разрешены на user-owned объектах во время active collaboration windows.

## Identity / Ownership

Статус: CURRENT (архитектурное правило), PARTIALLY IMPLEMENTED (runtime)

- User остаётся owner пользовательских данных.
- Coach действует как authorized collaborator в рамках правил relationship и permissions.
- Relationship должен управлять scope доступа, а не заменять ownership model.

## Relationship Lifecycle

Статус: PLANNED

Архитектурно определённые lifecycle patterns включают active и archived states с историческими границами.
Текущая runtime-реализация пока не предоставляет complete lifecycle persistence и route-level management для этой подсистемы.

## Access Through Relationship

Статус: PLANNED / NOT FULLY IMPLEMENTED

- Целевая модель: состояние relationship влияет на access к client-linked объектам.
- Текущее runtime evidence показывает отсутствие complete relationship subsystem implementation как выделенной backend capability.

## Взаимодействие с Permissions

Статус: PARTIALLY IMPLEMENTED (концептуально), PLANNED (full runtime)

- Ожидается, что relationship context будет работать совместно с action/object permissions.
- Полная relationship-based authorization chain пока не представлена в runtime backend согласно audit evidence.

## Текущая Реализация

Статус: PARTIALLY IMPLEMENTED

Evidence-backed текущее состояние:

- Концептуальная архитектура и принципы ownership задокументированы.
- Существующие backend access checks в реализованных flows в основном основаны на user-auth/ownership.
- Complete relationship persistence model (tables/routes/state transitions) реализована не полностью.

## PARTIALLY IMPLEMENTED

- Концепции relationship присутствуют в architecture и platform model.
- Runtime permission checks присутствуют в отдельных routes, но не как complete relationship subsystem.

## PLANNED

- Persistent relationship entities и lifecycle operations.
- Явные backend routes/workflows для операций connect/switch/archive/reactivate.
- Полная интеграция с permission engine и перерасчётом access.

## NOT VERIFIED

- End-to-end production verification для complete relationship lifecycle и policy behavior.

## Известные Пробелы

- Зрелость runtime-реализации ниже target conceptual model.
- Документация домена сейчас опережает runtime-реализацию в этой подсистеме.

## Связанные Документы

- docs/SYSTEMS/PERMISSIONS.md
- docs/SYSTEMS/AUTH.md
- docs/SYSTEMS/PAYMENTS.md
- docs/ARCHITECTURE/PLATFORM.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/modules/COACH_CLIENT_RELATIONSHIP.md
