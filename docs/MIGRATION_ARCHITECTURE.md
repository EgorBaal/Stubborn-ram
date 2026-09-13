Stubborn Ram --- Актуальная архитектура миграции

Версия: 2.0
Дата: 12.09.2026
Статус: АКТУАЛЬНОЕ СОСТОЯНИЕ ПРОЕКТА

# 1. Назначение

Этот документ фиксирует фактическое текущее состояние инфраструктуры
Stubborn Ram после выполненной миграции.

Документ заменяет старое описание архитектуры MVP, которое описывало
будущую инфраструктуру как план.

Главный принцип: здесь фиксируется только то, что уже реализовано и
подтверждено, а будущие этапы явно обозначаются как следующие задачи.

# 2. Фактическая архитектура на текущий момент

Текущая production-схема:

stubbornram.ru
│
▼
React / Vite frontend
│
│ HTTPS
▼
api.stubbornram.ru
│
▼
Nginx
│
▼
Fastify Backend
127.0.0.1:3000
│
▼
PostgreSQL 16
на том же Selectel Cloud Server
│
└──────────────► Unisender Go
email-уведомления

Frontend больше не использует Supabase для отправки заявок.

Leads полностью переведены на собственный Backend API и PostgreSQL.

# 3. Cloud Server

Production backend размещён на Selectel Cloud Server.

Сервер:

IP: 161.104.49.107

hostname: stubbornram-backend

Ubuntu 24.04

2 vCPU

4 GB RAM

20 GB SSD

На сервере работают:

Node.js;

Fastify backend;

PM2;

Nginx;

PostgreSQL 16;

pgAdmin 4;

Fail2ban;

UFW;

Certbot / Let's Encrypt.

# 4. PostgreSQL

PostgreSQL установлен не как Managed PostgreSQL, а непосредственно
на том же Cloud Server.

Это сознательное решение для снижения постоянных расходов и упрощения
текущей инфраструктуры.

Параметры:

PostgreSQL 16;

database: stubbornram;

application role: stubbornram_app;

порт: 5432;

доступ backend осуществляется локально через 127.0.0.1.

PostgreSQL является основным хранилищем структурированных данных
backend.

# 5. Текущая схема базы данных

На текущем этапе в базе существуют основные таблицы:

users;

profiles;

sessions;

auth_tokens;

leads;

pgmigrations.

Для leads создана отдельная production migration:

backend/migrations/1788859125914_leads.js

Таблица leads содержит данные анкет и имеет индексы по created_at и
status.

Статус новой заявки по умолчанию:

new

# 6. Backend

Production backend находится по пути:

/opt/stubbornram/backend/server

Основная структура:

backend/server
├── .env
├── database.cjs
├── migrations/
├── modules/
│ ├── auth/
│ ├── db/
│ ├── email/
│ └── leads/
├── package.json
├── package-lock.json
└── server.js

Backend построен на Fastify.

Основной процесс:

stubbornram-backend

Управление production-процессом выполняется через PM2.

Backend слушает:

127.0.0.1:3000

Наружу он публикуется через Nginx.

# 7. API

Production API:

https://api.stubbornram.ru

Основной backend API prefix:

/api

Для проверки состояния используется:

GET /health

Production health check подтверждён:

{
"ok": true,
"service": "stubbornram-backend",
"database": true
}

HTTP status:

200

Это подтверждает, что backend запущен и имеет рабочее соединение с
PostgreSQL.

# 8. Nginx и HTTPS

api.stubbornram.ru направлен на production server:

161.104.49.107

Nginx принимает HTTPS-запросы и проксирует их на:

127.0.0.1:3000

SSL-сертификат Let's Encrypt для API действует до:

09.12.2026

Настроено автоматическое продление сертификата.

# 9. Email

Для transactional email используется:

Unisender Go

Backend отправляет email через собственный сервис:

backend/modules/email/email.service.js

Используется отправитель:

noreply@stubbornram.ru

Имя отправителя:

Stubborn Ram

Реальная отправка была проверена через production API.

Результат проверки:

accepted
→ sent
→ delivered

Письмо было получено в почтовом ящике.

Таким образом цепочка email подтверждена end-to-end.

# 10. Leads / заявки

Заявки с frontend отправляются через:

POST /api/leads

Frontend использует:

src/services/leads/leadService.js

который обращается к общему:

src/shared/lib/apiClient.js

Backend:

принимает заявку;

валидирует данные через Zod;

сохраняет заявку в PostgreSQL;

присваивает статус new;

отправляет уведомление через Unisender;

возвращает результат frontend.

При ошибке email заявка не теряется: сначала она сохраняется в
PostgreSQL, после чего backend возвращает соответствующую ошибку
отправки уведомления.

Реальная анкета была отправлена после миграции.

Подтверждено:

Frontend
→ Backend API
→ PostgreSQL
→ Unisender
→ почтовый ящик

# 11. Старый lead-flow удалён

После успешной миграции удалены старые компоненты lead-системы:

Supabase Edge Function send-lead-email;

Resend API;

старые SQL-файлы leads;

старая backend-директория backend/src/;

старый Supabase lead flow.

В текущем проекте нет использования:

send-lead-email
RESEND_API_KEY
api.resend.com
public.leads

для текущего lead-flow.

# 12. Supabase --- текущее состояние

Supabase ещё не удалён полностью из проекта.

Это важно.

После миграции leads каталог `supabase/` и связанные legacy-артефакты
ещё сохраняются в проекте.

При этом по текущему коду рабочие Training и Auth flows уже используют
Backend API и PostgreSQL.

Поэтому сейчас нельзя считать выполненным условие:

Frontend больше не зависит от Supabase

Полное удаление Supabase --- отдельный последующий этап.

Удалять оставшиеся Supabase-зависимости сейчас не требуется.

# 13. Frontend

Frontend:

React;

Vite;

production build через GitHub Actions;

Vite base: /.

Production frontend продолжает обслуживаться через существующую
инфраструктуру сайта.

Frontend обращается к backend через:

https://api.stubbornram.ru/api

Общий API-клиент:

src/shared/lib/apiClient.js

Сервисы приложения отделяют UI от backend API.

Для leads уже используется новый backend API.

# 14. Авторизация

Собственный backend Auth уже реализован как часть новой архитектуры.

В backend присутствуют модули:

backend/modules/auth/
├── auth.routes.js
├── auth.schemas.js
├── auth.service.js
├── auth.session.js
└── auth.tokens.js

В базе присутствуют:

users
profiles
sessions
auth_tokens

Frontend Auth использует Backend API через `src/services/auth/authService.js`.

Поэтому текущий статус:

Backend Auth — реализован
Рабочие frontend Auth flows переведены на Backend API

Повторный аудит Auth на этом этапе не является задачей миграции.

# 15. Что уже завершено

На текущей контрольной точке завершены:

production Cloud Server;

PostgreSQL 16 на сервере;

production Fastify backend;

PM2;

Nginx;

HTTPS для API;

production health check;

database migrations;

собственная leads API;

сохранение leads в PostgreSQL;

Zod validation;

Unisender email service;

реальная проверка отправки email;

реальная проверка questionnaire flow;

перевод frontend leadService на Backend API;

удаление старого lead email flow;

удаление старого backend/src/;

удаление старых SQL для leads.

# 16. Текущий этап разработки

После завершения инфраструктурной миграции следующий основной этап:

Training

Training уже имеет существующий UI и маршрутизацию.

Актуальные маршруты:

/app/training
/app/training/create
/app/training/new
/app/training/:id

Текущая логика:

/app/training
→ история тренировок

/app/training/create
→ выбор способа создания тренировки

/app/training/new
→ редактор новой тренировки

/app/training/:id
→ конкретная историческая тренировка

Следующая задача --- продолжить развитие Training поверх уже
существующей структуры, а не возвращаться к завершённой миграции leads.

# 17. Следующие этапы после Training

После Training развитие платформы продолжается по мере необходимости:

Media / object storage;

Reports;

Chat / WebSocket;

окончательный перенос оставшихся Supabase-зависимостей;

удаление Supabase после завершения rollback window;

дополнительные функции платформы.

S3, отдельные workers и WebSocket сейчас не должны считаться уже
развёрнутыми production-компонентами.

# 18. Object Storage / S3

S3 пока не является частью фактической production-инфраструктуры.

Он нужен для будущего хранения:

фотографий;

видео;

документов;

вложений отчётов;

медиа тренировок;

вложений чата.

Когда будет реализован media layer, frontend не должен получать S3
credentials.

Целевой flow:

Frontend
→ Backend authorization
→ S3 upload
→ PostgreSQL metadata

Конкретный S3 provider подключается только на этапе реализации media
storage.

# 19. Reports и Chat

Reports и Chat являются следующими функциональными модулями платформы.

Целевая архитектура:

Reports

Client
→ Report
→ Media
→ Submit
→ Coach
→ Feedback

Chat

HTTP API
→ PostgreSQL
→ история сообщений

WebSocket
→ realtime-доставка

PostgreSQL должен оставаться источником истины для сообщений.

WebSocket не должен быть единственным механизмом сохранения сообщений.

# 20. Безопасность

Текущая инфраструктура включает:

UFW;

Fail2ban;

HTTPS;

PostgreSQL, доступный локально;

backend, слушающий 127.0.0.1:3000;

Nginx как внешний reverse proxy;

секреты в production .env, а не во frontend;

отдельного application database user.

Frontend не должен содержать:

PostgreSQL credentials;

S3 credentials;

Unisender API key;

внутренние серверные секреты.

# 21. Rollback и удаление старых компонентов

Старые компоненты не должны удаляться до подтверждения нового production
flow.

Для leads rollback уже пройден:

new Backend API
→ PostgreSQL
→ Unisender
→ real questionnaire test

После подтверждения старый lead-flow был удалён.

Для оставшихся Supabase-модулей аналогичный принцип сохраняется:

новая реализация
→ production test
→ подтверждение
→ rollback window
→ удаление старого компонента

# 22. Definition of Done текущей миграции

Инфраструктурная часть migration считается выполненной в текущем объёме,
потому что:

production backend работает;

PostgreSQL работает;

API доступен по HTTPS;

health check проходит;

leads сохраняются в PostgreSQL;

email через Unisender отправляется;

реальная анкета проверена;

frontend использует новый lead API;

старый lead email flow удалён;

production структура backend очищена от старой backend/src/.

При этом полная ликвидация Supabase ещё не является выполненной
задачей, поскольку legacy-артефакты Supabase ещё сохраняются в
репозитории до отдельного cleanup-этапа.

# 23. Архитектурный принцип

Stubborn Ram развивается без повторной большой миграции.

Правила:

не создавать микросервисы без необходимости;

PostgreSQL остаётся canonical source of truth;

frontend не получает секреты инфраструктуры;

backend является границей доступа к данным;

media не хранится непосредственно в PostgreSQL;

provider-specific код изолируется в service layer;

новые инфраструктурные сервисы подключаются только тогда, когда они
реально нужны текущему этапу.

# 24. Контрольная точка проекта

На момент версии 2.0 инфраструктурная миграция для Leads завершена и
production-путь проверен.

Проект находится в переходе:

Инфраструктурная миграция
↓
ЗАВЕРШЕНА ДЛЯ ТЕКУЩЕГО ОБЪЁМА
↓
TRAINING
↓
MEDIA / REPORTS / CHAT
↓
ОКОНЧАТЕЛЬНЫЙ УХОД ОТ SUPABASE

Следующая рабочая задача проекта:

продолжение разработки Training.

# 25. Правило обновления документа

Этот документ обновляется после существенного изменения архитектуры.

Не следует заранее записывать будущие компоненты как уже существующие.

Каждый компонент должен иметь один из статусов:

ГОТОВО
В РАЗРАБОТКЕ
ЗАПЛАНИРОВАНО

Это необходимо, чтобы документация оставалась фактической контрольной
точкой проекта.
