STUBBORN RAM --- SERVER_STATE.md

Версия: 3.0
Статус: CURRENT SERVER STATE / SINGLE SOURCE OF CURRENT SERVER
FACTS
Дата фиксации: 12.09.2026

# 1. Назначение

Этот документ фиксирует фактическое текущее состояние серверной части
Stubborn Ram.

Он НЕ заменяет архитектурную документацию.

Разница:

ARCHITECTURE.md --- как система должна быть устроена.

DATABASE_SCHEMA.md --- модель данных.

ROADMAP.md / STUBBORN_RAM_IMPLEMENTATION_PLAN.md --- что
планируется сделать.

SERVER_STATE.md --- что фактически существует и было проверено на
сервере.

Перед любой следующей серверной задачей необходимо учитывать этот
документ.

Не следует заново предполагать, что Backend, PostgreSQL, Authentication,
Leads или другая инфраструктура отсутствуют, если они указаны как
VERIFIED.

После подтверждённого изменения серверного состояния этот документ
должен быть обновлён.

# 2. Статусы

VERIFIED --- состояние непосредственно проверено на сервере или
подтверждено результатом выполнения команды/реального сценария.

EXISTS / NOT FULLY VERIFIED --- объект существует, но полная
работоспособность не проверена.

PLANNED --- предусмотрено архитектурой, но ещё не реализовано.

LEGACY --- старая реализация, сохраняемая до завершения
миграции.

BLOCKED --- реализация зависит от ещё не выполненного решения
или шага.

# 3. Последняя фактическая контрольная точка

Дата: 12.09.2026

Проверенная production-среда:

Selectel Cloud Server;

SSH под пользователем stubbornram;

Backend directory: /opt/stubbornram/backend/server;

PostgreSQL локально на Cloud Server;

Backend /health;

production API через api.stubbornram.ru;

pgAdmin через admin.stubbornram.ru;

authentication production flows;

email infrastructure через Unisender Go;

lead/questionnaire production flow.

# 4. Инфраструктура

Selectel Cloud Server

Статус: VERIFIED

Имя:

stubbornram-backend

Параметры:

Ubuntu 24.04
2 vCPU
4 GB RAM
20 GB SSD

Public IP:

161.104.49.107

Текущее размещение:

Selectel Cloud Server
├── Backend
└── PostgreSQL 16

Managed PostgreSQL на текущем этапе НЕ используется.

Причина: PostgreSQL размещён на существующем Cloud Server для снижения
постоянных расходов и упрощения инфраструктуры.

# 5. Установленное ПО

Статус: VERIFIED

Git 2.43.0
Node.js 24.20.0
npm 11.19.0
PM2 7.0.4
PostgreSQL 16.15
AWS CLI 2.36.40
Nginx
Certbot + Nginx module
UFW
Fail2ban
pgAdmin 4

Fail2ban:

jail sshd — active

# 6. Linux / доступ

Статус: VERIFIED

Создан Linux-пользователь:

stubbornram

Backend запускается не от root.

Пользователь имеет sudo.

SSH-доступ под stubbornram проверен.

Секреты, пароли и приватные SSH-ключи в этот документ не записываются.

# 7. Backend directory

Статус: VERIFIED

Основной путь:

/opt/stubbornram/backend

Backend application:

/opt/stubbornram/backend/server

Основная структура:

/opt/stubbornram/backend/server
├── .env
├── database.cjs
├── migrations/
├── modules/
│ ├── auth/
│ ├── db/
│ ├── email/
│ ├── leads/
│ └── training/
├── node_modules/
├── package.json
├── package-lock.json
└── server.js

.env содержит секретные значения и не должен выводиться, копироваться
в документацию или передаваться AI.

# 8. Backend runtime

Статус: VERIFIED

Используется:

Node.js 24
Fastify 5
pg
dotenv
Zod
argon2
ws
node-pg-migrate

Backend entrypoint:

server.js

HTTP bind:

127.0.0.1:3000

# 9. Backend фактическая реализация

Статус: VERIFIED

Backend является реально работающим production-сервером.

Реализовано:

Fastify application;

PostgreSQL connection pool;

startup database check;

/health;

JSON health response;

Authentication API;

session handling;

email verification;

password reset;

rate limiting;

Leads API;

email service;

запуск через PM2;

production reverse proxy через Nginx.

Текущая цепочка:

Frontend
↓
HTTPS
↓
api.stubbornram.ru
↓
Nginx
↓
127.0.0.1:3000
↓
Fastify
↓
PostgreSQL

# 10. Backend API

Статус: VERIFIED --- ОСНОВНЫЕ ТЕКУЩИЕ ENDPOINTS

Auth:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/session
POST /api/auth/resend-verification
POST /api/auth/verify-email
POST /api/auth/reset-password/request
POST /api/auth/reset-password/complete

Leads:

POST /api/leads

Health:

GET /health

Auth production flows проверены.

Lead production flow также проверен.

Реализовано:

Training API

GET /api/training/exercises
GET /api/training/workouts
GET /api/training/workouts/:id
POST /api/training/workouts
PUT /api/training/workouts/:id
DELETE /api/training/workouts/:id

Будущие API для следующих модулей ещё не реализованы:

Profiles
Coach/Client
Permissions
Reports
Media
Chat
Food
Activity
Weight
Photos/Measurements
Notifications
Payments
Analytics

# 11. Production API / DNS / HTTPS

API domain

Статус: VERIFIED

api.stubbornram.ru

DNS:

api.stubbornram.ru → 161.104.49.107

HTTPS

Статус: VERIFIED

HTTPS настроен через:

Nginx + Let's Encrypt

API certificate действует до:

09.12.2026

Настроено автоматическое продление сертификата.

Health

Production health endpoint проверен через HTTPS.

Ответ:

{
"ok": true,
"service": "stubbornram-backend",
"database": true
}

HTTP status:

200

# 12. PostgreSQL

Статус: VERIFIED

PostgreSQL установлен непосредственно на Cloud Server.

Версия:

16.15

Cluster:

16 main

Port:

5432

Cluster status:

online

PostgreSQL не выставлен напрямую в Internet для frontend.

# 13. Database

Статус: VERIFIED

Database:

stubbornram

Database существует.

# 14. Application database role

Статус: VERIFIED

Role:

stubbornram_app

Role имеет LOGIN.

Пароль настроен пользователем и не хранится в документации.

Реальное подключение application role к базе проверено.

# 15. Физическая схема PostgreSQL

Статус: VERIFIED — CURRENT PRODUCTION SCHEMA

На текущем этапе в базе существуют:

users
sessions
auth_tokens
profiles
leads
exercises
workouts
workout_exercises
workout_sets
pgmigrations

Auth/session schema существует и используется production backend.

Leads schema реализована и используется production.

Training schema реализована и используется production.

Основные Training таблицы:

exercises
workouts
workout_exercises
workout_sets

В production загружено:

232 системных упражнения.

Связи Training:

workouts.user_id → users.id

workout_exercises.workout_id → workouts.id

workout_exercises.exercise_id → exercises.id

workout_sets.workout_exercise_id → workout_exercises.id

Training ownership проверяется на Backend API.

Существующие migrations не изменяются задним числом.

Остальная business schema MVP ещё не реализована.

# 16. Database migrations

Статус: VERIFIED --- ТЕКУЩИЕ MIGRATIONS

Используется:

node-pg-migrate

Каталог:

/opt/stubbornram/backend/server/migrations/

Миграции:

1788859125911_init.js
1788859125912_sessions.js
1788859125913_auth_tokens.js
1788859125914_leads.js
1788859125915_training.js
1788859125916_seed_exercises.js

Auth/session migrations применены.

Leads migration применена.

Training migration применена.

Seed migration применена.

В production загружено 232 системных упражнения.

Существующие migrations не изменять задним числом.

# 17. Leads

Статус: VERIFIED --- MIGRATION ЗАВЕРШЕНА

Production endpoint:

POST /api/leads

Backend:

modules/leads/leads.routes.js
modules/leads/leads.schemas.js

Frontend:

src/services/leads/leadService.js
src/shared/lib/apiClient.js

Текущая цепочка:

Questionnaire
↓
leadService
↓
apiClient
↓
POST /api/leads
↓
Fastify
↓
Zod validation
↓
PostgreSQL
↓
Unisender Go
↓
Email

Реальный questionnaire flow был проверен.

Подтверждено:

заявка принимается;

данные сохраняются в PostgreSQL;

заявке присваивается статус new;

email отправляется;

письмо реально доставляется.

Lead migration больше не является текущей задачей.

# 18. Legacy lead infrastructure

Статус: REMOVED

Удалены:

supabase/functions/send-lead-email/
database/001_create_leads.sql
database/002_leads_rls.sql

Также удалена старая backend-директория:

backend/src/

Старый Resend flow больше не используется.

Не возвращать старый lead-flow в новую реализацию.

# 19. Email infrastructure

Статус: VERIFIED

Используется:

Unisender Go

Backend service:

backend/modules/email/email.service.js

Отправитель:

noreply@stubbornram.ru

Email infrastructure реально проверена.

Результат production-проверки:

accepted
→ sent
→ delivered

Реальное письмо было получено.

Auth email и lead email используют новый backend email service.

# 20. PM2

Статус: VERIFIED

Backend process:

stubbornram-backend

PM2 используется для production process management.

Автозапуск через systemd настроен.

# 21. Nginx / HTTPS

Статус: VERIFIED

API:

api.stubbornram.ru
↓
127.0.0.1:3000

pgAdmin:

admin.stubbornram.ru
↓
127.0.0.1:5050

Проверка конфигурации:

nginx -t
→ syntax is ok
→ test is successful

# 22. pgAdmin

Статус: VERIFIED

Установлен pgAdmin 4.

Сервис:

pgadmin4.service

Gunicorn:

127.0.0.1:5050

Production/admin domain:

admin.stubbornram.ru

DNS:

admin.stubbornram.ru → 161.104.49.107

pgAdmin открывается через домен.

PostgreSQL server зарегистрирован.

Подключение к базе stubbornram через application role настроено и
проверено.

# 23. Firewall / SSH protection

Статус: VERIFIED

Настроен UFW.

Базовые направления:

SSH
HTTP
HTTPS

Fail2ban активен для:

sshd

PostgreSQL не должен быть открыт публично для frontend.

# 24. GitHub source code

Статус: VERIFIED

GitHub используется как source-code platform.

Repository:

EgorBaal/Stubborn-ram

Рабочая ветка:

main

GitHub Actions используется для production frontend deployment.

Frontend build выполняется на Node.js 24.

# 25. Git checkpoint

Последний известный архитектурный checkpoint:

05e15a7

Push в main был выполнен.

После этого production infrastructure и backend продолжили развиваться.

Поэтому 05e15a7 не является снимком текущего production-состояния.

Git-команды не выполняются автоматически без отдельного запроса
пользователя.

# 26. Frontend API migration

Статус: PARTIALLY MIGRATED

Основной API base:

https://api.stubbornram.ru/api

Общий API client:

src/shared/lib/apiClient.js

Auth frontend использует Backend API.

Lead frontend также использует Backend API.

Остальные legacy-модули ещё не полностью переведены.

# 27. Authentication

Статус: VERIFIED --- PRODUCTION FLOWS

Собственный Backend Auth реализован.

Модули:

backend/modules/auth/
├── auth.routes.js
├── auth.schemas.js
├── auth.service.js
├── auth.session.js
└── auth.tokens.js

Реализованы:

registration;

email verification;

login;

logout;

persistent session;

password reset;

resend verification;

session endpoint;

password hashing через argon2;

session cookie;

auth route rate limiting.

Session cookie:

stubbornram_session

Основные cookie attributes:

httpOnly
secure
sameSite: none
path: /
maxAge: 30 days

Production flows проверены:

регистрация
→ подтверждение email
→ вход
→ сессия
→ выход

восстановление пароля

Supabase Auth больше не является текущим механизмом этих auth flows.

# 28. Supabase

Статус: LEGACY / STILL IN USE

Supabase не удалён полностью.

Оставшиеся зависимости используются в ещё не перенесённых частях
приложения.

Известные области:

часть legacy Auth / related frontend code
supabaseClient

Training больше не относится к legacy Supabase flow.

Правило:

Legacy Supabase
↓
Новая Backend API реализация
↓
Production verification
↓
Rollback window
↓
Удаление legacy

Не удалять оставшиеся Supabase-зависимости до переноса соответствующих
модулей.

# 29. Training

Статус: VERIFIED — PRODUCTION

Training persistence полностью переведён на новый Backend API и PostgreSQL.

Существующие маршруты:

/app/training
/app/training/create
/app/training/new
/app/training/:id

Текущая логика:

/app/training
→ история тренировок

/app/training/create
→ выбор способа создания

/app/training/new
→ создание/редактор новой тренировки

/app/training/:id
→ конкретная историческая тренировка

Production Training API:

GET /api/training/exercises
GET /api/training/workouts
GET /api/training/workouts/:id
POST /api/training/workouts
PUT /api/training/workouts/:id
DELETE /api/training/workouts/:id

Целевая модель данных:

WORKOUT
↓
WORKOUT_EXERCISE
↓
WORKOUT_SET

WORKOUT_EXERCISE
↓
EXERCISE

Production PostgreSQL содержит:

exercises
workouts
workout_exercises
workout_sets

В production загружено:

232 системных упражнения.

Frontend Training использует:

React
↓
trainingService
↓
Backend API
↓
Fastify
↓
PostgreSQL

Backend выполняет authentication и ownership checks.

Проверено в production:

создание тренировки;

загрузка истории;

открытие тренировки по ID;

редактирование тренировки;

удаление тренировки;

сохранение упражнений;

сохранение подходов;

перезагрузка страницы после сохранения;

работа с датой и временем.

Supabase больше не используется рабочим Training persistence flow.

Training migration завершена.

Следующие расширения Training остаются отдельными задачами:

пользовательские упражнения;

шаблоны;

программы;

media;

feedback;

история упражнения;

analytics;

Reports integration;

расширенная coach-client permission model.

# 30. Object Storage / S3

Статус: PLANNED / NOT CONNECTED

AWS CLI установлен.

Production Object Storage пока не подключено.

Целевая модель:

Frontend
↓
Backend
↓
permission check
↓
signed URL
↓
private Object Storage

Пользовательские media должны быть приватными.

Signed URLs пока не реализованы.

# 31. WebSocket

Статус: PLANNED / NOT IMPLEMENTED

Зависимость ws установлена.

Полноценный WebSocket server для Chat ещё не реализован.

# 32. Workers / FFmpeg

Статус: PLANNED / NOT IMPLEMENTED

Production worker ещё не реализован.

FFmpeg worker не считать установленным или работающим только на
основании архитектурной документации.

# 33. Coach / Client Relationship

Статус: PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая модель:

User
↓
Coach / Client Relationship
↓
Permissions

Предусмотрены состояния:

pending
accepted
rejected
cancellation
archive

История сотрудничества не должна удаляться только из-за архивирования
relationship.

# 34. Permissions

Статус: PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая модель --- action-based permissions.

Проверка доступа выполняется Backend.

Frontend не является источником истины для authorization.

# 35. Reports

Статус: PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевой lifecycle:

DRAFT
↓
SUBMITTED
↓
REVIEWED

Report является отдельной canonical сущностью.

Media отчётов будет использовать общий Object Storage layer.

# 36. Chat

Статус: PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая схема:

Chat UI
↓
chatService
↓
Backend / WebSocket
↓
PostgreSQL + Object Storage

PostgreSQL является source of truth.

WebSocket используется для realtime transport.

# 37. Остальные бизнес-модули

Статус: PLANNED

На новом Backend уровне ещё не реализованы:

Food
Activity
Weight
Photos / Measurements
Notifications
Payments
Analytics
AI / OCR

# 38. Security --- фактическое состояние

Подтверждено:

backend запускается не от root;

отдельный Linux user;

sudo;

UFW;

Fail2ban sshd;

secrets находятся в server .env;

PostgreSQL доступен приложению локально;

frontend не подключается непосредственно к PostgreSQL;

API работает через HTTPS;

auth routes имеют rate limiting.

Будущие security-задачи:

полноценная authorization;

permission layer;

audit log;

backup strategy;

private Object Storage;

signed URLs;

security notifications;

re-authentication;

incident procedures.

# 39. Персональные данные

Проект работает с персональными данными.

Инфраструктура ориентирована на российское размещение данных.

При этом размещение сервера в российской инфраструктуре само по себе не
означает автоматического выполнения всех требований 152-ФЗ.

Отдельно должны быть проверены:

локализация;

трансграничная передача;

consent;

privacy policy;

договоры с processors/providers;

сроки хранения;

удаление;

incident response.

# 40. Что НЕ считать выполненным

Не считать фактически завершёнными:

полную PostgreSQL business schema остальных MVP-модулей;

Coach/Client backend;

Permissions backend;

Reports backend;

Chat backend;

WebSocket;

Object Storage;

Signed URLs;

FFmpeg Worker;

полную миграцию всех legacy-модулей;

полное удаление Supabase.

# 41. Текущее состояние по слоям

Слой Состояние

Selectel Cloud Server VERIFIED
Ubuntu VERIFIED
Linux user VERIFIED
SSH VERIFIED
Firewall VERIFIED
Fail2ban VERIFIED
Node.js VERIFIED
npm VERIFIED
PM2 VERIFIED
GitHub source VERIFIED
Frontend build VERIFIED
Backend Fastify VERIFIED
Backend process VERIFIED
Backend production API VERIFIED
Nginx VERIFIED
HTTPS API VERIFIED
pgAdmin VERIFIED
PostgreSQL server VERIFIED
PostgreSQL database VERIFIED
Application DB role VERIFIED
Backend → PostgreSQL VERIFIED
Auth backend VERIFIED
Auth production flows VERIFIED
Email service VERIFIED
Unisender Go VERIFIED
Leads migration VERIFIED
Lead persistence VERIFIED
Lead email VERIFIED
Object Storage PLANNED
Signed URLs PLANNED
WebSocket PLANNED
Worker / FFmpeg PLANNED
Permissions backend PLANNED
Coach/Client backend PLANNED
Reports backend PLANNED
Chat backend PLANNED
Training persistence VERIFIED
Full Supabase removal PLANNED

# 42. Фактическая точка проекта

На текущей контрольной точке:

Infrastructure
↓
✅ VERIFIED

Backend Foundation
↓
✅ VERIFIED

PostgreSQL Foundation
↓
✅ VERIFIED

Authentication
↓
✅ VERIFIED

Email infrastructure
↓
✅ VERIFIED

Leads migration
↓
✅ VERIFIED + PRODUCTION TEST

Documentation
↓
✅ UPDATED

Training
↓
✅ VERIFIED + PRODUCTION

Фактически работающая базовая цепочка:

Cloud Server
↓
Nginx / HTTPS
↓
Fastify Backend
↓
PostgreSQL

Для Auth:

Frontend
↓
authService
↓
Backend API
↓
PostgreSQL
↓
Unisender Go

Для Leads:

Questionnaire
↓
leadService
↓
Backend API
↓
PostgreSQL
↓
Unisender Go

# 43. Следующий этап

Следующая основная задача проекта:

Миграция следующего legacy-модуля на Backend API и PostgreSQL.

Training migration завершена и повторной миграции не требует.

Не возвращаться к уже проверенным:

Infrastructure;

Backend Foundation;

PostgreSQL Foundation;

Auth;

Email;

Leads;

Training persistence.

Работа продолжается со следующего модуля согласно ROADMAP.md.

# 44. Правило для будущих AI-агентов

Перед серверной задачей:

прочитать docs/server/SERVER_STATE.md;

проверить соответствующую архитектурную документацию;

не считать PLANNED функциональность реализованной;

не считать LEGACY функциональность частью target architecture;

не создавать второй Backend;

не создавать второй PostgreSQL;

не создавать Managed PostgreSQL без отдельного решения;

не переустанавливать уже VERIFIED инфраструктуру без причины;

не просить пользователя повторно объяснять уже зафиксированное
состояние;

после серверного изменения обновить этот документ.

Если фактическое состояние сервера противоречит документу:

Проверить сервер
↓
Обновить SERVER_STATE.md
↓
Продолжить работу

# 45. Правило секретов

Никогда не записывать в SERVER_STATE.md:

пароли;

private SSH keys;

API keys;

S3 secrets;

database passwords;

JWT secrets;

email provider secrets;

payment secrets;

AI provider secrets.

Разрешается фиксировать:

наличие переменной;

имя переменной;

факт настройки;

способ хранения.

# 46. Источники истины

При конфликте:

Фактическое серверное состояние

SERVER_STATE.md

- непосредственная проверка сервера

Архитектура

docs/architecture/\*

Правила разработки

docs/core/\*

План

ROADMAP.md
STUBBORN_RAM_IMPLEMENTATION_PLAN.md

История решений

AI_HISTORY.md

Документы старше текущего состояния не должны автоматически
переопределять подтверждённые факты.

# 47. Главное

Этот файл описывает не желаемый Stubborn Ram, а сервер и backend,
которые реально существуют сейчас.

Он создан для предотвращения:

повторной установки уже установленного ПО;

создания второго Backend;

создания второго PostgreSQL;

создания ненужного Managed PostgreSQL;

повторной проверки уже подтверждённых базовых шагов;

ошибочного предположения, что Backend или Auth ещё не существуют;

потери контекста между AI-сессиями;

преждевременного удаления legacy-инфраструктуры.

После каждого существенного изменения серверной инфраструктуры этот файл
должен оставаться актуальным.

# 48. Контрольная точка 12.09.2026

На текущей контрольной точке подтверждено:

Selectel Cloud Server ✅
PostgreSQL 16 ✅
Backend Fastify ✅
PM2 ✅
Nginx ✅
HTTPS API ✅
pgAdmin ✅
api.stubbornram.ru ✅
admin.stubbornram.ru ✅
Backend → PostgreSQL ✅
Custom Authentication ✅
Email verification ✅
Password reset ✅
Unisender Go ✅
Frontend Auth → Backend ✅
Leads migration ✅
Lead persistence ✅
Lead email ✅
Training persistence ✅

Object Storage ⏳
Permissions ⏳
Coach/Client ⏳
Reports ⏳
Chat/WebSocket ⏳
Full Supabase removal ⏳

Это является текущей контрольной точкой серверного состояния Stubborn
Ram.
