# Модель платформы Stubborn Ram

Версия: 2.0  
Статус: CURRENT — каноническая platform model с отдельно отмеченной runtime-зрелостью  
Последнее обновление: 2026-09-20

---

# 1. Назначение документа

Этот документ является канонической моделью платформы Stubborn Ram.

Он определяет:

- кто является основной сущностью платформы;
- как соотносятся User, Client, Coach и Admin;
- кому принадлежат данные;
- как разделяются Authentication, Access и Permissions;
- как моделируются coach-client relationships;
- какие общие product/domain boundaries должны сохраняться при развитии платформы.

Документ не является runtime-аудитом реализации. Фактическая степень готовности конкретных функций определяется `SYSTEM_STATE` и специализированными system/module documents.

---

# 2. Главный принцип платформы

Stubborn Ram — единая платформа, в которой один User account может использовать разные контексты без создания отдельных аккаунтов для каждой роли.

Один пользователь потенциально может:

- использовать платформу самостоятельно;
- быть клиентом тренера;
- в будущем быть тренером;
- иметь одновременно личные и связанные с coach-client данные;
- менять context использования без потери истории.

Роль в одном сценарии не должна превращаться в жёсткий тип отдельного аккаунта.

---

# 3. User как основная сущность

Основная сущность платформы — `User`.

Концептуально User объединяет:

- `user_id`;
- credentials;
- profile;
- пользовательские данные;
- историю;
- access sources;
- связи с другими пользователями;
- настройки.

Одна учётная запись должна оставаться единой независимо от того, используется ли она в personal, client или coach context.

---

# 4. Client, Coach и Admin

## 4.1 Client / User

Client — context, в котором User использует платформу для собственных данных и сопровождения.

## 4.2 Coach

Coach — context, в котором тот же User получает возможность сопровождать других пользователей.

Для Coach не требуется отдельный аккаунт.

## 4.3 Admin

Admin — системный административный context над обычным User account.

Admin не должен рассматриваться как отдельная сущность с отдельными пользовательскими credentials.

Административные действия выполняются через Backend и server-side permission checks.

Admin не получает доступ к пользовательским паролям.

---

# 5. Ownership

Каноническое правило:

```text
User owns data
  ↓
Coach / Client relationship
  ↓
Permissioned access
```

Тренер не становится владельцем данных клиента только потому, что получил к ним доступ.

Например:

```text
Workout
owner = Client

Coach
role = collaborator / reviewer / viewer
```

Конкретные права определяются отдельной permission model.

Архитектурное следствие:

> совместная работа не должна создавать неконтролируемые независимые копии canonical data.

---

# 6. Author, Owner, Viewer, Collaborator

Платформа должна уметь различать разные отношения пользователя с объектом:

- `owner`;
- `author`;
- `viewer`;
- `collaborator`;
- другие object-specific roles, когда это необходимо.

Нельзя сводить все эти понятия к одному универсальному `user_id`.

Пример:

```text
Workout
owner = Client
author = Client
coach = collaborator
```

Другой объект:

```text
Report
owner = Client
author = Client
coach = reviewer
```

Эта модель оставляет пространство для нескольких специалистов и разных типов совместной работы.

---

# 7. Authentication, Access и Permissions

Это три разные архитектурные сущности.

## 7.1 Authentication

Отвечает на вопрос:

> Кто этот пользователь?

Authentication включает:

- registration;
- Email verification;
- password;
- session;
- password recovery;
- logout текущей сессии.

Текущие core authentication flows в runtime подтверждены отдельно в `SYSTEM_STATE`.

## 7.2 Access

Отвечает на вопрос:

> Имеет ли пользователь полный доступ к платформе сейчас?

Архитектурная модель использует отдельные источники access.

## 7.3 Permissions

Отвечает на вопрос:

> Может ли этот пользователь выполнить конкретное действие над конкретным объектом?

Примеры:

```text
training.create
training.read
training.update
report.create
report.read
chat.send
media.upload
```

Общее правило:

```text
Authentication ≠ Access ≠ Permissions
```

---

# 8. Источники полного Access

Архитектурная product model предусматривает полный access при наличии хотя бы одного активного источника:

```text
Trial
   OR
Personal Subscription
   OR
Coach Subscription + Active Relationship
        ↓
    Full Access
```

### Важно о статусе реализации

Этот раздел фиксирует утверждённую модель продукта, а не означает, что все связанные payment/access subsystems уже реализованы в runtime.

Фактическая production-зрелость Payments, subscription automation, trainer/client relationship и RBAC должна проверяться по `SYSTEM_STATE`.

---

# 9. Trial policy

Утверждённая модель Trial:

- предоставляется один раз;
- длительность — 10 календарных дней;
- не перезапускается при смене устройства;
- не перезапускается при повторном входе;
- не является постоянной подпиской.

Архитектурная модель предусматривает начало Trial после выполнения предусмотренных onboarding conditions, включая подтверждение Email и создание профиля.

Runtime enforcement этой полной модели не следует считать подтверждённым только по данному документу.

---

# 10. Personal и Coach Subscription

## Personal Subscription

Модель продукта:

- один календарный месяц;
- автоматического продления на текущем этапе не предусмотрено;
- после окончания access пересчитывается;
- исторические данные сохраняются.

## Coach Subscription

Модель продукта:

- coach subscription является отдельным source of access;
- клиентский доступ зависит от active coach-client relationship;
- для coach access предусмотрен grace period 72 часа.

Payment implementation и фактический runtime status описываются в специализированной payment documentation и `SYSTEM_STATE`.

---

# 11. Ограниченный доступ

При отсутствии всех источников полного access архитектурная модель не требует удаления аккаунта.

Сохраняются как минимум:

- вход в аккаунт;
- просмотр истории;
- просмотр ранее созданных данных;
- управление аккаунтом;
- возможность восстановить полный access.

Создание новых данных, требующих full access, может быть ограничено access policy.

Критически важно:

> окончание Trial или subscription не является основанием для автоматического удаления пользовательской истории.

---

# 12. User data lifecycle

История пользователя должна сохраняться независимо от изменения access source.

К основным историческим данным относятся:

- Training;
- Food;
- Weight;
- Measurements;
- Photos;
- Reports;
- Chat history;
- Media;
- другие canonical domain data.

Удаление данных определяется отдельными lifecycle/privacy/security rules, а не самим фактом окончания subscription.

---

# 13. Coach-Client Relationship

Coach → Client — отдельная доменная сущность.

Концептуальные состояния:

```text
Active
Archived
```

При archival relationship:

- новые collaborative actions могут быть заблокированы;
- исторические данные сохраняются;
- права, зависящие от active relationship, прекращаются;
- ownership пользователя не меняется.

### Runtime status

Полная trainer/client relationship subsystem и RBAC на текущем verified baseline не считаются реализованными. Этот документ поэтому описывает каноническую domain model, а не утверждает наличие готового runtime subsystem.

---

# 14. Canonical source of data

Каждая domain area должна иметь один canonical source.

Пример:

```text
Training → training data
Food → food data
Weight → weight data
Report → report data
Activity → activity data
Photos / Measurements → photo and measurement data
Chat → messages
```

Другие модули получают данные через references/API, а не создают независимые authoritative copies.

Home и Analytics должны агрегировать canonical data, а не становиться дополнительными источниками истины.

---

# 15. Основные product domains

Платформа концептуально включает:

1. Home;
2. Authentication / Account;
3. Training;
4. Food;
5. Activity;
6. Weight;
7. Photos & Measurements;
8. Weekly Reports;
9. Chat;
10. Analytics;
11. Coach / Client;
12. Media;
13. Notifications;
14. Payments;
15. Admin.

Наличие domain в platform model не означает его текущую runtime реализацию.

---

# 16. Domain boundaries

Граница platform включает:

- application UX;
- backend API;
- structured data;
- media layer;
- ownership;
- access;
- permissions.

Внешние providers рассматриваются как инфраструктурные dependencies:

```text
Platform domain
   ↓
adapter / service
   ↓
External provider
```

Provider должен быть заменяемым без переписывания core product domain.

---

# 17. Home

Home — навигационный и обзорный центр приложения.

Он может показывать входы в:

- Training;
- Food;
- Activity;
- Reports;
- Photos;
- Measurements;
- Weight;
- другие доступные product domains.

Home не должен хранить копии domain data только ради отображения.

Runtime Home в текущем baseline является shell/navigation layer; backend dashboard aggregation не следует считать полностью реализованным только на основании product model.

---

# 18. Training как domain

Training имеет canonical persistence model:

```text
Workout
  ↓
WorkoutExercise
  ↓
WorkoutSet
```

История реальной тренировки не должна подменяться шаблоном.

Core training persistence в текущем baseline подтверждён, но весь Training domain остаётся `PARTIAL` из-за незавершённых подсистем и edge behavior.

Подробности принадлежат `modules/Training/*` и `SYSTEMS/DATABASE.md`.

---

# 19. Media как domain

Media является отдельной domain/infrastructure boundary.

Ownership и access metadata хранятся в PostgreSQL, бинарные файлы — в Object Storage.

Общий media layer должен быть переиспользуемым для:

- Photos;
- Chat attachments;
- Reports;
- Training materials;
- других file-based domains.

---

# 20. Product maturity vs Platform model

Platform document не должен превращаться в список обещаний.

Используется следующий принцип:

```text
PLATFORM.md
= что система должна означать как продуктовая модель

SYSTEM_STATE
= что реально подтверждено сейчас

MODULE / SYSTEM DOCUMENT
= как конкретный domain должен работать и где находятся его границы
```

Поэтому target semantics и current runtime намеренно могут отличаться, если это явно помечено.

---

# 21. Текущая общая зрелость domain'ов

По verified baseline:

| Domain | Текущий статус |
|---|---|
| Authentication / Account core | VERIFIED |
| Training core persistence | VERIFIED baseline / domain PARTIAL |
| Home | PARTIAL / shell |
| Profile | PARTIAL |
| Questionnaire | PARTIAL |
| Media | PARTIAL / foundation verified |
| Reports | PLACEHOLDER |
| Chat | NOT IMPLEMENTED |
| Coach / Client | NOT IMPLEMENTED |
| RBAC | NOT IMPLEMENTED |
| Templates | PLACEHOLDER |
| Programs | PLACEHOLDER |
| Nutrition | PLACEHOLDER |
| Notifications | PLACEHOLDER |
| Analytics | PLACEHOLDER |
| PWA | PARTIAL |
| Payments | PLANNED / external integration scope |
| AI/OCR | PLANNED |

Эта таблица является ориентиром, а не заменой `SYSTEM_STATE`.

---

# 22. Архитектурные ограничения Platform

Нельзя:

- создавать отдельный аккаунт только ради Coach context;
- передавать ownership клиентских данных тренеру из-за relationship;
- использовать role name как единственную проверку доступа;
- создавать duplicate canonical sources;
- считать frontend permission checks security boundary;
- объявлять feature реализованной только потому, что для неё существует экран или domain document.

---

# 23. Source of Truth

| Область | Канонический документ |
|---|---|
| Platform model | `PLATFORM.md` |
| Technical runtime architecture | `ARCHITECTURE.md` |
| Codebase structure | `APP_STRUCTURE.md` |
| Layout contracts | `LAYOUT.md` |
| Authentication | `../SYSTEMS/AUTH.md` |
| Permissions | `../SYSTEMS/PERMISSIONS.md` |
| Payments | `../SYSTEMS/PAYMENTS.md` |
| Security | `../SYSTEMS/SECURITY.md` |
| Current verified state | `../SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` |

---

# 24. Заключение

Stubborn Ram — единая платформа вокруг `User`, где ownership остаётся у пользователя, а coach/client collaboration реализуется через relationship и permissioned access.

Ключевая модель:

```text
User
  ↓
Ownership
  ↓
Relationship / Access Source
  ↓
Permissions
  ↓
Domain Action
```

Эта модель остаётся стабильной даже тогда, когда отдельные runtime subsystems ещё находятся в стадии development.
