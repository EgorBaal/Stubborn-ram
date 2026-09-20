# SYSTEM_STATE_UPDATED_FULL

Статус: CURRENT OVERVIEW / INDEX
Последнее обновление: 2026-09-19

## Роль Этого Документа

Это глобальный обзор и индекс current-state для Stubborn Ram.
Он фиксирует verified high-level состояние системы, ограничения и ссылки на канонические domain docs.

Этот файл намеренно не является полной технической энциклопедией.

## Обзор Проекта

- Product: Stubborn Ram.
- Тип: web platform (mobile-first, PWA-oriented) для coach/client workflows.
- Ключевые зоны: auth/account, training, chat, reports, media/storage, profile и смежные health/analytics modules.

## Local vs Production (Высокий Уровень)

### Local (CURRENT)

```text
Windows dev host
  -> React/Vite frontend
  -> Fastify backend
  -> Local PostgreSQL
```

### Production (CURRENT)

```text
stubbornram.ru + api.stubbornram.ru + admin.stubbornram.ru
  -> Nginx (TLS)
  -> Fastify backend (PM2)
  -> PostgreSQL
  -> Private S3-compatible Object Storage
```

## Высокоуровневая Архитектура (CURRENT)

```text
Frontend UI
  -> Services
  -> apiClient
  -> Backend API (Fastify)
  -> PostgreSQL (structured data)
  -> Object Storage (files/media)
```

Правила:

- frontend не имеет прямого доступа к PostgreSQL;
- frontend не имеет прямого доступа к private Object Storage;
- backend является authority для auth/access/permissions/business logic;
- обмен media использует backend-mediated signed URL flow.

## Статус Ключевых Систем

- Базовая цепочка frontend/backend/runtime: CURRENT.
- Базовый слой auth/session: CURRENT.
- Полнота hardening для permission/access: PARTIALLY IMPLEMENTED.
- Storage/media backend flow: CURRENT.
- Полное разделение фоновых worker-процессов для тяжёлой обработки: PARTIALLY IMPLEMENTED.

## Статус Ключевых Продуктовых Модулей

- Home: PARTIALLY IMPLEMENTED.
- Training core persistence baseline: CURRENT (VERIFIED).
- Training advanced expansion areas: PARTIALLY IMPLEMENTED.
- Chat: PARTIALLY IMPLEMENTED.
- Report: PARTIALLY IMPLEMENTED.
- Profile: PARTIALLY IMPLEMENTED.
- Comments: PARTIALLY IMPLEMENTED.
- Activity: PARTIALLY IMPLEMENTED.
- Food: PARTIALLY IMPLEMENTED.
- Weight: PARTIALLY IMPLEMENTED.
- Photo & Measurements: PARTIALLY IMPLEMENTED.
- Food/Activity/Weight/Photos-Measurements/Analytics/Notifications: PLANNED or PARTIALLY IMPLEMENTED (module-dependent).
- Payments advanced integration: PLANNED.
- AI/OCR advanced integration: PLANNED.

## Ключевые Подтверждённые Факты Инфраструктуры и Операций

- Backend runtime в production остаётся онлайн за Nginx и PM2.
- Production PostgreSQL не открыт публично.
- S3-compatible private media flow и signed URL path проверены для операционных сценариев.
- HTTPS admin-panel и operational scope pgAdmin 9.18 подтверждены.

## Известные Ограничения и Deferred-Пункты

- Часть проверок auth/security hardening остаётся partially verified.
- Усиление CSRF token: DEFERRED.
- Усиление pgAdmin 2FA/MFA: DEFERRED.
- Автоматизация backup и verified restore workflow: PARTIALLY IMPLEMENTED.

## Состояние Закрытия Foundation Remediation

Статус: COMPLETED WITH DOCUMENTED LIMITATIONS

Подтверждённое состояние закрытия:

1. Closed foundation items remain closed.
2. F1-SEC-01 remains PARTIALLY VERIFIED (production email-failure scenario gap).
3. F1-NV-01 remains FIXED/VERIFIED.
4. F1-NV-02 remains VERIFIED.
5. F1-NV-03 remains FIXED/VERIFIED with documented admin-scope limits.
6. CSRF enhancement remains DEFERRED.
7. pgAdmin 2FA/MFA remains DEFERRED.
8. Текущие заблокированные пункты: 0.

## Индекс Канонических Документов

### Каноническая Архитектура

- `docs/ARCHITECTURE/ARCHITECTURE.md`
- `docs/ARCHITECTURE/PLATFORM.md`
- `docs/ARCHITECTURE/APP_STRUCTURE.md`
- `docs/ARCHITECTURE/LAYOUT.md`

### Канонические Системы

- `docs/SYSTEMS/AUTH.md`
- `docs/SYSTEMS/DATABASE.md`
- `docs/SYSTEMS/SERVER.md`
- `docs/SYSTEMS/MEDIA.md`
- `docs/SYSTEMS/SECURITY.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEMS/PAYMENTS.md`
- `docs/SYSTEMS/COACH_CLIENT_RELATIONSHIP.md`

### Planned Системы (Следующие Канонические Шаги)

- На этом шаге не запланированы дополнительные системные документы Phase 2B.

### Контекст Product/Module и Flow

- `docs/modules/*`
- `docs/modules/HOME.md`
- `docs/modules/PROFILE.md`
- `docs/modules/COMMENTS.md`
- `docs/modules/CHAT.md`
- `docs/modules/REPORT.md`
- `docs/modules/ACTIVITY.md`
- `docs/modules/FOOD.md`
- `docs/modules/WEIGHT.md`
- `docs/modules/PHOTO_AND_MEASUREMENTS.md`
- `docs/modules/ANALYTICS.md`
- `docs/modules/LIBRARY.md`
- `docs/modules/NOTIFICATIONS.md`
- `docs/modules/Training/TRAINING.md`
- `docs/modules/Training/TRAINING_DATA_MODEL.md`
- `docs/modules/Training/TRAINING_UI.md`
- `docs/modules/Training/TRAINING_API.md`
- `docs/modules/Training/TRAINING_TEMPLATES.md`
- `docs/flows/CLIENT_LIFECYCLE.md`
- `docs/flows/COACH_LIFECYCLE.md`

### Process / Roadmap / Decisions

- `docs/PROCESS/*`
- `docs/ROADMAP/*`
- `docs/DECISIONS/*`
- `docs/DECISIONS/TRAINING_2_0_DECISIONS.md`
- `docs/PROCESS/AGENTS.md`
- `docs/PROCESS/CODING_RULES.md`
- `docs/PROCESS/DESIGN_SYSTEM.md`
- `docs/PROCESS/DEVELOPMENT_RULES.md`
- `docs/PROCESS/WORKFLOW.md`
- `docs/ROADMAP/ROADMAP.md`
- `docs/DECISIONS/ARCHITECTURE_DECISIONS.md`

### Доказательная База Audit и Foundation

- `docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md`
- `docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`
- `docs/AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md`

## Примечания По Управлению

- Этот файл является обзором/индексом, а не самым глубоким источником по каждому домену.
- Канонические детали находятся в связанных доменных документах.
- Утверждения о production state должны оставаться evidence-based и использовать только verified statuses.
