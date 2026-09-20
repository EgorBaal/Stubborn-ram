# SECURITY

## Назначение

Канонический документ security-layer для Stubborn Ram.
Он описывает текущие security controls, verified behavior и известные ограничения без дублирования полной логики AUTH и PERMISSIONS.

## Границы Threat / Trust

Статус: CURRENT

Ключевые trust-границы:

- Граница Browser/client: окружение под управлением пользователя.
- Граница API: backend на Fastify как точка security-решений.
- Граница данных: PostgreSQL только на сервере, без прямого доступа из frontend.
- Граница файлов: Object Storage приватный и доступен через backend-mediated signed URLs.
- Admin-граница: приложение pgAdmin имеет internal bind и внешний доступ только через reverse proxy admin domain.

## Security-Модель

Статус: CURRENT с документированными ограничениями

- Server-side enforcement для защищённых операций.
- Cookie-based auth sessions с secure attributes.
- Origin gate для API-методов, меняющих состояние.
- Internal-only bind для service ports backend/db/pgAdmin.
- TLS ingress на production public domains.

## Безопасность Authentication

Статус: CURRENT

Security-relevant поведение auth:

- Пароли хэшируются на server-side.
- Session token хранится в DB как token hash.
- Gate проверки email блокирует login для unverified account.
- Завершение reset-password инвалидирует все user sessions.

Для полной детализации auth lifecycle см. docs/SYSTEMS/AUTH.md.

## Безопасность Authorization / Permissions

Статус: PARTIALLY IMPLEMENTED

Текущий security-взгляд:

- Защищённые endpoints требуют authenticated session.
- Существующие backend ownership checks есть для in-scope операций с media/training objects.
- Полный action-based permission engine для всех planned domains реализован не полностью.

Для детализации модели access см. docs/SYSTEMS/PERMISSIONS.md.

## Защита CSRF / Origin

Статус: CURRENT baseline + DEFERRED enhancement

- Проверка Origin для state-changing методов /api: VERIFIED.
- Минимальный baseline реализован через allowed-origin gate в backend runtime.
- Усиление CSRF token: DEFERRED.

## Session Security

Статус: CURRENT

- Session cookie имеет параметры httpOnly + secure + sameSite none.
- Baseline lifetime для session составляет 30 days.
- Очистка истёкших sessions реализована при startup и периодическим scheduler.
- Logout удаляет текущую session; завершение reset-password выполняет all-session invalidation.

## Безопасность Media / Storage

Статус: CURRENT с ограничениями control-plane

- Используется private модель S3-compatible object storage.
- Backend выдаёт signed upload/download URLs.
- Поведение запрета anonymous direct object read/write verified.
- Frontend не содержит S3 secret credentials.

Control-plane проверки для отдельных provider APIs в этом окружении остаются частично непроверяемыми.

## Безопасность Server / Infrastructure

Статус: CURRENT с deferred hardening

- Для public domains используется ingress через Nginx/TLS.
- Backend bind: 127.0.0.1:3000.
- PostgreSQL bind: internal-only listener.
- pgAdmin app bind: 127.0.0.1:5050; публикация через reverse proxy admin domain.
- Baseline внешней доступности: порты 22/80/443 доступны; backend/db/internal-admin ports не открыты напрямую.

Примечание по hardening:

- pgAdmin 2FA/MFA: DEFERRED.

## Secrets / Configuration

Статус: CURRENT

- Secret values не документируются в canonical docs.
- Классы runtime-secrets включают DB credentials, ключи email provider и S3 credentials.
- Frontend не должен хранить server-side secret values.

## Security Verification

Статус: PARTIALLY VERIFIED

Ключевые evidence-backed факты:

- F1-SEC-02 baseline защиты по origin: VERIFIED.
- F1-SEC-03 baseline очистки session: VERIFIED.
- F1-SEC-01 production success/resend path: verified; simulation ошибки отправки email в production остаётся NOT VERIFIED.
- F1-NV-01 поведение private media flow: FIXED/VERIFIED.

## Текущие Security Controls

- Secure cookie session-модель и server-side хранение session.
- Origin gate для state-changing API methods.
- Endpoint-level auth checks в существующих backend routes.
- Ownership checks в реализованных media/training flows.
- Internal runtime bind-модель за Nginx reverse proxy.

## PARTIALLY IMPLEMENTED

- Единое cross-domain покрытие action authorization реализовано не полностью.
- Операционная зрелость backup/recovery остаётся частичной.

## DEFERRED

- Усиление CSRF token сверх текущего origin baseline.
- Усиление pgAdmin 2FA/MFA.
- Дополнительные hardening-capabilities, отслеживаемые в scope roadmap/remediation.

## NOT VERIFIED

- Воспроизведение production-сценария F1-SEC-01 с ошибкой отправки email.
- Часть S3 control-plane verification APIs в текущем provider-окружении.

## Известные Ограничения

- Текущий security baseline не эквивалентен полной target hardening architecture.
- Зрелость relationship/permission subsystem ниже target model coverage.

## Связанные Документы

- docs/SYSTEMS/AUTH.md
- docs/SYSTEMS/PERMISSIONS.md
- docs/SYSTEMS/SERVER.md
- docs/SYSTEMS/MEDIA.md
- docs/SYSTEMS/DATABASE.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/architecture/SECURITY.md
