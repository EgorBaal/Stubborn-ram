# MEDIA

**Статус:** CANONICAL / CURRENT  
**Актуальность фактов:** 19.09.2026 по последним доступным Audit/Remediation evidence

## 1. Назначение

Media — общая инфраструктура хранения и доступа к пользовательским файлам Stubborn Ram.

Это не самостоятельный пользовательский бизнес-модуль.

Media используется/предусмотрен для:

- Training;
- Reports;
- Chat;
- Photos & Measurements;
- других модулей, которым нужны файлы.

Каноническое разделение:

```text
PostgreSQL
↓
media metadata + links

Object Storage
↓
binary objects
```

---

# 2. Runtime Architecture

**Статус: CURRENT**

Основной flow:

```text
Frontend module
↓
module service / mediaService
↓
apiClient
↓
Backend Media API
↓
storage service
↓
S3-compatible Object Storage
```

Metadata:

```text
Backend
├── PostgreSQL
│   ├── media
│   └── media_links
│
└── Object Storage
    └── binary object
```

Frontend не получает storage credentials.

Прямой браузерный PUT в Object Storage допустим только после получения server-generated signed upload URL и является штатной частью Media flow.

Это не является authorization bypass.

---

# 3. Object Storage

**Статус: CURRENT / PRODUCTION VERIFIED**

Используется S3-compatible Object Storage на production infrastructure.

Production storage profile настроен.

Backend использует server-side configuration:

```text
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

Значения секретов не фиксируются в документации.

Storage layer поддерживает текущие операции:

- signed upload URL;
- signed download URL;
- object existence check;
- delete.

---

# 4. Privacy / Bucket Security

**Статус: VERIFIED по effective runtime behavior**

Production verification подтвердила:

```text
unsigned direct read  → 403
unsigned direct write → 403
```

Также подтверждены:

- `GetBucketAcl` — доступен и подтверждён;
- `GetBucketPolicy` — policy присутствует.

Provider API limitations:

```text
GetPublicAccessBlock  → 501 NotImplemented
GetBucketPolicyStatus → 501 NotImplemented
```

Поэтому:

```text
effective private behavior
→ VERIFIED

часть provider control-plane attributes
→ NOT VERIFIED
```

Это не является доказательством публичности bucket.

---

# 5. Media Data Model

## `media`

**Статус: CURRENT**

Основная metadata table.

Ключевые поля:

```text
id
owner_id
author_id
object_key
original_name
mime_type
size_bytes
status
created_at
updated_at
```

Constraints:

- `id` — primary key;
- `object_key` — unique;
- `owner_id -> users.id`;
- `author_id -> users.id`;
- status constraint.

Модель:

```text
owner_id
→ кому принадлежит Media

author_id
→ кто создал Media record
```

Автор и владелец могут совпадать.

## `media_links`

**Статус: CURRENT**

Связывает Media с конкретными доменными сущностями.

Поля:

```text
id
media_id
entity_type
entity_id
role
sort_order
created_at
```

Связь:

```text
media_id → media.id
```

Индексы:

```text
(entity_type, entity_id)
(media_id)
```

`media_links` хранит связь, а не binary file.

---

# 6. Ownership

**Статус: CURRENT**

Текущий Media owner:

```text
media.owner_id
```

Backend проверяет ownership для текущих операций:

```text
complete
read
delete
```

Само знание:

```text
media_id
```

или:

```text
object_key
```

не даёт права доступа.

Архитектурное правило:

```text
Client
↓ owns
Media
↓ linked to
Report / Training / Chat object
↓ accessible according to permissions
Coach
```

При этом полноценный relationship-based coach authorization в текущем Media runtime пока не является полностью реализованным universal permission layer.

---

# 7. Upload Flow

**Статус: CURRENT / VERIFIED**

Текущий flow:

```text
Authenticated client
↓
POST /api/media/upload
↓
Backend validation
↓
INSERT media
status = UPLOADING
↓
server-generated object_key
↓
signed upload URL
↓
Client PUT binary to Object Storage
```

Backend контролирует:

- authentication;
- payload shape;
- MIME type;
- size;
- ownership;
- допустимость параметров;
- object key.

Frontend validation допускается только как UX layer.

---

# 8. Complete Flow

**Статус: CURRENT / VERIFIED**

Endpoint:

```text
POST /api/media/{id}/complete
```

Backend:

```text
authentication
↓
owner check
↓
status check
↓
headObject
↓
storage existence check
↓
size/content-type comparison
↓
READY / FAILED
```

Цель — не подтвердить upload как успешный, пока actual object в storage не соответствует metadata.

---

# 9. Download Flow

**Статус: CURRENT / VERIFIED**

Endpoint:

```text
GET /api/media/{id}
```

Flow:

```text
Authenticated client
↓
Backend owner check
↓
READY state
↓
signed download URL
↓
Object Storage
```

Backend не выдаёт постоянный public URL.

Production verification подтвердила скачивание через signed URL и совпадение содержимого.

---

# 10. Delete Flow

**Статус: CURRENT / VERIFIED**

Endpoint:

```text
DELETE /api/media/{id}
```

Flow:

```text
Authenticated client
↓
ownership check
↓
delete object from Object Storage
↓
delete media row from PostgreSQL
```

Удаление Media затрагивает:

```text
PostgreSQL metadata
+
Object Storage object
```

Автоматическое удаление Media только из-за возраста не используется.

---

# 11. Media Status

Текущая модель предусматривает:

```text
UPLOADING
PROCESSING
READY
FAILED
```

Допустимый простой flow:

```text
UPLOADING
↓
READY
```

Flow с processing:

```text
UPLOADING
↓
PROCESSING
↓
READY
```

При ошибке:

```text
PROCESSING
↓
FAILED
```

Конкретный переход зависит от типа Media и текущего runtime flow.

---

# 12. Signed URLs

**Статус: CURRENT**

Signed URLs генерируются server-side.

Текущий storage service TTL:

```text
900 seconds
```

то есть:

```text
15 минут
```

Signed URL является временным разрешением на конкретную storage operation.

Он не заменяет backend authorization.

---

# 13. API

Подтверждённые Media endpoints:

```text
POST   /api/media/upload
POST   /api/media/{id}/complete
GET    /api/media/{id}
DELETE /api/media/{id}
```

Защищённые Media routes требуют authentication.

Unauthenticated запросы к защищённым routes получают:

```text
401
```

---

# 14. Production Verification

**Статус: FIXED — VERIFIED (F1-NV-01)**

Подтверждённый synthetic production flow:

```text
authenticated upload init
↓
signed upload URL issuance
↓
PUT upload
↓
complete
↓
signed download
↓
content match
↓
delete
```

Дополнительно подтверждено:

```text
unsigned read  → 403
unsigned write → 403
```

В verification использовался synthetic user и synthetic media.

После проверки:

- synthetic media удалён;
- synthetic user удалён;
- временные verification scripts удалены.

Schema migrations в рамках этой проверки не запускались.

---

# 15. Configuration / Secrets

Production backend использует:

```text
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

Storage secrets:

- не передаются frontend;
- не публикуются в Git;
- не фиксируются в документации;
- хранятся server-side.

Frontend environment содержит API configuration, а не S3 credentials.

---

# 16. Media и Training

Media является общей инфраструктурой для Training.

Каноническая Training persistence:

```text
WORKOUT
↓
WORKOUT_EXERCISE
↓
WORKOUT_SET
```

Training set notes могут использовать:

```text
training_set_notes
↓
media_links
↓
media
```

Media policy не должна дублировать Training business rules.

Например, UI-specific training limits должны оставаться в Training documentation.

---

# 17. Media и Reports / Chat / Photos

## Reports

Целевой контур:

```text
Report
↓
Media Link
↓
Media
↓
Object Storage
```

## Chat

Целевой контур:

```text
Chat Message
↓
Media reference
↓
Media
↓
Object Storage
```

Текст сообщения хранится в PostgreSQL.

Binary вложение хранится в Object Storage.

## Photos & Measurements

Будущие фотографии и видео должны использовать тот же Media layer, а не собственное file storage.

Наличие Media runtime не означает, что Reports, Chat или Photos & Measurements уже полностью реализованы как бизнес-модули.

---

# 18. Supported File Categories

Историческая target architecture предусматривает:

- images;
- video;
- documents;
- audio.

Но полный текущий production whitelist MIME types/extensions не следует утверждать без отдельной проверки backend validation.

Source of truth для реально разрешённых типов — текущая реализация Media API.

---

# 19. Image Handling

Target architecture предусматривает server-side validation:

- MIME type;
- размер;
- extension;
- фактическое содержимое;
- технические параметры.

При необходимости может существовать optimized version.

Оригинальный пользовательский material не должен автоматически удаляться без отдельного retention policy.

---

# 20. Video / Worker

**Статус worker: PLANNED / NOT CONFIRMED AS CURRENT RUNTIME**

Историческая target model:

```text
Upload
↓
Private Object Storage
↓
FFmpeg Worker
↓
Processed Video
↓
READY
```

FFmpeg не должен выполняться как финальная storage architecture в браузере.

При небольших нагрузках worker архитектурно может находиться на том же Cloud Server.

При росте нагрузки processing может быть вынесен отдельно.

Но наличие описания FFmpeg pipeline в старой документации не означает, что production FFmpeg worker сейчас запущен.

---

# 21. Audio

Target architecture позволяет хранить голосовые сообщения Chat как Media.

Принцип:

```text
Chat Message
↓
Media
↓
Object Storage
```

Автоматическая расшифровка аудио не относится к текущему verified baseline.

---

# 22. Documents

Chat documents могут использовать тот же Media layer.

Backend должен контролировать:

- type;
- size;
- ownership;
- access;
- связь с конкретным message/context.

Документы не должны публиковаться через постоянные public URLs.

---

# 23. Object Key

Object key генерируется Backend.

Пользовательское имя файла не используется как единственный storage identifier.

Базовый принцип:

```text
user input
≠
storage path
```

Точный формат object key является внутренней backend implementation detail.

---

# 24. Lifecycle / Retention

**Статус: CURRENT BASELINE**

Нет автоматического user-media deletion только по возрасту.

Удаление текущего Media выполняется через предусмотренный server flow.

Будущая lifecycle governance может дополнительно определять:

- retention;
- cleanup;
- orphan object handling;
- processing cleanup.

Эти расширения не считаются текущей полностью реализованной системой.

---

# 25. Performance Principles

Историческая архитектура допускает:

- optimized images;
- server-side video processing;
- CDN;
- pagination / lazy loading в модулях;
- вынесение тяжёлых workers.

Но:

```text
performance
≠
нарушение ownership
≠
прямой uncontrolled storage access
```

Performance optimization не должна превращать Object Storage в публичное хранилище.

---

# 26. Permanent Storage Policy

Для future Reports / Chat architecture предусматривалось долговременное хранение:

- reports;
- messages;
- report photos;
- report videos;
- chat attachments.

Это policy-level requirement.

Оно не является отдельным DB constraint и не отменяет будущую официальную lifecycle/data-retention policy.

---

# 27. Security Boundary

Канонический текущий boundary:

```text
Browser
↓
Backend authentication
↓
ownership / access checks
↓
signed URL
↓
private Object Storage
```

Правила:

1. storage credentials только server-side;
2. постоянные public URLs не используются;
3. `media_id` не является permission;
4. backend проверяет ownership;
5. object key генерируется server-side;
6. PostgreSQL хранит metadata;
7. Object Storage хранит binary;
8. effective private behavior verified production tests.

---

# 28. Что НЕ входит в VERIFIED Media baseline

Не считать текущим production runtime только по target documentation:

```text
полноценный relationship-based coach access
universal permission engine
production FFmpeg worker
audio transcription
AI moderation
CDN as mandatory Media path
сложная Media analytics
полная lifecycle governance
provider-independent control-plane verification
```

---

# 29. Source of Truth при конфликте

Приоритет для Media:

```text
1. последнее подтверждённое production/runtime evidence
2. current backend/frontend implementation
3. Audit / Remediation closure
4. SYSTEM_STATE_FINAL
5. этот canonical MEDIA.md
6. historical / target architecture documents
```

Старые документы сохраняются как контекст и provenance, но не должны переопределять позднее verified runtime.

---

# 30. Связанные документы

```text
SYSTEMS/DATABASE.md
SYSTEMS/SERVER.md
SYSTEMS/SECURITY.md
SYSTEMS/PERMISSIONS.md

SYSTEM_STATE/SYSTEM_STATE_FINAL.md

ARCHITECTURE/ARCHITECTURE.md

modules/Training/*
modules/REPORT.md
modules/CHAT.md
modules/PHOTO_AND_MEASUREMENTS.md

AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
```

Исторические:

```text
ARCHIVE/MEDIA.md
ARCHIVE/INFRASTRUCTURE_MIGRATION.md
ARCHIVE/MIGRATION_ARCHITECTURE.md
ARCHIVE/SERVER_STATE.md
```

---

# Итог

Текущий Media baseline:

```text
Frontend service
↓
Backend Media API
↓
PostgreSQL metadata + media_links
↓
S3-compatible Object Storage
```

Production-verified:

```text
upload
complete
signed download
delete
unsigned access blocking
```

Ownership:

```text
media.owner_id
```

Signed URL TTL:

```text
900 seconds
```

Production Media status:

```text
FIXED — VERIFIED
```

Residual limitations:

```text
provider control-plane verification → PARTIAL
relationship-wide permissions       → NOT FULLY IMPLEMENTED
FFmpeg worker                       → PLANNED
broader lifecycle governance        → PLANNED
```
