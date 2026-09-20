# PLATFORM

Статус: CURRENT (с явно отмеченной зрелостью модулей)
Последнее обновление: 2026-09-19

## Назначение

Этот документ является канонической platform model для Stubborn Ram.
Он описывает product contexts, ownership, role semantics, access logic и domain boundaries.

## Product Model (CURRENT)

Stubborn Ram — единая coaching platform, где одна user account может работать в нескольких contexts:

- personal/client context;
- coach context;
- admin service context.

Платформа не требует отдельных accounts для каждого context.

## Core Identity и Ownership (CURRENT)

- `User` является primary entity.
- Данные user остаются во владении user.
- Coach получает authorized access через active relationship и permissions, а не через передачу ownership.

Каноническое правило ownership:

```text
User ownership
  -> Coach/Client relationship
  -> Permissioned access
```

## Модель Role и Access

### Role Contexts (CURRENT)

- Client/User, Coach, Admin — это contexts над одной user account.
- Решения по access основаны на action/object, а не только на имени role.

### Access Sources (CURRENT)

Полный access предоставляется, когда активен хотя бы один source:

- Trial;
- personal subscription;
- coach subscription + active coach-client relationship.

Примечания по текущей access-модели:

- baseline длительности trial — 10 календарных дней;
- логика grace для coach-access учитывается в evidence по architecture payment/access;
- history остаётся доступной, когда все источники full-access заканчиваются, а лимиты создания определяются access policy.

### Auth / Access / Permissions Separation (CURRENT)

- Authentication: кто такой user.
- Access: разрешено ли сейчас полное использование платформы.
- Permissions: разрешено ли конкретное действие над конкретным объектом.

## Ключевые Product-Зоны и Зрелость

- Home: CURRENT.
- Baseline authentication/account: CURRENT.
- Training: CURRENT для core persistence baseline (VERIFIED), дальнейшее расширение features — PARTIALLY IMPLEMENTED.
- Chat: PARTIALLY IMPLEMENTED.
- Reports: PARTIALLY IMPLEMENTED.
- Food, Activity, Weight, Photos/Measurements, Analytics, Notifications: PLANNED/PARTIALLY IMPLEMENTED в зависимости от состояния module.
- Глубокая интеграция Payments и AI/OCR: PLANNED.

Детали уровня module индексируются в system state и module docs.

## Domain Boundaries (CURRENT)

- Граница platform включает app UX, API, data и permissions.
- Внешние providers (storage/email/payments/AI) подключаются через adapter-driven integrations.
- Контракты providers должны быть заменяемыми без переписывания product-domain логики.

Ключевые поведенческие границы, сохранённые из project context:

- domain modules сохраняют каноническое ownership данных (без неконтролируемых duplicate sources);
- сотрудничество coach-client не передаёт ownership данных от user к coach;
- historical user data сохраняется при истечении access sources, а права создания ограничиваются policy.

Напоминание о границе:

- platform model определяет ownership, roles и domain behavior;
- runtime layering и механика интеграций канонизированы в `docs/ARCHITECTURE/ARCHITECTURE.md`.

## Ограничения Platform и Deferred-Решения

- Часть hardening-пунктов остаётся DEFERRED (например отдельные усиления безопасности admin/auth).
- Production-grade verification отслеживается по документированным evidence и не выводится автоматически из target architecture.

## Связанные Канонические Документы

- Technical runtime architecture: `docs/ARCHITECTURE/ARCHITECTURE.md`
- Project/app folder and dependency structure: `docs/ARCHITECTURE/APP_STRUCTURE.md`
- Layout/shell contracts: `docs/ARCHITECTURE/LAYOUT.md`
- Global current-state index and verified limitations: `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`
