# PERMISSIONS

## Назначение

Каноническое описание модели authorization и action/object access control для Stubborn Ram.
Документ отделяет текущее реализованное enforcement-покрытие от planned target-покрытия.

## Authentication vs Access vs Permissions

Статус: CURRENT concept, PARTIALLY IMPLEMENTED runtime coverage

Определения:

- Authentication = who the user is.
- Access = whether user currently has full usage rights.
- Permissions = what action can be executed on which object.

Текущие замечания:

- Подсистема Authentication реализована и активна.
- Access-source architecture (trial/subscription/coach context) определена, но не полностью реализована как complete runtime permission engine.
- Enforcement для Permissions сейчас реализован только в отдельных backend flows.

## Текущая Модель Ownership

Статус: CURRENT (в реализованном scope)

- User-linked ownership присутствует в текущей модели данных auth/training/media.
- Текущие backend checks опираются на authenticated user id и object ownership filters для in-scope routes.

## Модель Action / Object

Статус: PARTIALLY IMPLEMENTED

- Action-based permission architecture определена в исходных architecture-документах.
- Runtime сейчас обеспечивает только подмножество через endpoint auth + ownership checks.
- Полная action matrix по всем planned modules реализована не полностью.

## Текущее Backend-Enforcement

Статус: CURRENT (в реализованных endpoints), PARTIALLY IMPLEMENTED (platform-wide)

Evidence-backed паттерны enforcement:

- Auth requirement via session checks in protected routes.
- Media endpoints enforce owner scope for upload/complete/read/delete flows.
- Training endpoints use authenticated user scope and ownership-linked data access in current implemented routes.

Что сейчас не подтверждено как полностью реализованное:

- Централизованный permission service, покрывающий все target domains.
- Полная relationship-based authorization trainer/client в runtime backend.

## Relationship-Based Access

Статус: PLANNED / PARTIALLY IMPLEMENTED concept

- Модель relationship-based access определена архитектурно.
- Runtime relationship subsystem (tables/routes/role model) документирован как не полностью реализованный.
- Для зрелости домена см. docs/SYSTEMS/COACH_CLIENT_RELATIONSHIP.md.

## Текущая Permission Matrix

Статус: PARTIALLY IMPLEMENTED

Реализованный и evidence-backed baseline:

- auth.session.read: implemented via GET /api/auth/session.
- auth.logout: implemented via POST /api/auth/logout.
- media.create/read/complete/delete: implemented with auth + owner checks.
- training in-scope read/write flows: implemented with auth + user ownership scope.

Не подтверждено как полностью реализованное:

- полная action matrix для report/chat/relationship-based сценариев;
- широкая role-to-action matrix для trainer/admin workflows за пределами текущих in-scope routes.

## Planned Permission Coverage

Статус: PLANNED

- Унифицированная action/object authorization для target modules.
- Relationship-aware покрытие policy для coach-client сценариев.
- Более широкие object-state-aware permissions поверх текущего baseline.

## Deferred

Статус: DEFERRED

- Расширенный permission hardening и расширенная поверхность policy вне текущего remediation baseline.

## NOT VERIFIED

- Полная production runtime verification для complete target permission model.
- Полная relationship permission chain в production runtime.

## Известные Ограничения

- Текущая реализация уже, чем target permission architecture.
- Документационные концепции опережают текущее runtime coverage в relationship-driven domains.

## Связанные Документы

- docs/SYSTEMS/AUTH.md
- docs/SYSTEMS/SECURITY.md
- docs/SYSTEMS/COACH_CLIENT_RELATIONSHIP.md
- docs/SYSTEMS/PAYMENTS.md
- docs/ARCHITECTURE/PLATFORM.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/architecture/PERMISSIONS_ARCHITECTURE.md
