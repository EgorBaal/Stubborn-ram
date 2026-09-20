# SERVER

## Назначение

Каноническое описание состояния host/runtime/network/deployment для server-инфраструктуры Stubborn Ram.
Документ фиксирует текущее verified-поведение и явно отмечает частичные или deferred-зоны.

## Production Host

Статус: CURRENT

- Provider: Selectel Cloud Server.
- Public IP хоста: 161.104.49.107.
- OS: Ubuntu 24.04.x.
- Baseline ёмкости, использованный в документированных проверках: 2 vCPU, 4 GB RAM, 20 GB SSD.

Размещение PostgreSQL в runtime:

- CURRENT: PostgreSQL работает на том же Selectel host, что и backend runtime.
- Managed PostgreSQL не является текущей production-моделью.

## Local Runtime

Статус: CURRENT

- Локальный frontend dev server (Vite).
- Локальный backend process на Fastify.
- Локальный PostgreSQL для development/testing.

## Production Runtime

Статус: CURRENT

Runtime-цепочка:

- Nginx terminates external HTTP/HTTPS.
- Fastify backend listens on 127.0.0.1:3000.
- PM2 manages backend process stubbornram-backend.
- PostgreSQL listens locally (internal-only listener).
- pgAdmin application listens on 127.0.0.1:5050 and is reverse-proxied via admin domain.

## Domains

### stubbornram.ru

Назначение: public product frontend domain.

Статус маршрутизации:

- Доступность public site verified в remediation checks.
- Точное владение serving stack для этого домена в текущей фазе имеет статус PARTIALLY VERIFIED и должно трактоваться через deployment evidence sources.

### api.stubbornram.ru

Назначение: public API ingress для backend.

Статус маршрутизации: VERIFIED

- Nginx reverse proxy to 127.0.0.1:3000.
- Health endpoint verification on HTTPS documented.

### admin.stubbornram.ru

Назначение: administrative web-access к pgAdmin.

Статус маршрутизации: VERIFIED

- Nginx reverse proxy to 127.0.0.1:5050.
- HTTPS path and admin login/connectivity checks documented in remediation evidence.

## Nginx

Статус: CURRENT

- Public listeners на 80 и 443.
- API и admin domains reverse-proxied на internal loopback services.
- Поведение HTTP -> HTTPS документировано для опубликованных domains.

## Fastify / Node.js

Статус: CURRENT

- Backend framework: Fastify на Node.js runtime.
- Bind на 127.0.0.1:3000.
- /health endpoint возвращает флаги готовности service и database.

## PM2

Статус: CURRENT

- Имя процесса: stubbornram-backend.
- Production checks документировали online state процесса во время remediation-задач.

## PostgreSQL Runtime Placement

Статус: CURRENT

- Локальный listener PostgreSQL на production host.
- Внешний прямой доступ к DB не является частью runtime ingress.

## pgAdmin

Статус: CURRENT с deferred hardening

- Internal app listener: 127.0.0.1:5050.
- Публикация через admin.stubbornram.ru и Nginx.
- Runtime/HTTPS/admin-login checks документированы как verified.
- pgAdmin MFA/2FA остаётся DEFERRED.

## Network Exposure

Статус: VERIFIED BASELINE (по production checks)

Порты, доступные извне:

- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

Порты, недоступные извне в документированных проверках:

- 3000 (Fastify bind)
- 5432 (PostgreSQL)
- 5050 (pgAdmin internal bind)
- 8080 and sampled additional ports in checks

## HTTPS

Статус: CURRENT

- HTTPS используется на опубликованных production domains.
- Admin HTTPS path входил в scope проверки фикса F1-NV-03.
- API HTTPS health оставался рабочим в verification logs.

## Deployment Model

Статус: CURRENT

- Доставка frontend и backend является раздельной задачей.
- Backend deployment в remediation evidence использовал package + deploy script + PM2 restart.
- Защита production environment включала явный no-overwrite guard для критического env scope в документированных deployment checks.

## Backups / Recovery

Статус: PARTIALLY IMPLEMENTED

Подтверждено:

- Исторический DB dump artifact присутствует в документированном контексте server state.

Не подтверждено как полностью реализованное:

- автоматизированная backup-политика с регулярной verification;
- протестированный restore runbook как регулярный операционный процесс.

Считать полную готовность backup/recovery не полностью verified.

## Текущая Verified-Инфраструктура

- Selectel host runtime активен для stack backend/db/nginx/pgadmin.
- Роутинг Nginx -> Fastify API verified.
- Operational checks для API и admin выполнены в remediation evidence.
- Internal-only модель экспонирования для bind ports Fastify/PostgreSQL/pgAdmin verified.

## Deferred / Известные Пробелы

- Усиление pgAdmin MFA/2FA остаётся DEFERRED.
- Часть server/infrastructure записей являются историческими и не должны считаться автоматически актуальной runtime-истиной без перепроверки.
- Автоматизация backup и verify восстановления остаются PARTIALLY IMPLEMENTED.

## Связанные Документы

- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/SYSTEMS/DATABASE.md
- docs/SYSTEMS/MEDIA.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- docs/SERVER/SERVER_STATE.md
- docs/INFRASTRUCTURE_MIGRATION.md
- docs/MIGRATION_ARCHITECTURE.md
