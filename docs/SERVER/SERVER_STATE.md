STUBBORN RAM --- SERVER_STATE.md

Версия: 1.0 Статус: CURRENT SERVER STATE / SINGLE SOURCE OF CURRENT
SERVER FACTS Дата фиксации: 09.09.2026

1. Назначение

Этот документ фиксирует фактическое текущее состояние серверной части
Stubborn Ram.

Он НЕ заменяет архитектурную документацию.

Разница:

ARCHITECTURE.md --- как система должна быть устроена.

DATABASE_SCHEMA.md --- какой должна быть модель данных.

ROADMAP.md --- что планируется сделать.

SERVER_STATE.md --- что фактически существует и было проверено
на сервере.

Перед любой следующей серверной задачей AI должен сначала прочитать этот
документ.

Не следует заново предполагать, что Backend или PostgreSQL отсутствуют,
если это уже указано как VERIFIED здесь.

После любого подтвержденного изменения серверного состояния этот
документ должен быть обновлен.

2. Статусы

Используются следующие статусы:

VERIFIED --- состояние проверено непосредственно на сервере или
подтверждено результатом выполнения команды.

EXISTS / NOT FULLY VERIFIED --- объект существует, но полная
работоспособность не проверена.

PLANNED --- предусмотрено архитектурой, но еще не реализовано.

LEGACY --- старая реализация, сохраняемая до завершения
миграции.

BLOCKED --- реализация зависит от решения/шага, который еще не
выполнен.

3. Последняя фактическая проверка

Дата: 09.09.2026

Проверенная среда:

Selectel Cloud Server.

SSH под пользователем stubbornram.

Backend directory: /opt/stubbornram/backend/server.

PostgreSQL подключение локально.

Backend /health.

4. Инфраструктура

Selectel

Статус: VERIFIED

Создан проект Selectel.

Cloud Server

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

Важное решение по PostgreSQL

Managed PostgreSQL НЕ создается на текущем этапе.

Текущее решение:

Cloud Server
├── Backend
└── PostgreSQL

Причина --- не создавать отдельный оплачиваемый managed-сервис, пока
текущей нагрузки достаточно для PostgreSQL на существующем сервере.

Старые документы, где указано Managed PostgreSQL как текущая
инфраструктура, являются устаревшими в этой части.

Целевая логическая архитектура PostgreSQL сохраняется; изменен только
способ размещения на текущем этапе.

5. Установленное ПО

Статус: VERIFIED

Git 2.43.0
Node.js 24.20.0
npm 11.19.0
PM2 7.0.4
PostgreSQL 16.15
AWS CLI 2.36.40

Также установлены/настроены:

Nginx
Certbot + Nginx module
UFW
Fail2ban

Fail2ban:

jail sshd — active

6. Linux / доступ

Статус: VERIFIED

Создан Linux-пользователь:

stubbornram

Backend запускается не от root.

Пользователь имеет sudo.

SSH-доступ под stubbornram проверен.

Секреты, пароли и приватные SSH-ключи в этот документ не записываются.

7. Backend directory

Статус: VERIFIED

Основной путь:

/opt/stubbornram/backend

Backend application:

/opt/stubbornram/backend/server

Внутри backend уже существуют:

.env
migrations/
node_modules/
package.json
package-lock.json
server.js

.env содержит секретные значения и не должен выводиться, копироваться
в документацию или передаваться AI.

8. Backend runtime

Статус: VERIFIED

Используется:

Fastify 5
Node.js 24
PostgreSQL driver pg
dotenv
Zod
argon2
ws
node-pg-migrate

Backend entrypoint:

server.js

Текущий HTTP bind:

127.0.0.1:3000

Backend не выставляет PostgreSQL напрямую наружу через frontend.

9. Backend фактическая реализация

На текущий момент Backend является реально существующим минимальным
каркасом, а не только планом.

Реализовано:

Fastify application;

PostgreSQL connection pool;

startup database check;

/health;

JSON health response;

запуск через PM2.

Текущий /health возвращает:

{
"ok": true,
"service": "stubbornram-backend",
"database": true
}

Это означает, что следующая цепочка фактически проверена:

Backend
↓
PostgreSQL

10. Backend API

Статус:

PARTIALLY VERIFIED / FOUNDATION ONLY

Реально реализован:

GET /health

Бизнес API еще не реализован.

Пока отсутствуют полноценные endpoint groups для:

Auth;

Profiles;

Coach/Client;

Permissions;

Reports;

Media;

Chat;

Training;

Food;

Activity;

Weight;

Photos/Measurements;

Notifications;

Payments;

Analytics.

Не следует считать наличие архитектурного описания этих API
доказательством их реализации.

11. PostgreSQL

Статус: VERIFIED

PostgreSQL установлен непосредственно на Cloud Server.

Версия:

16.15

Cluster:

16 main

Port:

5432

Статус cluster:

online

12. Database

Статус: VERIFIED

Database:

stubbornram

Database уже существует.

13. Application database role

Статус: VERIFIED

Role:

stubbornram_app

Role имеет LOGIN.

Пароль настроен пользователем и не хранится в документации.

Проверено реальное подключение:

psql -U stubbornram_app -d stubbornram -h 127.0.0.1 -W

Подключение успешно.

14. Физическая схема PostgreSQL

Статус: VERIFIED --- СХЕМА ЕЩЕ НЕ СОЗДАНА

Проверка:

\dt

результат:

Did not find any relations.

Следовательно:

database существует;

application role существует;

backend подключается;

production business tables еще отсутствуют.

Нельзя считать целевую DATABASE_SCHEMA.md физически реализованной.

15. Database migrations

Статус: EXISTS / NOT APPLIED

Установлен:

node-pg-migrate

Существует каталог:

migrations/

Существует initial migration:

migrations/1788859125911_init.js

Текущая initial migration является пустым каркасом:

up() — без изменений
down() — без изменений

Физическая schema migration еще не выполнена.

16. Object Storage / S3

Статус: PLANNED / NOT CONNECTED

AWS CLI установлен для работы с S3-совместимым Object Storage.

Однако наличие AWS CLI не означает, что production Object Storage уже
подключено.

Целевая модель:

Backend
↓
private Object Storage / S3

Пользовательские media должны быть приватными.

Signed URLs выдаются Backend после проверки доступа.

17. WebSocket

Статус: PLANNED / NOT IMPLEMENTED

Зависимость:

ws

установлена.

Но текущий server.js еще не реализует WebSocket server.

Следовательно:

dependency существует;

Chat realtime еще не реализован.

18. Workers / FFmpeg

Статус: PLANNED / NOT IMPLEMENTED

Архитектура предусматривает Worker и FFmpeg для тяжелой обработки media.

На текущем серверном состоянии production worker еще не реализован.

Не считать архитектурное описание FFmpeg доказательством его фактической
установки или запуска.

19. PM2

Статус: VERIFIED

Backend работает через PM2.

PM2 настроен на автозапуск через systemd.

Автозапуск после перезагрузки сервера проверен.

20. Nginx / HTTPS

Статус:

INSTALLED / PRODUCTION ROUTING REQUIRES SEPARATE VERIFICATION

Установлены:

Nginx;

Certbot;

модуль Certbot для Nginx.

Наличие этих пакетов не является доказательством того, что production
reverse proxy и HTTPS полностью настроены и проверены.

Перед production switch это необходимо проверить отдельно.

21. Firewall / SSH protection

Статус: VERIFIED

Настроен UFW.

Разрешенные базовые направления:

SSH
HTTP
HTTPS

Fail2ban активен для:

sshd

22. GitHub source code

Статус: VERIFIED

GitHub остается source-code платформой.

Repository:

EgorBaal/Stubborn-ram

Repository клонирован на сервер.

Рабочая ветка:

main

На сервере выполнены:

npm ci
npm run build

Frontend успешно собирается на Node.js 24.

23. Git checkpoint

Последний зафиксированный архитектурный checkpoint:

05e15a7

Push в main был успешно выполнен.

Git не является частью автоматических действий при работе с сервером без
отдельного запроса пользователя.

24. Legacy Supabase

Статус: LEGACY / STILL IN USE UNTIL MIGRATION COMPLETES

Историческая frontend/server infrastructure использует Supabase.

Прямые обращения были обнаружены в:

authService.js
leadService.js
trainingService.js
ExerciseList.jsx
supabaseClient.js

Это не означает, что эти файлы нужно немедленно переписывать.

Миграция должна выполняться поэтапно:

Supabase implementation
↓
Backend API equivalent
↓
Verification
↓
Remove legacy dependency

Supabase не отключается до завершения миграции и проверки production
сценариев.

25. Authentication

Статус:

LEGACY CURRENT / TARGET NOT COMPLETED

Текущая система исторически основана на Supabase Auth.

Целевая система:

Frontend
↓
authService
↓
Backend API
↓
PostgreSQL

Целевая Auth должна поддерживать утвержденные требования:

email verification;

registration;

login;

logout;

persistent sessions;

password recovery;

profile creation;

server-side authorization.

В будущем biometric unlock является локальной разблокировкой
существующей сессии, а не отдельной серверной authentication system.

26. Coach / Client Relationship

Статус:

PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая модель:

User
↓
Coach-Client Relationship
↓
Permissions

MVP:

одна активная coach-client relationship;

pending;

accepted;

rejected;

cancellation;

archive;

исторический доступ согласно permissions.

Архивирование не удаляет пользовательскую историю.

27. Permissions

Статус:

PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая модель action-based permissions.

Роли и статусы не являются заменой permissions.

При проверке учитываются:

authentication;

ownership;

action/permission;

coach-client relationship;

ACTIVE / ARCHIVED;

historical access;

object state.

Критические проверки выполняются на Backend.

28. Reports

Статус:

PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая модель:

DRAFT
↓
SUBMITTED
↓
REVIEWED

Report является отдельной canonical сущностью.

Он не должен становиться частью Chat history.

Media отчета использует общий Media/Object Storage layer.

29. Chat

Статус:

PLANNED / NOT IMPLEMENTED IN NEW BACKEND

Целевая схема:

Chat UI
↓
chatService
↓
Backend / WebSocket
↓
PostgreSQL + Object Storage

PostgreSQL --- source of truth.

WebSocket --- realtime transport.

Если WebSocket недоступен, сообщения не должны теряться.

30. Training

Статус:

FRONTEND UI EXISTS / BACKEND PERSISTENCE NOT IMPLEMENTED

Существующий Training UI сохраняется.

Целевая canonical model:

Workout
↓
WorkoutExercise
↓
WorkoutSet

Exercise является отдельной entity.

Persistence будет подключаться к Backend API и PostgreSQL без ненужного
переписывания существующего UI.

31. Остальные бизнес-модули

На новом Backend уровне не считать реализованными:

Food;

Activity;

Weight;

Photos/Measurements;

Analytics;

Notifications;

Payments;

AI/OCR.

Их архитектура существует в документации, но физическая серверная
реализация еще не завершена.

32. Security --- фактическое состояние

Фактически подтверждено:

backend запускается не от root;

отдельный Linux user;

sudo;

UFW;

Fail2ban sshd;

secrets находятся в server .env, а не в исходном коде backend;

PostgreSQL доступен приложению локально;

frontend не подключается непосредственно к PostgreSQL.

Архитектурно требуется дополнительно реализовать/проверить:

полноценную authentication;

authorization;

permission layer;

rate limiting;

audit log;

backup strategy;

private Object Storage;

signed URLs;

security notifications;

re-authentication;

production incident procedures.

33. Персональные данные

Проект обрабатывает персональные данные.

Инфраструктурное решение ориентировано на российский регион.

Однако:

Российское размещение сервера само по себе не означает автоматического
выполнения всех требований 152-ФЗ.

До production необходимо отдельно проверить:

локализацию;

трансграничную передачу;

consent;

privacy policy;

договоры с processors/providers;

сроки хранения;

удаление;

incident response.

34. Что НЕ считать выполненным

Наличие следующих вещей в документации не означает их фактическую
реализацию:

PostgreSQL schema;

Auth backend;

Permissions;

Coach/Client backend;

Reports backend;

Chat backend;

WebSocket;

Object Storage;

FFmpeg Worker;

API business endpoints;

production backups;

production migration;

production switch.

35. Критическое различие между документами

Некоторые старые документы содержат состояние, которое больше не
соответствует фактическому серверу.

В частности:

Старое утверждение

Backend отсутствует.

Факт

Backend уже существует в:

/opt/stubbornram/backend/server

и успешно подключается к PostgreSQL.

Старое утверждение

Managed PostgreSQL является следующим обязательным шагом.

Факт

Managed PostgreSQL не создается.

PostgreSQL уже установлен непосредственно на существующем Cloud Server и
connection verified.

Старое утверждение

Infrastructure Migration / Backend Foundation еще не начались.

Факт

Часть Infrastructure Migration и Backend Foundation уже выполнена.

36. Состояние по слоям

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
PostgreSQL server VERIFIED
PostgreSQL database VERIFIED
Application DB role VERIFIED
Backend → PostgreSQL VERIFIED
PostgreSQL business schema NOT IMPLEMENTED
DB migrations NOT APPLIED
Object Storage NOT CONNECTED
Signed URLs NOT IMPLEMENTED
WebSocket NOT IMPLEMENTED
Worker / FFmpeg NOT IMPLEMENTED
Auth backend NOT IMPLEMENTED
Permissions backend NOT IMPLEMENTED
Coach/Client backend NOT IMPLEMENTED
Reports backend NOT IMPLEMENTED
Chat backend NOT IMPLEMENTED
Training persistence NOT IMPLEMENTED
Production migration NOT COMPLETED
Supabase removal NOT COMPLETED

37. Фактическая точка проекта

Наиболее точное описание текущего этапа:

Infrastructure foundation + minimal Backend foundation завершены.
PostgreSQL connection verified. Production business data layer еще не
создан.

Фактическая цепочка уже работает:

Cloud Server
↓
Node.js
↓
Fastify Backend
↓
PostgreSQL 16
↓
stubbornram database

Следующий слой --- не создание еще одного сервера и не установка еще
одного PostgreSQL.

Следующий слой --- реализация утвержденной database schema через
migrations, после проверки соответствующих архитектурных документов.

38. Следующие этапы

Порядок определяется актуальной архитектурой и MVP.

Ближайший технический этап:

DATABASE_SCHEMA
↓
physical PostgreSQL migrations
↓
verification
↓
Backend data/repository layer

После этого:

Auth
↓
Permissions
↓
Coach / Client
↓
Media / Object Storage
↓
Reports
↓
Chat
↓
Training persistence

Точный порядок отдельных модулей может быть изменен только отдельным
утвержденным архитектурным решением.

39. Правило для будущих AI-агентов

Перед серверной задачей:

Прочитать docs/server/SERVER_STATE.md.

Проверить соответствующую архитектурную документацию.

Не считать PLANNED функциональность реализованной.

Не считать LEGACY функциональность частью target architecture.

Не создавать второй Backend.

Не создавать второй PostgreSQL.

Не создавать Managed PostgreSQL без отдельного решения.

Не переустанавливать уже VERIFIED инфраструктуру без причины.

Не просить пользователя повторно объяснять уже зафиксированное
состояние.

После серверного изменения обновить этот документ.

Если фактическое состояние сервера противоречит этому документу, сначала
проверить сервер, затем обновить документ.

40. Правило секретов

Никогда не записывать в SERVER_STATE.md:

пароли;

private SSH keys;

API keys;

S3 secrets;

database passwords;

JWT secrets;

Email provider secrets;

payment secrets;

AI provider secrets.

Разрешается фиксировать только:

наличие переменной;

имя переменной;

факт настройки;

способ хранения.

41. Источники истины

При конфликте:

Фактическое серверное состояние

SERVER_STATE.md + непосредственная проверка сервера.

Архитектура

docs/architecture/\*

Правила разработки

docs/core/\*

План

ROADMAP.md

История решений

AI_HISTORY.md

Документы старше текущего состояния не должны автоматически
переопределять VERIFIED факты из этого документа.

42. Главное

Этот файл описывает не желаемый Stubborn Ram, а тот сервер, который
реально существует сейчас.

Он создан для предотвращения:

повторной установки уже установленного ПО;

создания второго Backend;

создания ненужного Managed PostgreSQL;

повторной проверки уже подтвержденных базовых шагов;

ошибочного предположения, что Backend еще не существует;

потери контекста между AI-сессиями.

После каждого существенного изменения серверной инфраструктуры этот файл
должен оставаться актуальным.
