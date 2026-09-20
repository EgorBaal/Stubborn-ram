# PAYMENTS

## Назначение

Канонический системный документ для payment-related access-source architecture в Stubborn Ram.
Документ отделяет утверждённую target-модель от текущего статуса реализации.

## Роль в Access-Модели

Статус: CURRENT (архитектурная роль), NOT IMPLEMENTED (full runtime)

Payments сами по себе не являются permissions.
Payments создают или расширяют access sources, которые используются при access/permission decisions.

## Текущий Статус

Статус: NOT IMPLEMENTED / PLANNED

- Полная production payment subsystem не реализована в текущем runtime codebase.
- Payment provider integration, обработка webhook и backend состояния subscription не подтверждены как активные production features.

## Planned Payment Model

Статус: PLANNED

Архитектурная модель включает:

- provider-agnostic adapter/service layer;
- ingestion событий payment;
- transitions состояния subscription/access-source;
- пересчёт access после изменений payment lifecycle.

## Access Sources

Статус: CURRENT (утверждённая архитектура), PARTIALLY IMPLEMENTED runtime surface

Определённая access-source модель:

- trial;
- personal subscription;
- coach-related access source.

Примечание по runtime:

- Access-source architecture утверждена.
- Полная реализация source lifecycle с оплатой не подтверждена как complete runtime capability.

## Planned Backend

Статус: PLANNED

Ожидаемые backend-capabilities:

- payment provider adapter;
- webhook verification and idempotent processing;
- subscription lifecycle operations;
- access-source updates driven by backend truth.

## Planned Database

Статус: PLANNED

Ожидаемые зоны data model:

- payment records;
- subscription records;
- payment-to-access-source linkage;
- refund and status history.

Здесь не утверждается, что эта полная модель уже существует в текущем production runtime.

## Соображения Безопасности

Статус: CURRENT baseline + PLANNED extensions

- Полномочия по payment-decision должны оставаться на backend-side.
- Frontend не должен получать provider secret credentials.
- Подлинность webhook и idempotency обязательны в planned implementation.

## Deferred / Not Implemented

Статус: DEFERRED / NOT IMPLEMENTED

- Полная реализация payment subsystem.
- Processing recurring/autorenew (поверх текущей baseline-модели).
- Полный lifecycle автоматизации refund в runtime.

## Известные Ограничения

- Архитектура утверждена, но покрытие реализации неполное.
- Поведение payments нельзя представлять как активную production feature, пока пути backend/database/provider не реализованы и не verified.

## Связанные Документы

- docs/SYSTEMS/PERMISSIONS.md
- docs/SYSTEMS/AUTH.md
- docs/ARCHITECTURE/PLATFORM.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
- docs/architecture/PAYMENT_ARCHITECTURE.md
