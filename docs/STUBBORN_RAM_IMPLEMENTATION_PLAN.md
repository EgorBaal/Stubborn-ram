Stubborn Ram --- План реализации

Версия: 2.0
Дата: 12.09.2026
Статус: АКТУАЛЬНАЯ КОНТРОЛЬНАЯ ТОЧКА

# 1. Текущее состояние

Архитектурная и инфраструктурная миграция уже начата и основные
фундаментальные части реализованы.

На текущий момент фактически работают:

production Cloud Server;

PostgreSQL 16 на том же сервере;

собственный Fastify Backend API;

Nginx + HTTPS для API;

PM2;

backend health endpoint;

database migrations;

собственная Leads API;

сохранение leads в PostgreSQL;

Unisender Go для email;

реальная проверка отправки заявки;

frontend leadService, работающий через Backend API.

Старый lead-flow на Supabase/Resend удалён.

Повторно реализовывать или проверять эти этапы не требуется.

# 2. Фактическая production-архитектура

React / Vite
↓
api.stubbornram.ru
↓
Nginx
↓
Fastify Backend
↓
PostgreSQL 16
↓
Unisender Go

PostgreSQL установлен непосредственно на Selectel Cloud Server.

Object Storage, WebSocket и Workers пока не являются развёрнутыми
production-компонентами.

# 3. Главный принцип дальнейшей реализации

Работать по одному логическому этапу за раз.

Не делать повторную миграцию уже завершённых частей.

Для каждого нового этапа:

определить фактическое состояние существующего кода;

внести минимально необходимое изменение;

проверить результат;

выполнить npm run build, если изменение затрагивает frontend;

проверить production/backend-сценарий, если изменение затрагивает
backend;

только после успешной проверки переходить дальше.

Не использовать Copilot для внесения изменений.

Изменения выполняются вручную совместно с пользователем: сначала
определяем конкретный файл/шаг, затем изменяем и проверяем его.

# 4. Уже завершённые этапы

Backend Foundation

Готово:

backend-папка;

Fastify;

server.js;

конфигурация окружения;

API/router;

обработка ошибок;

graceful shutdown;

health endpoint;

структура модулей.

PostgreSQL Foundation

Готово:

PostgreSQL 16;

production database;

application user;

server-side connection layer;

migrations;

backend connection check.

Leads

Готово:

Frontend
→ Backend API
→ PostgreSQL
→ Unisender
→ Email

Реальный questionnaire flow проверен.

Production infrastructure

Готово:

Selectel Cloud Server;

Nginx;

HTTPS;

PM2;

UFW;

Fail2ban;

pgAdmin;

api.stubbornram.ru.

# 5. Auth

Собственный backend Auth уже существует.

В backend есть:

backend/modules/auth/
├── auth.routes.js
├── auth.schemas.js
├── auth.service.js
├── auth.session.js
└── auth.tokens.js

В PostgreSQL есть:

users
profiles
sessions
auth_tokens

Однако frontend пока содержит Supabase-зависимости Auth.

Поэтому Auth не считается полностью переведённым на новый backend.

Это не текущий первый этап работы.

# 6. Supabase

Supabase пока сохраняется как legacy для тех частей приложения, которые
ещё не переведены.

В частности, текущий код Training и часть Auth всё ещё используют
Supabase.

Правило:

Не удалять Supabase до завершения соответствующей миграции и проверки
нового функционала.

Удалённый lead-flow к Supabase возвращать не нужно.

# 7. Текущий основной этап --- Training

Следующий этап разработки:

Training

Training уже имеет существующий UI.

Актуальные маршруты:

/app/training
/app/training/create
/app/training/new
/app/training/:id

Назначение:

/app/training
→ история тренировок

/app/training/create
→ выбор способа создания

/app/training/new
→ создание/редактор новой тренировки

/app/training/:id
→ конкретная историческая тренировка

Эти маршруты и существующий UI не переписываются без необходимости.

# 8. Цель Training

Наша задача --- перевести Training от текущего UI/legacy data flow к
устойчивому сохранению данных.

Целевая модель:

Training UI
↓
trainingService
↓
Backend API
↓
PostgreSQL

Frontend не должен напрямую работать с PostgreSQL.

До изменения существующего Training-кода сначала определить, какая часть
уже работает и какие именно данные сейчас получает/сохраняет Supabase.

# 9. Training data model

Целевая структура:

WORKOUT
↓
WORKOUT_EXERCISE
↓
WORKOUT_SET

Базовые сущности:

workout;

workout exercise;

workout set;

exercise reference.

Точные поля должны соответствовать уже утверждённой архитектуре и
фактической модели Training, а не придумывать новую схему без
необходимости.

# 10. Порядок работы с Training

Не переносить Training целиком одним большим изменением.

Порядок:

существующий Training UI;

существующий trainingService;

определение фактических операций чтения/создания/изменения;

PostgreSQL schema для Training;

Backend Training API;

перевод trainingService на Backend API;

сохранение тренировок;

история тренировок;

конкретная тренировка /app/training/:id;

проверка всех существующих сценариев;

только после этого удаление соответствующего Supabase Training flow.

# 11. Object Storage / Media

После стабилизации необходимых структурных данных подключается Object
Storage.

Целевая модель:

Frontend
→ Backend
→ permission check
→ signed URL
→ Object Storage

Пользовательские media не должны получать публичные постоянные URL.

S3 пока не развёрнут и не должен считаться готовым компонентом.

# 12. Reports

После необходимых Training/Media foundations:

DRAFT
→ SUBMITTED
→ REVIEWED

Клиент создаёт и отправляет отчёт.

Тренер просматривает отчёт и создаёт feedback.

Feedback должен оставаться отдельной сущностью и не превращаться в
сообщения Chat.

# 13. Chat

После Reports/необходимой Media-инфраструктуры:

HTTP API
→ PostgreSQL
→ история сообщений

WebSocket
→ realtime delivery

PostgreSQL остаётся источником истины.

WebSocket не должен быть единственным способом сохранения сообщений.

# 14. Permissions и Coach/Client Relationship

Эти модули реализуются по утверждённой архитектуре при переходе
соответствующего функционала на Backend API.

Основной принцип:

Authentication

- Ownership
- Permission
- Coach/Client relationship
- Object state

Frontend не является источником истины для доступа.

При смене тренера исторические данные не должны физически удаляться
только из-за изменения relationship.

# 15. Workers

Workers подключаются только при появлении реально тяжёлых фоновых задач.

В первую очередь:

видео;

FFmpeg;

другие долгие операции.

На старте worker может находиться на том же Cloud Server.

Redis, Kubernetes и микросервисы без реальной необходимости не
добавляются.

# 16. Удаление legacy

Для каждого legacy-компонента применяется один порядок:

Новая реализация
↓
Проверка
↓
Production test
↓
Rollback window
↓
Удаление legacy

Не удалять рабочий legacy до того, как новая реализация доказала
работоспособность.

# 17. Финальный переход от Supabase

После переноса всех необходимых модулей:

Auth;

Training;

Relationship;

Reports;

Media;

Chat;

проверить:

ownership;

permissions;

auth/session;

historical access;

data integrity;

production scenarios;

rollback.

Только после этого удалять оставшиеся Supabase-зависимости и
инфраструктуру.

# 18. Git

Изменения фиксируются логическими коммитами после завершения значимого
этапа.

Текущая известная архитектурная контрольная точка:

05e15a7

После неё инфраструктура уже развивалась, поэтому этот commit не
является описанием текущего production-состояния.

Новые коммиты должны отражать фактически завершённые этапы.

# 19. Что не делать

Не делать:

повторную миграцию уже завершённых компонентов;

полный rewrite frontend;

массовый перенос всех модулей одновременно;

удаление Supabase заранее;

прямой PostgreSQL из React;

публичное хранение пользовательских media;

backend secrets во frontend;

Redis/Kubernetes без необходимости;

микросервисы без необходимости;

временные архитектуры, которые потом придётся снова мигрировать.

# 20. Текущая точка

На текущий момент:

Infrastructure
↓
ГОТОВО

Backend Foundation
↓
ГОТОВО

PostgreSQL Foundation
↓
ГОТОВО

Leads migration
↓
ГОТОВО + PRODUCTION TEST

Documentation
↓
ПРИВОДИМ К АКТУАЛЬНОМУ СОСТОЯНИЮ

Training
↓
СЛЕДУЮЩИЙ ОСНОВНОЙ ЭТАП

# 21. Следующая конкретная задача

После фиксации документации не возвращаться к уже проверенным
Auth/Leads/Infrastructure этапам.

Следующая рабочая задача:

продолжить реализацию Training с существующего состояния проекта.

Первым действием в Training будет не переписывание кода, а просмотр
конкретного существующего файла Training, который отвечает за текущую
работу с данными.

После этого изменения делаются небольшими логическими шагами с проверкой
каждого результата.

# 22. Правило актуальности

Этот документ должен описывать фактическое состояние проекта.

Для каждого крупного компонента используется один статус:

ГОТОВО
В РАЗРАБОТКЕ
ЗАПЛАНИРОВАНО

Будущие компоненты не записываются как уже реализованные.

Завершённые этапы не возвращаются в список текущих задач без объективной
причины.
