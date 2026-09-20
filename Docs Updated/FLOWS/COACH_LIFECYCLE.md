# COACH_LIFECYCLE.md — Stubborn Ram

**Статус документа:** CANONICAL / CURRENT + TARGET  
**Актуальность фактов:** 19.09.2026  
**Назначение:** сквозной жизненный цикл пользователя в coach context: получение coach capabilities, работа с клиентами, collaborative actions и завершение relationship.

---

# 1. Назначение

Coach Lifecycle описывает продуктовый путь тренера как participant платформы.

Важно различать:

- обычный User account;
- Coach context;
- Coach ↔ Client Relationship;
- Permissions;
- Access.

Один User-аккаунт может в будущем выполнять и client, и coach функции.

---

# 2. Current baseline

Полноценная Coach subsystem в текущем runtime **NOT IMPLEMENTED**.

Актуальное evidence подтверждает:

- обычную Authentication/Session систему;
- защищённые app routes;
- user ownership checks;
- отсутствие полноценной trainer/client role model;
- отсутствие relationship persistence;
- отсутствие relationship routes;
- отсутствие полноценного client-management flow.

Следовательно, текущий «coach lifecycle» нельзя описывать как уже действующий production workflow.

---

# 3. Общая модель

## TARGET

Coach является контекстом использования существующего User account:

```text
User
 ├── personal context
 ├── client context
 └── coach context
```

Coach context не создаёт отдельный аккаунт.

Один человек потенциально может:

- быть клиентом другого Coach;
- сопровождать собственных клиентов;
- продолжать собственную personal history.

---

# 4. Получение Coach capabilities

## TARGET

Пользователь должен получить доступ к coach tools без создания отдельного account.

После активации coach context становятся доступны соответствующие инструменты:

- список клиентов;
- карточка клиента;
- разрешённые данные;
- назначения;
- отчёты;
- feedback;
- communication;
- управление сопровождением.

Конкретный механизм предоставления coach capabilities должен опираться на общую access/permissions model.

Полный runtime-механизм пока не реализован.

---

# 5. Переключение интерфейса

## TARGET

Пользователь с coach capabilities может переключаться между:

```text
User Interface
      ↕
Coach Interface
```

Переключение меняет:

- набор доступных экранов;
- coach tools;
- рабочий context.

Не меняются:

- User account;
- ownership;
- личная история;
- основная identity.

Runtime switch между кабинетами пока не реализован.

---

# 6. Поиск / приглашение клиента

## TARGET MVP

Базовый способ:

```text
Client
  ↓
public Trainer ID
  ↓
Connection Request
  ↓
Coach
```

До принятия request:

```text
No Client Access
```

Coach может:

- принять request;
- отклонить request.

После Accept:

```text
Pending
  ↓
ACTIVE Relationship
```

При Reject ACTIVE relationship не создаётся.

Pending request может быть отменён клиентом.

Отклонённый request может быть отправлен повторно.

Этот flow пока не реализован.

---

# 7. ACTIVE Relationship

## TARGET

Когда relationship становится ACTIVE, Coach получает только те collaborative capabilities, которые разрешены общей permission model.

Целевая логика:

```text
Authentication
      ↓
ACTIVE Relationship
      ↓
Permission
      ↓
Object Access
```

Relationship не означает unrestricted access.

Каждая операция должна учитывать:

- actor;
- relationship state;
- action;
- object;
- ownership;
- object state;
- другие применимые access conditions.

---

# 8. Работа с клиентом

## TARGET

Coach cabinet должен давать доступ к клиентам через relationship-aware model.

Целевой набор:

```text
Client List
   ↓
Client Card
   ↓
Allowed Data
   ↓
Coach Actions
```

Coach может получать доступ к:

- разрешённым тренировочным данным;
- отчётам;
- прогрессу;
- назначениям;
- feedback/communication.

Объекты остаются user-owned.

---

# 9. Назначения

## TARGET

При наличии Coach:

```text
Coach
  ↓
creates / updates assignment
  ↓
Client executes assignment
  ↓
Client produces actual data
```

Целевые назначения могут включать:

- тренировочные планы;
- программы;
- планы питания;
- цели периода;
- cardio;
- шаги;
- другие coaching assignments.

Coach authorship и Client ownership должны оставаться раздельными.

Полный Programs/Nutrition persistence сейчас не реализован.

---

# 10. Работа с Training

## TARGET

Coach не должен создавать копию client Training data.

Целевая модель:

```text
Workout
owner = Client
      +
Coach relationship
      +
Permission
      ↓
Coach read / allowed collaboration
```

User-generated actuals сохраняются как часть client history.

Coach-created plan/assignment должен сохранять информацию об авторстве Coach, не меняя ownership клиентской истории.

Текущие Training ownership checks уже существуют, но coach access layer отсутствует.

---

# 11. Работа с Reports

## TARGET

Основной workflow:

```text
Client creates Report
        ↓
Submit
        ↓
Coach sees Report
        ↓
Coach reviews
        ↓
Coach feedback
```

Coach должен иметь доступ только при:

```text
Authenticated Coach
+
Applicable Relationship
+
Permission
+
Report belongs to that Client context
```

Coach не становится владельцем Report.

Full Reports backend lifecycle пока отсутствует.

---

# 12. Работа с Chat

## TARGET

Одна Coach ↔ Client relationship предусматривает один primary chat.

Цель:

```text
Coach
  ↕
Client
```

Chat используется для общения и может ссылаться на объекты платформы.

Не должны создаваться отдельные чаты:

- для каждой тренировки;
- для каждого отчёта;
- для каждого упражнения.

Полный Chat backend/realtime runtime не реализован.

---

# 13. Работа с Media

## TARGET

Coach получает доступ к media только в рамках:

```text
User Ownership
+
Relationship
+
Permission
```

Файлы не копируются в отдельное coach storage.

Private Object Storage остаётся общим storage layer.

Full relationship-aware media access пока не реализован.

---

# 14. Feedback и авторство

Coach feedback должен иметь:

```text
Owner  = Client context / related object
Author = Coach
```

Это не меняет ownership исходного объекта.

Для разных domain objects конкретные author/owner semantics могут отличаться, но ownership не должен автоматически переходить Coach.

---

# 15. История сотрудничества

## TARGET

Один active Coach одновременно является MVP-ограничением.

История может содержать несколько периодов:

```text
Client
  ↓
Coach A
  ↓
Archived
  ↓
Coach B
  ↓
Archived
  ↓
Coach A
```

Архивирование relationship не должно удалять:

- client data;
- reports;
- media;
- training history;
- relationship history.

---

# 16. ARCHIVED Relationship

## TARGET

При завершении:

```text
ACTIVE
  ↓
ARCHIVED
```

Coach:

- теряет действия, требующие ACTIVE relationship;
- перестаёт получать новые client data автоматически;
- может иметь historical access к своему периоду согласно policy.

Client:

- сохраняет все данные;
- сохраняет ownership;
- продолжает использовать платформу;
- может подключить другого Coach.

Исторический access runtime пока не реализован.

---

# 17. Historical Access

Target principle:

```text
Current Coach
      ≠
Automatic access to entire old history
```

Для нового Coach по умолчанию предполагается доступ к данным собственного collaboration period.

Пользователь может в целевой модели отдельно разрешить доступ к старой истории по периодам/модулям.

Это product/permission contract, не реализованный runtime flow.

---

# 18. Access и Coach Subscription

Общая архитектура определяет Coach Subscription + active relationship как один из источников полного доступа клиента.

Схема:

```text
Coach Subscription
       +
Active Relationship
       ↓
Client Full Access Source
```

При прекращении relationship или coach subscription Access должен быть пересчитан.

Однако платежная подсистема пока не является завершённым production runtime, поэтому это target integration contract.

---

# 19. Notifications

## TARGET

Coach-related events могут создавать уведомления:

- новый connection request;
- принятие/отклонение;
- новый report;
- feedback;
- другие collaborative events.

После archival relationship новые события collaborative context должны быть ограничены.

Текущий Notifications module не имеет самостоятельного backend lifecycle.

---

# 20. Admin и Coach — разные contexts

Coach не является Admin.

```text
User
  ├── Client
  ├── Coach
  └── Admin (отдельный системный уровень)
```

Admin предназначен для обслуживания платформы.

Coach действует только в рамках client relationships и разрешённых actions.

Наличие Coach context не даёт административных прав.

---

# 21. Audit

## TARGET

Критические relationship actions должны журналироваться:

- request created;
- accepted;
- rejected;
- cancelled;
- archived;
- reactivated;
- access/permission changed.

Audit entry должен позволять определить:

- actor;
- client;
- relationship;
- action;
- before state;
- after state;
- timestamp;
- reason при необходимости.

Runtime relationship audit subsystem пока отсутствует.

---

# 22. Current vs Target

| Область                | Current                        | Target                            |
| ---------------------- | ------------------------------ | --------------------------------- |
| User account           | ✅                             | сохранить                         |
| Auth/session           | ✅                             | использовать                      |
| Coach role model       | ❌                             | context over User                 |
| Coach capabilities     | ❌                             | отдельный capability/access layer |
| Client list            | ❌                             | реализовать                       |
| Trainer ID             | ❌                             | реализовать                       |
| Connection request     | ❌                             | реализовать                       |
| Accept/reject          | ❌                             | реализовать                       |
| ACTIVE relationship    | ❌                             | реализовать                       |
| ARCHIVED relationship  | ❌                             | реализовать                       |
| Client access          | ❌ relationship-based          | permission-aware                  |
| Training collaboration | ⚠️ ownership only              | relationship-aware                |
| Reports review         | ❌                             | реализовать                       |
| Chat                   | ⚠️ placeholder                 | persistence/realtime              |
| Feedback               | ❌ полноценная backend feature | реализовать                       |
| Historical access      | ❌                             | policy + permissions              |
| Coach cabinet switch   | ❌                             | реализовать                       |
| Relationship audit     | ❌                             | реализовать                       |

---

# 23. Зависимости разработки

Coach Lifecycle зависит от следующих foundations:

```text
Authentication
      ↓
Access
      ↓
Permissions
      ↓
Coach/Client Relationship
      ↓
Reports
      ↓
Chat / Notifications / Coach Tools
```

В текущем remediation roadmap Relationship/Permissions стоят перед Reports и Communication, потому что downstream-модулям требуется relationship-aware authorization.

Нельзя считать отсутствие downstream feature самостоятельным defect relationship subsystem.

---

# 24. Минимальный Target Coach Flow

```text
User
  ↓
Coach capability
  ↓
Coach Interface
  ↓
Connection Request
  ↓
Accept
  ↓
ACTIVE Relationship
  ↓
Client List
  ↓
Client Card
  ↓
Allowed Client Data
  ↓
Assignments / Reports / Feedback / Chat
  ↓
Archive Relationship
  ↓
Historical Access per Policy
```

Этот flow является целевой продуктовой моделью и не является текущей production implementation.

---

# 25. Главный инвариант Coach Lifecycle

Coach приходит в пользовательскую систему как collaborator, а не как владелец client data.

Правильная модель:

```text
User owns data
       +
Relationship defines context
       +
Permissions define actions
       ↓
Coach collaborates
```

После завершения relationship:

```text
Coach access changes
       ≠
User history deleted
```

Пользовательский аккаунт и его история остаются непрерывными.
