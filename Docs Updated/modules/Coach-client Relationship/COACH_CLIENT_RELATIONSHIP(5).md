# COACH_CLIENT_RELATIONSHIP.md — Stubborn Ram

**Статус документа:** CANONICAL / CURRENT  
**Актуальность фактов:** 19.09.2026  
**Назначение:** единое описание домена Coach ↔ Client Relationship: продуктовой модели, ownership, access, lifecycle, coach/client flows, связей с Permissions и downstream-модулями.

> Документ объединяет текущую системную модель и детальную продуктовую концепцию.
> Он принципиально разделяет:
>
> - **CURRENT** — подтверждённое состояние runtime/архитектуры;
> - **TARGET / PLANNED** — утверждённую продуктовую модель и будущую реализацию;
> - **NOT VERIFIED** — поведение, которое пока не подтверждено runtime evidence.
>
> Наличие target-правила в этом документе не означает, что соответствующая подсистема уже работает в Production.

---

# 1. Роль домена

Coach ↔ Client Relationship — отдельный доменный слой платформы, определяющий контекст сотрудничества между пользователем и тренером.

Relationship не заменяет:

- Authentication;
- Access;
- Permissions;
- Ownership.

Его задача — определять контекст, в котором тренер может получать доступ к user-owned данным и выполнять разрешённые collaborative actions.

Целевая цепочка:

```text
Authenticated User
        ↓
Coach ↔ Client Relationship
        ↓
Relationship State / Scope
        ↓
Access Decision
        ↓
Permission Check
        ↓
Allowed / Denied
```

Главный принцип:

**Relationship изменяет контекст доступа, но не передаёт тренеру ownership пользовательских данных.**

---

# 2. Runtime-статус на текущий baseline

## 2.1 Общий статус

**Архитектура домена — CURRENT.**  
**Полноценная runtime relationship subsystem — NOT IMPLEMENTED.**

По актуальному System State и forensic audit:

- отдельные relationship persistence tables в Production не реализованы;
- relationship/invitation routes не реализованы;
- отдельная trainer/client role model с route-level guards не реализована;
- relationship-aware authorization в полном виде не реализована;
- coach/client management flow как полноценный data-backed subsystem не реализован;
- отдельной production E2E-проверки relationship lifecycle нет.

Текущая реализованная модель защищённых ресурсов в основном выглядит так:

```text
Authentication
      ↓
Ownership Check
      ↓
Business Logic
      ↓
DB / Storage
```

Это не следует интерпретировать как готовую Coach ↔ Client subsystem.

## 2.2 Что уже существует

В runtime подтверждены:

- authentication/session;
- user-linked ownership;
- ownership checks в реализованных Training и Media flows;
- отдельные permission enforcement points.

Следовательно, фундамент для будущего relationship layer существует, но сам relationship layer ещё не является рабочей production-подсистемой.

---

# 3. Product Model

Stubborn Ram — персональная пользовательская платформа.

Каждый человек использует один постоянный User-аккаунт.

Тренер не является обязательной частью системы.

Целевая модель:

```text
User
  ↓
Personal Account
  ↓
Optional Coach Relationship
```

Пользователь может:

- использовать платформу самостоятельно;
- стать клиентом тренера;
- в будущем получить coach capabilities;
- в одном аккаунте выполнять несколько контекстных функций.

Создание отдельного аккаунта только ради роли Coach архитектурой не предусматривается.

---

# 4. User, Client и Coach

Client и Coach являются контекстами использования одного User.

Целевая модель:

```text
User
 ├── personal data
 ├── client context
 └── coach context
```

Наличие relationship определяет контекст сотрудничества, но не создаёт нового пользователя.

Один человек потенциально может одновременно:

- вести собственный прогресс;
- быть клиентом другого тренера;
- сопровождать собственных клиентов;
- использовать обычный пользовательский кабинет.

### Runtime limitation

Архитектурный контекст Coach существует в документации, но полноценный runtime role/relationship model пока не реализован.

---

# 5. Ownership

## 5.1 Основное правило

**Пользователь остаётся владельцем своих данных.**

Наличие тренера не меняет ownership.

Это относится к пользовательской истории и доменным объектам, включая:

- профиль;
- тренировочные данные;
- питание;
- активность;
- вес;
- замеры;
- фотографии;
- видео;
- отчёты;
- переписку;
- достижения;
- другие user-owned объекты.

Целевая модель:

```text
User owns object
        +
Relationship grants context
        +
Permission allows action
```

Тренер не становится владельцем объекта только потому, что может его видеть или изменять в разрешённом сценарии.

## 5.2 Единственный экземпляр данных

Один business object должен существовать в одном canonical source.

При предоставлении тренеру доступа:

```text
existing object
      ↓
permissioned access
```

а не:

```text
existing object
      ↓
copy for coach
```

Нельзя создавать отдельную копию пользовательской истории только ради coach cabinet.

---

# 6. Ownership и Authoring

Ownership и авторство являются разными понятиями.

Целевая модель:

```text
owner = User
author = User / Coach / другой допустимый actor
```

Примеры:

```text
Workout
owner  = Client
author = Client
coach  = collaborator
```

```text
Report
owner  = Client
author = Client
coach  = reviewer
```

```text
Coach-created plan
owner  = Client
author = Coach
```

Такая модель сохраняет происхождение данных и не смешивает право собственности с правом выполнения действия.

Конкретные физические поля и таблицы для relationship domain должны проектироваться отдельным DB/design шагом; этот документ не утверждает не подтверждённую схему.

---

# 7. Самостоятельный пользователь и пользователь с тренером

Во всех доменах используется одна общая модель приложения.

## Самостоятельный пользователь

```text
создаёт
  ↓
изменяет
  ↓
выполняет
  ↓
анализирует
```

## Пользователь с тренером

```text
получает назначения
  ↓
выполняет
  ↓
анализирует
  ↓
получает обратную связь
```

Архитектура продукта не должна создавать отдельную версию основных пользовательских модулей только из-за появления тренера.

Меняется прежде всего источник назначения и набор разрешённых collaborative actions.

---

# 8. Relationship Lifecycle

Целевая lifecycle-модель:

```text
PENDING REQUEST
       ↓
   ACCEPT
       ↓
     ACTIVE
       ↓
    ARCHIVED
```

Также предусматриваются действия над pending request:

```text
PENDING
 ├── ACCEPT → ACTIVE
 ├── REJECT
 └── CANCEL
```

Отклонённый запрос может быть создан повторно.

Архивирование предпочтительнее физического удаления relationship, если требуется сохранить историю сотрудничества.

## 8.1 ACTIVE

Во время ACTIVE relationship целевая модель допускает:

- доступ к разрешённым текущим данным клиента;
- создание и изменение разрешённых назначений;
- просмотр и обработку отчётов;
- coach feedback;
- coach/client communication;
- другие actions, разрешённые permission model.

ACTIVE relationship сама по себе не означает автоматический доступ ко всем данным.

## 8.2 ARCHIVED

После завершения сотрудничества:

- история relationship сохраняется;
- новые данные клиента, относящиеся к периоду после завершения, не должны становиться доступны тренеру автоматически;
- новые actions, требующие ACTIVE relationship, недоступны;
- исторический доступ определяется отдельной policy/permissions-моделью;
- пользователь продолжает владеть всей своей историей.

Точное историческое поведение пока не является реализованным runtime flow.

---

# 9. Подключение тренера

Целевая MVP-модель подключения:

```text
Client
  ↓
вводит публичный Trainer ID
  ↓
Connection Request
  ↓
Coach
  ├── Accept
  └── Reject
```

До принятия запроса тренер не получает доступ к данным клиента.

После принятия:

```text
Pending Request
      ↓
ACTIVE Relationship
```

При reject:

```text
Pending Request
      ↓
Rejected
```

Pending request может быть отменён клиентом.

Отклонённый запрос может быть отправлен повторно.

История request decisions должна сохраняться в target persistence model.

Все операции выполняются в рамках существующих User-аккаунтов.

---

# 10. Количество активных тренеров и история

Для target MVP используется:

```text
один активный тренер одновременно
```

При этом исторически допускается любое количество последовательных периодов сотрудничества.

Пример:

```text
2026 — Coach A
        ↓
2027 — самостоятельно
        ↓
2028 — Coach B
        ↓
2029 — самостоятельно
        ↓
2031 — Coach A
```

Каждый период должен сохраняться как часть истории пользователя.

В будущем архитектура должна допускать:

- нескольких специалистов;
- нескольких тренеров;
- нутрициолога;
- реабилитолога;
- врача;
- другие типы collaborative participants.

---

# 11. Исторический доступ

После завершения relationship пользовательская история не удаляется.

Target principle:

```text
User data
   ↓
REMAINS
```

а coach access:

```text
Coach access
   ↓
RECALCULATED
```

Для завершённого периода сотрудничества целевая модель предусматривает возможность historical access согласно permission policy.

Новый тренер по умолчанию не должен получать всю старую историю предыдущего сотрудничества.

Целевая модель допускает явное открытие отдельных периодов/модулей пользователем.

Эта модель является target contract и не подтверждена как реализованный production flow.

---

# 12. Coach Tools

После получения coach capabilities пользователь должен продолжать использовать тот же User-аккаунт.

Целевые coach tools:

- список клиентов;
- карточка клиента;
- просмотр разрешённых данных;
- создание программ;
- ответы на отчёты;
- просмотр прогресса;
- управление сопровождением.

Coach tools не создают отдельную копию client data.

Target ownership остаётся:

```text
Client owns data
Coach authors / collaborates / reviews
```

в зависимости от конкретного объекта и разрешённого действия.

---

# 13. Переключение пользовательского и тренерского интерфейса

Целевая модель допускает переключатель интерфейса для пользователя, которому доступны coach tools:

```text
User Interface
      ↕
Coach Interface
```

Переключение:

- меняет интерфейс;
- открывает доступные coach tools;
- не создаёт новый аккаунт;
- не переносит ownership;
- не превращает пользователя в другого User.

Один аккаунт может одновременно иметь собственный пользовательский контекст и coach context.

Runtime-переключение кабинетов пока не реализовано.

---

# 14. Связь с Access

Access и Relationship не являются одним и тем же.

В общей архитектуре платформы источниками полного доступа определены:

- Trial;
- личная подписка;
- coach subscription + active coach-client relationship.

Целевая логика:

```text
Coach Subscription
       +
Active Relationship
       ↓
Client Access Source
```

Но наличие relationship не означает автоматически разрешение каждого отдельного действия.

Полный access и object-level permission проверяются раздельно.

Payments/subscription runtime не являются завершённой production subsystem на текущем baseline, поэтому эта часть остаётся архитектурной моделью.

---

# 15. Связь с Permissions

Relationship — один из входов в решение authorization.

Общая модель:

```text
Authentication
      ↓
Access
      ↓
Relationship
      ↓
Permission
      ↓
Object / Object State
      ↓
Allowed / Denied
```

Permission относится к конкретному действию над конкретным объектом.

Примеры:

```text
report.review
chat.send
training.read
training.update
media.read
```

В target model relationship является обязательным условием для ряда coach-client actions.

Текущий runtime не содержит полного relationship-aware permission engine.

---

# 16. Связь с Reports

Weekly Report является user-owned объектом.

Целевая модель:

```text
Client
  ↓
Create Report
  ↓
Report remains Client-owned
  ↓
Active Relationship
  ↓
Coach may review
  ↓
Coach feedback
```

Отчёт не переносится в coach cabinet и не копируется для тренера.

После архивирования relationship:

- report сохраняется;
- ownership остаётся у клиента;
- historical access тренера определяется policy.

Полный Reports lifecycle также пока не реализован как backend persistence subsystem.

---

# 17. Связь с Chat

Target MVP предусматривает:

```text
one Coach ↔ Client relationship
          ↓
one primary chat
```

Chat является самостоятельным модулем.

Relationship определяет базовый context доступа к коммуникации, а Chat сам хранит messages.

Целевые правила:

- сообщения не копируют бизнес-данные;
- сообщения могут ссылаться на существующие objects;
- отдельные чаты для каждой тренировки/отчёта/упражнения не создаются;
- active relationship является частью access decision.

Полный chat persistence/realtime runtime ещё не реализован.

---

# 18. Связь с Media

User-owned media должны оставаться частью пользовательской истории.

Target model:

```text
User-owned Media
       ↓
Relationship / Permission
       ↓
Coach access
```

Файл не копируется специально в coach storage.

Media остаётся в общем Media domain и private Object Storage.

Полный relationship-aware media sharing пока не реализован.

---

# 19. Связь с Training

Тренировочные данные остаются canonical data Training.

Relationship не должна создавать отдельную coach-копию тренировки.

Целевая модель:

```text
Workout
owner = Client
      +
Active Relationship
      +
Permission
      ↓
Coach may read / collaborate
```

Coach-created assignments и user-executed actual data должны оставаться различимыми по ownership/author semantics.

Текущий Training runtime уже имеет ownership checks, но полноценный coach access layer не реализован.

---

# 20. Связь с другими модулями

Relationship является cross-domain dependency для:

- Reports;
- Chat;
- Notifications;
- Training assignments;
- future Programs;
- future Nutrition;
- future Analytics/coach views;
- Media sharing.

Реализация downstream collaborative features до стабилизации relationship/permission model создаёт риск последующего refactor.

Это прямо отражено в текущем remediation roadmap: Phase 8 Relationship должна предшествовать Reports и Communication.

---

# 21. Notifications

В target model события relationship могут порождать уведомления:

- новый request;
- request accepted/rejected;
- новый report;
- новый coach feedback;
- другие collaborative events.

При ARCHIVED relationship новые collaborative notifications должны быть ограничены согласно policy.

Текущий Notification subsystem является только UI-поверхностью внутри Home; отдельный backend notification lifecycle не реализован.

---

# 22. Comments и Feedback

Ownership и authorship должны сохраняться отдельно.

Например:

```text
Owner  = Client
Author = Coach
```

для coach feedback к user-owned объекту.

Feedback не должен менять ownership исходного объекта.

Текущий Comments/Feedback subsystem как полноценная backend feature не реализован.

---

# 23. Audit

Критические relationship actions в target model должны быть audit-able.

Минимально необходимо фиксировать:

- actor;
- вторую сторону relationship;
- relationship identifier;
- action;
- state before;
- state after;
- timestamp;
- при необходимости reason.

Особенно важны:

- accept;
- reject;
- cancel;
- archive;
- reactivate;
- permission changes;
- historical access grants/revokes.

Runtime relationship audit log пока не реализован.

---

# 24. Target MVP

Минимальный target scope relationship domain:

1. Public Trainer ID.
2. Connection Request.
3. Accept / Reject.
4. ACTIVE relationship.
5. Один active coach одновременно.
6. ARCHIVED state.
7. Сохранение истории.
8. Базовый coach access scope.
9. Сохранение user ownership.
10. Backend permission checks.
11. Базовая historical-access policy.
12. End-to-end verification.

Это target scope, а не список уже работающих Production features.

---

# 25. Future Extensions

После базового relationship layer могут быть добавлены:

- передача клиента другому тренеру;
- выбор отдельных данных для sharing;
- временная пауза сопровождения;
- несколько специалистов;
- несколько active relationships;
- индивидуальные permissions;
- экспорт истории;
- импорт данных;
- marketplace.

Marketplace является отдельным продуктовым модулем и не должен смешиваться с базовым relationship lifecycle.

---

# 26. Что нельзя считать реализованным

Следующие утверждения **не подтверждены текущим runtime**:

```text
Trainer ID уже работает
Connection Request уже сохраняется
Coach уже принимает клиента через Backend
ACTIVE / ARCHIVED уже существуют в Production
Coach уже видит список клиентов
Coach уже видит историю клиента
Coach уже может редактировать назначения
Relationship уже используется полноценным permission engine
Coach/Client cabinet switch уже работает
```

Для каждого такого утверждения требуется отдельное runtime/API/DB evidence.

---

# 27. Current vs Target

| Область                        | Current                            | Target                         |
| ------------------------------ | ---------------------------------- | ------------------------------ |
| User ownership                 | ✅ подтверждено                    | сохранить                      |
| Auth/session                   | ✅ реализовано                     | использовать существующий слой |
| Training ownership checks      | ✅ подтверждено                    | расширить relationship access  |
| Media ownership checks         | ✅ подтверждено                    | расширить relationship access  |
| Relationship definition        | ✅ архитектурно CURRENT            | сохранить                      |
| Relationship persistence       | ❌ не реализовано                  | реализовать                    |
| Request flow                   | ❌ не реализован                   | реализовать                    |
| Trainer ID                     | ❌ не реализован                   | реализовать                    |
| ACTIVE / ARCHIVED runtime      | ❌ не реализован                   | реализовать                    |
| Relationship-aware permissions | ❌ не реализованы полностью        | реализовать                    |
| Historical access              | ❌ не реализован                   | определить и реализовать       |
| Coach tools                    | ❌ полноценный runtime отсутствует | реализовать                    |
| Interface switch               | ❌ не реализирован                 | реализовать                    |
| Coach subscription access      | ⚠️ архитектурно определён          | интегрировать с Access         |
| Full production E2E            | ❌ отсутствует                     | обязательна перед closure      |

---

# 28. Evidence и правила актуальности

При конфликте источников применяются правила:

1. Позднее подтверждённое runtime/code/DB evidence имеет приоритет.
2. Remediation closure заменяет более ранний finding, если исправление действительно подтверждено.
3. Planned ≠ Implemented.
4. Deferred ≠ Open defect.
5. Historical ≠ Current.
6. При отсутствии evidence нельзя превращать концепцию в факт.

Для текущего relationship domain актуальный baseline подтверждает отсутствие полной runtime subsystem.

Отдельный `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19_LATEST.md` не содержит записи, закрывающей relationship implementation; roadmap продолжает относить её к отдельной Phase 8.

---

# 29. Главный инвариант

Stubborn Ram не передаёт данные пользователя тренеру как собственность.

Правильная модель:

```text
USER
 │
 ├── owns data
 │
 └── relationship
        │
        ├── state
        ├── scope
        └── permissions
                │
                ↓
        COACH ACCESS
```

Тренеры могут приходить и уходить.

Relationship может меняться.

Permissions могут пересчитываться.

**Пользовательская история остаётся у пользователя.**
