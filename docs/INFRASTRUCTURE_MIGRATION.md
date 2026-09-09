# INFRASTRUCTURE_MIGRATION.md

# Миграция инфраструктуры Stubborn Ram

Версия: 1.0
Статус: утверждено
Дата: сентябрь 2026

---

# 1. НАЗНАЧЕНИЕ

Документ является единой картой перехода Stubborn Ram с текущей инфраструктуры Supabase на целевую архитектуру проекта.

Документ фиксирует:

- целевую инфраструктуру;
- последовательность миграции;
- порядок подготовки платформы;
- зависимости между этапами;
- проверки;
- rollback;
- условия отключения старой инфраструктуры.

Документ используется как источник истины для этапа Infrastructure Migration.

Новая feature-разработка не должна выполняться вместо необходимых миграционных этапов.

---

# 2. ТЕКУЩЕЕ СОСТОЯНИЕ

Текущая система использует Supabase как legacy-инфраструктуру.

Supabase сохраняется до полного завершения миграции и rollback window.

До этого момента старая инфраструктура не удаляется.

---

# 3. ЦЕЛЕВАЯ АРХИТЕКТУРА

Целевая схема:

```text
Stubborn Ram Frontend
        ↓
    Backend API
        ↓
 ┌───────────────┐
 │ PostgreSQL    │
 │ Object Storage│
 │ Workers       │
 └───────────────┘
```

Основные сервисы:

- Selectel Cloud Server — Backend API и первоначально worker;
- Selectel Managed PostgreSQL — основная база данных;
- Selectel Object Storage / S3 — пользовательские файлы;
- Selectel CDN — доставка медиа;
- Selectel DNS — DNS;
- Unisender Go — transactional email;
- Yandex AI — AI/OCR;
- собственный WebSocket backend — Chat;
- YooKassa или T-Bank — платежи на будущем этапе.

Redis, Kubernetes и отдельные микросервисы на начальном этапе не используются.

---

# 4. ГЛАВНЫЕ АРХИТЕКТУРНЫЕ ПРИНЦИПЫ

1. Frontend не обращается напрямую к PostgreSQL.
2. Frontend не имеет секретов инфраструктуры.
3. Backend API является основной точкой доступа к данным.
4. Пользовательские файлы хранятся в приватном Object Storage.
5. Доступ к приватным файлам предоставляется через backend/signed URLs.
6. Пользователь остаётся владельцем своих данных.
7. Доступ тренера определяется relationship и permissions.
8. Объекты системы существуют в единственном экземпляре.
9. Внешние сервисы подключаются через service/adapter layer.
10. Миграция выполняется поэтапно, с возможностью rollback.
11. Старая инфраструктура не удаляется до завершения rollback window.
12. Не выполняется массовая перепись frontend только ради смены backend.

---

# 5. УТВЕРЖДЁННАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ МИГРАЦИИ

## Этап 1. Подготовка инфраструктуры

Создать и настроить:

- Selectel Cloud Server;
- Managed PostgreSQL;
- Object Storage;
- CDN;
- DNS.

На этом этапе production продолжает работать на текущей инфраструктуре.

**Результат:**

целевая инфраструктура существует и доступна для staging.

---

## Этап 2. Backup текущей системы

Перед переносом данных:

1. создать полный backup Supabase;
2. проверить, что backup пригоден для восстановления;
3. сохранить информацию, необходимую для rollback.

**Запрещено удалять или отключать Supabase.**

**Результат:**

существует проверенная точка восстановления.

---

## Этап 3. Подготовка целевой PostgreSQL

Создать физическую схему целевой PostgreSQL на основании утверждённой `DATABASE_SCHEMA.md`.

Последовательность:

```text
DATABASE_SCHEMA.md
↓
Approved physical schema
↓
Migrations
↓
Selectel PostgreSQL
```

Не изменять production database ради удобства текущего frontend-кода.

**Результат:**

целевая PostgreSQL готова принимать данные.

---

## Этап 4. Backend Foundation

Создать основу собственного Backend API.

Backend должен обеспечить:

- конфигурацию;
- database access;
- API routing;
- authentication foundation;
- authorization foundation;
- validation;
- error handling;
- logging;
- secrets management;
- health checks.

Frontend начинает использовать service layer для обращения к Backend API.

**Результат:**

существует стабильная серверная основа целевой платформы.

---

## Этап 5. Authentication

Перенести authentication на целевой Backend.

Целевой flow:

```text
Landing
↓
Registration
↓
Email Verification
↓
Profile
↓
Welcome Flow
↓
Home
```

Требования:

- один аккаунт на пользователя;
- стабильный `user_id`;
- подтверждение email;
- persistent sessions;
- password reset;
- профиль после подтверждения email.

Email provider:

Unisender Go.

**Результат:**

пользователь может безопасно зарегистрироваться, подтвердить email, войти и восстановить доступ.

---

## Этап 6. Relationships + Permissions

После authentication переносится модель:

```text
User
↓
Coach Relationship
↓
ACTIVE / ARCHIVED
↓
Permissions
```

Проверяются:

- ownership;
- active relationship;
- archived relationship;
- разрешённые действия;
- запрещённые действия;
- server-side permission checks.

**Результат:**

сервер корректно определяет, кто и какие данные может видеть/изменять.

---

## Этап 7. Reports + Media

Перенести Reports и Media.

Reports:

- PostgreSQL — metadata и состояние;
- Object Storage — media;
- Backend — access control.

Media:

```text
Upload
↓
Backend validation
↓
Private S3
↓
Signed URL
```

Не использовать публичные URL для приватных пользовательских файлов.

Для видео используется FFmpeg worker.

**Результат:**

отчёты и пользовательские файлы сохраняются в целевой инфраструктуре.

---

## Этап 8. Chat

Перенести Chat на:

```text
Frontend
↓
Backend WebSocket
↓
PostgreSQL
+
Object Storage
```

Сообщения сохраняются в PostgreSQL.

Файлы сохраняются в Object Storage.

Прикреплённые объекты платформы являются ссылками на существующие объекты, а не копиями.

**Результат:**

чат работает на собственной серверной инфраструктуре.

---

## Этап 9. Training и остальные модули

После стабильной базовой платформы постепенно переводятся:

- Training;
- Food;
- Activity;
- Weight;
- Photos & Measurements;
- Progress;
- другие модули.

Перенос выполняется модульно.

Не выполнять массовую перепись независимых разделов одновременно.

**Результат:**

основные модули работают через целевой Backend API и canonical data.

---

# 6. STAGING

До переключения production необходимо создать staging-сценарий.

Проверяются:

## Authentication

- registration;
- email verification;
- login;
- logout;
- persistent session;
- password reset.

## Data

- create;
- read;
- update;
- delete;
- refresh;
- повторный вход.

## Coach access

- ACTIVE;
- ARCHIVED;
- ownership;
- permissions.

## Media

- upload;
- processing;
- preview;
- private access;
- signed URL;
- retention/deletion rules.

## Chat

- send;
- read;
- reply;
- media;
- object references.

## UI

- mobile;
- desktop;
- PWA;
- routing;
- loading;
- error;
- empty states.

---

# 7. ПРОВЕРКА ПЕРЕД PRODUCTION

Перед переключением необходимо подтвердить:

- данные перенесены корректно;
- количество и целостность объектов проверены;
- authentication работает;
- permissions работают;
- relationships работают;
- private media работает;
- signed URLs работают;
- chat работает;
- email работает;
- AI integrations, если уже подключены, работают;
- frontend работает через Backend API;
- secrets отсутствуют во frontend;
- `npm run build` проходит;
- критических ошибок нет.

---

# 8. PRODUCTION SWITCH

После успешной staging-проверки:

```text
stubbornram.ru
      ↓
Target infrastructure
```

DNS переключается только после подтверждения готовности.

Старая Supabase-инфраструктура остаётся доступной.

---

# 9. ROLLBACK WINDOW

После production switch начинается rollback window.

В этот период необходимо:

- наблюдать за ошибками;
- проверять authentication;
- проверять сохранение данных;
- проверять media;
- проверять chat;
- проверять критические пользовательские сценарии.

При обнаружении критической проблемы:

```text
Target infrastructure
↓
Rollback
↓
Previous infrastructure
```

Supabase не удаляется до окончания rollback window.

---

# 10. DECOMMISSION

После завершения rollback window и подтверждения стабильности:

1. сделать финальный backup;
2. подтвердить отсутствие зависимости production от Supabase;
3. проверить отсутствие старых Supabase references в production;
4. отключить legacy integration;
5. только после этого деcommission Supabase.

Удаление старой инфраструктуры является отдельным завершённым этапом.

---

# 11. ПОРЯДОК В РАЗРАБОТКЕ

Нельзя перескакивать через критические зависимости.

Основная последовательность:

```text
Architecture
↓
Infrastructure
↓
Backup
↓
PostgreSQL
↓
Backend Foundation
↓
Authentication
↓
Relationships / Permissions
↓
Reports / Media
↓
Chat
↓
Training
↓
Other modules
↓
Staging
↓
Verification
↓
Production
↓
Rollback Window
↓
Decommission Supabase
```

Feature-разработка может продолжаться только в пределах, которые не конфликтуют с текущим миграционным этапом.

---

# 12. ЧТО НЕ ДЕЛАЕМ НА ПЕРВОМ ЭТАПЕ

Не создаём:

- Kubernetes;
- Redis;
- отдельные микросервисы;
- сложный message broker;
- отдельную инфраструктуру только ради будущей нагрузки;
- второй frontend;
- массовую перепись всех модулей.

Архитектура должна оставаться простой до появления реальной необходимости масштабирования.

---

# 13. ПРАВИЛО НОВЫХ ВНЕШНИХ СЕРВИСОВ

Каждый новый сервис должен быть предварительно проверен по:

- необходимости;
- обработке данных;
- физическому хранению данных;
- API/contract;
- стоимости;
- ограничениям;
- возможности замены provider;
- юридическим требованиям.

После утверждения интеграция выполняется через соответствующий service/adapter.

---

# 14. КРИТЕРИИ ЗАВЕРШЕНИЯ МИГРАЦИИ

Миграция считается завершённой, если:

- целевая инфраструктура работает;
- данные находятся в целевой PostgreSQL;
- пользовательские файлы находятся в целевом Object Storage;
- Backend API является основной точкой доступа;
- authentication работает;
- permissions работают;
- relationships работают;
- Reports/Media работают;
- Chat работает;
- критические пользовательские сценарии проверены;
- build проходит;
- production работает стабильно;
- rollback window завершён;
- Supabase больше не является production dependency;
- документация соответствует реализации;
- CHANGELOG обновлён.

---

# 15. ТЕКУЩАЯ ТОЧКА

На момент утверждения документа:

```text
Документация
     ↓
     ✅
     ↓
Целевая архитектура
     ↓
     ✅
     ↓
Подготовка инфраструктуры
     ↓
     ← МЫ ЗДЕСЬ
```

**Следующее действие:**

Подготовить инфраструктуру Selectel.

После этого двигаться строго по данному документу.

---

# 16. СВЯЗАННЫЕ ДОКУМЕНТЫ

Основные документы:

- `AGENTS.md`
- `ARCHITECTURE.md`
- `PROJECT_CONTEXT.md`
- `PROJECT_STRUCTURE.md`
- `DATABASE_SCHEMA.md`
- `AUTH_ARCHITECTURE.md`
- `PERMISSIONS_ARCHITECTURE.md`
- `SECURITY.md`
- `COACH_CLIENT_RELATIONSHIP.md`
- `CHAT.md`
- `REPORT.md`
- `MEDIA.md`
- `PAYMENT_ARCHITECTURE.md`
- `ROADMAP.md`
- `WORKFLOW.md`
- `CODING_RULES.md`
- `DEVELOPMENT_RULES.md`
- `DESIGN_SYSTEM.md`
- `PLATFORM_ARCHITECTURE.md`
- `CHANGELOG.md`

---

# ГЛАВНЫЙ ПРИНЦИП

Не начинать миграцию с переписывания frontend.

Сначала создаётся надёжная целевая инфраструктура.

Затем данные и backend.

Затем модули.

Затем staging.

Затем production.

Старая инфраструктура удаляется последней.

Цель — выполнить один контролируемый переход и не создавать необходимость повторной миграции.
