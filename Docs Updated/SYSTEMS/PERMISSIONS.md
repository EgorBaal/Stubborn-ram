# PERMISSIONS.md — Stubborn Ram

**Статус документа:** CANONICAL / CURRENT  
**Актуальность фактов:** 19.09.2026  
**Назначение:** единое описание action/object authorization, ownership, relationship-aware access и текущего enforcement baseline Stubborn Ram.

> Этот документ объединяет target-модель из старой `PERMISSIONS_ARCHITECTURE.md` с текущим runtime baseline.
> Архитектурное правило не считается реализованным только потому, что оно описано здесь.

---

# 1. Роль документа

`PERMISSIONS.md` определяет:

- что является permission;
- различие Authentication / Access / Permissions;
- ownership;
- relationship context;
- action/object model;
- порядок permission evaluation;
- обязательность server-side enforcement;
- target permission architecture;
- текущие реально подтверждённые permission checks;
- ограничения текущего runtime;
- planned/deferred coverage.

Конкретная бизнес-логика отдельных модулей остаётся в их канонических документах.

---

# 2. Authentication vs Access vs Permissions

Нужно строго различать три уровня:

```text
Authentication
= кто пользователь

Access
= имеет ли пользователь право пользоваться защищённой функциональностью платформы сейчас

Permissions
= разрешено ли выполнить конкретное действие над конкретным объектом
```

Authentication сам по себе не даёт права на произвольные действия.

Access сам по себе тоже не означает доступ к любому объекту.

Итоговое решение формируется через:

```text
Authentication
↓
Session validity
↓
Access, если он требуется
↓
Permission / action
↓
Ownership / relationship / object state
↓
Business operation
```

---

# 3. Текущий статус permission subsystem

**Общий статус: PARTIALLY IMPLEMENTED.**

Подтверждено в текущем runtime:

- authentication requirement для защищённых endpoints;
- current-session auth/logout operations;
- ownership enforcement для реализованных Media flows;
- ownership/user-scope enforcement для реализованных Training flows;
- отдельные auth-related decisions.

Не подтверждено как полностью реализованное:

- централизованный platform-wide permission service;
- полная action/object matrix;
- полная relationship-based trainer/client authorization;
- полная role/context matrix для trainer/admin;
- полное permission enforcement для planned Chat/Reports и других ещё не реализованных доменов.

---

# 4. Permission является правом на действие

Основной элемент модели:

```text
Permission = право выполнить конкретное действие
над конкретным объектом / контекстом
```

Примеры target actions:

```text
training.create
training.update
report.create
report.submit
report.review
media.read
media.delete
chat.send
```

Permission не является просто свойством пользователя или названием роли.

---

# 5. Пользовательский статус ≠ permission

Архитектура различает product context:

- Self-managed User;
- Client;
- Coach.

Эти статусы не являются permissions сами по себе.

Они могут участвовать в вычислении результата:

```text
status/context
+
access
+
relationship
+
object
+
action
```

То есть:

```text
role/status ≠ unrestricted access
```

---

# 6. System level ≠ permission

В архитектуре выделяются как минимум:

```text
User
Admin
```

System level определяет системный контекст, но не заменяет action-level authorization.

Например:

```text
Admin
≠
automatically allowed to perform every action on every object
```

Admin actions должны дополнительно проходить server-side checks и security constraints.

---

# 7. Server-side enforcement

**Статус: CURRENT в реализованных protected flows.**

Любое защищённое действие должно проверяться на Backend.

UI может:

- скрывать недоступную кнопку;
- отключать элемент;
- показывать сообщение;
- заранее делать permission-aware navigation.

Но это только UX.

Безопасность обеспечивается сервером:

```text
Frontend check
    ↓
UX

Backend check
    ↓
Security / authorization
```

Если frontend restriction обойдён вручную, Backend всё равно обязан отклонить запрещённую операцию.

---

# 8. Ранняя проверка

Target-модель предусматривает раннюю permission check до запуска основной бизнес-логики модуля.

Пример:

```text
Request
↓
Authentication
↓
Access
↓
Permission evaluation
↓
Business logic
```

Если permission denied:

```text
Permission denied
↓
Return controlled reason
↓
Do not execute business operation
```

Это предотвращает дублирование правил в каждом feature module.

---

# 9. Обязательная повторная серверная проверка

Даже если permission была проверена на frontend или в router guard:

```text
Backend
```

обязан повторно определить допустимость операции перед изменением данных.

Это особенно важно для:

- create;
- update;
- delete;
- submit;
- send;
- upload;
- access to private data.

---

# 10. Permission формируется совокупностью условий

Окончательное решение может зависеть от:

1. identity пользователя;
2. session validity;
3. access state;
4. system level / context;
5. ownership;
6. author context;
7. relationship;
8. relationship state;
9. object state;
10. requested action;
11. дополнительных security constraints.

Ни один отдельный признак не должен считаться универсальным разрешением.

---

# 11. Ownership

**Статус: CURRENT в реализованном scope.**

User-linked ownership присутствует в current auth/training/media data model.

Для текущих protected flows Backend использует authenticated user id и ownership filters.

Принцип:

```text
User owns object
```

может быть проверен через server-side query scope.

Client-provided `owner_id` не должен автоматически считаться trusted identity.

Identity берётся из authenticated session.

---

# 12. Ownership ≠ relationship

Критическое правило:

```text
Relationship ≠ Ownership
```

Coach может получить permissioned access к объекту клиента, но не становится его owner.

Это сохраняет user ownership:

- при active coach relationship;
- при смене тренера;
- при archival relationship;
- при переходе между access sources.

---

# 13. Relationship-based access

**Статус: PLANNED / PARTIALLY IMPLEMENTED concept.**

Target-модель:

```text
Authenticated User
↓
Coach ↔ Client Relationship
↓
Relationship state
↓
Permission policy
↓
Action/Object decision
```

Relationship может ограничивать или расширять collaborative actions.

Полная runtime relationship subsystem сейчас не реализована.

---

# 14. Active relationship

Target `ACTIVE` relationship может разрешать:

- просмотр client-linked данных;
- получение новых reports;
- разрешённые coach assignments;
- comments;
- chat;
- progress review.

Но:

```text
ACTIVE relationship
≠
all permissions
```

Каждое конкретное действие всё равно должно быть проверено policy.

---

# 15. Archived relationship

Target `ARCHIVED` relationship сохраняет исторический контекст.

При archival:

- новые collaborative actions, требующие active relationship, прекращаются;
- исторические данные сохраняются;
- доступ к истории определяется отдельной policy;
- ownership не меняется.

Целевая модель:

```text
ACTIVE
  ↓
ARCHIVED
```

---

# 16. Historical data permissions

Окончание access source или relationship не должно само по себе удалять historical data.

Permission policy должна отдельно определять:

- может ли старый coach читать исторические данные;
- какие новые действия блокируются;
- может ли новый coach получить доступ к старой истории;
- какие дополнительные user controls применяются.

На текущем runtime это target policy.

---

# 17. Access sources

Целевая Access-модель использует:

```text
Trial
OR
Personal Subscription
OR
Coach Subscription + Active Relationship
```

Наличие одного активного source может предоставлять full access.

Но full access не означает автоматически право выполнять любую операцию над любым объектом.

---

# 18. Object state

Permission evaluation может зависеть от состояния объекта.

Примеры target states:

```text
ACTIVE
ARCHIVED
DELETED
BLOCKED
```

Даже при valid authentication + access + ownership действие может быть запрещено object state.

---

# 19. Единый permission mechanism

Target-модель требует единый механизм проверки permission.

Модули не должны создавать собственные независимые системы authorization.

Архитектурная идея:

```text
Feature Module
      ↓
Permission evaluation
      ↓
Allowed / Denied
      ↓
Feature business logic
```

Это нужно для:

- единообразия;
- централизации policy;
- снижения дублирования;
- предсказуемого расширения.

---

# 20. Permission engine не содержит feature business logic

Permission layer отвечает за решение:

```text
Can action X be performed on object Y?
```

Он не должен содержать внутреннюю бизнес-логику Training, Reports, Chat и т. д.

После `Allowed` соответствующий module выполняет свою бизнес-логику.

---

# 21. Permissions как вычисляемые значения

Target architecture предполагает dynamic evaluation.

Не требуется хранить индивидуальные permissions каждого пользователя как отдельные records без отдельного архитектурного решения.

Decision inputs могут включать:

```text
user identity
access state
system context
ownership
relationship
object state
requested action
```

---

# 22. Причина отказа

Target permission layer должен возвращать не только:

```text
allowed = false
```

но и стандартизированную reason category, пригодную для frontend UX.

Например:

```text
NO_AUTH
NO_FULL_ACCESS
NOT_OWNER
NO_RELATIONSHIP
RELATIONSHIP_ARCHIVED
OBJECT_NOT_AVAILABLE
ACTION_NOT_ALLOWED
SECURITY_RESTRICTION
```

Конкретный публичный error contract определяется API contract.

---

# 23. Evaluation order

Рекомендуемая target sequence:

```text
1. Authentication
2. Session validity
3. Access, если action требует full access
4. System level / role context
5. Object existence
6. Ownership
7. Relationship, если applicable
8. Relationship state
9. Object state
10. Requested action
11. Additional security conditions
12. Business operation
```

Порядок может уточняться domain-specific правилами, но server-side security boundary сохраняется.

---

# 24. Current backend enforcement

Подтверждённые текущие patterns:

```text
Authenticated session
↓
Ownership scope
↓
DB query / storage operation
```

### Media

Реализованные Media operations используют authenticated user и owner scope.

Подтверждённые операции:

```text
media create/upload init
media complete
media read/download
media delete
```

### Training

Реализованные Training flows используют authenticated user и ownership-linked data access.

Например:

```text
workout user_id = authenticated user
```

и соответствующие joins/filtering для nested objects.

---

# 25. Current permission matrix

**Статус: PARTIALLY IMPLEMENTED**

### Authentication

```text
auth.session.read
auth.logout
```

реализованы через текущие auth endpoints.

### Media

Реализован baseline:

```text
media.create
media.read
media.complete
media.delete
```

с auth + ownership enforcement.

### Training

В текущем реализованном scope присутствует:

```text
training.read
training.create
training.update
```

в пределах authenticated user ownership model.

---

# 26. Chat

Target actions:

```text
chat.read
chat.send
chat.attach
```

Полная Chat backend/persistence/relationship permission matrix сейчас не реализована.

Следовательно:

```text
Chat permissions = TARGET
```

а не current platform-wide enforcement.

---

# 27. Reports

Target actions:

```text
report.create
report.read_own
report.submit
report.review
report.feedback
report.read_history
```

`report.review` не должен означать автоматический unrestricted access ко всей истории клиента.

Полный Reports persistence/API/permission enforcement сейчас не реализован.

---

# 28. Training

Target базовые действия:

```text
training.read
training.create
training.update
training.delete
```

Current runtime имеет только подтверждённый in-scope subset.

Templates/programs и relationship-aware training permissions не следует считать полностью реализованными только на основании architecture docs.

---

# 29. Media

Current permission boundary:

```text
Authenticated User
↓
Ownership
↓
Media operation
```

Private Object Storage использует backend-mediated signed URL flow.

Unsigned direct storage access не является допустимым permission path.

---

# 30. Admin permissions

Target admin flow:

```text
Authentication
↓
Admin system level
↓
Specific action
↓
Object/state
↓
Security constraints
```

Admin не получает автоматически все пользовательские permissions.

Infrastructure admin surfaces, например pgAdmin, не следует смешивать с product-level permission model.

Полная application-level Admin/RBAC matrix пока не реализована.

---

# 31. Author context

Для некоторых objects может использоваться различие:

```text
Owner
Author
Actor
```

Например:

```text
Owner = Client
Author = Coach
Actor = authenticated Coach
```

Authorship не меняет ownership и сама по себе не является permission.

---

# 32. RLS

В legacy Supabase infrastructure RLS использовался для отдельных таблиц.

Для новой Backend architecture:

```text
Backend authorization
```

является основным business access control layer.

RLS может применяться как defense-in-depth, но наличие старых Supabase policies не означает, что новая permission architecture уже реализована.

Training-specific target RLS/permission model не считается production-implemented только из-за старой архитектурной документации.

---

# 33. Module boundaries

Конкретные module actions должны жить в документации соответствующего домена.

`PERMISSIONS.md` задаёт общий contract.

Например:

```text
Training → TRAINING.md
Reports → REPORT.md
Chat → CHAT.md
Media → MEDIA.md
Coach/Client → COACH_CLIENT_RELATIONSHIP.md
```

Добавление нового feature module не должно требовать переписывания базовой permission architecture.

---

# 34. Current limitations

Сейчас отсутствуют или не подтверждены как complete:

- centralized platform-wide permission service;
- full relationship-based authorization;
- role-based trainer/client runtime;
- full Admin action matrix;
- complete Chat permissions;
- complete Reports permissions;
- object-state-aware policy across all domains;
- production E2E verification всей target model.

---

# 35. Foundation remediation relation

Final Foundation статус:

```text
COMPLETED WITH DOCUMENTED LIMITATIONS
```

Для permission layer это означает:

- существующие auth/ownership checks не имеют текущего Foundation blocker;
- core ownership enforcement в in-scope flows подтверждён;
- platform-wide permission engine ещё не реализован;
- relationship-aware authorization остаётся planned;
- deferred items не следует трактовать как active blocker.

---

# 36. Что нельзя считать реализованным

Нельзя считать фактом только из архитектурного документа:

```text
"У каждого action уже есть централизованный permission check."
"Trainer RBAC уже работает."
"Coach-client relationship уже защищает все endpoints."
"Chat permissions уже реализованы."
"Reports permissions уже реализованы."
"Admin имеет полностью готовую permission matrix."
```

Для таких утверждений необходимы code/API/DB/runtime evidence.

---

# 37. Security invariants

1. Frontend не является источником истины для permissions.
2. Ownership определяется server-side.
3. Client-provided identifiers не считаются trusted identity.
4. Relationship не передаёт ownership.
5. Active relationship не означает unrestricted access.
6. Active session не означает право на любой объект.
7. Full access не означает право на любой action.
8. Backend должен повторно проверять защищённые write operations.
9. Permission layer не должен выполнять feature business logic.
10. Planned permissions нельзя маркировать CURRENT без implementation evidence.

---

# 38. Связанные документы

```text
SYSTEMS/AUTH.md
SYSTEMS/SECURITY.md
SYSTEMS/COACH_CLIENT_RELATIONSHIP.md
SYSTEMS/PAYMENTS.md
SYSTEMS/DATABASE.md
SYSTEMS/MEDIA.md
ARCHITECTURE/PLATFORM.md
SYSTEM_STATE/SYSTEM_STATE_FINAL.md
```

Evidence/provenance:

```text
AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
```
