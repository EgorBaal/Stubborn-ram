# SYSTEM_STATE.md — Stubborn Ram

**Актуальное состояние проекта и инфраструктуры**  
**Дата:** 17.09.2026

> Этот файл описывает конечное состояние системы: где что находится, за что
> отвечает, как подключено, как запускается, что реализовано, что не
> реализовано и какие планы приняты.
>
> Хронология промежуточных действий здесь не хранится. Исторически важные
> сведения сохраняются только там, где они нужны для понимания текущей
> системы или безопасности.

---

# 1. ПРОЕКТ

**Название:** Stubborn Ram

**Локальный проект:**

```text
D:\CRM-Platform Stubborn Ram
```

**Локальный Backend:**

```text
D:\CRM-Platform Stubborn Ram\backend
```

## 0. ЕЖЕДНЕВНЫЙ ЦИКЛ РАЗРАБОТКИ — КРАТКАЯ ИНСТРУКЦИЯ

### Утром: как начать работу после включения компьютера

1. Открыть **VS Code**.
2. Открыть проект **`D:\\CRM-Platform Stubborn Ram`**.
3. Открыть терминал VS Code.
4. Запустить локальный Backend:

```powershell
cd "D:\\CRM-Platform Stubborn Ram\\backend"
npm start
```

5. Открыть второй терминал VS Code и запустить Frontend командой проекта (сейчас для Vite используется `npm run dev` в frontend-проекте).
6. Разрабатывать и проверять всё **только локально** до момента, когда изменение готово к публикации.
7. Локальный Backend использует локальную PostgreSQL. Production-сайт продолжает работать независимо от выключения/перезагрузки этого компьютера.

### В течение работы

- Сначала изменяем код/документы локально.
- Проверяем результат локально.
- Если меняется структура БД — отдельно проверяем миграцию и только после этого применяем её там, где требуется.
- **Production DB не используется как тестовая.**
- Файлы пользователей (фото/видео) хранятся в Object Storage, а не в Git.
- Структурированные данные хранятся в PostgreSQL.
- Документы проекта (`docs`, `SYSTEM_STATE.md` и т. п.) являются файлами проекта и должны попадать в Git, если их нужно сохранить в истории проекта.

### В конце рабочего дня: что обязательно сохранить

**Минимально безопасное правило:** после законченного рабочего шага нужно сделать Git `commit`, а затем `push` в GitHub.

```text
изменил → проверил → git add → git commit → git push
```

`git push` **не отправляет изменения автоматически на production-сайт**. Он сохраняет текущую версию кода/документации в удалённом GitHub-репозитории. Публикация на `stubbornram.ru` — отдельная операция.

### Что именно сохраняет Git

Git — это **история версий файлов проекта**.

Если документ появился в `docs/`, но его не добавили в commit, GitHub его не знает. Если затем вернуть проект к последнему commit, такой новый документ может исчезнуть из рабочей версии.

Если файл добавлен в commit и commit отправлен через `push`, эта версия остаётся в истории GitHub. Можно вернуться к ней позже.

Git **не является хранилищем**:

- PostgreSQL-данных;
- пользовательских фото и видео;
- объектов Object Storage;
- секретов из `.env`.

Поэтому для Stubborn Ram существуют отдельные источники сохранения:

```text
Код + docs       → Git / GitHub
Данные клиентов  → PostgreSQL
Фото/видео       → Object Storage
Секреты          → .env / серверная конфигурация, не Git
```

### Как сейчас публикуется production

Пока используется прямой путь:

```text
LOCAL → проверка → Git/GitHub → отдельное обновление Production
                                              ↓
                                      stubbornram.ru
```

**Не считать `git push` деплоем на `stubbornram.ru`.** Push только сохраняет версию проекта в GitHub.

### Будущий безопасный вариант

Будет подготовлена схема:

```text
GitHub
├── main
│   └── Production → stubbornram.ru → Production DB
│
└── develop / feature
    └── Staging → staging.stubbornram.ru → отдельная Staging DB
```

Staging не должен использовать Production DB или Production-клиентские данные. Сначала изменения проверяются на Staging, затем готовая версия переносится в Production.

### Главное правило сохранности

**Чтобы не потерять изменения в файлах проекта — в конце законченного рабочего шага сохранять их через Git commit + push.**

**Чтобы не потерять данные клиентов — Git недостаточен: нужны отдельные резервные копии PostgreSQL и отдельно учитывается Object Storage.**

---

## Цель

Единая PWA/CRM-платформа для тренера и клиентов.

Основные направления:

- кабинет клиента;
- кабинет тренера;
- тренировки;
- отчёты;
- чат;
- питание;
- вес / фото / замеры;
- аналитика;
- библиотека;
- уведомления.

Планируется возможность переключения между клиентским/личным и тренерским
кабинетом через профиль пользователя с учётом ролей и permissions.

---

# 2. БАЗОВАЯ АРХИТЕКТУРА

## Local

```text
Windows
↓
React
↓
Fastify Backend
↓
PostgreSQL
```

## Production

```text
stubbornram.ru
↓
Nginx / HTTPS
↓
Fastify Backend
↓
PostgreSQL на Selectel
```

## Media

```text
React
↓
Backend
↓
Private Object Storage / S3
```

### Принцип

Frontend не подключается напрямую к:

- PostgreSQL;
- приватному Object Storage.

Backend является центральной точкой:

- авторизации;
- permissions;
- бизнес-логики;
- работы с PostgreSQL;
- работы с файлами;
- внешних интеграций.

PostgreSQL хранит:

- структурированные данные;
- метаданные;
- связи;
- ссылки на медиа.

Object Storage хранит:

- фото;
- видео;
- документы;
- другие файлы.

---

# 3. ЛОКАЛЬНЫЙ BACKEND

**Путь:**

```text
D:\CRM-Platform Stubborn Ram\backend
```

## Основные модули

```text
backend/modules/
├── auth/
├── db/
├── email/
├── leads/
├── training/
├── media/
└── storage/
```

## Node.js

```text
Node.js 24.18.0
npm 11.16.0
```

## Запуск Backend

В `package.json` есть:

```text
start
  node server.js

migrate
  node-pg-migrate
```

Запуск:

```powershell
npm start
```

**`npm run dev` не существует.**

## Текущий локальный адрес Backend

```text
http://127.0.0.1:3000
```

Backend слушает:

```text
127.0.0.1:3000
```

## Health endpoint

```text
GET /health
```

Полный адрес:

```text
http://127.0.0.1:3000/health
```

Текущий ответ:

```json
{
  "ok": true,
  "service": "stubbornram-backend",
  "database": true
}
```

---

# 4. ЛОКАЛЬНЫЙ POSTGRESQL

**Версия:**

```text
PostgreSQL 16.15
```

**Windows service:**

```text
postgresql-x64-16
```

**Состояние:** Running

## Подключение

```text
Host: 127.0.0.1
Port: 5432
Database: stubbornram
User: stubbornram_app
Password: хранится только локально в backend/.env
```

Пароль в этот файл не записывается.

## psql

```text
C:\Program Files\PostgreSQL\16\bin\psql.exe
```

Подключение:

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -p 5432 -U stubbornram_app -d stubbornram
```

---

# 5. ЛОКАЛЬНАЯ БАЗА ДАННЫХ

## Миграции

Используется:

```text
node-pg-migrate
```

Конфигурация:

```text
backend/database.cjs
```

Скрипт:

```json
"migrate": "node-pg-migrate"
```

## Запуск миграций

Dry-run:

```powershell
npm run migrate -- up --dry-run -f database.cjs
```

Реальное применение:

```powershell
npm run migrate -- up -f database.cjs
```

## Текущие миграции

```text
1788859125911_init.js
1788859125912_sessions.js
1788859125913_auth_tokens.js
1788859125914_leads.js
1788859125915_training.js
1788859125916_seed_exercises.js
1788859125917_auth_tokens_active_unique.js
1788859125918_training_templates.js
1788859125919_media.js
1788859125920_media_status.js
```

Все 10 миграций применены в локальной БД.

## Текущие таблицы

```text
auth_tokens
exercises
leads
media
media_links
pgmigrations
profiles
sessions
training_template_exercises
training_template_sets
training_templates
users
workout_exercises
workout_sets
workouts
```

Всего:

```text
15 таблиц
```

`pgmigrations` содержит:

```text
10 / 10 применённых миграций
```

## Production и Local DB

Production и Local DB — разные базы.

Production DB нельзя использовать для локального тестирования.

---

# 6. DATABASE / ОСНОВНЫЕ СУЩНОСТИ

## Пользователи

```text
users
profiles
sessions
auth_tokens
```

## Leads

```text
leads
```

## Training

```text
exercises
workouts
workout_exercises
workout_sets
```

## Training Templates

```text
training_templates
training_template_exercises
training_template_sets
```

Каноническая модель тренировки:

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Шаблоны отделены от фактической истории тренировок.

---

# 7. AUTH / СЕССИИ

Архитектура:

```text
Frontend
↓
Backend Auth API
↓
PostgreSQL
```

Таблицы:

```text
users
profiles
sessions
auth_tokens
```

## Основные решения

- постоянная сессия;
- пользователь остаётся авторизованным, пока сам не выйдет;
- поддерживается backend-логика session/token;
- выбран Variant A для email verification;
- требуется возможность `logout from all devices`.

## Безопасность

- пароли хешируются через `argon2`;
- session tokens генерируются через Node crypto;
- используются Zod schemas.

Production secrets не хранятся в этом файле.

## Локально подтверждённая email verification

17.09.2026 локально полностью проверена цепочка подтверждения email:

```text
Local registration
↓
email verification link
↓
http://localhost:5173/auth/confirm
↓
Local Fastify Backend
↓
Local PostgreSQL
↓
users.email_verified_at
↓
successful local login/session
```

Проверено фактически:

- confirmation link для локальной разработки ведёт на `http://localhost:5173`;
- локальная база получает заполненное `users.email_verified_at`;
- после подтверждения пользователь успешно входит в локальное приложение.

Причина исправления:

ранее `backend/modules/auth/auth.routes.js` всегда формировал production URL
`https://stubbornram.ru`, из-за чего локальное подтверждение могло попадать в
production frontend.

Текущая логика выбирает frontend URL по `NODE_ENV`:

```js
const baseUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5173"
    : "https://stubbornram.ru";

return `${baseUrl}${path}`;
```

Production URL при этом не изменён.

---

# 8. PRODUCTION СЕРВЕР

**Провайдер:** Selectel Cloud Server

```text
IP: 161.104.49.107
OS: Ubuntu 24.04.5 LTS
Kernel: 6.8.0-139-generic
CPU: 2 vCPU
RAM: 4 GB
Disk: 20 GB SSD
```

## SSH

Основной Linux-пользователь:

```text
stubbornram
```

Подключение:

```text
ssh stubbornram@161.104.49.107
```

Root SSH запрещён.

Password SSH authentication отключена.

Recovery SSH настроен.

Recovery private key хранится отдельно на USB.

## Backend

Production Backend находится:

```text
/opt/stubbornram/backend/server
```

Версии:

```text
Node.js 24.20.0
npm 11.19.0
PM2 7.0.4
```

PM2 application:

```text
stubbornram-backend
```

Fastify:

```text
127.0.0.1:3000
```

PM2 autostart настроен.

## Nginx

```text
Nginx 1.24.0
```

Основной API:

```text
api.stubbornram.ru
```

HTTPS:

- Let's Encrypt;
- Nginx принимает внешний HTTP/HTTPS;
- Backend работает локально на 127.0.0.1:3000.

## pgAdmin

```text
admin.stubbornram.ru
```

Локальная привязка:

```text
127.0.0.1:5050
```

---

# 9. PRODUCTION POSTGRESQL

```text
PostgreSQL 16.15
Database: stubbornram
User: stubbornram_app
Host: 127.0.0.1
Port: 5432
```

PostgreSQL не выставлен наружу.

Firewall:

```text
22  SSH
80  HTTP
443 HTTPS
```

5432 наружу не разрешён.

UFW:

```text
default deny
```

Fail2ban:

- jail `sshd` активен;
- maxretry 5;
- findtime 600;
- bantime 600.

---

# 10. PRODUCTION MIGRATIONS

На последней прямой проверке production:

```text
7 миграций
до 1788859125917 включительно
```

Локально дополнительно применены:

```text
1788859125918_training_templates.js
1788859125919_media.js
1788859125920_media_status.js
```

Production migrations `5918`, `5919`, `5920` в рамках текущего локального
этапа не выполнялись.

**Важно:** Local DB и Production DB остаются разными базами; production не
используется для локального тестирования.

---

# 11. BACKUP

Исторический dump:

```text
/root/stubbornram-database-2026-09-12.dump
```

Это исторический dump, а не актуальная резервная копия production.

В нём migration state был только до:

```text
5914
```

PostgreSQL:

```text
archive_mode: off
archive_command: disabled
wal_level: replica
```

Полноценная автоматизация backup и обязательная проверка восстановления
ещё не завершены.

Временный файл, созданный при исторической проверке:

```text
/tmp/stubbornram-pgmigrations.list
```

**Не удалять без явного разрешения.**

---

# 12. OBJECT STORAGE / MEDIA

## Selectel Object Storage

```text
Bucket: stubbornram-media
Region: ru-6
Endpoint: https://s3.ru-6.storage.selcloud.ru
```

Состояние bucket:

```text
Private
Standard
vHosted
Versioning: off
Object Lock: off
Lifetime: indefinite
```

Публичного доступа нет.

## Service user

```text
stubbornram-backend
```

Role:

```text
s3.bucket.user
```

Policy ограничена bucket:

```text
stubbornram-media
stubbornram-media/*
```

## S3 key

Существующий key:

```text
stubbornram-backend-s3
```

Новый key не создавался.

Secret нигде в документации не хранится.

---

# 13. ЛОКАЛЬНАЯ S3-КОНФИГУРАЦИЯ

Файл:

```text
backend/.env
```

Используемые переменные:

```text
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

Реальные secret values здесь не записываются.

`.env.example` содержит только названия переменных с пустыми значениями.

`.gitignore` содержит:

```text
.env
```

Реальный `.env` не должен попадать в Git.

---

# 14. STORAGE SERVICE

Файл:

```text
backend/modules/storage/storage.service.js
```

Отвечает за работу Backend с S3.

Экспортируемые операции:

```text
uploadObject()
deleteObject()
getSignedDownloadUrl()
getSignedUploadUrl()
headObject()
```

## uploadObject

Назначение:

```text
Backend → загрузка файла в Object Storage
```

Основные параметры:

```text
key
body
contentType
```

## deleteObject

Назначение:

```text
Backend → удаление конкретного объекта
```

Удаление не должно выполняться автоматически без предусмотренной бизнес-логики
и правил хранения.

## getSignedDownloadUrl

Назначение:

```text
Backend → временная ссылка на скачивание приватного объекта
```

По умолчанию:

```text
expiresIn = 900 секунд
```

## getSignedUploadUrl

Назначение:

```text
Backend → временная ссылка на загрузку объекта
```

По умолчанию:

```text
expiresIn = 900 секунд
```

## headObject

Назначение:

```text
Backend → проверка существования объекта и его metadata в Object Storage
```

Используется Media `/complete` для проверки фактически загруженного объекта
перед переводом записи из `UPLOADING` в `READY`.

## S3 client

Использует:

```text
endpoint = S3_ENDPOINT
region = S3_REGION
credentials = S3_ACCESS_KEY / S3_SECRET_KEY
forcePathStyle = true
bucket = S3_BUCKET
```

---

# 15. STORAGE PLUGIN

Файл:

```text
backend/modules/storage/storage.plugin.js
```

Назначение:

подключает Storage service к Fastify.

Регистрация:

```text
app.decorate("storage", storage)
```

В `server.js`:

```text
await app.register(storagePlugin)
```

В результате Backend получает:

```text
app.storage
```

с операциями Storage service.

---

# 16. S3 SDK

Установлены:

```text
@aws-sdk/client-s3
@aws-sdk/s3-request-presigner
```

Presigner используется для signed URLs.

S3 connectivity проверена.

Результаты:

```text
S3 CONNECTION: OK
BUCKET ACCESS: OK
STORAGE SIGNING: OK
S3 UPLOAD: OK
S3 OBJECT: OK
S3 DOWNLOAD: OK
```

В ходе проверки был создан тестовый объект:

```text
test/storage-check.txt
```

Объект **не удалён** и должен сохраняться до отдельного явного разрешения на
удаление.

Локальный тестовый файл:

```text
backend/storage-check.txt
```

также не удалять без отдельного явного разрешения.

Проверка точного содержимого дала `FAIL` только потому, что PowerShell создал
файл с BOM и CRLF; фактический текст объекта соответствует ожидаемому
`Stubborn Ram media test`. Ошибка относится к строгости теста, а не к работе
S3 Storage.

---

# 17. MEDIA АРХИТЕКТУРА ДЛЯ МОДУЛЕЙ

Используется одно общее хранилище:

```text
Training
Reports
Chat
Photos & Measurements
Future modules
        ↓
Shared Media / Storage
        ↓
Selectel Object Storage
```

Не создавать отдельное файловое хранилище для каждого модуля.

Модуль должен хранить в PostgreSQL ссылку/метаданные, а сам файл — в
Object Storage.

Frontend получает доступ к приватным файлам через Backend и контролируемые
signed URLs.

## Текущее состояние Media API

Media API уже реализован частично как отдельный Backend module.

В `backend/modules/media/media.routes.js` реализованы:

```text
POST /api/media/upload
POST /api/media/:id/complete
GET  /api/media/:id
```

### `POST /api/media/upload`

Проверяет authentication через существующий auth foundation.

Поддерживаемые MIME-типы:

```text
image/jpeg
image/png
image/webp

video/mp4
video/webm

audio/mpeg
audio/mp4
audio/webm
```

Текущий общий лимит размера:

```text
100 MB
```

Object key формируется по схеме:

```text
users/{userId}/media/{mediaId}.{extension}
```

При создании media-записи статус:

```text
UPLOADING
```

Backend создаёт metadata в PostgreSQL и выдаёт signed upload URL.

### `POST /api/media/:id/complete`

Доступен только владельцу media.

Перед переводом записи в `READY` Backend:

1. проверяет, что media существует и принадлежит текущему пользователю;
2. проверяет текущий статус `UPLOADING`;
3. выполняет `headObject()`;
4. проверяет существование объекта;
5. проверяет фактический `ContentLength`;
6. проверяет `ContentType`, если он возвращён Object Storage;
7. при успешной проверке переводит media в `READY`;
8. при несоответствии переводит media в `FAILED`.

### `GET /api/media/:id`

Доступен только владельцу media.

Для `READY` media Backend выдаёт временный signed download URL и возвращает
metadata файла.

### Проверка authentication

Неавторизованный запрос к:

```text
POST /api/media/upload
```

проверен и получает:

```text
401 Unauthorized
```

Media API использует существующий механизм:

```text
request cookie
↓
session
↓
getAuthenticatedUser()
↓
userId
```

Отдельный механизм сессий для Media не создаётся.

## Что пока не реализовано в Media

- `media_links` в API/бизнес-логике;
- полноценная action-based permissions-проверка;
- content sniffing / независимая проверка реального содержимого файла;
- специализированные лимиты по типам файлов;
- обработка abandoned `UPLOADING` записей;
- полноценный end-to-end пользовательский сценарий Training photo/video;
- image optimization;
- video processing / FFmpeg;
- thumbnails / previews;
- production rollout локальных Media migrations `5919/5920`;
- production deployment текущего Media/Storage-кода.

Поэтому Media infrastructure/storage foundation считается готовым, но полный
Media layer и пользовательский E2E flow — ещё нет.

# 18. TRAINING

## Текущая persistence-модель

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Таблицы:

```text
exercises
workouts
workout_exercises
workout_sets
```

## Templates

```text
training_templates
training_template_exercises
training_template_sets
```

Шаблоны не заменяют историю тренировок.

## Состояние

Training persistence:
**реализовано**

Training 2.0:
**разработка приостановлена до завершения инфраструктурного Storage/Media
фундамента**

Первый media use case Storage:
**Training photo/video**

# 19. REPORTS

## MVP lifecycle

```text
DRAFT
↓
SUBMITTED
↓
REVIEWED
```

Report создаётся клиентом.

Планируемые данные:

- identifier;
- owner;
- reporting period;
- created date;
- submitted date;
- reviewed date;
- status;
- text data;
- Coach/Client relationship identifier;
- timestamps.

## Media

```text
Report
↓
Media Link
↓
Private Object Storage
```

Типы:

- фото;
- видео;
- документы;
- другие поддерживаемые файлы.

Медиа отчёта считается частью постоянной истории клиента.

## Submit

Backend должен проверять:

1. authentication;
2. ownership;
3. relationship;
4. `report.submit` permission;
5. required data;
6. переход в `SUBMITTED`;
7. submission timestamp.

Frontend не должен самостоятельно устанавливать `SUBMITTED`.

## Состояние

Reports backend:
**не реализован полностью**

Reports media:
**не реализовано**

# 20. CHAT

План:

```text
Client
↕
Backend Chat API
↕
PostgreSQL
```

Media:

```text
Chat
↓
Shared Media
↓
Object Storage
```

Состояние:

```text
Chat backend: не реализован
Chat media: не реализовано
WebSocket: не реализован
```

---

# 21. ПРАВА / PERMISSIONS

Permissions являются частью Backend architecture.

Принцип:

```text
Frontend request
↓
Authentication
↓
Authorization / Permission
↓
Business logic
↓
Database / Storage
```

Критические операции нельзя разрешать только через frontend.

Для медиа Backend должен проверять право пользователя на соответствующий
объект перед выдачей доступа к приватному файлу.

Полная permissions-система:
**ещё не завершена**.

---

# 22. EMAIL

Email provider:

```text
Unisender Go
```

Существующая цепочка:

```text
Frontend questionnaire
↓
Lead service
↓
Backend API
↓
PostgreSQL
↓
Unisender Go
```

Email infrastructure:
**реализована / ранее проверена**

---

# 23. LEADS

Таблица:

```text
leads
```

Lead persistence:
**реализовано**

Lead email:
**реализовано**

Migration:

```text
1788859125914_leads.js
```

---

# 24. ДОКУМЕНТАЦИЯ ПРОЕКТА

Основные документы:

```text
AGENTS.md
CODING_RULES.md
DESIGN_SYSTEM.md
WORKFLOW.md
PROJECT_CONTEXT.md
PLATFORM_ARCHITECTURE.md
ARCHITECTURE.md
DATABASE_SCHEMA.md
MEDIA.md
MIGRATION_ARCHITECTURE.md
SECURITY.md
PERMISSIONS_ARCHITECTURE.md
PAYMENT_ARCHITECTURE.md
DEVELOPMENT_RULES.md
ROADMAP.md
TRAINING_2.0 documentation
REPORT.md
SYSTEM_STATE.md
```

## Роль документов

`SYSTEM_STATE.md`
— фактическое состояние инфраструктуры и реализации.

`DATABASE_SCHEMA.md`
— структура PostgreSQL и правила хранения данных.

`MEDIA.md`
— архитектура общего Media/Object Storage.

`WORKFLOW.md`
— правила процесса разработки.

`SECURITY.md`
— правила безопасности.

`PERMISSIONS_ARCHITECTURE.md`
— архитектура прав доступа.

`TRAINING_2.0`
— архитектура и функциональный план Training 2.0.

`ROADMAP.md`
— общий план продукта.

# 25. СОХРАННОСТЬ ДАННЫХ

Главный принцип:

**Накопленные данные клиентов не удалять.**

Запрещено без отдельного явного разрешения:

- удалять файлы;
- удалять S3 objects;
- удалять записи клиентов;
- удалять старые инфраструктурные файлы;
- проводить destructive migrations.

Особенно сохраняются:

```text
/root/stubbornram-database-2026-09-12.dump
/tmp/stubbornram-pgmigrations.list
```

Не удалять без явного разрешения.

S3:

- автоматическое удаление пользовательских медиа не предусмотрено;
- Object Storage должен использоваться как долговременное хранилище истории.

# 26. DEVELOPMENT RULES

Рабочий порядок:

```text
ПРОВЕРКА
↓
ОБСУЖДЕНИЕ
↓
ИЗМЕНЕНИЕ
↓
ПРОВЕРКА
```

Для DB changes:

```text
Обсуждение
↓
DATABASE_SCHEMA
↓
Approval
↓
Migration
↓
Verification
```

Для новой инфраструктуры:

- сначала проверить необходимость;
- рассмотреть существующие решения;
- определить место хранения данных;
- определить API;
- определить безопасность;
- определить ограничения;
- только после этого внедрять.

Не создавать временные endpoints/временный код для диагностики, если тот
же результат можно получить прямой проверкой существующей системы.

Git-команды:
**только по явному запросу пользователя.**

---

# 27. ЧТО УЖЕ РЕАЛИЗОВАНО

## Infrastructure

- Production Selectel server
- Ubuntu
- SSH hardening
- SSH recovery
- UFW
- Fail2ban
- Node.js
- PM2
- Nginx
- HTTPS
- pgAdmin
- production PostgreSQL
- production application DB role

## Local

- PostgreSQL 16.15
- local role `stubbornram_app`
- local database `stubbornram`
- node-pg-migrate
- 10 локальных migrations
- 15 локальных таблиц
- Fastify
- `/health`
- Backend → PostgreSQL

## Storage

- Selectel private bucket
- service user
- S3 credentials in local `.env`
- AWS S3 SDK
- presigner
- `storage.service.js`
- `storage.plugin.js`
- Storage registration in Fastify
- S3 bucket access

## Application

- Auth foundation
- sessions/tokens
- email verification architecture
- Leads
- Training persistence
- Training templates
- Email service

# 28. ЧТО ЕЩЁ НЕ РЕАЛИЗОВАНО

- полный Media API (базовые upload/complete/read routes уже реализованы);
- полноценная работа `media_links` в API/бизнес-логике;
- полноценный permission-aware signed URL flow;
- реальный end-to-end Training photo/video flow;
- Reports backend;
- Reports media;
- Chat backend;
- Chat media;
- WebSocket;
- FFmpeg worker;
- полная permissions-система;
- Coach/Client relationship backend;
- переключение кабинетов тренер/клиент;
- Nutrition;
- Analytics;
- Library;
- полноценная автоматизация backup;
- обязательный restore test;
- полный отказ от legacy-интеграций;
- окончательная очистка legacy Supabase-зависимостей;
- production rollout локальной миграции `5918`;
- production deployment текущего Storage-кода.

# 29. ПЛАН РАЗВИТИЯ

Текущий порядок:

```text
Инфраструктурный фундамент
↓
Local PostgreSQL + migration system        [ГОТОВО]
↓
Shared Storage / Media                     [ФУНДАМЕНТ ГОТОВ]
↓
Training media                             [СЛЕДУЮЩИЙ]
↓
Reports + media
↓
Chat + media
↓
Nutrition
↓
Weight / Photos / Measurements
↓
Analytics
↓
Library
↓
PWA improvements / notifications
↓
финальная оптимизация
```

Training 2.0 остаётся основной функциональной целью.

---

# 30. КРАТКАЯ КАРТА ПРОЕКТА

## Где находится Backend

```text
D:\CRM-Platform Stubborn Ram\backend
```

## Где находится production Backend

```text
/opt/stubbornram/backend/server
```

## Где находится локальная БД

```text
127.0.0.1:5432
database: stubbornram
user: stubbornram_app
```

## Где находится production БД

```text
127.0.0.1:5432
database: stubbornram
user: stubbornram_app
```

> Local и Production находятся на разных машинах и являются разными БД.

## Где находится Storage service

```text
backend/modules/storage/storage.service.js
```

## Где находится Storage plugin

```text
backend/modules/storage/storage.plugin.js
```

## Где находится DB configuration для миграций

```text
backend/database.cjs
```

## Где находится backend entry point

```text
backend/server.js
```

## Где находятся миграции

```text
backend/migrations/
```

## Где находится local environment

```text
backend/.env
```

Секреты оттуда сюда не копировать.

## Где находится example environment

```text
backend/.env.example
```

---

# 31. КОМАНДЫ БЫСТРОГО ДОСТУПА

## Запустить Backend

```powershell
cd "D:\CRM-Platform Stubborn Ram\backend"
npm start
```

## Проверить health

```powershell
Invoke-WebRequest http://127.0.0.1:3000/health | Select-Object StatusCode,Content
```

## Подключиться к Local PostgreSQL

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -p 5432 -U stubbornram_app -d stubbornram
```

## Посмотреть таблицы

В `psql`:

```sql
\dt
```

## Посмотреть применённые миграции

В `psql`:

```sql
SELECT name, run_on FROM pgmigrations ORDER BY name;
```

## Dry-run миграций

```powershell
npm run migrate -- up --dry-run -f database.cjs
```

## Применить миграции

```powershell
npm run migrate -- up -f database.cjs
```

---

# 31.1. ПРОВЕРЕННЫЙ MEDIA / AUTH ФУНДАМЕНТ

## Авторизация

Файл:

```text
backend/modules/auth/auth.session.js
```

Существующий механизм:

```text
request cookie
↓
getSessionToken()
↓
hashSessionToken()
↓
sessions
↓
expires_at > now()
↓
authUser.userId
```

Функция:

```text
getAuthenticatedUser(pool, request)
```

возвращает `userId` авторизованного пользователя и обновляет
`last_used_at`.

Отдельного permissions-модуля в текущем `backend/modules/` нет.

Существующие защищённые Training routes используют именно
`getAuthenticatedUser()` и ограничивают пользовательские записи через
`authUser.userId`. Поэтому Media API не должен изобретать отдельный механизм
сессий; авторизация будет опираться на существующий auth foundation.

## Backend registration

`backend/server.js` уже регистрирует:

```text
authRoutes
leadsRoutes
trainingRoutes
storagePlugin
```

и предоставляет:

```text
app.pg
app.storage
```

Media API должен быть отдельным модулем и подключаться аналогично существующим
routes, без переделки Storage service.

## Storage service

Проверено, что существующий Storage service предоставляет:

```text
getSignedUploadUrl()
getSignedDownloadUrl()
uploadObject()
deleteObject()
headObject()
```

`headObject()` используется Media `/complete` для проверки фактически
загруженного объекта.

Для следующего Media API этапа отдельная переделка Storage service не требуется.

## Database Media

Локально применены:

```text
1788859125919_media.js
1788859125920_media_status.js
```

Созданы:

```text
media
media_links
```

`media.status` ограничен значениями:

```text
UPLOADING
READY
PROCESSING
FAILED
```

`media_links.media_id` использует `ON DELETE RESTRICT`.

## Media routes — текущее состояние

В `backend/modules/media/media.routes.js` уже зарегистрированы:

```text
POST /api/media/upload
POST /api/media/:id/complete
GET  /api/media/:id
```

`POST /api/media/upload` создаёт media metadata со статусом `UPLOADING` и
выдаёт signed upload URL.

`POST /api/media/:id/complete` использует `app.storage.headObject()` и проверяет
существование объекта, размер и `ContentType`, после чего переводит запись в
`READY` либо `FAILED`.

`GET /api/media/:id` выдаёт signed download URL только для `READY` media.

Следующий постоянный слой:

```text
Media API
↓
authentication
↓
PostgreSQL media / media_links
↓
shared Storage / S3
```

Временные диагностические endpoints создавать не планируется.

# 31.2. АКТУАЛЬНЫЙ СТАТУС НА 17.09.2026

## Auth

Local email verification и последующий login/session **проверены end-to-end**.

## Storage

Private S3 Storage foundation **готов** и используется Backend через
`app.storage`.

## Media

Базовый Media API **частично реализован и локально проверен**:

```text
POST /api/media/upload
POST /api/media/:id/complete
GET  /api/media/:id
```

Полный Media layer ещё требует `media_links`, permissions, content validation,
processing/optimization, E2E Training flow и production rollout.

## Backup

Production backup с 14-дневным retention и обязательным restore test ещё
**не завершён**.

# 32. ТЕКУЩАЯ ТОЧКА ПРОЕКТА

На 17.09.2026 фундамент локальной разработки приведён к рабочему состоянию:

```text
Local React
    ↓
Local Fastify
    ↓
Local PostgreSQL
```

и:

```text
Local Fastify
    ↓
Private Selectel Object Storage
```

Storage уже является частью Backend architecture.

**Следующая функциональная задача:**

```text
Shared Media API
↓
Training photo/video
↓
реальный пользовательский сценарий
```

После этого — Reports и Chat с использованием того же общего Storage.

Не создавать отдельное файловое хранилище для Training, Reports или Chat.
