# ПЛАН ПРОВЕРКИ И ФИНАЛИЗАЦИИ ДОКУМЕНТАЦИИ STUBBORN RAM

**Назначение файла**

Этот файл фиксирует порядок совместной проверки документации проекта после реорганизации `docs`.

Основные источники:

1. `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md` — основной baseline текущего состояния проекта.
2. `docs_archive/` — исходная версия документации до реорганизации, используется для восстановления утраченного содержимого.
3. `docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md` — подробная forensic-база.
4. `docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md` — история проверок, исправлений и их верификации.
5. `docs/AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md` — scope, решения, этапы и deferred-элементы.
6. `docs_archive/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` — старый образец структуры и степени детализации `System State`, но не источник актуального состояния.

---

# 1. ГЛАВНОЕ ПРАВИЛО ПРОВЕРКИ

Для каждого домена используем тройную сверку:

`Старый документ → Текущий канонический документ → SYSTEM_STATE_FINAL`

И отдельно учитываем сведения из `AUDIT`/`FOUNDATION`/`REMEDIATION`, когда нужно установить последнее фактически подтверждённое состояние.

Ничего не считать потерянным или устаревшим только по названию файла.

---

# 2. РЕЗУЛЬТАТ, КОТОРЫЙ НУЖНО ПОЛУЧИТЬ

Для каждого проверяемого документа определить:

- что было в старой версии;
- что осталось в новой;
- что было объединено;
- что было изменено;
- что было сокращено;
- что было удалено;
- что необходимо вернуть;
- что является новым и корректным;
- что является дубликатом;
- что должно остаться в архиве;
- что можно удалить после подтверждения.

Особенно сохранять уникальное содержательное описание:

- визуальные решения;
- структуру экранов;
- блоки интерфейса;
- click/tap-поведение;
- переходы;
- открытия экранов и окон;
- состояния UI;
- пользовательские сценарии;
- бизнес-логику;
- связи между сущностями;
- зависимости;
- planned/deferred-поведение;
- продуктовые принципы.

Не сокращать такие сведения только ради уменьшения размера документа.

---

# 3. ФОРМАТ ПРОВЕРКИ КАЖДОГО ПАКЕТА

Для каждого домена использовать схему:

## Старые документы
Какие файлы относятся к домену в `docs_archive`.

## Текущие документы
Какие файлы относятся к домену в `docs`.

## SYSTEM_STATE_FINAL
Какие актуальные факты должны быть отражены.

## AUDIT / REMEDIATION
Какие поздние подтверждения изменяют старое состояние.

## Сравнение
- ✅ сохранено;
- ⚠️ изменено;
- ❌ потеряно;
- ➕ нужно вернуть;
- 🔀 нужно объединить;
- 🗑 можно удалить после переноса;
- ❓ требует отдельной проверки.

## Итог
Как должен выглядеть окончательный канонический документ.

---

# 4. ПОРЯДОК ПРОВЕРКИ

## ПАКЕТ 1 — ARCHITECTURE

### Старые

- `docs_archive/core/ARCHITECTURE.md`
- `docs_archive/architecture/PLATFORM_ARCHITECTURE.md`
- `docs_archive/PROJECT_STRUCTURE.md`
- `docs_archive/ARCHITECTURE_LAYOUT.md`
- `docs_archive/core/PROJECT_CONTEXT.md`

### Текущие

- `docs/architecture/ARCHITECTURE.md`
- `docs/architecture/PLATFORM.md`
- `docs/architecture/APP_STRUCTURE.md`
- `docs/architecture/LAYOUT.md`
- `docs/ARCHIVE/PROJECT_CONTEXT_LEGACY_2026-09-19.md`

### Проверить

- техническую архитектуру;
- модель платформы;
- frontend/backend структуру;
- layout;
- связи слоёв;
- Local/Production;
- архитектурные правила;
- что было объединено и что потеряно.

---

# 5. ПАКЕТ 2 — AUTH

### Старые

- `docs_archive/architecture/AUTH_ARCHITECTURE.md`

### Текущие

- `docs/SYSTEMS/AUTH.md`
- `docs/architecture/AUTH_ARCHITECTURE.md`

### Проверить

- registration;
- email verification;
- login;
- session restore;
- logout;
- password reset;
- resend;
- token lifecycle;
- session lifetime;
- cookies;
- ownership;
- current limitations;
- последние F1-SEC-01/02/03.

---

# 6. ПАКЕТ 3 — SECURITY + PERMISSIONS

### Старые

- `docs_archive/architecture/SECURITY.md`
- `docs_archive/architecture/PERMISSIONS_ARCHITECTURE.md`

### Текущие

- `docs/SYSTEMS/SECURITY.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/architecture/SECURITY.md`
- `docs/architecture/PERMISSIONS_ARCHITECTURE.md`

### Проверить

- authentication vs authorization;
- ownership;
- RBAC;
- session/cookie security;
- CSRF/CORS;
- rate limiting;
- SQL injection;
- XSS;
- secret handling;
- error leakage;
- media security;
- current deferred limitations.

---

# 7. ПАКЕТ 4 — DATABASE

### Старые

- `docs_archive/architecture/DATABASE_SCHEMA.md`

### Текущие

- `docs/SYSTEMS/DATABASE.md`
- `docs/architecture/DATABASE_SCHEMA.md`

### Проверить

- таблицы;
- связи;
- constraints;
- migrations;
- Local DB;
- Production DB;
- `5918` divergence;
- production inventory;
- current data model;
- что относится к Training, Auth, Media и другим системам.

---

# 8. ПАКЕТ 5 — SERVER + DEPLOYMENT + MEDIA

## SERVER

### Старые

- `docs_archive/SERVER/SERVER_STATE.md`
- `docs_archive/INFRASTRUCTURE_MIGRATION.md`
- `docs_archive/MIGRATION_ARCHITECTURE.md`

### Текущие

- `docs/SYSTEMS/SERVER.md`
- `docs/SERVER/SERVER_STATE.md`
- `docs/INFRASTRUCTURE_MIGRATION.md`
- `docs/MIGRATION_ARCHITECTURE.md`

### Проверить

- Selectel;
- Ubuntu;
- Nginx;
- PM2;
- Fastify;
- ports;
- domains;
- backend runtime;
- admin panel;
- pgAdmin;
- deployment;
- Local vs Production.

## MEDIA

### Старые

- `docs_archive/MEDIA.md`

### Текущие

- `docs/SYSTEMS/MEDIA.md`
- `docs/MEDIA.md`

### Проверить

- Object Storage;
- S3;
- bucket;
- signed URLs;
- upload;
- complete;
- download;
- delete;
- ownership;
- private access;
- DB ↔ S3 consistency;
- текущий Production baseline.

---

# 9. ПАКЕТ 6 — TRAINING

Training проверять отдельно и наиболее подробно.

### Старые

- `docs_archive/modules/Training/TRAINING.md`
- `docs_archive/modules/Training/TRAINING_2_0_DECISIONS.md`
- `docs_archive/modules/Training/TRAINING_TEMPLATES_SPEC.md`
- связанные сведения из:
  - `docs_archive/architecture/DATABASE_SCHEMA.md`
  - `docs_archive/ROADMAP.md`
  - `docs_archive/CURRENT_MVP.md`
  - `docs_archive/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`

### Текущие

- `docs/modules/Training/TRAINING.md`
- `docs/modules/Training/TRAINING_DATA_MODEL.md`
- `docs/modules/Training/TRAINING_UI.md`
- `docs/modules/Training/TRAINING_API.md`
- `docs/modules/Training/TRAINING_TEMPLATES.md`
- `docs/modules/Training/TRAINING_2_0_DECISIONS.md`
- `docs/modules/Training/TRAINING_SOURCE_LEGACY_2026-09-19.md`
- `docs/modules/Training/TRAINING_TEMPLATES_SPEC.md`
- `docs/DECISIONS/TRAINING_2_0_DECISIONS.md`

### Проверить

- Workout model;
- WorkoutExercise;
- WorkoutSet;
- history;
- create/update/delete;
- exercises;
- templates;
- materials;
- UI;
- визуальные решения;
- interaction;
- states;
- API;
- persistence;
- ownership;
- current verified status;
- что было потеряно при разделении старого `TRAINING.md`.

---

# 10. ПАКЕТ 7 — COACH / CLIENT + FLOWS

## Coach/Client

### Старые

- `docs_archive/modules/COACH_CLIENT_RELATIONSHIP.md`

### Текущие

- `docs/SYSTEMS/COACH_CLIENT_RELATIONSHIP.md`
- `docs/modules/COACH_CLIENT_RELATIONSHIP.md`

### Проверить

- system-level vs module-level содержание;
- relationship model;
- ownership;
- permissions;
- planned relationships;
- что оставить в `SYSTEMS`;
- что оставить в `modules`;
- где есть дубль.

## Flows

### Старые

- `docs_archive/flows/CLIENT_LIFECYCLE.md`
- `docs_archive/flows/COACH_LIFECYCLE.md`

### Текущие

- `docs/flows/CLIENT_LIFECYCLE.md`
- `docs/flows/COACH_LIFECYCLE.md`

### Проверить

- последовательность;
- связи;
- current vs planned steps;
- взаимодействие систем;
- потерю старых пользовательских сценариев.

---

# 11. ПАКЕТ 8 — PRODUCT MODULES

Каждый модуль проверять отдельно:

`старый → новый → SYSTEM_STATE_FINAL`

### Пары

- `ACTIVITY`
- `ANALYTICS`
- `CHAT`
- `COMMENTS` — нового старого аналога нет;
- `FOOD`
- `HOME`
- `LIBRARY`
- `NOTIFICATIONS`
- `PHOTO_AND_MEASUREMENTS`
- `PROFILE`
- `REPORT`
- `WEIGHT`

### Особое внимание

`FOOD`, `REPORT`, `CHAT`, `PROFILE`, `HOME` и другие документы проверять не только по фактической реализации, но и по сохранности продуктовой спецификации.

Placeholder/PLANNED не означает, что подробную спецификацию нужно удалять.

---

# 12. ПАКЕТ 9 — PROCESS

### Старые

- `docs_archive/core/AGENTS.md`
- `docs_archive/core/CODING_RULES.md`
- `docs_archive/core/DESIGN_SYSTEM.md`
- `docs_archive/core/DEVELOPMENT_RULES.md`
- `docs_archive/core/WORKFLOW.md`
- `docs_archive/internal/PROMPT_STRUCTURE.md`
- `docs_archive/internal/AI_HISTORY_v1.1.md`

### Текущие

- `docs/PROCESS/AGENTS.md`
- `docs/PROCESS/CODING_RULES.md`
- `docs/PROCESS/DESIGN_SYSTEM.md`
- `docs/PROCESS/DEVELOPMENT_RULES.md`
- `docs/PROCESS/WORKFLOW.md`
- `docs/internal/PROMPT_STRUCTURE.md`
- `docs/internal/AI_HISTORY_v1.1.md`
- `docs/DOCS_UPDATE_MAP.md`

### Проверить

- правила разработки;
- правила работы с AI/Copilot;
- coding rules;
- design system;
- workflow;
- документационный workflow;
- что осталось дублем;
- что должно быть в `PROCESS`, а что в `internal`.

---

# 13. ПАКЕТ 10 — ROADMAP

### Старые

- `docs_archive/ROADMAP.md`
- `docs_archive/CURRENT_MVP.md`
- `docs_archive/STUBBORN_RAM_IMPLEMENTATION_PLAN.md`

### Текущие

- `docs/ROADMAP/ROADMAP.md`
- `docs/CURRENT_MVP.md`
- `docs/STUBBORN_RAM_IMPLEMENTATION_PLAN.md`

### Проверить

- Foundation closure;
- current product roadmap;
- MVP boundaries;
- planned modules;
- deferred items;
- что относится к текущему roadmap;
- что является историческим планом.

После проверки определить, что должно остаться в `ROADMAP`, а что перейти в `ARCHIVE`.

---

# 14. ПАКЕТ 11 — DECISIONS

### Старые

- `docs_archive/architecture/ARCHITECTURE_DECISIONS.md`
- `docs_archive/modules/Training/TRAINING_2_0_DECISIONS.md`

### Текущие

- `docs/DECISIONS/ARCHITECTURE_DECISIONS.md`
- `docs/DECISIONS/TRAINING_2_0_DECISIONS.md`
- `docs/modules/Training/TRAINING_2_0_DECISIONS.md`

### Проверить

- настоящие decision records;
- rationale;
- consequences;
- что является просто описанием системы;
- дубль Training decisions;
- что оставить в `DECISIONS`.

---

# 15. ПАКЕТ 12 — SYSTEM STATE

### Старый образец

- `docs_archive/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`

### Текущий

- `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`

### Главный новый baseline

- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`

### Проверить

`SYSTEM_STATE_FINAL` должен оставаться главным кратким актуальным обзором:

- как запускается проект;
- Local;
- Production;
- domains;
- localhost;
- API;
- Backend;
- Frontend;
- PostgreSQL;
- Object Storage;
- Auth;
- Security;
- Training;
- Media;
- PWA;
- production infrastructure;
- developer workflow;
- current module status;
- limitations;
- связи между основными слоями.

Он не должен превращаться в полную энциклопедию каждого модуля.

---

# 16. ПАКЕТ 13 — LEGACY / ROOT / ARCHIVE CLEANUP

После содержательной проверки:

- `CHANGELOG.md`
- `CURRENT_MVP.md`
- `DOCS_UPDATE_MAP.md`
- `INFRASTRUCTURE_MIGRATION.md`
- `MEDIA.md`
- `MIGRATION_ARCHITECTURE.md`
- `STUBBORN_RAM_IMPLEMENTATION_PLAN.md`
- `AUTH_DOLGS.md`
- `SERVER_STATE.md`
- старые документы в `core/`
- старые документы в `architecture/`

Для каждого принять решение:

`оставить / перенести / объединить / архивировать / удалить`

Ничего не удалять до завершения соответствующей содержательной проверки.

---

# 17. ОТДЕЛЬНЫЕ ПРАВИЛА ДЛЯ AUDIT

Файлы:

- `PROJECT_FULL_AUDIT_2026-09-19.md`
- `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`
- `PROJECT_REMEDIATION_ROADMAP_2026-09-19.md`

не переписывать в рамках обычной проверки модулей.

Они являются:

- доказательной базой;
- историей проверок;
- историей исправлений;
- источником provenance;
- источником remediation status.

Если внутри них встречается старое состояние, всегда искать более позднюю подтверждённую запись внутри этих же документов.

---

# 18. ПРАВИЛА ПРИ КОНФЛИКТАХ

При конфликте:

1. Более позднее подтверждённое runtime/code/DB evidence имеет приоритет.
2. Remediation closure имеет приоритет над более ранним audit finding, если предмет действительно был исправлен и подтверждён.
3. Planned не считать implemented.
4. Deferred не считать open defect.
5. Historical не считать current.
6. Если доказательств недостаточно — не угадывать.

---

# 19. ФИНАЛЬНАЯ ЦЕЛЬ

После завершения всех пакетов должно получиться:

`docs/`

— без файлов в корне;

— с чётким разделением по смыслу:

- `ARCHITECTURE/`
- `AUDIT/`
- `ARCHIVE/`
- `DECISIONS/`
- `FLOWS/`
- `PROCESS/`
- `ROADMAP/`
- `SYSTEMS/`
- `SYSTEM_STATE/`
- `internal/`
- `modules/`

А внутри каждого раздела:

**один канонический документ на один домен**, если отдельное разделение действительно оправдано.

---

# 20. ПОРЯДОК НАШЕЙ СОВМЕСТНОЙ РАБОТЫ

Работа идёт пакетами.

Для каждого пакета:

1. Пользователь передаёт старые и текущие документы.
2. Полностью читаем документы.
3. Сверяем содержимое со `SYSTEM_STATE_FINAL`.
4. Учитываем поздние Audit/Remediation факты.
5. Строим таблицу потерь/изменений/дубликатов.
6. Определяем, что вернуть в canonical document.
7. Определяем, что оставить как archive/legacy.
8. Только после этого изменяем файл.
9. После изменения повторно проверяем результат.

Не переходить к следующему крупному пакету, пока текущий не разобран.

---

# 21. ПЕРВЫЙ ПАКЕТ ДЛЯ РАБОТЫ

Начать с:

**ARCHITECTURE**

Сопоставить:

`docs_archive/core/ARCHITECTURE.md`
`docs_archive/architecture/PLATFORM_ARCHITECTURE.md`
`docs_archive/PROJECT_STRUCTURE.md`
`docs_archive/ARCHITECTURE_LAYOUT.md`
`docs_archive/core/PROJECT_CONTEXT.md`

с:

`docs/architecture/ARCHITECTURE.md`
`docs/architecture/PLATFORM.md`
`docs/architecture/APP_STRUCTURE.md`
`docs/architecture/LAYOUT.md`

и сверить всё с:

`docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`

После завершения этого пакета перейти к AUTH.
