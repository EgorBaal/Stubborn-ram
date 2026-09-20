# SECURITY.md — Stubborn Ram

**Статус документа:** CANONICAL / CURRENT  
**Актуальность фактов:** 19.09.2026  
**Назначение:** единый канонический документ security baseline Stubborn Ram, объединяющий согласованную target security architecture с фактически подтверждёнными текущими controls и ограничениями.

> Архитектурные требования из legacy/security specification сохранены как TARGET/PLANNED, когда они ещё не подтверждены runtime.
> Более позднее production evidence имеет приоритет над устаревшим описанием CURRENT.

---

# 1. Роль документа

`SECURITY.md` определяет:

- trust boundaries;
- authentication security boundary;
- session security;
- authorization/permissions boundary;
- ownership protection;
- PostgreSQL security;
- Object Storage security;
- secrets;
- admin security;
- personal data protection principles;
- logging/audit;
- monitoring;
- backup/recovery;
- external provider security;
- current verified status;
- deferred/not-verified boundaries.

Детальная authentication логика находится в `SYSTEMS/AUTH.md`.

Детальная permission model находится в `SYSTEMS/PERMISSIONS.md`.

---

# 2. Главный принцип безопасности

Security boundary находится на стороне Backend.

Frontend является недоверенной средой.

Frontend не является источником истины для:

- authentication;
- authorization;
- permissions;
- ownership;
- PostgreSQL access;
- private Object Storage access;
- secrets;
- критических business/security rules.

Базовая схема:

```text
Browser / Frontend
        ↓
     Backend API
        ↓
Auth / Security / Permission Checks
        ↓
PostgreSQL / Object Storage / Providers
```

Изменение UI не должно позволять обойти server-side controls.

---

# 3. Trust boundaries

## 3.1 Browser / Frontend

**Статус: CURRENT**

Browser считается пользовательской средой.

Он может контролировать UX, но не должен самостоятельно определять финальное security decision.

## 3.2 Backend API

**Статус: CURRENT**

Fastify Backend является основной security enforcement point для защищённых API operations.

Backend отвечает за:

- authentication;
- session validation;
- input validation;
- ownership checks;
- permission checks там, где они реализованы;
- database access;
- storage access;
- server-side integrations.

## 3.3 PostgreSQL

**Статус: CURRENT**

Frontend не получает прямой доступ к PostgreSQL.

Production PostgreSQL слушает internal-only interface.

## 3.4 Object Storage

**Статус: CURRENT**

User media хранится в private S3-compatible Object Storage.

Доступ проходит через backend-mediated signed URL flow.

## 3.5 Administrative infrastructure

**Статус: CURRENT infrastructure baseline**

Production pgAdmin публикуется через reverse proxy/TLS, при этом application bind остаётся локальным.

---

# 4. Security layers

Текущая security model:

```text
Authentication
        ↓
Session Validity
        ↓
Access / Availability
        ↓
Permission / Action
        ↓
Ownership / Relationship / Object State
        ↓
Business Operation
```

Наличие только одного уровня не является достаточной защитой.

---

# 5. Authentication security

**Статус: CURRENT**

Подтверждены:

- password hashing server-side;
- Argon2 hashing/verification;
- session token hash в DB;
- email verification gate для login;
- one-time verification/reset tokens;
- reset-password session invalidation;
- secure session cookie;
- critical auth rate limiting;
- allowed-origin baseline.

Детали:

```text
SYSTEMS/AUTH.md
```

---

# 6. Password security

**Статус: CURRENT**

Пароли:

- не хранятся в plaintext;
- не передаются обратно frontend;
- не должны присутствовать в logs;
- не должны быть доступны Admin;
- хранятся в hashed form.

Текущий Backend использует Argon2.

---

# 7. Session security

**Статус: CURRENT / production baseline VERIFIED**

Текущая cookie:

```text
stubbornram_session
```

Подтверждённые параметры:

```text
HttpOnly = true
Secure = true
SameSite = none
Path = /
Max-Age = 30 days
```

В PostgreSQL хранится hash session token.

Session lifetime контролируется Backend.

---

# 8. Session revocation

Текущий logout удаляет current session.

Password reset complete удаляет существующие user sessions.

Отдельная capability:

```text
logout-all-devices
```

не реализована.

Статус:

```text
DEFERRED / NOT IN CURRENT SCOPE
```

---

# 9. Session cleanup

**Статус: FIXED — VERIFIED**

Expired sessions очищаются:

- при startup;
- затем через daily scheduler.

Удаляются только истёкшие записи.

Production verification подтвердила:

- expired marker удаляется;
- active marker сохраняется.

F1-SEC-03:

```text
FIXED — VERIFIED
```

---

# 10. CSRF / Origin baseline

**Статус: CURRENT baseline / VERIFIED**

State-changing `/api` requests проходят allowed-origin gate.

Подтверждено production:

```text
Allowed Origin
→ accepted

Foreign Origin
→ 403 INVALID_ORIGIN

OPTIONS preflight
→ 204
```

Отдельный token-based CSRF mechanism отсутствует.

Статус расширения:

```text
DEFERRED / FUTURE
```

F1-SEC-02:

```text
FIXED — VERIFIED
```

---

# 11. CORS

**Статус: CURRENT**

Allowed origins должны быть ограничены ожидаемыми frontend origins.

Cookie-based auth используется с credentials-enabled requests.

Production/Local configuration разделены.

Secret values не являются частью документации.

---

# 12. API protection

**Статус: CURRENT baseline**

Protected endpoints должны применять:

- authentication;
- validation;
- ownership/permission checks;
- controlled errors;
- request size constraints там, где нужно;
- rate limiting для sensitive operations.

Публичный response не должен раскрывать:

- stack traces;
- credentials;
- internal secret values;
- лишние implementation details.

Full cross-domain enforcement остаётся partial.

---

# 13. Rate limiting

**Статус: PARTIALLY IMPLEMENTED**

Подтверждены endpoint-level limits на критических authentication routes.

Целевой hardening scope может расширять protection на:

- file upload;
- chat send;
- AI/OCR;
- payment endpoints;
- admin endpoints;
- другие abuse-sensitive actions.

Наличие target requirement не означает, что все такие limits уже существуют.

---

# 14. Input validation

**Статус: CURRENT baseline**

Auth payloads используют Zod validation.

General security rules:

- входные данные проверяются на server-side;
- SQL должен быть параметризован;
- command/data boundaries не должны принимать uncontrolled input;
- error responses должны быть controlled.

---

# 15. SQL Injection / database access

**Статус: CURRENT baseline для проверенных flows**

Frontend не получает PostgreSQL credentials.

Backend выполняет SQL operations.

В проверенных current routes используется parameterized query pattern.

Application database role не должна иметь лишние administrative privileges.

По production evidence application role не является superuser.

---

# 16. PostgreSQL security

**Статус: CURRENT infrastructure baseline**

Rules:

- PostgreSQL не является public frontend-facing service;
- production listener internal-only;
- credentials не попадают во frontend;
- secrets не документируются;
- runtime uses restricted application role.

RLS может использоваться как defense-in-depth.

Новая business authorization architecture не должна зависеть исключительно от RLS.

---

# 17. Object Storage security

**Статус: CURRENT / private-flow VERIFIED**

Текущий flow:

```text
Frontend
↓
Media API
↓
Authentication + ownership/security checks
↓
Signed URL
↓
Private Object Storage
```

Подтверждено:

- signed upload flow;
- signed download flow;
- ownership checks;
- unsigned direct object read blocked;
- unsigned direct object write blocked;
- frontend не содержит S3 secret keys;
- production media/storage alignment restored.

Некоторые provider control-plane APIs возвращают `501 NotImplemented`, поэтому часть provider-level configuration attributes остаётся не проверяемой.

Это ограничивает глубину control-plane evidence, но не отменяет подтвержденный private runtime behavior.

---

# 18. File metadata

Security-relevant metadata может включать:

- media id;
- owner;
- object key;
- linked object;
- MIME/type;
- size;
- processing state.

Object key не должен превращаться в публичную ссылку только из-за знания его значения.

---

# 19. Media processing

**Статус: PARTIALLY IMPLEMENTED / target extensions**

Для тяжёлых media операций target architecture предусматривает:

- size limits;
- MIME validation;
- safe object keys;
- duration limits;
- controlled processing;
- resource controls;
- worker-style processing при необходимости.

Полный отдельный production worker service не подтверждён как самостоятельный current boundary.

---

# 20. Secrets management

**Статус: CURRENT baseline**

Secret values не должны находиться:

- во frontend bundle;
- в Git;
- в canonical docs;
- в public API responses.

К server-side secrets относятся:

- DB credentials;
- S3 credentials;
- Email provider credentials;
- payment provider secrets;
- AI provider keys;
- administrative secrets.

Local `.env` / `.env.local` должны быть исключены из Git.

---

# 21. Frontend security boundary

Frontend может получать только client-safe configuration.

Запрещены:

```text
database password
private API keys
S3 secret keys
payment secret keys
AI provider secrets
SMTP/private Email credentials
admin secrets
```

Frontend can suggest UX state, but final security decision belongs to Backend.

---

# 22. Authorization / Permissions

**Статус: PARTIALLY IMPLEMENTED**

Protected endpoints use authentication checks.

Current ownership enforcement confirmed for:

- Training;
- Media.

Полная target action/object permission engine не реализована.

Relationship-based authorization также пока неполна.

Подробности:

```text
SYSTEMS/PERMISSIONS.md
```

---

# 23. Relationship security

Target relationship model:

```text
Authentication
↓
Coach ↔ Client Relationship
↓
Relationship state
↓
Permission
↓
Object access
```

Relationship не переносит ownership.

Current runtime не содержит complete relationship subsystem.

---

# 24. Admin security

**Статус: PARTIALLY IMPLEMENTED / infrastructure baseline VERIFIED**

Target admin action должен проходить:

```text
Authentication
↓
Admin system level
↓
Specific action
↓
Object / state
↓
Security constraints
```

Admin не получает пароль пользователя.

Для critical admin operations target architecture предусматривает:

- server-side checks;
- least privilege;
- audit log;
- optional re-authentication;
- future 2FA/MFA.

Полная application-level Admin/RBAC matrix пока не реализована.

---

# 25. Administrative viewing

**Статус: TARGET / NOT VERIFIED as complete runtime capability**

Административный просмотр пользовательских данных должен:

- быть явно отмечен;
- использовать minimal necessary data;
- не раскрывать password/session secrets;
- иметь audit trail для critical actions.

---

# 26. pgAdmin security

**Статус: CURRENT infrastructure baseline VERIFIED**

Production:

```text
pgAdmin bind = 127.0.0.1:5050
```

Внешний доступ проходит через admin domain + HTTPS reverse proxy.

Direct external access to port 5050 закрыт.

pgAdmin 2FA/MFA:

```text
DEFERRED / FUTURE
```

---

# 27. Personal data

Security scope включает, в зависимости от реализованных product domains:

- Email;
- profile data;
- questionnaire;
- training;
- food/nutrition;
- activity;
- weight;
- measurements;
- photos;
- videos;
- reports;
- chat;
- coach-client interaction data.

Security principles:

- data minimization;
- restricted access;
- private storage;
- controlled external sharing;
- lifecycle/retention rules;
- auditability for critical access.

Юридические основания, consent и конкретные retention policies не считаются автоматически выполненными только из-за наличия архитектурного требования.

---

# 28. Geography and external providers

Целевой infrastructure model предусматривает российский регион для основных пользовательских storage/data layers.

External integrations, которые могут получать user data, должны проходить отдельную assessment.

Особого контроля требуют:

- Email;
- AI/OCR;
- payments;
- analytics;
- external APIs.

Provider adapters должны изолировать product modules от provider implementation.

---

# 29. Email security

**Статус: CURRENT server-side integration с частично подтверждённым failure boundary**

Frontend не обращается к Email provider напрямую.

Email credentials находятся на Backend.

Auth email flows:

- verification;
- resend verification;
- password reset.

F1-SEC-01:

```text
PARTIALLY VERIFIED
```

Production success/resend paths verified.

Intentional production email-provider failure simulation не выполнялась по safe-policy.

---

# 30. AI/OCR security

**Статус: TARGET / PLANNED**

AI/OCR должен вызываться через Backend.

Frontend не получает provider secret.

Перед отправкой данных внешнему provider target security model требует проверить:

- необходимость данных;
- минимизацию;
- регион обработки;
- retention;
- provider storage;
- возможность удаления исходных данных.

---

# 31. Payment security

**Статус: TARGET / PLANNED**

Stubborn Ram не должен хранить полные card credentials.

Provider secrets остаются server-side.

Внутри приложения сохраняются только необходимые payment metadata/statuses.

Подробный payment contract:

```text
SYSTEMS/PAYMENTS.md
```

---

# 32. Logging security

Logs не должны содержать:

- plaintext passwords;
- session tokens;
- API keys;
- payment credentials;
- лишние персональные данные;
- private message contents без необходимости.

При этом logs должны позволять диагностировать:

- auth failures;
- API failures;
- DB/storage failures;
- provider failures;
- relevant admin/security events.

---

# 33. Audit log

**Статус: TARGET / PARTIALLY IMPLEMENTED depending on zone**

Critical administrative/system actions должны позволять фиксировать:

- actor;
- action;
- object type;
- object id;
- timestamp;
- result;
- reason, если требуется;
- correlation/request id при наличии.

Audit log не должен содержать passwords или secret tokens.

Полный cross-platform audit subsystem не считается текущей fully implemented feature без runtime evidence.

---

# 34. Monitoring

**Статус: PARTIALLY IMPLEMENTED**

Security/operations должны иметь visibility для:

- API availability;
- error rate;
- DB errors;
- storage errors;
- Email errors;
- unusual authentication events;
- administrative events.

Текущий monitoring coverage не следует расширять в документации сверх подтверждённого runtime evidence.

---

# 35. Backup / recovery

**Статус: PARTIALLY IMPLEMENTED**

Target security baseline требует:

- regular PostgreSQL backups;
- separate backup retention;
- recovery verification;
- documented restore process;
- protection of critical Object Storage data.

Current foundation baseline не подтверждает полную operational maturity backup/recovery.

Наличие backup artifact или policy не равно подтверждённому restore test.

---

# 36. Failure handling

External provider failure не должен раскрывать:

- stack traces;
- secrets;
- internal credentials.

Target pattern:

```text
timeout
+
controlled error
+
controlled retry where safe
+
fallback where defined
+
technical logging
```

Если local persistence и external delivery можно разделить, failure внешнего provider не должен уничтожать уже durable own data.

---

# 37. Data lifecycle and deletion

Окончание subscription или relationship не должно автоматически удалять user history.

Важно различать:

```text
Access change
≠
Data deletion
```

Удаление/архивирование должно учитывать:

- retention policy;
- legal requirements;
- dependencies;
- backups;
- audit requirements.

---

# 38. Legacy migration security boundary

Legacy Supabase security controls не должны автоматически считаться current controls новой Backend architecture.

Migration target:

```text
Frontend
↓
Backend
↓
PostgreSQL / Object Storage / server-side providers
```

Старая инфраструктура не является источником текущего production security truth после завершённой миграции.

---

# 39. Current verified security baseline

### VERIFIED

```text
F1-SEC-02
Origin / CSRF baseline
```

```text
F1-SEC-03
Expired session cleanup
```

```text
F1-NV-01
Production private media/storage behaviour
```

Также подтверждены normal auth paths:

- registration success;
- resend verification;
- Email verification;
- login/session;
- current-session logout;
- password reset.

---

# 40. Partial verification

```text
F1-SEC-01
```

Остаётся:

```text
PARTIALLY VERIFIED
```

Потому что:

- production success path verified;
- resend verified;
- production intentional email-failure simulation не проводилась.

---

# 41. Deferred security items

Current Foundation closure фиксирует:

```text
F1-SEC-04
logout-all-devices
```

как:

```text
DEFERRED / NOT IN CURRENT SCOPE
```

Также deferred:

- token-based CSRF enhancement;
- pgAdmin 2FA/MFA;
- отдельные future hardening capabilities.

Deferred item не является current blocker.

---

# 42. Foundation relation

Final Foundation status:

```text
COMPLETED WITH DOCUMENTED LIMITATIONS
```

Для security это означает:

- origin baseline закрыт;
- session cleanup закрыт;
- private media/storage runtime baseline подтверждён;
- normal auth paths подтверждены;
- F1-SEC-01 имеет explicit partial verification boundary;
- deferred hardening не считается unresolved foundation blocker.

---

# 43. Security invariants

1. Frontend не является security source of truth.
2. Backend принимает финальные protected-operation decisions.
3. PostgreSQL не доступен напрямую из frontend.
4. Private Object Storage не должен становиться public из-за frontend logic.
5. Session token не хранится в DB в открытом виде.
6. Passwords не хранятся plaintext.
7. Server secrets не попадают во frontend.
8. State-changing cookie-auth requests проходят current allowed-origin baseline.
9. Access expiration не должна сама по себе удалять historical data.
10. Planned architecture нельзя маркировать CURRENT без evidence.
11. Deferred item не следует описывать как active blocker.
12. Security claims должны иметь соответствующий evidence или быть явно помечены TARGET/PLANNED.

---

# 44. Что нельзя считать реализованным

Не следует считать current fact только на основании target-документации:

```text
"Полный Admin/RBAC уже работает."
"Полный relationship authorization уже работает."
"Весь rate limiting уже унифицирован."
"Все critical operations уже audit logged."
"Backup/restore уже полностью verified."
"2FA уже включена."
"Token-based CSRF уже реализован."
"Все AI/payment/chat security flows уже production-ready."
```

---

# 45. Связанные документы

```text
SYSTEMS/AUTH.md
SYSTEMS/PERMISSIONS.md
SYSTEMS/SERVER.md
SYSTEMS/MEDIA.md
SYSTEMS/DATABASE.md
SYSTEMS/PAYMENTS.md
SYSTEMS/COACH_CLIENT_RELATIONSHIP.md
ARCHITECTURE/ARCHITECTURE.md
ARCHITECTURE/PLATFORM.md
SYSTEM_STATE/SYSTEM_STATE_FINAL.md
```

Evidence/provenance:

```text
AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
```
