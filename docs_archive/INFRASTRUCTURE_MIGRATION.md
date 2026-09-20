Миграция инфраструктуры Stubborn Ram

Версия: 2.0 Статус: CURRENT / SOURCE OF TRUTH Дата: сентябрь 2026

# 1. НАЗНАЧЕНИЕ

Документ фиксирует фактическое состояние инфраструктурной миграции
Stubborn Ram и оставшиеся этапы перехода с Supabase на собственную
серверную архитектуру.

Документ используется как источник истины для инфраструктуры.

Он фиксирует:

фактическую инфраструктуру;

текущую архитектуру;

уже завершённые этапы миграции;

оставшиеся этапы;

зависимости между этапами;

проверки;

rollback;

условия окончательного отключения legacy-инфраструктуры.

Документ необходимо обновлять после каждого подтверждённого
инфраструктурного изменения.

# 2. ОСНОВНОЕ АРХИТЕКТУРНОЕ РЕШЕНИЕ

Stubborn Ram переходит от зависимости от Supabase к собственной
серверной архитектуре.

При этом миграция выполняется поэтапно.

На текущем этапе:

Backend API работает на собственном Cloud Server;

PostgreSQL работает непосредственно на том же Cloud Server;

frontend использует Backend API для уже перенесённых серверных
функций;

Unisender Go используется для transactional email;

Supabase пока сохраняется для ещё не перенесённых частей приложения.

Важно:

Selectel Managed PostgreSQL на текущем этапе НЕ используется.

PostgreSQL размещён непосредственно на существующем Cloud Server.

# 3. ФАКТИЧЕСКАЯ ТЕКУЩАЯ АРХИТЕКТУРА

Текущая production-схема:

stubbornram.ru
↓
Stubborn Ram Frontend
↓ HTTPS / API
api.stubbornram.ru
↓
Nginx reverse proxy
↓
Fastify Backend
↓
PostgreSQL 16
↓
Stubborn Ram DB

Backend также использует Unisender Go
для transactional email.

Backend и PostgreSQL находятся на одном Selectel Cloud Server.

# 4. SERVER INFRASTRUCTURE

4.1 Selectel Cloud Server

Статус: VERIFIED

Сервер:

Name: stubbornram-backend
IP: 161.104.49.107
OS: Ubuntu 24.04
CPU: 2 vCPU
RAM: 4 GB
Disk: 20 GB SSD

Назначение сервера:

Backend API;

PostgreSQL;

Nginx;

pgAdmin;

PM2;

системные сервисы инфраструктуры.

# 5. POSTGRESQL

5.1 Размещение

Статус: VERIFIED

PostgreSQL 16 работает непосредственно на Cloud Server.

PostgreSQL не выставлен наружу как публичный database endpoint.

Backend подключается к PostgreSQL локально.

5.2 Database

Database: stubbornram
Application role: stubbornram_app
Port: 5432
Connection: 127.0.0.1:5432

Структура базы управляется миграциями node-pg-migrate.

Production-миграции уже применены.

Основные таблицы:

users;

profiles;

sessions;

auth_tokens;

pgmigrations;

leads.

# 6. BACKEND API

6.1 Production

Статус: VERIFIED

Backend:

/opt/stubbornram/backend/server

Runtime:

Node.js;

Fastify;

PM2.

PM2 process:

stubbornram-backend

Backend слушает:

127.0.0.1:3000

Внешний API:

https://api.stubbornram.ru

Nginx используется как reverse proxy.

# 7. API DOMAIN

Production API:

api.stubbornram.ru

DNS:

api.stubbornram.ru
→ 161.104.49.107

HTTPS:

Let's Encrypt.

Nginx:

api.stubbornram.ru
↓
127.0.0.1:3000

# 8. BACKEND HEALTH CHECK

Endpoint:

GET /health

Health check проверяет доступность Backend и PostgreSQL.

Успешный production response:

{
"ok": true,
"service": "stubbornram-backend",
"database": true
}

Статус: VERIFIED

# 9. EMAIL INFRASTRUCTURE

9.1 Provider

Статус: VERIFIED

Transactional email provider:

Unisender Go

Backend использует:

modules/email/email.service.js

API key хранится только на сервере в environment variables.

Frontend не получает API key.

9.2 Проверка доставки

Production API-запрос в Unisender Go успешно проверен.

Email был принят, отправлен и доставлен.

Также успешно проверена отправка реальной заявки из production
questionnaire.

# 10. LEADS

10.1 Production flow

Статус: VERIFIED

Frontend
↓
createLead()
↓
apiClient
↓
POST /api/leads
↓
Backend
↓
PostgreSQL
↓
Unisender Go
↓
Trainer email

10.2 Lead endpoint

POST /api/leads

Backend выполняет:

validation входных данных;

сохранение заявки в PostgreSQL;

отправку уведомления тренеру;

возврат результата frontend.

Rate limit:

10 requests / minute

Production end-to-end test успешно пройден.

# 11. FRONTEND API LAYER

Frontend использует:

src/shared/lib/apiClient.js

Для leads используется:

src/services/leads/leadService.js

Frontend больше не использует старый Supabase Edge Function для отправки
заявок.

Удалены:

supabase/functions/send-lead-email/

а также старые SQL-файлы leads.

# 12. SUPABASE

Статус:

LEGACY / PARTIALLY IN USE

Supabase больше не используется для отправки заявок.

Удалены:

supabase/functions/send-lead-email/;

Resend integration;

старый Supabase leads flow;

старые SQL-файлы для leads.

Однако Supabase пока остаётся legacy-зависимостью для ещё не
перенесённых частей приложения.

В текущем репозитории рабочие Auth и Training flows уже используют
Backend API и PostgreSQL.

Каталог `supabase/` сохраняется как legacy-артефакт миграции до
окончательной очистки репозитория и подтверждения, что оставшихся
рабочих зависимостей больше нет.

Полное отключение Supabase является будущим этапом.

# 13. ТЕКУЩЕЕ РАСПРЕДЕЛЕНИЕ ОТВЕТСТВЕННОСТИ

Компонент Технология Статус

Frontend React / Vite VERIFIED
Backend Fastify / Node.js VERIFIED
Database PostgreSQL 16 VERIFIED
DB migrations node-pg-migrate VERIFIED
Reverse proxy Nginx VERIFIED
Process manager PM2 VERIFIED
Transactional email Unisender Go VERIFIED
Leads API Own Backend API VERIFIED
Leads storage PostgreSQL VERIFIED
Leads email Unisender Go VERIFIED
Authentication Own Backend API VERIFIED
Training Backend API + PostgreSQL VERIFIED
Object Storage Selectel S3 PLANNED
CDN Selectel CDN PLANNED
Chat / WebSocket Own Backend PLANNED
Workers Own infrastructure PLANNED
AI/OCR Yandex AI PLANNED
Payments YooKassa / T-Bank PLANNED

# 14. ЧТО УЖЕ ЗАВЕРШЕНО

Infrastructure

Selectel Cloud Server создан;

Ubuntu 24.04 настроен;

PostgreSQL 16 установлен;

PostgreSQL работает на Cloud Server;

Nginx настроен;

HTTPS настроен;

API domain настроен;

PM2 настроен;

backend запускается автоматически;

health check работает;

базовая защита сервера настроена.

Backend

Backend foundation;

Fastify;

database connection;

migrations;

CORS;

cookies;

rate limiting;

validation;

logging;

health check.

Leads

leads migration;

leads table;

leads schema;

leads API;

PostgreSQL persistence;

email service;

Unisender integration;

frontend API integration;

production end-to-end test.

# 15. ЧТО ОСТАЛОСЬ СДЕЛАТЬ

Authentication

Переход основных Authentication flows на собственный Backend API
завершён.

Следующие задачи Authentication:

change email;

Welcome Flow / onboarding;

дополнительные security-сценарии;

дальнейшее развитие profile lifecycle;

расширение server-side authorization.

Training

Базовая Training migration на Backend API + PostgreSQL завершена.

Следующие расширения выполняются модульно.

Reports + Media

Перенести Reports и Media.

PostgreSQL используется для metadata и состояния.

Object Storage / S3 подключается для пользовательских файлов.

Приватные файлы не должны храниться в публичном доступе.

Chat

Перенести Chat на собственный WebSocket backend.

Frontend
↓
Backend WebSocket
↓
PostgreSQL

- Object Storage

Остальные модули

После стабилизации базовой платформы постепенно переводятся:

Food;

Activity;

Weight;

Photos & Measurements;

Progress;

другие модули.

Не выполнять массовую перепись всех модулей одновременно.

Workers

Workers добавляются при появлении реальных тяжёлых фоновых задач:

обработка видео;

FFmpeg;

генерация файлов;

тяжёлые фоновые операции;

AI/OCR.

Payments

Платёжная инфраструктура добавляется после стабилизации основного
пользовательского и тренерского flow.

Потенциальные providers:

YooKassa;

T-Bank.

Полное отключение Supabase

После переноса всех production-зависимостей:

проверить отсутствие production-зависимости от Supabase;

сделать финальный backup;

завершить rollback window;

отключить legacy integration;

только после этого удалить Supabase.

# 16. ПРИНЦИП РАЗВИТИЯ ИНФРАСТРУКТУРЫ

Stubborn Ram не должен усложняться инфраструктурой раньше времени.

На текущем этапе не используются:

Kubernetes;

Redis;

микросервисная архитектура;

отдельный PostgreSQL server;

отдельный worker server,

если для них нет реальной технической необходимости.

Основная модель:

Cloud Server
├── Backend
├── PostgreSQL
├── Nginx
├── PM2
└── системные сервисы

Это является осознанным решением для текущего масштаба проекта.

При росте нагрузки отдельные компоненты могут быть вынесены без
изменения публичного API.

# 17. SECURITY PRINCIPLES

PostgreSQL не должен быть доступен из публичного интернета.

Backend API является единой точкой доступа frontend к серверным
данным.

Секреты не хранятся во frontend.

API keys хранятся только в server environment.

Пароли пользователей хранятся только в виде безопасных хэшей.

Доступ к данным проверяется на сервере.

Rate limiting применяется к публичным endpoints.

HTTPS используется для production API.

Production .env не хранится в Git.

Изменение инфраструктуры должно быть проверено после deployment.

# 18. ROLLBACK

Для каждого существенного инфраструктурного изменения должен
существовать понятный rollback.

Минимальный принцип:

Change
↓
Deploy
↓
Verify
↓
If failed
↓
Rollback

Нельзя удалять рабочую legacy-систему только потому, что новая
реализация уже создана.

Удаление legacy выполняется только после:

успешной проверки новой реализации;

завершения миграции соответствующего функционала;

подтверждения отсутствия зависимостей;

наличия рабочего rollback / backup;

отдельного решения об окончательном отключении.

# 19. УСЛОВИЯ ПОЛНОГО УДАЛЕНИЯ SUPABASE

Supabase можно окончательно отключать только после того, как:

Authentication перенесён;

Training перенесён;

все остальные используемые Supabase-зависимости найдены;

frontend больше не требует Supabase для production-функций;

backend покрывает соответствующие операции;

production end-to-end тесты пройдены;

данные проверены;

backup существует;

rollback plan подтверждён.

До выполнения этих условий Supabase остаётся:

LEGACY

а не удалённой системой.

# 20. DEFINITION OF DONE ДЛЯ INFRASTRUCTURE MIGRATION

Миграция считается завершённой, когда production работает по схеме:

Stubborn Ram Frontend
↓
Backend API
↓
PostgreSQL
↓
┌─────────────────────┐
│ Object Storage │
│ Workers │
│ WebSocket │
│ Email │
│ AI / OCR │
│ Payments │
└─────────────────────┘

и при этом:

frontend не зависит от Supabase для production-функций;

данные контролируются собственным Backend;

authentication работает через собственную серверную архитектуру;

Training работает через собственный Backend;

файлы хранятся в Object Storage;

email работает через Unisender Go;

фоновые задачи выполняются workers;

chat работает через собственный WebSocket backend;

все секреты находятся на сервере;

PostgreSQL защищён от публичного доступа;

production имеет backup и понятный rollback;

legacy Supabase отключён.

# 21. ТЕКУЩАЯ ТОЧКА ПРОЕКТА

На текущий момент инфраструктурная миграция уже вышла из этапа
первоначальной подготовки.

Текущая точка:

Cloud Server ✅
PostgreSQL ✅
Backend API ✅
Nginx + HTTPS ✅
PM2 ✅
Health check ✅
Database migrations ✅
Leads API ✅
Leads PostgreSQL ✅
Unisender email ✅
Production leads test ✅

Authentication 🔄
Training 🔄

Object Storage ⏳
Reports / Media ⏳
Chat / WebSocket ⏳
Workers ⏳
AI/OCR ⏳
Payments ⏳
Supabase removal ⏳

Следующий основной рабочий блок:

Authentication
↓
Training
↓
Reports / Media
↓
Chat
↓
остальные модули
↓
полное отключение Supabase

# 22. ПРАВИЛО АКТУАЛИЗАЦИИ

Этот документ должен отражать фактическое состояние системы.

Если инфраструктурное решение изменилось, необходимо обновить этот
документ до начала следующего крупного этапа.

Нельзя оставлять в документе:

уже выполненные задачи как PLANNED;

удалённые компоненты как ACTIVE;

отменённые архитектурные решения;

Managed PostgreSQL как фактически используемую базу, если PostgreSQL
работает непосредственно на Cloud Server.

Последняя проверенная версия документа должна соответствовать реальному
production-состоянию Stubborn Ram.
