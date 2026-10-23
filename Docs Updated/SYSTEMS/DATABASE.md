# DATABASE.md — Stubborn Ram

**Статус:** CANONICAL / CURRENT + TARGET ARCHITECTURE BOUNDARY  
**Актуальность текущих фактов:** 19.09.2026  
**Назначение:** единое описание слоя PostgreSQL Stubborn Ram с чётким разделением между реализованной production-схемой и целевой схемой будущих модулей.

> Этот документ заменяет разрозненное описание текущей PostgreSQL-схемы и целевой `DATABASE_SCHEMA.md`.
> CURRENT означает подтверждённое текущим runtime / schema evidence.
> PLANNED означает согласованную целевую архитектуру, которая не должна считаться реализованной только из-за наличия UI, документа или migration-файла.
> Forensic-доказательства, remediation и исторические расхождения сохраняются в AUDIT/System State документах.

---

# 1. Роль документа

`DATABASE.md` фиксирует:

- модель Local / Production PostgreSQL;
- runtime-путь приложения к БД;
- текущую реализованную schema;
- подтверждённые production tables, relationships и constraints;
- состояние migrations;
- ownership и referential integrity;
- текущую persistence-модель Training, Training Set Notes и Media;
- target-модель для Coach/Client Relationship, Chat, Reports и последующих модулей;
- правила проектирования новых таблиц;
- границы verification и известные расхождения.

Главное правило статусов:

```text
CURRENT  = подтверждено текущим runtime / DB evidence
PLANNED  = целевая архитектура, ещё не считать production implementation
```

Наличие записи в документации, экрана во frontend или SQL migration в repository само по себе не доказывает наличие соответствующей production-схемы.

---

# 2. Принципы проектирования

База данных Stubborn Ram проектируется с учётом:

- долгосрочного развития продукта;
- безопасности пользовательских данных;
- разделения системных и бизнес-данных;
- сохранения пользовательской истории;
- явного ownership;
- referential integrity;
- возможности расширения ролей и нескольких специалистов в будущем.

## 2.1 Только подтверждённые решения

В фактическую схему не должны попадать предположения только потому, что они упомянуты в product documentation.

Идеи, целевые сущности и будущие сценарии должны иметь отдельный PLANNED/TARGET статус до появления подтверждённой migration + runtime evidence.

## 2.2 Разделение ответственности

Каждая таблица должна отвечать за конкретный тип данных.

Структура БД должна соответствовать границам модулей приложения, но не должна дублировать одну и ту же каноническую бизнес-сущность между модулями.

## 2.3 Владение данными

Для пользовательских данных система должна различать:

- кто является владельцем данных;
- кто создал запись или элемент;
- кто имеет право доступа;
- кто имеет право изменения.

Для тех сущностей, где ownership и authorship имеют разные смысловые роли, они должны моделироваться отдельно.

## 2.4 Идентификатор пользователя

Постоянным идентификатором аккаунта является `users.id` / `user_id`.

Email, имя пользователя и изменяемые характеристики аккаунта не используются как внешние ключи между бизнес-сущностями.

Изменение Email или профильных данных не должно нарушать целостность ссылок на пользовательскую историю.

## 2.5 Сохранение истории

Пользовательские данные проектируются как долгосрочные.

Изменение режима использования платформы, смена тренера, окончание Trial или изменение отдельных настроек не должны сами по себе трактоваться как разрешение на уничтожение исторических данных.

Окончательная data-retention / deletion policy является отдельной областью governance.

---

# 3. User / Account / Profile model

Stubborn Ram разделяет:

```text
AUTH ACCOUNT
↓
PROFILE
↓
BUSINESS DATA
```

Auth отвечает за идентификацию аккаунта, credentials и sessions.

Profile является представлением основных пользовательских данных.

Business tables не должны использовать auth Email как внешний идентификатор.

## 3.1 `users`

**Статус:** CURRENT IMPLEMENTED — production.

Назначение: идентичность auth-аккаунта.

Основные поля:

```text
id
email
password_hash
email_verified_at
created_at
updated_at
```

Ключевые ограничения:

- `id` — primary key;
- `email` — unique.

Пароль хранится в виде password hash, а не plaintext.

## 3.2 `profiles`

**Статус:** CURRENT IMPLEMENTED — baseline.

Назначение: основной профиль пользователя внутри Stubborn Ram.

Основные поля:

```text
user_id
first_name
last_name
avatar_media_id
created_at
updated_at
```

Ключевые ограничения:

- `user_id` — primary key;
- `user_id -> users.id`;
- удаление аккаунта каскадирует профиль в текущей SQL-схеме.

Profile не является владельцем бизнес-сущностей вместо аккаунта. Ownership пользовательских данных определяется через постоянный `user_id`.

Историческая целевая модель предусматривала дополнительные profile attributes, включая trial/account state и welcome-state. Эти поля не следует считать частью текущей production schema без отдельного подтверждения.

---

# 4. Local и Production PostgreSQL

## 4.1 Local

**Статус:** CURRENT.

Local Backend использует отдельный локальный PostgreSQL instance.

```text
Host:     127.0.0.1
Port:     5432
Database: stubbornram
User:     stubbornram_app
```

Local предназначен для:

- разработки;
- локальной проверки;
- подготовки schema/migrations;
- проверки изменений до production rollout.

Local DB не является копией Production DB и не должна рассматриваться как автоматальный backup Production.

## 4.2 Production

**Статус:** CURRENT.

Production PostgreSQL находится на том же Selectel Cloud Server, что и production Backend.

```text
Provider host: Selectel Cloud Server
PostgreSQL:    16.15
Host:          127.0.0.1
Port:          5432
Database:      stubbornram
Role:          stubbornram_app
```

Внешний прямой доступ к PostgreSQL закрыт.

Production DB является отдельной БД относительно Local DB, даже при одинаковых имени database и application role.

---

# 5. Runtime architecture DB

Для application flows канонический путь выглядит так:

```text
Frontend
↓
Service
↓
apiClient
↓
Backend API
↓
Fastify
↓
PostgreSQL
```

Frontend не подключается к PostgreSQL напрямую.

Параметры DB подключения передаются Backend через environment configuration.

Используемые DB-модули:

```text
backend/modules/db/database.js
backend/database.cjs
```

Административный доступ к DB через pgAdmin является отдельным operational/admin контуром и не заменяет Backend API как основной runtime-путь приложения.

---

# 6. Migration model

Используется `node-pg-migrate`.

Обычный запуск Backend:

```text
npm start
```

не должен автоматически менять production schema.

Отдельный запуск migrations:

```text
npm run migrate
```

Таким образом разделяются:

```text
Code deployment
≠
DB migration
```

Это позволяет выполнять code-only deployment без несанкционированного изменения схемы.

Для code-only rollout действует правило:

```text
NO MIGRATIONS
NO .env OVERWRITE
```

---

# 7. Production schema snapshot

**Статус:** VERIFIED SNAPSHOT / read-only.  
**Дата snapshot:** 19.09.2026.

Production public-schema inventory проверялся в read-only режиме.

Подтверждённые application tables в каноническом текущем baseline:

```text
users
profiles
sessions
auth_tokens
leads

exercises
workouts
workout_exercises
workout_sets
training_set_notes

media
media_links
```

Migration-tracking table:

```text
pgmigrations
```

Sequence:

```text
pgmigrations_id_seq
```

## 7.1 Point-in-time volume snapshot

Forensic inventory на 19.09.2026 фиксировал:

```text
exercises           232
auth_tokens          14
sessions              7
users                 5
profiles              4
leads                 3
workout_exercises     3
media                 2
workout_sets          2
pgmigrations         10
media_links           0
training_set_notes    0
```

Итого:

```text
272 rows — без pgmigrations
282 rows — включая pgmigrations
```

Эти значения являются point-in-time snapshot и не должны использоваться как постоянные счетчики.

## 7.2 Документированное расхождение inventory

В одном ручном inventory-перечне forensic-аудита `workouts` не была перечислена, хотя текущие database/training evidence описывают `workouts` как реализованную часть Training persistence и Training flows используют эту сущность.

Поэтому в каноническом DB-документе:

```text
workouts = CURRENT IMPLEMENTED
```

Числовые totals и ручные списки из forensic inventory должны пониматься как read-only snapshot с возможным documentation omission, а не как единственная будущая истина schema.

При следующей DB inventory-проверке existence + columns + constraints `workouts` должна быть отдельно подтверждена и синхронизирована с System State.

---

# 8. Current implemented tables

## 8.1 `users`

**CURRENT IMPLEMENTED.**

```text
id
email
password_hash
email_verified_at
created_at
updated_at
```

Constraints:

- primary key `id`;
- unique `email`.

## 8.2 `profiles`

**CURRENT IMPLEMENTED.**

```text
user_id
first_name
last_name
avatar_media_id
created_at
updated_at
```

Constraints:

- primary key `user_id`;
- FK `user_id -> users.id`;
- cascade delete from users to profile.

## 8.3 `sessions`

**CURRENT IMPLEMENTED.**

Purpose: persistent login sessions.

```text
id
user_id
token_hash
expires_at
last_used_at
```

Constraints/indexes:

- primary key `id`;
- FK `user_id -> users.id`;
- cascade delete;
- unique `token_hash`;
- index `user_id`;
- index `expires_at`.

В БД хранится hash session token, не plaintext token.

## 8.4 `auth_tokens`

**CURRENT IMPLEMENTED.**

Purpose: verification/reset tokens.

```text
id
user_id
type
token_hash
expires_at
used_at
created_at
```

Constraints:

- primary key `id`;
- FK `user_id -> users.id`;
- cascade delete;
- unique `token_hash`;
- максимум один активный token одного `type` на пользователя при `used_at IS NULL`.

Поддерживаемые текущим auth flow types включают:

```text
email_verification
password_reset
```

## 8.5 `leads`

**CURRENT IMPLEMENTED — отдельный lead/questionnaire flow.**

Используемые SQL-артефакты legacy/base:

```text
database/001_create_leads.sql
database/002_leads_rls.sql
```

Назначение: questionnaire / lead capture.

Documented fields include:

```text
id
created_at
status
full_name
age
goals
...
```

Ключевые ограничения/индексы включают primary key `id` и индексы по `created_at` и `status`.

Leads являются отдельным data-flow и не должны путаться с authenticated `users`.

## 8.6 `exercises`

**CURRENT IMPLEMENTED — Training.**

Назначение: каталог упражнений.

Текущая модель:

```text
user_id IS NULL
    → system exercise

user_id = users.id
    → personal exercise
```

Основные поля:

```text
id
name
muscle_group
user_id
created_at
updated_at
```

Constraints/indexes:

- primary key `id`;
- FK `user_id -> users.id`;
- cascade delete;
- index `(user_id, name)`.

На 19.09.2026 подтверждено 232 системных упражнения.

Полный frontend/backend CRUD lifecycle пользовательских упражнений ещё не считается реализованным.

---

# 9. Training persistence

**Статус:** CURRENT IMPLEMENTED — production.

Каноническая модель:

```text
USER
↓
WORKOUT
↓
WORKOUT_EXERCISE
↓
WORKOUT_SET

WORKOUT_EXERCISE
↓
EXERCISE
```

Training не должен создавать копии исторических workout-данных для History, Reports, Analytics или других модулей.

## 9.1 `workouts`

**CURRENT IMPLEMENTED.**

Назначение: фактическая тренировка пользователя.

Основные поля:

```text
id
user_id
title
training_date
start_time
end_time
training_type
comment
status
completed_at
created_at
updated_at
```

Ownership:

```text
workouts.user_id -> users.id
```

Основные индексы:

```text
(user_id, training_date)
(user_id, created_at)
```

Training Backend API использует `workouts` для списка, деталей, создания, редактирования и удаления тренировок.

## 9.2 `workout_exercises`

Назначение: упорядоченные строки упражнений внутри конкретной тренировки.

Основные поля:

```text
id
workout_id
exercise_id
position
exercise_comment
superset_after
created_at
updated_at
```

Связи:

```text
workout_id  -> workouts.id
exercise_id -> exercises.id
```

Delete behavior:

```text
workout -> workout_exercises = CASCADE
exercise referenced by history = RESTRICT
```

Историческая ссылка на exercise не должна позволять случайно уничтожить необходимый объект истории.

## 9.3 `workout_sets`

Назначение: отдельная запись фактического подхода и его performance metrics.

Основные поля:

```text
id
workout_exercise_id
position
weight
repetitions
difficulty
distance
calories
speed
power
incline
time
rir
rpe
rest
intensity_methods JSONB
```

Связь:

```text
workout_exercise_id -> workout_exercises.id
```

Индекс:

```text
(workout_exercise_id, position)
```

Delete behavior:

```text
workout_exercise -> workout_sets = CASCADE
```

---

# 10. Training Set Notes

## `training_set_notes`

**Статус:** CURRENT IMPLEMENTED — production.

Назначение:

- заметка клиента для конкретного `workout_set`;
- feedback тренера для конкретного `workout_set`.

Для одного `workout_set` допускается:

```text
0..1 CLIENT_NOTE
0..1 TRAINER_FEEDBACK
```

Основные поля:

```text
id
workout_set_id
author_id
type
comment
created_at
updated_at
```

Связи:

```text
workout_set_id -> workout_sets.id
author_id      -> users.id
```

`type` ограничивается:

```text
CLIENT_NOTE
TRAINER_FEEDBACK
```

У одного `workout_set` не может существовать более одной записи каждого типа.

### 10.1 Semantics

Training Set Note — отдельная сущность и не является Chat message.

Она не образует conversation thread и не должна использовать Chat storage как источник истины.

### 10.2 Media в Training Set Notes

Текст хранится в `training_set_notes`.

Фотографии и видео представлены отдельными `media`-объектами.

Связь с note выполняется через `media_links`.

Целевая логика удаления:

```text
workout_set deleted
↓
training_set_notes deleted
↓
связанные media очищаются по соответствующему media lifecycle
```

Физическая очистка Object Storage должна выполняться в рамках подтверждённого media flow, а не за счёт хранения бинарного содержимого в PostgreSQL.

---

# 11. Media persistence

**Статус:** CURRENT IMPLEMENTED — metadata + storage flow.

Основной принцип:

```text
PostgreSQL
↓
media metadata + links

Object Storage
↓
binary files
```

Сами файлы не хранятся непосредственно в PostgreSQL.

## 11.1 `media`

Основные поля:

```text
id
owner_id
author_id
object_key
original_name
mime_type
size_bytes
status
```

Связи:

```text
owner_id  -> users.id
author_id -> users.id
```

Ограничения:

- primary key `id`;
- unique `object_key`;
- контролируемый `status`, включая `UPLOADING`, `READY`, `PROCESSING`, `FAILED`.

Семантика:

```text
owner_id
→ кому принадлежат данные

author_id
→ кто создал конкретную запись
```

Автор и владелец могут совпадать.

## 11.2 `media_links`

Назначение: связь media-object с конкретной доменной сущностью.

Основные поля:

```text
id
media_id
entity_type
entity_id
role
sort_order
created_at
```

Связь:

```text
media_id -> media.id
```

Индексы:

```text
(entity_type, entity_id)
(media_id)
```

`media_links` не хранит бинарный файл.

## 11.3 Media object semantics

Архитектурное правило:

```text
одна загрузка
→ один самостоятельный MEDIA-object
```

Если тот же физический файл повторно загружается в другой контекст, создаётся новый самостоятельный media object.

Например:

```text
REPORT
↓
MEDIA A

TRAINING
↓
MEDIA B
```

`MEDIA A` и `MEDIA B` могут иметь одинаковое физическое содержимое, но являются независимыми объектами системы.

Удаление или изменение `MEDIA A` не должно менять `MEDIA B`.

### 11.4 Private media

Пользовательские media являются приватными.

Доступ должен предоставляться после server-side проверки ownership/permission.

Текущий verified media flow:

```text
authenticated request
↓
upload init
↓
signed upload URL
↓
Object Storage upload
↓
complete
↓
signed download URL
```

Unsigned direct object read/write были заблокированы в verification.

Provider control-plane API:

```text
GetPublicAccessBlock
GetBucketPolicyStatus
```

в текущем окружении возвращали `501 NotImplemented`; поэтому эти отдельные control-plane attributes не считаются полностью verified через API provider.

---

# 12. Ownership и authorship

В текущем и целевом проектировании используются два разных понятия:

```text
owner_id
```

и

```text
author_id
```

`owner_id` — пользователь, которому принадлежат данные.

`author_id` — пользователь, создавший конкретную запись/элемент, когда это различие имеет смысл.

Автор и владелец могут совпадать.

Примеры целевой модели:

```text
Program
author = Coach
owner  = Client

Report
author = Client
owner  = Client

Comment / feedback

author = Coach
owner  = Client
```

Тренер не становится владельцем клиентских данных только потому, что создаёт в рамках сотрудничества план, комментарий, цель или иной объект.

Этот принцип является правилом для новых таблиц, где ownership/authorship действительно различимы.

---

# 13. Referential integrity

Текущая схема использует foreign keys для сохранения целостности данных.

Подтверждённые/документированные связи:

```text
profiles.user_id
    → users.id
    → CASCADE

sessions.user_id
    → users.id
    → CASCADE

auth_tokens.user_id
    → users.id
    → CASCADE

exercises.user_id
    → users.id
    → CASCADE

workouts.user_id
    → users.id

workout_exercises.workout_id
    → workouts.id
    → CASCADE

workout_exercises.exercise_id
    → exercises.id
    → RESTRICT

workout_sets.workout_exercise_id
    → workout_exercises.id
    → CASCADE

training_set_notes.workout_set_id
    → workout_sets.id
    → CASCADE

training_set_notes.author_id
    → users.id

media.owner_id
    → users.id

media.author_id
    → users.id

media_links.media_id
    → media.id
    → RESTRICT
```

Поведение удаления определяется актуальной SQL schema и её constraints. Product documentation не должна подменять фактическую DB definition.

---

# 14. Single instance / canonical data rule

Канонические бизнес-сущности платформы существуют в одном экземпляре.

Предоставление доступа к существующей сущности выполняется через:

- ссылки;
- связи;
- permissions;
- domain context.

Не через копирование бизнес-данных.

Правило распространяется, например, на:

```text
workout
exercise
workout_set
report
и другие canonical business objects
```

Report может агрегировать или snapshot-фиксировать данные на определённый момент, но не должен создавать вторую live-копию исходной канонической сущности.

Media является специальным исключением: каждая загрузка представляет самостоятельный media object в конкретном контексте.

---

# 15. Coach ↔ Client Relationship

**Статус:** PLANNED / PARTIALLY DEFINED — production relationship schema не реализована.

Связь между клиентом и тренером является самостоятельной доменной сущностью и не должна храниться только как поле профиля.

Причины:

- история сотрудничества;
- смена тренера;
- разные состояния отношения;
- исторический доступ;
- возможность нескольких специалистов в будущем.

Целевая сущность:

```text
coach_client_relationships
```

Целевые состояния:

```text
ACTIVE
ARCHIVED
```

## 15.1 Целевая модель исторического доступа

Целевые правила:

- `ACTIVE` — текущее сотрудничество и основной доступ в разрешённых модулях;
- `ARCHIVED` — новые данные клиент не открывает тренеру автоматически, но разрешённый исторический доступ к периоду сотрудничества может сохраняться;
- новый тренер по умолчанию получает только данные собственного периода;
- клиент может отдельно открыть исторические периоды и/или модули;
- клиент может расширять, ограничивать и отзывать такой исторический доступ;
- архивирование не удаляет данные и не меняет ownership;
- связь может быть реактивирована с сохранением истории периодов сотрудничества.

Конкретные production fields, indexes и дополнительные status values должны быть утверждены перед созданием production migration.

## 15.2 Important boundary

Наличие relationship architecture в документации не означает наличие текущих relationship tables/routes.

На текущем foundation baseline trainer/client relationship persistence и полноценная relationship-aware authorization ещё не считаются реализованными.

---

# 16. Chat target schema

**Статус:** PLANNED — функциональная концепция утверждена, physical schema не реализована.

Целевые сущности:

```text
chats
chat_messages
media / media_links
```

Целевая модель:

```text
one chat
↓
one coach-client relationship
```

Chat должен поддерживать:

- текстовые сообщения;
- фотографии;
- видео;
- документы;
- статусы отправки/прочтения;
- ссылки на существующие объекты платформы;
- историю переписки.

PostgreSQL является источником истины для message history.

WebSocket является только transport/realtime layer и не является источником истины.

При временной недоступности WebSocket история сообщений не должна теряться.

---

# 17. Reports target schema

**Статус:** PLANNED — функциональная концепция утверждена, physical schema не реализована.

Weekly Report является самостоятельным canonical object и принадлежит пользователю-клиенту.

Relationship определяет контекст сотрудничества и доступа, но не ownership отчёта.

Целевая структура включает:

```text
reports
report_feedback
media / media_links
```

Report conceptually содержит:

```text
owner_id
relationship_id
period_start
period_end
created_at
submitted_at
reviewed_at
status
```

Также report может содержать:

- ответы на questionnaire;
- список включённых модулей/элементов;
- данные canonical entities за выбранный период;
- зафиксированное состояние данных на момент отправки;
- feedback тренера.

## 17.1 Report lifecycle

Целевой lifecycle:

```text
DRAFT
↓
SUBMITTED
↓
REVIEWED
```

До `SUBMITTED` report может изменяться.

После `SUBMITTED` report должен рассматриваться как зафиксированный snapshot состояния на момент отправки, а не как live-копия текущих данных модулей.

Если исходная сущность позже изменилась, сам report не переписывается задним числом.

Если исходная сущность была удалена или недоступна, архивный report должен сохранять место с соответствующей отметкой о недоступности/удалении.

## 17.2 Report feedback

Целевая сущность:

```text
report_feedback
```

Она должна иметь:

- `author_id`;
- связь с конкретным report;
- при необходимости связь с конкретным модулем/сущностью/элементом на минимально необходимом уровне;
- текст до 500 символов согласно согласованной target-модели;
- до 2 изображений и 1 видео через media links согласно согласованной target-модели;
- soft delete;
- возможность автора редактировать/удалять собственную feedback запись.

При удалённом feedback в target UI должна использоваться пометка вроде `Комментарий тренера удалён`.

Эти правила являются target architecture и не означают наличие production table.

---

# 18. Long-term retention

Целевая product policy для будущих Chat / Reports flows не предусматривает автоматическое удаление истории только по возрасту.

Это относится к:

- старым сообщениям;
- отчётам;
- фото отчётов;
- видео отчётов;
- Chat attachments.

Резервное копирование является отдельным механизмом и не заменяет основное хранилище.

Это policy-level requirement, а не отдельный DB constraint.

---

# 19. Planned module schema boundaries

Следующие области находятся после текущего implemented database baseline и требуют отдельного проектирования физической схемы:

```text
FOOD
ACTIVITY
WEIGHT
PHOTO_AND_MEASUREMENTS
ANALYTICS
NOTIFICATIONS
```

И отдельного physical schema design требуют:

```text
COACH_CLIENT_RELATIONSHIP
CHAT
REPORT
```

Для этих модулей нельзя создавать production truth из product documentation без согласованной migration и verification.

---

# 20. Training Templates

В текущем репозитории отсутствует активная migration для шаблонов тренировок. Планируемые таблицы шаблонов будут созданы новой миграцией с новым уникальным идентификатором, когда функциональность будет фактически реализована.

Текущие таблицы шаблонов в production не существуют.

## 20.1 Migration state

Production applied migrations:

```text
5911
5912
5913
5914
5915
5916
5917
5919
5920
5921
```

Отсутствует:

```text
5918 — training_templates
```

## 20.2 Controlled divergence

Текущий статус:

```text
5918 = CONTROLLED DIVERGENCE
```

Forensic dependency verification установила:

- `5918` создаёт только template tables;
- `5919`, `5920`, `5921` не имеют прямой FK/ALTER/SQL зависимости от template tables;
- текущие in-scope foundation flows не показывают технической зависимости от `5918`;
- применение `5918` должно пересматриваться при включении Templates в реальный implementation scope или при появлении подтверждённой зависимости.

`5918` не следует автоматически применять в Production только ради последовательности migration numbers.

---

# 21. RLS и legacy Supabase

В старой Supabase-инфраструктуре существовал RLS для `leads`.

Это legacy infrastructure fact.

В текущей собственной Backend-архитектуре основной runtime-механизм доступа находится на Backend API:

```text
authentication
+
ownership
+
action / permission
+
relationship context
```

Наличие legacy RLS SQL-файла не означает, что RLS является текущим единственным механизмом authorization приложения.

Если PostgreSQL RLS будет использоваться как дополнительный defense layer, это должно быть отдельное подтверждённое архитектурное решение.

Наличие таблицы в БД само по себе никогда не считается достаточным условием доступа к ней.

---

# 22. Access boundary

Доступ к DB records определяется не только наличием строки.

Для current protected flows Backend использует authentication + ownership checks.

Для target relationship-aware model дополнительно рассматриваются:

- требуемый action/permission;
- relationship context;
- status `ACTIVE` / `ARCHIVED`;
- правила historical access;
- object state;
- настройки предоставленного доступа.

Frontend не является источником истины для DB access.

Permission checks должны выполняться server-side.

---

# 23. Data lifecycle и deletion principles

## 23.1 Current SQL lifecycle

Конкретная SQL schema уже задаёт отдельные cascade/restrict relationships.

Например:

```text
user deletion
→ related auth/session/profile rows may cascade

workout deletion
→ workout exercises / sets cascade

exercise referenced by history
→ deletion restricted

media link deletion
→ does not itself define binary object deletion
```

Это текущие schema-level rules и они важнее общих product statements.

## 23.2 Target account deletion

В целевой governance model окончательная политика удаления аккаунта должна быть определена отдельно.

Нельзя автоматически считать, что product-level account deletion равна физическому удалению всей исторической информации.

При этом текущие FK cascade rules не должны игнорироваться: они являются реальным поведением конкретной schema.

---

# 24. Current vs Planned summary

## CURRENT IMPLEMENTED

```text
users
profiles
sessions
auth_tokens
leads

exercises
workouts
workout_exercises
workout_sets
training_set_notes

media
media_links
pgmigrations
```

## PLANNED / NOT IMPLEMENTED

```text
coach_client_relationships

chats
chat_messages

reports
report_feedback

food
activity
weight
photo_and_measurements
analytics
notifications

training_templates
training_template_exercises
training_template_sets
```

Для `training_templates*` отдельно существует repository migration `5918`, но это не меняет их production status.

---

# 25. Known gaps / verification boundaries

На текущем baseline нельзя утверждать как полностью реализованные:

- production relationship tables;
- полный trainer/client RBAC subsystem;
- centralized universal permission engine для всех будущих модулей;
- production physical schema Chat;
- production physical schema Reports;
- production physical schema Food / Activity / Weight / Photo & Measurements / Analytics / Notifications;
- training template persistence in Production;
- глобальную retention/deletion policy;
- полный provider control-plane security набор S3 через все provider API.

Также остаётся отдельная документационная задача:

```text
workouts
```

должна быть отдельно подтверждена при следующем production schema inventory из-за расхождения одного ручного forensic перечня с текущими Training/database docs.

Эти пункты являются verification/scope boundaries. Они не должны автоматически превращаться в новые defects без evidence.

---

# 26. Правила проектирования новых таблиц

Новая schema не создаётся просто потому, что появился новый экран.

Каноническая последовательность:

```text
Пользовательский сценарий
↓
Требования модуля
↓
Ownership / access rules
↓
Структура данных
↓
FK / indexes / constraints
↓
SQL migration
↓
Local verification
↓
Production rollout
↓
Production verification
```

Перед production migration должны быть согласованы:

- сущности;
- поля;
- ownership;
- authorship, когда применимо;
- foreign keys;
- cascade/restrict semantics;
- индексы;
- unique/check constraints;
- access rules;
- deletion lifecycle;
- media relationships;
- migration order/dependencies.

---

# 27. Definition of Done для схемы модуля

Физическая schema модуля считается готовой к production implementation, когда:

1. пользовательский сценарий согласован;
2. requirements модуля согласованы;
3. ownership/access rules определены;
4. структура таблиц согласована;
5. FK, indexes и constraints определены;
6. migration создана;
7. Local verification выполнена;
8. data migration/integrity checks выполнены, если нужен перенос;
9. Backend server-side access checks готовы;
10. Production rollout выполнен отдельно от обычного backend startup;
11. Production schema verification завершена.

---

# 28. Migration safety

При переносе legacy-модуля:

1. существующие данные сохраняются;
2. создаётся целевая schema;
3. создаются tables/indexes/constraints;
4. реализуются server-side access checks;
5. выполняется перенос данных;
6. выполняется integrity verification;
7. frontend переводится на новую persistence system;
8. legacy flow удаляется только после успешной проверки.

Training является уже мигрированным core persistence flow и не требует повторной миграции его базовой persistence-модели на текущем scope.

---

# 29. Главное правило базы данных

```text
Данные создаются один раз.
Данные сохраняются один раз.
Канонические данные не копируются между модулями.
Владение определяется через постоянный user_id.
Авторство отделяется от ownership там, где это имеет смысл.
Backend является источником истины для runtime access.
PostgreSQL хранит структурированные данные.
Object Storage хранит бинарные файлы.
Media является самостоятельным контекстным объектом.
Migration выполняется отдельно от обычного backend startup.
PLANNED schema не становится CURRENT из-за одного migration-файла.
Production snapshot является point-in-time evidence.
```

Для текущего foundation baseline:

```text
USER
├── PROFILE
├── AUTH / SESSION / TOKEN
├── LEADS
├── TRAINING
│   ├── WORKOUT
│   │   ├── WORKOUT_EXERCISE
│   │   │   └── WORKOUT_SET
│   │   ├── EXERCISE
│   │   └── TRAINING_SET_NOTES
└── MEDIA
    └── MEDIA_LINKS
```

Для target product model:

```text
USER
├── COACH_CLIENT_RELATIONSHIP
│   ├── CHAT
│   │   └── CHAT_MESSAGE
│   │       └── MEDIA
│   └── REPORT
│       ├── MEDIA
│       └── REPORT_FEEDBACK
│           └── MEDIA
└── TRAINING
```

Relationship, Chat и Reports остаются отдельными planned domain schemas до их фактической реализации.

---

# 30. Related canonical documents

```text
Docs Updated/ARCHITECTURE/ARCHITECTURE.md
Docs Updated/ARCHITECTURE/PLATFORM.md
Docs Updated/ARCHITECTURE/APP_STRUCTURE.md
Docs Updated/ARCHITECTURE/LAYOUT.md

Docs Updated/SYSTEMS/AUTH.md
Docs Updated/SYSTEMS/SECURITY.md
Docs Updated/SYSTEMS/PERMISSIONS.md
Docs Updated/SYSTEMS/MEDIA.md
Docs Updated/SYSTEMS/SERVER.md

Docs Updated/AUDIT/*
Docs Updated/SYSTEM_STATE/*
Docs Updated/DECISIONS/*
```

Legacy source documents, на которые опирался этот canonical DB document:

```text
docs_archive/architecture/DATABASE_SCHEMA.md
docs/SYSTEMS/DATABASE.md
```

Forensic/current evidence:

```text
SYSTEM_STATE_FINAL.md
PROJECT_FULL_AUDIT_2026-09-19.md
PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
PROJECT_REMEDIATION_ROADMAP_2026-09-19.md
```

---

# 31. Правило обновления DATABASE.md

`DATABASE.md` обновляется только после подтверждения изменений на уровне:

1. пользовательского сценария;
2. требований модуля;
3. ownership/access model;
4. структуры данных;
5. FK/index/constraint design;
6. migration;
7. runtime/schema verification.

Изменение DB документа не должно само по себе считаться доказательством изменения БД.

И наоборот, фактическое изменение production schema должно быть отражено в canonical DB документации после verification.
