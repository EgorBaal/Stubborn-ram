# CHANGELOG.md

# История изменений Stubborn Ram

Версия документа: 1.1  
Дата обновления: сентябрь 2026

---

# 2026-09 — Архитектурная миграция и стабилизация

## Архитектура

Зафиксирован переход от текущей Supabase-ориентированной инфраструктуры к целевой архитектуре:

```text
React / PWA
↓
Services
↓
Backend API
↓
PostgreSQL + Object Storage
↓
Server-side integrations
```

Backend становится центральной точкой для:

- authentication;
- authorization;
- permissions;
- business logic;
- database access;
- file access;
- external integrations.

---

## Infrastructure

Определен целевой инфраструктурный стек:

- российский Cloud Server;
- Managed PostgreSQL;
- Object Storage;
- CDN;
- DNS.

На стартовом этапе не добавляются без необходимости:

- Kubernetes;
- Redis;
- отдельный message broker;
- микросервисная архитектура.

---

## Database

Зафиксирован переход на PostgreSQL как основную целевую базу.

Frontend не подключается к PostgreSQL напрямую.

Изменения схемы выполняются через документированный migration process.

Актуальная архитектура данных описывается в:

```text
DATABASE_SCHEMA.md
```

---

## Storage

Зафиксирован Object Storage как основное хранилище пользовательских:

- фотографий;
- видео;
- документов;
- Chat media;
- Training media.

Пользовательские файлы приватны по умолчанию.

Доступ к ним предоставляется через Backend API после проверки permissions.

---

## Backend

Зафиксирована собственная Backend API архитектура.

Backend отвечает за:

- authentication;
- authorization;
- permissions;
- business logic;
- PostgreSQL;
- Object Storage;
- Chat;
- Email;
- AI/OCR;
- Payments;
- audit log;
- rate limiting.

---

## Chat

Подтверждено, что Chat остается частью Stubborn Ram.

Целевая модель:

```text
Chat UI
↓
chatService
↓
Backend / WebSocket
↓
PostgreSQL + Object Storage
```

Внешний realtime provider не является обязательным.

---

## Video

Зафиксирована server-side обработка видео через FFmpeg.

На первом этапе worker может работать на том же сервере, что и Backend.

При росте нагрузки worker может быть вынесен отдельно без изменения frontend-контрактов.

---

## External providers

Зафиксирован принцип provider adapters.

Email, AI/OCR, Payments, Storage и другие внешние сервисы подключаются через server-side service/adapter.

Бизнес-модули не должны зависеть от конкретного поставщика.

---

## Security

Актуализированы правила:

- server-side permission checks;
- least privilege;
- отсутствие secrets во frontend;
- приватный Object Storage;
- audit log;
- rate limiting;
- backups;
- security notifications;
- re-authentication для критических действий;
- будущая 2FA/MFA.

---

## Personal Data

Зафиксировано требование учитывать российское законодательство о персональных данных.

Основные пользовательские данные целевой инфраструктуры размещаются в российском регионе.

Для каждого внешнего provider необходимо отдельно проверять:

- географию обработки;
- условия обработки данных;
- договорные условия;
- трансграничную передачу;
- retention.

---

## Migration

Зафиксирован принцип поэтапного переезда:

```text
Backup
↓
Target Infrastructure
↓
Data Migration
↓
Verification
↓
Production Switch
↓
Rollback Window
↓
Decommission Old Infrastructure
```

Старая инфраструктура не удаляется до завершения проверки target.

Цель — выполнить один устойчивый переезд и после него продолжить разработку приложения.

---

# 2026-08 — Архитектурная база продукта

## Product

Зафиксирована концепция Stubborn Ram как единой платформы для онлайн-сопровождения клиентов тренером.

Основные направления:

- Client Cabinet;
- Coach Cabinet;
- Training;
- Food;
- Activity;
- Reports;
- Photos/Measurements;
- Weight;
- Chat;
- Analytics;
- Notifications;
- Payments.

---

## Ownership

Зафиксирован принцип:

> Пользователь владеет своими данными.

Тренер получает доступ через coach-client relationship и permissions.

Данные не копируются специально для тренера.

---

## Coach-Client Relationship

Coach-client relationship определена как самостоятельная сущность.

Поддерживаются:

- ACTIVE;
- ARCHIVED.

Архивирование не удаляет историю пользователя.

---

## Permissions

Зафиксирована action-based permission model.

Permissions вычисляются динамически с учетом:

- системного уровня;
- ownership;
- authorship;
- relationship;
- состояния объекта;
- конкретного действия.

Серверная проверка обязательна.

---

## Canonical Data

Зафиксирован принцип единственного источника истины для каждого бизнес-модуля.

Другие модули используют данные через API/reference, а не независимые копии.

---

## Modular Frontend

Зафиксирована модульная frontend-архитектура.

Основные разделы находятся в:

```text
src/modules/
```

Каждый модуль имеет собственную Page, CSS и локальные компоненты.

AppLayout и BottomTabBar являются общим shell.

---

## Mobile First / PWA

Зафиксировано развитие Stubborn Ram как mobile-first web application с PWA.

---

# 2026-08 — Основные продуктовые модули

## Training

Утверждена модель:

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Exercise использует отдельный `exercise_id`.

Поддерживаются:

- system exercises;
- personal exercises;
- media;
- feedback;
- history;
- coach access;
- Chat references.

Ограничения Training media:

- максимум 8 видео на тренировку;
- максимум 45 секунд на видео;
- compression;
- удаление оригинала после успешной обработки.

---

## Food

Утверждено разделение:

```text
Plan
Fact
```

Основные показатели:

- calories;
- protein;
- fat;
- carbohydrates;
- water;
- salt.

Поддерживаются:

- manual input;
- FatSecret import;
- AI screenshot import;
- plan history;
- daily overrides;
- analytics.

---

## Activity

Утверждена календарная модель активности.

Поддерживаются:

- steps;
- cardio;
- extra activity;
- daily goals;
- period goals.

Источники шагов могут включать:

- Apple Health;
- Health Connect;
- manual input.

---

## Weight

Утвержден отдельный Weight module.

Поддерживаются:

- daily calendar;
- multiple measurements per day;
- primary measurement;
- history;
- analytics.

---

## Photos and Measurements

Утверждена модель контрольной точки.

Поддерживаются:

- 4 базовые фотографии;
- дополнительные фотографии;
- видео;
- measurements;
- comments;
- calendar;
- comparison;
- face blur without AI.

Weight остается canonical source и не дублируется внутри этого модуля.

---

## Reports

Reports являются самостоятельной сущностью для регулярного контроля клиента и обратной связи тренера.

---

## Chat

Утверждена модель одного основного чата на coach-client relationship.

Поддерживаются:

- text;
- voice;
- photo;
- video;
- documents;
- object references;
- replies;
- search;
- drafts;
- sent/read states.

---

## Home

Home определен как навигационный центр приложения.

Основные модули:

- Training;
- Food;
- Activity;
- Report;
- Photos/Measurements;
- Weight.

Основная навигация:

- Home;
- Library;
- Chat;
- Analytics;
- Profile.

---

# Правило CHANGELOG

CHANGELOG фиксирует завершенные и архитектурно значимые изменения.

Он не заменяет:

- PROJECT_CONTEXT.md;
- ARCHITECTURE.md;
- DATABASE_SCHEMA.md;
- SECURITY.md;
- ROADMAP.md.

Если изменение является текущим архитектурным решением, оно должно быть отражено в соответствующем архитектурном документе.

CHANGELOG содержит историю, а не является источником текущего состояния системы.
