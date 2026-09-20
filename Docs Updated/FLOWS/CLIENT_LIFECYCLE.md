# CLIENT_LIFECYCLE.md — Stubborn Ram

**Статус документа:** CANONICAL / CURRENT + TARGET  
**Актуальность фактов:** 19.09.2026  
**Назначение:** сквозной жизненный цикл клиента от публичной части платформы до использования приложения и optional Coach Relationship.

---

# 1. Назначение

Этот документ описывает путь пользователя как клиента платформы.

Он не заменяет детальные документы Auth, Training, Reports или Coach/Client Relationship. Его задача — показать последовательность пользовательских состояний и переходов между основными доменными зонами.

Документ всегда разделяет:

- **CURRENT** — что подтверждено текущим runtime;
- **TARGET / PLANNED** — целевой продуктовый путь;
- **NOT VERIFIED** — сценарии, для которых нет достаточного runtime evidence.

---

# 2. Current baseline

Текущий реализованный пользовательский контур включает:

- публичную landing page;
- регистрацию через Backend API;
- подтверждение Email;
- login;
- server-side session;
- восстановление пароля;
- защищённые app routes;
- App Shell;
- Home;
- базовые внутренние module routes.

Текущая auth implementation создаёт `user + profile` в одной DB transaction на регистрации. Email verification остаётся обязательным gate для login.

Цепочка текущего runtime:

```text
Landing
   ↓
Registration
   ↓
User + Profile persistence
   ↓
Email Verification
   ↓
Login
   ↓
Session
   ↓
Protected App
   ↓
Home / Modules
```

---

# 3. Первый вход и регистрация

## CURRENT

1. Пользователь находится на public landing.
2. Пользователь запускает регистрацию.
3. Frontend передаёт данные в Auth Service.
4. Auth Service использует `apiClient`.
5. Backend валидирует входные данные.
6. Backend создаёт User и Profile в одной транзакции.
7. Создаётся verification token.
8. Backend пытается отправить verification email.
9. Пользователь должен подтвердить Email.
10. До подтверждения login блокируется `EMAIL_NOT_VERIFIED`.

Архитектурная цепочка:

```text
Registration UI
      ↓
authService
      ↓
apiClient
      ↓
Backend Auth API
      ↓
PostgreSQL
```

---

# 4. Email Verification

## CURRENT

Пользователь получает verification message и открывает verification flow.

Целевая/реализованная серверная логика:

```text
Verification Token
      ↓
Backend transaction
      ↓
email_verified_at
      +
token used_at
```

После успешного подтверждения Email пользователь может пройти login.

Поведение production для нормального verification/resend path подтверждено.

Симуляция production failure email delivery остаётся отдельным partially verified пунктом F1-SEC-01 и не относится к завершённости client lifecycle.

---

# 5. Login и Session

## CURRENT

После подтверждения Email:

```text
Login
  ↓
password verification
  ↓
email verification gate
  ↓
server session
  ↓
secure cookie
```

При следующем открытии приложения:

```text
AuthContext
   ↓
authService.getSession()
   ↓
apiClient
   ↓
GET /api/auth/session
```

При действующей session пользователь восстанавливается без повторной регистрации.

Session cleanup и baseline Origin protection подтверждены в актуальном remediation baseline.

---

# 6. Попадание во внутреннее приложение

## CURRENT

После успешной authentication пользователь работает внутри App Shell.

Основной экран:

```text
/app/home
```

Home является навигационным центром и ведёт к основным модулям.

Общая последовательность:

```text
Authenticated User
       ↓
App Shell
       ↓
Home
       ↓
Training / Report / Profile / Chat / ...
```

Часть внутренних модулей пока является placeholder/partial.

---

# 7. Profile

## CURRENT

Profile используется как identity/account screen.

Текущий route:

```text
/app/profile
```

Он показывает:

- avatar;
- display name;
- email;
- account/support/about sections;
- logout action.

Полный profile edit/save lifecycle пока не реализован.

---

# 8. Questionnaire

## CURRENT

Анкета является отдельным coaching intake flow.

Подтверждённый baseline:

```text
Questionnaire
    ↓
createLead
    ↓
leadService
    ↓
apiClient
    ↓
POST /api/leads
```

Lead persistence и questionnaire/coaching flow относятся к существующему foundation scope.

Анкета не должна автоматически трактоваться как обязательный auth gate.

---

# 9. Welcome Flow

## TARGET

Целевая архитектура предусматривает Welcome Flow:

```text
Email Verification
      ↓
Profile / onboarding setup
      ↓
Welcome
      ↓
Initial status selection
      ↓
Platform introduction
      ↓
Home
```

Однако отдельный обязательный Welcome Flow сейчас **NOT VERIFIED / NOT IMPLEMENTED как подтверждённый runtime gate**.

Поэтому он не должен описываться как текущий обязательный шаг client runtime.

---

# 10. Самостоятельный режим

## TARGET

Самостоятельный пользователь работает по общей модели:

```text
создать
  ↓
изменить
  ↓
выполнить
  ↓
проанализировать
```

Наличие Coach Relationship не должно менять базовую структуру пользовательских данных.

---

# 11. Подключение тренера

## TARGET

Client может подключить тренера в любой момент, не создавая новый аккаунт.

Целевой flow:

```text
Client
  ↓
Trainer ID
  ↓
Connection Request
  ↓
Coach
  ├── Accept → ACTIVE Relationship
  └── Reject
```

Pending request может быть отменён.

Отклонённый запрос может быть создан повторно.

До Accept тренер не получает client data.

Эта часть пока не реализована в runtime.

---

# 12. Работа клиента при ACTIVE Relationship

## TARGET

При active relationship клиент продолжает использовать собственный кабинет и данные.

Целевая модель:

```text
Client owns data
      +
Coach has permitted access
```

Client сохраняет возможность:

- просматривать данные;
- выполнять назначения;
- вводить фактические данные;
- формировать отчёты;
- анализировать собственную историю;
- общаться с тренером.

В target model Coach может управлять разрешёнными назначениями, но ownership клиентских данных не меняется.

---

# 13. Отчёт

## TARGET

Weekly Report является user-owned объектом.

Цепочка:

```text
Client
  ↓
Create Report
  ↓
Fill period data
  ↓
Attach permitted media
  ↓
Save Draft
  ↓
Submit
  ↓
Coach Review
  ↓
Feedback
```

Тренер получает доступ только при соответствующей relationship/permission context.

Полный report backend lifecycle сейчас не реализован.

---

# 14. Chat

## TARGET

При наличии active relationship клиент получает доступ к coach/client communication.

Целевая модель:

```text
Active Relationship
      +
Chat Permission
      ↓
Primary Coach ↔ Client Chat
```

Один primary chat предусматривается на пару Coach ↔ Client.

Chat должен хранить сообщения, а business objects остаются в собственных модулях.

Полный backend Chat runtime пока отсутствует.

---

# 15. Данные и история

Пользовательская история должна сохраняться независимо от изменения источника access.

Target invariant:

```text
Access changes
      ≠
Data deletion
```

Окончание:

- Trial;
- personal subscription;
- coach relationship

не должно автоматически удалять пользовательскую историю.

После окончания access source система может ограничивать создание новых данных, не уничтожая существующие.

---

# 16. Завершение Coach Relationship

## TARGET

После завершения relationship:

```text
ACTIVE
  ↓
ARCHIVED
```

Клиент:

- продолжает владеть всеми данными;
- продолжает видеть собственную историю;
- получает новый access context;
- может позднее подключить другого тренера.

Новый тренер не должен автоматически получать всю старую историю предыдущего coach period.

Исторический доступ регулируется отдельной permission policy.

---

# 17. История сотрудничества

## TARGET

Один активный тренер предусмотрен для MVP, но история может содержать несколько последовательных периодов:

```text
Coach A
   ↓
Self
   ↓
Coach B
   ↓
Self
   ↓
Coach A
```

Relationship history не должна удаляться при смене тренера.

---

# 18. Current vs Target

| Этап                    | Current               | Target                                    |
| ----------------------- | --------------------- | ----------------------------------------- |
| Landing                 | ✅                    | сохранить                                 |
| Registration            | ✅                    | сохранить                                 |
| Email verification      | ✅                    | сохранить                                 |
| Login/session           | ✅                    | сохранить                                 |
| Protected app           | ✅                    | сохранить                                 |
| Home                    | ✅                    | развить dynamic state                     |
| Profile                 | ⚠️ partial            | полный account lifecycle                  |
| Questionnaire           | ✅ foundation flow    | расширять отдельно                        |
| Welcome gate            | ❓ not verified       | реализовать как отдельный onboarding flow |
| Coach connection        | ❌                    | Trainer ID + request                      |
| Active relationship     | ❌                    | persistent relationship                   |
| Coach access            | ❌ relationship layer | permission-aware                          |
| Reports                 | ⚠️ placeholder        | полноценный lifecycle                     |
| Chat                    | ⚠️ placeholder        | persistence/realtime                      |
| Relationship archive    | ❌                    | history-preserving archive                |
| Historical coach access | ❌                    | policy + permissions                      |

---

# 19. Главный принцип Client Lifecycle

Пользовательский аккаунт является постоянным.

Меняться могут:

- access source;
- наличие Coach;
- relationship state;
- permissions;
- доступность конкретных collaborative tools.

Не должна меняться базовая идентичность пользователя и его ownership истории.

Целевая модель:

```text
One User Account
      ↓
Personal History
      ↓
Optional Coaching Periods
      ↓
History remains
```
