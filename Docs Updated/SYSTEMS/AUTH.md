# AUTH.md — Stubborn Ram

**Статус документа:** CANONICAL / CURRENT  
**Актуальность фактов:** 19.09.2026  
**Назначение:** единое каноническое описание подсистемы Authentication и Session Stubborn Ram, включая текущий verified runtime, архитектурные границы и явно отделённые target/deferred сценарии.

> Этот документ объединяет содержательные части старой `AUTH_ARCHITECTURE.md` и текущего `AUTH.md`.
> При конфликте между ними приоритет отдан более позднему подтверждённому runtime evidence.
> Target-функции сохранены, но не выдаются за реализованные.

---

# 1. Роль документа

`AUTH.md` является каноническим системным документом для домена authentication и session.

Документ отвечает за:

- identity пользователя;
- регистрацию;
- подтверждение Email;
- login;
- session restore;
- current-session logout;
- password reset;
- resend verification;
- token/session lifecycle;
- cookie/session transport;
- базовые auth security controls;
- границы между Authentication, Access и Permissions;
- текущие ограничения;
- отдельные target/deferred auth-сценарии.

Документ не является заменой:

- `SYSTEMS/PERMISSIONS.md` — permission model;
- `SYSTEMS/PAYMENTS.md` — платежи и subscriptions;
- `ARCHITECTURE/PLATFORM.md` — общая Access-модель;
- `SYSTEMS/SECURITY.md` — общий security baseline;
- `SYSTEMS/DATABASE.md` — физическая PostgreSQL schema.

---

# 2. Правила статусов

В этом документе используются:

```text
CURRENT
    подтверждено текущим runtime / code / DB evidence

PARTIAL
    работает или подтверждено только часть необходимой модели

PLANNED
    целевая архитектура, runtime не завершён

DEFERRED
    сознательно отложено и не входит в текущий scope

NOT VERIFIED
    существование или поведение не имеет достаточного runtime evidence
```

Наличие архитектурного описания или UI само по себе не означает `CURRENT`.

---

# 3. Текущий статус Authentication

**Общий статус: CURRENT с документированными ограничениями.**

Подтверждённые основные auth flows:

```text
Registration
↓
Email Verification
↓
Login
↓
Session Restore
↓
Current-session Logout
```

Также реализованы:

```text
Resend Verification
Password Reset Request
Password Reset Complete
```

Текущий frontend работает через service/API boundary:

```text
Frontend
↓
src/services/auth/authService.js
↓
src/shared/lib/apiClient.js
↓
Backend Auth API
↓
PostgreSQL
```

Frontend не обращается к PostgreSQL напрямую.

---

# 4. Identity model

## 4.1 Основная идентичность

Основным системным идентификатором пользователя является:

```text
users.id
```

Тип — UUID.

Email является уникальным credential/identifier для authentication, но связи бизнес-данных строятся через `user_id`.

## 4.2 Profile

Профиль связан с пользователем через:

```text
profiles.user_id
```

В текущем runtime profile создаётся **на этапе регистрации в одной DB transaction с user**.

Это важное уточнение.

Нельзя описывать текущую реализацию как:

```text
Registration
↓
Email Verification
↓
Profile Creation
```

Фактическая текущая цепочка:

```text
Registration
↓
transaction: users + profiles
↓
verification token
↓
email verification
```

Это подтверждено текущим auth baseline и более поздним audit evidence.

---

# 5. Registration

**Статус: CURRENT**

Основная цепочка:

```text
Register UI
↓
authService.signUp()
↓
POST /api/auth/register
↓
Zod validation
↓
Duplicate email check
↓
DB transaction
    ├── users
    └── profiles
↓
COMMIT
↓
Create verification token
↓
Attempt verification email delivery
↓
Response
```

## 5.1 Validation

Auth credentials проходят серверную Zod validation.

При malformed input backend возвращает соответствующий validation error.

## 5.2 Duplicate email

Для уже существующего Email предусмотрен отдельный duplicate-email path.

Текущее поведение включает:

```text
409 EMAIL_ALREADY_EXISTS
```

## 5.3 Transaction boundary

`users` и `profiles` создаются внутри одной DB transaction.

То есть в рамках registration transaction:

```text
BEGIN
↓
INSERT users
↓
INSERT profiles
↓
COMMIT
```

После commit создаётся verification token и выполняется попытка отправки письма.

Это означает важное ограничение:

```text
DB commit
    происходит ДО
email delivery
```

## 5.4 Email failure boundary

Если отправка verification email завершается ошибкой после commit:

- пользователь уже существует;
- registration operation может завершиться server-side error;
- recovery path существует через resend verification.

Production email-failure scenario не был специально воспроизведён из-за safe-policy.

Поэтому:

```text
F1-SEC-01 = PARTIALLY VERIFIED
```

а не `fully verified`.

---

# 6. Email Verification

**Статус: CURRENT**

Endpoint:

```text
POST /api/auth/verify-email
```

Токен:

```text
auth_tokens
type = email_verification
```

Целевая и текущая проверка включает:

- token hash;
- type;
- expiry;
- single-use state;
- user binding.

При успешной verification в одной transaction обновляются:

```text
users.email_verified_at
auth_tokens.used_at
```

## 6.1 Expired / used token

Невалидный, истёкший или использованный токен отклоняется.

Frontend получает соответствующий error state.

## 6.2 Resend

Endpoint:

```text
POST /api/auth/resend-verification
```

Resend создаёт новый verification token.

Старый активный verification token должен быть закрыт при создании нового.

Production resend flow подтверждён.

---

# 7. Email verification gate

**Статус: CURRENT**

Login требует подтверждённый Email.

При попытке login до verification backend возвращает:

```text
403 EMAIL_NOT_VERIFIED
```

То есть текущая базовая цепочка:

```text
Valid Credentials
      +
Email Verified
      ↓
Login allowed
```

---

# 8. Login

**Статус: CURRENT**

Endpoint:

```text
POST /api/auth/login
```

Целевая и фактическая sequence:

```text
Validate input
↓
Lookup user
↓
Verify password hash
↓
Check email_verified_at
↓
Create server session
↓
Set session cookie
↓
Authenticated state
```

При неверных credentials используется:

```text
401 INVALID_CREDENTIALS
```

После успешного login frontend обновляет auth state через session restore/context и переходит в приложение.

---

# 9. Session model

**Статус: CURRENT / production baseline VERIFIED**

Сессия является server-side сущностью.

DB table:

```text
sessions
```

В БД сохраняется:

```text
token_hash
```

Raw session token в БД не хранится.

## 9.1 Session token

Текущая backend-модель использует криптографически случайный token, после чего в БД сохраняется его hash.

## 9.2 Cookie

Текущая cookie:

```text
stubbornram_session
```

Подтверждённые параметры:

```text
HttpOnly: true
Secure: true
SameSite: none
Path: /
Max-Age: 30 days
```

## 9.3 Session expiration

Backend использует срок:

```text
SESSION_DAYS = 30
```

DB expiration хранится в `expires_at`.

Session считается действующей при выполнении соответствующего expiry check.

## 9.4 Multiple devices

Каждое устройство может иметь собственную session.

Concurrent sessions допускаются.

Наличие login на одном устройстве не должно автоматически завершать session на другом.

---

# 10. Session restore

**Статус: CURRENT**

При старте приложения frontend восстанавливает session через:

```text
AuthContext
↓
getSession()
↓
authService
↓
GET /api/auth/session
```

`apiClient` использует:

```text
credentials: "include"
```

для cookie-based authentication.

Таким образом frontend не хранит application authentication state как собственную независимую credential system.

---

# 11. Session touch

При обращении к session endpoint Backend обновляет:

```text
last_used_at
```

для действующей session.

Это позволяет фиксировать последнее использование.

---

# 12. Session cleanup

**Статус: CURRENT / production VERIFIED**

В текущем backend реализован housekeeping mechanism:

```text
Startup cleanup
+
Periodic cleanup
```

Период:

```text
24 hours
```

Удаляются только истёкшие sessions:

```sql
DELETE FROM sessions
WHERE expires_at < now()
```

Cleanup не меняет базовую семантику session validity.

Production verification подтвердила:

- expired marker удаляется;
- active marker остаётся;
- scheduler запускается после startup.

---

# 13. Logout

**Статус: CURRENT**

Endpoint:

```text
POST /api/auth/logout
```

Logout текущего пользователя:

```text
Current Cookie Token
↓
Hash
↓
Delete current sessions row
↓
Clear cookie
```

Logout текущего устройства не должен автоматически закрывать sessions других устройств.

---

# 14. Logout all devices

**Статус: DEFERRED / NOT IN CURRENT SCOPE**

Отдельная standalone capability:

```text
logout-all-devices
```

не реализована.

Важно не смешивать это с password reset.

При `password reset complete` массовая session invalidation уже существует.

То есть:

```text
Password Reset
→ all sessions invalidated
```

но:

```text
User-selected "logout all devices"
→ standalone endpoint
```

пока отсутствует.

---

# 15. Password security

**Статус: CURRENT**

Пароли не хранятся в plaintext.

Backend использует Argon2:

```text
argon2.hash
argon2.verify
```

Frontend никогда не получает password hash.

Admin не должен получать password.

Password material не должен присутствовать в application logs.

---

# 16. Password reset

**Статус: CURRENT**

### Request

```text
POST /api/auth/reset-password/request
```

### Complete

```text
POST /api/auth/reset-password/complete
```

Reset token:

- хранится в hashed form;
- имеет expiry;
- является single-use;
- связан с user;
- после использования помечается `used_at`.

После успешного reset:

1. обновляется password hash;
2. reset token становится использованным;
3. существующие user sessions удаляются.

Таким образом password reset выполняет:

```text
Password Recovery
+
Session Invalidation
```

в рамках текущей auth model.

---

# 17. Auth token lifecycle

В текущем runtime используются разные токеновые механизмы.

## 17.1 Session token

```text
Purpose: authentication session
Storage: sessions.token_hash
Lifetime: 30 days
Single-use: no
Invalidation: logout / password reset
```

## 17.2 Email verification token

```text
Purpose: email verification
Storage: auth_tokens
Type: email_verification
Single-use: yes
Expiry: limited
Invalidation: used_at / replacement by new token
```

## 17.3 Password reset token

```text
Purpose: password recovery
Storage: auth_tokens
Type: password_reset
Single-use: yes
Expiry: limited
Invalidation: used_at / replacement by new token
```

---

# 18. Active token uniqueness

**Статус: CURRENT**

В `auth_tokens` существует защита от нескольких одновременно активных токенов одного user/type.

Используется unique constraint/index для состояния:

```text
used_at IS NULL
```

Это означает, что для одной комбинации:

```text
user_id + type
```

не должен существовать более одного активного token.

Это относится прежде всего к:

- email verification;
- password reset.

---

# 19. Cookies и transport boundary

Auth transport является cookie-based.

Основная модель:

```text
Browser
↓
HTTP request + credentials include
↓
Backend
↓
session cookie
```

Не используется модель:

```text
Frontend
↓
Authorization: Bearer <database-like secret>
```

для основной текущей auth session.

---

# 20. CSRF / Origin baseline

**Статус: CURRENT baseline / production VERIFIED**

Для state-changing `/api` requests используется allowed-origin baseline.

Подтверждено:

```text
Allowed Origin
→ request accepted
```

и:

```text
Foreign Origin
→ 403 INVALID_ORIGIN
```

Production verification также подтвердила normal CORS preflight path.

## 20.1 CSRF token

Отдельный CSRF token mechanism не реализован.

Статус:

```text
DEFERRED / FUTURE
```

Это расширение поверх текущего origin baseline, а не доказанный текущий runtime defect.

F1-SEC-02 считается:

```text
FIXED — VERIFIED
```

---

# 21. Rate limiting

**Статус: CURRENT baseline**

Критические authentication endpoints используют endpoint-level rate limiting.

В target security model также предусматриваются ограничения на:

- login attempts;
- password reset;
- verification-related abuse;
- другие sensitive auth operations.

Конкретные operational limits являются частью backend security configuration.

---

# 22. Ownership boundary

Authentication не владеет бизнес-данными.

Auth subsystem отвечает за identity/account/session layer:

```text
users
profiles
sessions
auth_tokens
```

Бизнес-данные связываются с пользователем через:

```text
user_id
```

или соответствующие domain ownership keys.

Это разделение предотвращает смешивание:

```text
Authentication
```

с:

```text
Business Data
```

---

# 23. Authentication ≠ Access

Это обязательное архитектурное разделение.

```text
Authentication
= Who is the user?

Access
= Is the user currently entitled to use protected functionality?

Permissions
= Which action is allowed on which object?
```

Например:

```text
Authenticated
≠
Full Access
```

Пользователь может иметь действующую session и одновременно находиться в restricted access state.

Окончательная Access-модель определяется:

```text
ARCHITECTURE/PLATFORM.md
SYSTEMS/PAYMENTS.md
SYSTEMS/PERMISSIONS.md
```

---

# 24. Authentication ≠ Permissions

Успешный login не означает право изменить любой объект.

Target processing:

```text
Authentication
↓
Session Validity
↓
Access State
↓
Permission
↓
Ownership / Relationship / Object State
↓
Business Operation
```

В текущем runtime полноценная platform-wide permission engine пока не реализована.

В отдельных существующих routes уже присутствуют auth + ownership checks.

---

# 25. Current security-backed auth behaviour

Подтверждено в текущем baseline:

- password hashing server-side;
- Argon2 verification;
- email verification gate;
- hashed session tokens;
- secure session cookie;
- session expiration;
- current-session logout;
- reset-password token lifecycle;
- invalidation of existing sessions after password reset;
- active-token uniqueness;
- state-changing allowed-origin baseline;
- session cleanup at startup + daily scheduler;
- critical auth route rate limiting.

---

# 26. Verified production auth paths

По final foundation evidence:

### Registration

```text
POST https://api.stubbornram.ru/api/auth/register
→ 201
```

Подтверждены:

- success path;
- `emailVerificationRequired`;
- `verificationEmailSent`.

### Resend verification

```text
POST https://api.stubbornram.ru/api/auth/resend-verification
→ 200
```

### Origin protection

Подтверждены:

```text
Allowed origin
→ accepted
```

и:

```text
Foreign origin
→ 403
```

### Session cleanup

Production startup cleanup и selective cleanup test подтверждены.

---

# 27. F1-SEC-01

**Статус: PARTIALLY VERIFIED**

Подтверждено:

- production registration success path;
- production resend verification;
- implementation and recovery path;
- transaction ordering `users/profiles commit → email send`.

Не подтверждено:

- специальная production simulation provider/email failure.

Причина отсутствия полной проверки:

- воспроизведение требовало бы намеренно ломать production provider/config path;
- по safe-policy такая проверка не выполнялась.

Это не следует описывать как unresolved core authentication failure.

---

# 28. F1-SEC-02

**Статус: FIXED — VERIFIED**

Предмет:

```text
CSRF / Origin baseline
```

Подтверждено:

- allowed state-changing origin;
- foreign origin rejection;
- preflight;
- normal auth/session behaviour after the control.

Отдельный CSRF token mechanism остаётся deferred.

---

# 29. F1-SEC-03

**Статус: FIXED — VERIFIED**

Предмет:

```text
Expired session cleanup
```

Подтверждено:

- startup cleanup;
- periodic cleanup;
- expired rows removed;
- active rows preserved;
- no change to session lifetime semantics.

---

# 30. Welcome Flow

**Статус: PLANNED / NOT VERIFIED as auth gate**

В старой target-архитектуре предусмотрен обязательный Welcome Flow:

```text
Email Verification
↓
Welcome Flow
↓
Home
```

Предполагалось состояние:

```text
onboarding_completed
```

и последовательность экранов:

1. приветствие;
2. выбор первоначального статуса использования;
3. знакомство с основными возможностями;
4. переход на Home.

Однако текущий auth runtime baseline не подтверждает, что Welcome Flow является обязательным server-enforced gate.

Поэтому в текущем каноническом статусе:

```text
Welcome Flow
= TARGET / PLANNED
```

а не CURRENT.

---

# 31. Account redirect behaviour

Target architecture предусматривает:

```text
Unauthenticated user
→ Landing / Auth flow
```

и:

```text
Valid authenticated session
→ Application
```

Email-not-verified и будущие onboarding states могут быть отдельными route gates.

Фактическая реализация route guards должна определяться текущим frontend router/auth runtime, а не только этой target-спецификацией.

---

# 32. Trial и Authentication

Trial не является частью authentication.

Целевая модель:

```text
Authentication
        +
Access Source
        =
Current Product Access
```

Trial является access source, а не session type.

Target rule:

```text
10 календарных дней
```

Старт — после выполнения определённых onboarding conditions, включая подтверждение Email и создание профиля.

Однако полноценный Trial lifecycle в текущем runtime не подтверждён как реализованный.

---

# 33. Ограниченный доступ

Authentication session не обязательно прекращается при окончании полного доступа.

Ключевое различие:

```text
Access expired
≠
Auth session revoked
```

Target model допускает:

- login;
- просмотр существующей истории;
- управление аккаунтом;
- восстановление полного access.

Какие именно операции остаются доступными, определяются Access/Permissions layers.

---

# 34. Личная подписка и coach access

Authentication не управляет payment state напрямую.

В target-модели:

```text
Personal Subscription
OR
Coach-related Access
OR
Trial
```

создают соответствующий access source.

Подробности:

```text
SYSTEMS/PAYMENTS.md
ARCHITECTURE/PLATFORM.md
```

---

# 35. Email change

**Статус: TARGET / PLANNED**

Target model предусматривает:

1. только авторизованный пользователь может запросить Email change;
2. critical action может требовать re-authentication;
3. новый Email подтверждается отдельным verification flow;
4. до подтверждения новый Email не становится login credential;
5. account identity (`user_id`) не меняется;
6. profile, history, subscriptions и domain data сохраняются.

Полный current runtime для Email-change flow в актуальном auth baseline не подтверждён.

---

# 36. Account deletion

**Статус: TARGET / PLANNED**

Target architecture предусматривает:

```text
Delete Account Request
↓
Archived Account State
```

с возможностью сохранения данных согласно retention/legal policy.

Удаление account identity не должно автоматически означать немедленное физическое удаление всех данных.

Окончательная retention policy определяется отдельно security/legal rules.

Текущий production account-deletion lifecycle как полноценная auth capability не подтверждён.

---

# 37. Biometric unlock

**Статус: PLANNED / FUTURE**

Биометрия может использоваться только как механизм локального быстрого открытия ранее авторизованной сессии.

Она не должна становиться самостоятельной заменой server-side authentication.

При отсутствии valid session биometric unlock не должен предоставлять новый auth state сам по себе.

В текущем runtime не реализован как подтверждённый auth capability.

---

# 38. Two-factor authentication

**Статус: DEFERRED / FUTURE**

2FA не используется в текущем auth runtime.

Архитектура должна позволять подключить 2FA без перестройки:

- user identity;
- business data;
- core session model.

Отдельная authenticator/email MFA implementation пока не входит в текущий verified baseline.

---

# 39. Administrative authentication boundary

Admin access не должен создавать отдельную credential model, полностью отделённую от базовой account identity.

Однако admin authorization является отдельным access/permission/security concern.

Admin не должен получать:

- user passwords;
- password hashes для operational use;
- session secrets;
- provider secrets.

Подробные admin controls определяются:

```text
SYSTEMS/SECURITY.md
SYSTEMS/PERMISSIONS.md
SYSTEMS/SERVER.md
```

---

# 40. Frontend boundaries

Auth frontend integration должна идти:

```text
Component
↓
authService
↓
apiClient
↓
Backend
```

Текущие `authService` operations включают:

```text
/auth/register
/auth/login
/auth/session
/auth/logout
/auth/resend-verification
/auth/verify-email
/auth/reset-password/request
/auth/reset-password/complete
```

`AuthContext` отвечает за восстановление session/application auth state.

---

# 41. Backend boundaries

Auth backend отвечает за:

- input validation;
- identity lookup;
- password verification;
- email verification;
- token lifecycle;
- session creation;
- session validation;
- logout;
- password reset;
- session invalidation;
- auth security controls.

Auth backend не должен:

- напрямую отдавать PostgreSQL credentials frontend;
- делегировать критические auth decisions frontend;
- хранить business data вместо domain modules.

---

# 42. Database boundaries

Подтверждённые auth tables:

```text
users
profiles
sessions
auth_tokens
```

Ключевые ограничения:

```text
users.email UNIQUE
sessions.token_hash UNIQUE
auth_tokens.token_hash UNIQUE
active auth token per user/type UNIQUE
FK → users.id
```

Физическая schema является ответственностью:

```text
SYSTEMS/DATABASE.md
```

---

# 43. Current API surface

Подтверждённые auth endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/session
POST /api/auth/logout
POST /api/auth/resend-verification
POST /api/auth/verify-email
POST /api/auth/reset-password/request
POST /api/auth/reset-password/complete
```

Полноценные target endpoints для:

```text
logout-all-devices
email-change
account-deletion
2FA
biometric auth
```

не следует считать current API capabilities без отдельного runtime evidence.

---

# 44. Error semantics

Из подтверждённых auth flows используются, в частности:

```text
400 INVALID_INPUT
401 INVALID_CREDENTIALS
403 EMAIL_NOT_VERIFIED
403 INVALID_ORIGIN
409 EMAIL_ALREADY_EXISTS
```

Точный error contract является частью backend API contract и должен оставаться единообразным.

Frontend не должен подменять server truth локальной интерпретацией состояния аккаунта.

---

# 45. Recovery paths

Auth architecture должна обеспечивать восстановимость неуспешных сценариев.

Подтверждённый пример:

```text
Registration
→ email delivery problem
→ account already exists
→ resend verification
→ verification
→ login
```

Это важное свойство текущего F1-SEC-01 flow.

---

# 46. Что считать реализованным

### CURRENT

- registration;
- users/profiles creation transaction;
- email verification;
- resend verification;
- login;
- session creation;
- session restore;
- current-session logout;
- password reset request;
- password reset complete;
- session invalidation after password reset;
- hashed session tokens;
- secure cookie;
- session expiry;
- periodic expired-session cleanup;
- allowed-origin baseline;
- auth endpoint rate limiting;
- active-token uniqueness.

### PARTIAL / NOT VERIFIED

- complete production verification of registration email-failure behaviour.

### DEFERRED

- logout-all-devices standalone capability;
- CSRF token enhancement;
- 2FA/MFA;
- other future hardening extensions.

### PLANNED / NOT CURRENT

- mandatory Welcome Flow gate;
- full Email-change lifecycle;
- full account-deletion lifecycle;
- biometric unlock.

---

# 47. Что нельзя считать реализованным

Следующие утверждения нельзя считать фактами только на основании архитектурной документации:

```text
"Welcome Flow уже является обязательным server gate."
"Trial уже автоматически работает 10 дней."
"Email change уже полностью работает."
"Удаление аккаунта уже имеет archival lifecycle."
"Logout all devices уже доступен отдельным endpoint."
"2FA уже включена."
"Биометрия уже является authentication mechanism."
```

Для каждого такого утверждения требуется соответствующее code/API/DB/runtime evidence.

---

# 48. Final architecture

Текущая подтверждённая цепочка:

```text
React / PWA
      ↓
Auth Components
      ↓
authService
      ↓
apiClient
      ↓
Backend Auth API
      ↓
Authentication / Session Logic
      ↓
PostgreSQL
      ↓
users / profiles / sessions / auth_tokens
```

Security boundaries:

```text
Frontend
   ↓
HTTPS / Cookie
   ↓
Backend
   ↓
Validation + Auth Controls
   ↓
PostgreSQL
```

Access boundaries:

```text
Authentication
      ↓
Session Validity
      ↓
Access State
      ↓
Permissions
      ↓
Ownership / Relationship / Object State
      ↓
Business Operation
```

---

# 49. Связанные канонические документы

```text
ARCHITECTURE/ARCHITECTURE.md
ARCHITECTURE/PLATFORM.md
ARCHITECTURE/APP_STRUCTURE.md
SYSTEMS/SECURITY.md
SYSTEMS/PERMISSIONS.md
SYSTEMS/PAYMENTS.md
SYSTEMS/DATABASE.md
SYSTEMS/COACH_CLIENT_RELATIONSHIP.md
SYSTEM_STATE/SYSTEM_STATE_FINAL.md
```

Evidence/provenance:

```text
AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
AUDIT/PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
```

---

# 50. Главный принцип

**Authentication подтверждает, кто пользователь и действительно ли существует действующая сессия.**

**Authentication не определяет самостоятельно полный продуктовый доступ.**

**Access определяется отдельным слоем источников доступа.**

**Permissions определяют допустимость конкретного действия.**

**Ownership и Relationship ограничивают область работы с конкретными объектами.**

В текущем Stubborn Ram базовый authentication/session слой является рабочим и production-verified с документированными ограничениями. Более широкие target-сценарии должны внедряться отдельно и не должны смешиваться с уже подтверждённым authentication baseline.
