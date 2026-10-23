# SERVER

**Статус:** CANONICAL / CURRENT  
**Актуальность фактов:** 19.09.2026 по последним доступным System State + Audit/Remediation evidence

## 1. Назначение

Этот документ является каноническим описанием текущего server/runtime/deployment слоя Stubborn Ram.

Он фиксирует:

- production host;
- Local / Production runtime;
- Fastify + PM2;
- Nginx / HTTPS / domains;
- PostgreSQL и pgAdmin;
- network exposure;
- deployment safety;
- migration state;
- Object Storage runtime boundary;
- backups/recovery;
- текущие deferred/partial области.

Документ описывает **текущее подтверждённое состояние**, а не всю будущую инфраструктуру.

`SYSTEM_STATE_FINAL` остаётся глобальной краткой картой проекта, а Audit/Remediation остаются источниками forensic evidence.

---

# 2. Local и Production

## 2.1 Local

Local используется для:

- разработки;
- локальной проверки;
- подготовки migrations;
- проверки новых изменений до production rollout.

Базовая цепочка:

```text
React + Vite
↓
Service layer
↓
apiClient
↓
Fastify Backend
↓
Local PostgreSQL
```

Local DB и Production DB разделены.

## 2.2 Production

Production — опубликованная рабочая система.

Базовая цепочка:

```text
stubbornram.ru
↓
Production Frontend
```

```text
api.stubbornram.ru
↓
Nginx / HTTPS
↓
Fastify
↓
PostgreSQL
```

Media:

```text
Fastify
↓
S3-compatible Object Storage
```

Admin:

```text
admin.stubbornram.ru
↓
Nginx / HTTPS
↓
pgAdmin
↓
PostgreSQL
```

Local может временно опережать Production во время разработки. Для уже перенесённого foundation scope после rollout должен быть обеспечен функциональный паритет.

---

# 3. Production Host

**Статус: CURRENT / VERIFIED**

```text
Provider: Selectel Cloud Server
IP: 161.104.49.107
OS: Ubuntu 24.04.x
Baseline capacity: 2 vCPU / 4 GB RAM / 20 GB SSD
```

Назначение host:

- Backend API;
- PostgreSQL;
- Nginx;
- pgAdmin;
- PM2;
- системные сервисы инфраструктуры.

**Managed PostgreSQL не является текущей production-моделью.**

PostgreSQL работает непосредственно на том же Cloud Server, что и Backend.

---

# 4. Linux и административный доступ

**Статус: VERIFIED baseline**

Production использует отдельного Linux-пользователя:

```text
stubbornram
```

Подтверждено:

- Backend не должен запускаться от `root`;
- SSH под `stubbornram` используется;
- у пользователя есть sudo;
- UFW настроен;
- Fail2ban активен для `sshd`.

Секреты, пароли и приватные SSH-ключи в документации не фиксируются.

---

# 5. Backend Runtime

**Статус: CURRENT / VERIFIED**

Основной production path:

```text
/opt/stubbornram/backend/server
```

Entry point:

```text
server.js
```

Основной runtime:

```text
Node.js
Fastify
pg
dotenv
Zod
argon2
ws
node-pg-migrate
```

Backend слушает:

```text
127.0.0.1:3000
```

Production process manager:

```text
PM2
```

Process name:

```text
stubbornram-backend
```

PM2 управляет lifecycle production backend и автозапуском.

---

# 6. Production Backend Composition

После закрытия DG-1 / F1-ENV-01 production runtime был выровнен с актуальным localhost backend в рамках foundation scope.

Подтверждённые области runtime:

```text
auth/
db/
email/
leads/
training/
media/
storage/
```

Ранее, до remediation 19.09.2026, production runtime не содержал `media/storage`, а media routes отсутствовали. Это историческое состояние и не должно использоваться как current baseline.

Финальное remediation evidence подтверждает:

- production `media` и `storage` runtime присутствуют;
- `storagePlugin` и `mediaRoutes` зарегистрированы;
- `/api/media/upload` существует и защищён;
- PM2 остаётся `online`.

---

# 7. API Ingress

Production API:

```text
https://api.stubbornram.ru
```

Схема:

```text
Client
↓
api.stubbornram.ru
↓
Nginx
↓
127.0.0.1:3000
↓
Fastify
```

Backend не публикуется напрямую через `3000`.

Health endpoint:

```text
GET /health
```

Подтверждённое состояние:

```text
HTTP 200
```

Сервис и database readiness возвращаются в health response.

---

# 8. Domains

## `api.stubbornram.ru`

**Статус: VERIFIED**

Назначение:

```text
public API ingress
```

DNS:

```text
api.stubbornram.ru → 161.104.49.107
```

HTTPS:

```text
Nginx + Let's Encrypt
```

Health через HTTPS проверен.

## `admin.stubbornram.ru`

**Статус: VERIFIED**

Назначение:

```text
pgAdmin access
```

Цепочка:

```text
admin.stubbornram.ru
↓
Nginx / HTTPS
↓
127.0.0.1:5050
```

Browser login и PostgreSQL connectivity через pgAdmin были проверены в remediation.

## `stubbornram.ru`

Назначение:

```text
production frontend
```

Доступность production site подтверждалась remediation checks.

Глобальный System State фиксирует GitHub Pages как production frontend deployment path.

---

# 9. Nginx / HTTPS

**Статус: CURRENT / VERIFIED**

Nginx — внешний reverse proxy.

Публичные listener:

```text
80  HTTP
443 HTTPS
```

Internal targets:

```text
api.stubbornram.ru
→ 127.0.0.1:3000
```

```text
admin.stubbornram.ru
→ 127.0.0.1:5050
```

HTTP → HTTPS используется для опубликованных production domains.

Nginx должен проверяться через syntax validation перед применением изменений.

---

# 10. Network Exposure

**Статус: VERIFIED baseline**

Публично доступная поверхность:

```text
22  SSH
80  HTTP
443 HTTPS
```

Внутренними остаются:

```text
3000 Fastify
5432 PostgreSQL
5050 pgAdmin
```

Архитектурное правило:

```text
Internet
↓
Nginx
↓
internal loopback services
```

а не:

```text
Internet
↓
Fastify / PostgreSQL / pgAdmin directly
```

---

# 11. PostgreSQL Runtime

**Статус: CURRENT / VERIFIED**

Production PostgreSQL:

```text
PostgreSQL 16.15
Host: 127.0.0.1
Port: 5432
Database: stubbornram
Role: stubbornram_app
```

PostgreSQL находится на том же Selectel Cloud Server, что и Backend.

Прямой внешний database ingress закрыт.

Application runtime обращается к DB через Backend.

---

# 12. pgAdmin

**Статус: CURRENT / VERIFIED с deferred hardening**

Runtime:

```text
127.0.0.1:5050
```

Publication:

```text
admin.stubbornram.ru
↓
Nginx / HTTPS
↓
pgAdmin
```

Подтверждено:

- сервис активен;
- browser login;
- подключение к PostgreSQL;
- подключение к `stubbornram`.

MFA/2FA для pgAdmin:

```text
DEFERRED
```

Это отдельная будущая hardening-задача.

---

# 13. Frontend API Deployment Boundary

Frontend и Backend публикуются раздельно.

Для Production API используется:

```text
https://api.stubbornram.ru/api
```

Для Local:

```text
http://127.0.0.1:3000/api
```

API base должен задаваться через environment configuration.

Архитектурный принцип:

```text
Component
↓
Service
↓
apiClient
↓
Backend API
```

Frontend не подключается напрямую к PostgreSQL.

`git push` сам по себе не является Backend deployment.

---

# 14. Deployment Model

Frontend:

```text
push main
↓
GitHub Actions
↓
build
↓
GitHub Pages
↓
stubbornram.ru
```

Backend:

```text
backend package / deployment artifact
↓
/opt/stubbornram/backend/server
↓
PM2 restart
↓
verification
```

В Foundation Remediation для DG-1 использовался controlled code-only rollout.

---

# 15. Deployment Safety Invariants

Для code-only backend deployment:

```text
NO MIGRATIONS
NO .env overwrite
NO production data replacement
NO local data import
```

Принцип разделения:

```text
Backend code
≠
Production DB
≠
Production Object Storage
≠
Production secrets
```

Обычный запуск:

```text
npm start
```

не должен автоматически менять schema.

Отдельная команда:

```text
npm run migrate
```

используется для migrations.

---

# 16. Migration State

Используется:

```text
node-pg-migrate
```

Текущая repository migration chain включает актуальные миграции для backend-проектного state. Отложенная migration шаблонов была удалена из активного репозитория; будущая реализация шаблонов будет добавлена новой миграцией с новым идентификатором в момент реализации.

На Production подтверждены migrations:

```text
5911
5912
5913
5914
5915
5916
5917
5919
5920
5921
```

`5918` отсутствует в Production.

Статус:

```text
CONTROLLED DIVERGENCE
```

Причина, подтверждённая forensic verification:

- `5918` создаёт только template tables;
- `5919/5920/5921` не зависят от таблиц `5918`;
- current foundation flows технически не требуют `5918`.

Поэтому `5918` не должен применяться автоматически только ради непрерывности номеров.

Пересмотр нужен при включении Templates в реальный implementation scope или при появлении фактической dependency.

---

# 17. Object Storage Boundary

**Статус: CURRENT / PRODUCTION VERIFIED**

Production Media/Storage runtime подключён и проверен.

Цепочка:

```text
Frontend
↓
Backend Media API
↓
Storage service
↓
S3-compatible Object Storage
```

PostgreSQL хранит metadata.

Object Storage хранит binary objects.

Storage credentials не передаются во frontend.

---

# 18. Media Security Boundary

Текущая effective-private модель подтверждена:

```text
unsigned direct read  → 403
unsigned direct write → 403
```

Backend выдаёт временные signed URLs.

Provider control-plane ограничения:

```text
GetPublicAccessBlock  → 501 NotImplemented
GetBucketPolicyStatus → 501 NotImplemented
```

При этом remediation evidence подтверждает:

- `GetBucketAcl` — verified;
- `GetBucketPolicy` — verified;
- effective private behavior — verified runtime tests.

Следует различать:

```text
effective runtime privacy → VERIFIED
часть provider control-plane attributes → NOT VERIFIED
```

---

# 19. Media Production Flow

Подтверждённый production flow:

```text
authenticated upload init
↓
signed upload URL
↓
Object Storage PUT
↓
complete
↓
signed download
↓
content verification
↓
delete
```

В production был выполнен synthetic verification flow без изменения schema.

После проверки synthetic data была удалена.

---

# 20. Backup / Recovery

**Статус: PARTIALLY IMPLEMENTED**

Подтверждены отдельные backup / rollback artifacts.

Однако нельзя считать полностью завершёнными:

- автоматическую регулярную backup policy;
- регулярную backup verification;
- полностью воспроизводимый restore runbook;
- полную retention / disaster-recovery policy.

Важно:

```text
DB backup
≠
backend runtime backup
```

Rollback artifact защищает deployment runtime, но не заменяет полноценную DB recovery strategy.

---

# 21. Security Infrastructure Baseline

Подтверждённый server baseline включает:

```text
UFW
Fail2ban
SSH user isolation
Nginx / HTTPS
internal PostgreSQL
internal Fastify bind
internal pgAdmin bind
server-side secrets
rate-limited auth/API surface
```

Новые infrastructure changes должны проходить:

```text
READ-ONLY PRE-CHECK
↓
BACKUP
↓
CHANGE
↓
RESTART / RELOAD
↓
VERIFY
↓
ROLLBACK if needed
```

---

# 22. Legacy Supabase

**Статус: LEGACY / STILL IN USE для ещё не перенесённых областей**

После миграции Auth, Leads и Training рабочие flows используют собственный Backend API и PostgreSQL.

При этом каталог/артефакты Supabase ещё сохраняются до полного завершения переноса всех зависимостей.

Правило:

```text
Legacy implementation
↓
New Backend API
↓
Production verification
↓
Rollback window
↓
Legacy removal
```

Нельзя удалять оставшиеся Supabase-зависимости до подтверждения, что соответствующий production flow уже перенесён.

---

# 23. Что не следует считать текущим runtime только по старым архитектурным документам

Не считать автоматически реализованными:

```text
WebSocket Chat server
FFmpeg worker
полный universal permission engine
Coach/Client relationship backend
Reports backend
Food backend
Weight backend
Activity backend
Analytics backend
Payments backend
полную decommission Supabase
полную disaster-recovery automation
pgAdmin MFA/2FA
```

Наличие описания в старой target architecture не является доказательством production implementation.

---

# 24. Historical Context, retained from SERVER_STATE

Документ `SERVER_STATE.md` фиксировал контрольную точку 12.09.2026 и содержит исторические сведения, которые важны для provenance, но не должны переопределять более поздние 19.09.2026 facts.

К этой точке относились:

- проверенный Selectel host;
- Fastify + PM2;
- PostgreSQL;
- Nginx;
- pgAdmin;
- Auth;
- Leads;
- Training persistence.

В той же исторической версии Media/Object Storage ещё были отмечены как planned. Позднее это было изменено remediation-этапами 19.09.2026: production Media/Storage runtime был deployed/configured и verification завершена.

Поэтому историческая запись `Object Storage = PLANNED` в старом `SERVER_STATE.md` не является текущим статусом.

---

# 25. Source of Truth / Приоритет при конфликте

Для server-фактов действует приоритет:

```text
1. последнее подтверждённое production/runtime evidence
2. Audit / Remediation closure
3. SYSTEM_STATE_FINAL
4. этот canonical SERVER.md
5. старые SERVER_STATE / infrastructure documents
6. target architecture
```

Historical documents используются для восстановления контекста, но не должны переопределять более поздний verified state.

---

# 26. Связанные документы

```text
SYSTEM_STATE/SYSTEM_STATE_FINAL.md

SYSTEMS/DATABASE.md
SYSTEMS/MEDIA.md
SYSTEMS/AUTH.md
SYSTEMS/SECURITY.md
SYSTEMS/PERMISSIONS.md

ARCHITECTURE/ARCHITECTURE.md
ARCHITECTURE/PLATFORM.md

AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
```

Исторические:

```text
ARCHIVE/SERVER_STATE.md
ARCHIVE/INFRASTRUCTURE_MIGRATION.md
ARCHIVE/MIGRATION_ARCHITECTURE.md
```

---

# Итог

Current server foundation:

```text
Selectel Cloud Server
        ↓
Nginx / HTTPS
        ↓
Fastify + PM2
        ↓
PostgreSQL

Fastify
   └── S3-compatible Object Storage

admin.stubbornram.ru
        ↓
Nginx / HTTPS
        ↓
pgAdmin
```

Current foundation verification:

```text
Backend runtime               → VERIFIED
PostgreSQL placement          → VERIFIED
API ingress                   → VERIFIED
Internal service exposure     → VERIFIED
Production Media/Storage      → FIXED — VERIFIED
Authentication foundation     → VERIFIED
Training persistence          → VERIFIED
Backup/recovery automation    → PARTIALLY IMPLEMENTED
pgAdmin MFA/2FA               → DEFERRED
часть S3 control-plane checks → NOT VERIFIED
```
