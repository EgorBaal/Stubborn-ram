# Stubborn Ram — Documentation Update Map

Версия: 1.0
Дата: 05.09.2026

Этот документ фиксирует, какие существующие документы необходимо изменить перед реализацией MVP.

## 1. AGENTS.md

Изменение:

Добавить правило:

> На текущем этапе приоритетом является MVP для реального ведения первых клиентов: Auth, Coach-Client Relationship, Chat, Reports, Media и базовый Training persistence. Остальные модули Roadmap не должны блокировать MVP.

Сохранить существующий workflow:

Idea → Discussion → Documentation → Approval → Implementation → Verification → Documentation → Git Commit.

## 2. ARCHITECTURE.md

Изменить backend architecture.

Было:

Frontend → Services → Supabase

Становится:

Frontend → Services → Backend API → PostgreSQL / S3 / Workers

Supabase считается legacy-инфраструктурой миграции и не является целевой архитектурой.

## 3. AUTH_ARCHITECTURE.md

Разделить:

- текущую Supabase Auth реализацию;
- целевую собственную Auth систему.

Целевая система должна сохранить уже утверждённые требования:

- email confirmation;
- password reset;
- persistent sessions;
- profile creation;
- trial/access logic в будущем;
- secure password hashing;
- server-side authorization.

Auth должен быть provider-independent для frontend.

## 4. DATABASE_SCHEMA.md

Полностью переработать как целевую PostgreSQL schema.

Приоритет MVP:

profiles
coach_client_relationships
chats
chat_messages
reports
report_feedback
media
media_links

Training schema:

exercises
workouts
workout_exercises
workout_sets

В документе обязательно разделить:

CURRENT IMPLEMENTED
PLANNED
MIGRATION TARGET

Не выдавать планируемые таблицы за уже существующие.

## 5. CHAT.md

Сохранить утверждённую концепцию:

- один чат на пару coach-client;
- text/photo/video/document;
- reply/search/drafts/read state;
- object references.

Дополнить:

- PostgreSQL = source of truth;
- WebSocket = realtime transport;
- отсутствие WebSocket не должно приводить к потере сообщений;
- attachments → Media/S3.

## 6. REPORT.md

Создать/обновить документ как MVP-критический.

Зафиксировать:

- weekly report;
- draft;
- submit;
- coach review;
- coach feedback;
- client feedback view;
- media attachments;
- permanent retention;
- access through coach-client relationship.

## 7. MEDIA.md

Создать новый обязательный документ.

Описать:

- S3;
- private storage;
- object keys;
- metadata;
- signed URLs;
- upload;
- download;
- image/video/document;
- video processing;
- retention;
- access control;
- future CDN.

## 8. TRAINING.md

Не удалять существующую архитектуру Training.

Изменить статус:

UI частично реализован.
Persistence/data layer не завершён.

Приоритет:

после Chat/Reports/Media подключить существующий UI к новой backend architecture.

Сохранить canonical model:

Workout → WorkoutExercise → WorkoutSet

## 9. COACH_CLIENT_RELATIONSHIP.md

Сохранить ownership model.

Добавить:

- MVP использует одну активную связь coach-client;
- доступ к данным предоставляется через relationship;
- история отношений не должна приводить к удалению данных;
- архитектура остаётся расширяемой до нескольких специалистов.

## 10. PROJECT_STRUCTURE.md

Обновить services:

services/
├── auth/
├── api/
├── chatService
├── reportService
├── mediaService
├── trainingService
└── coachClientService

Указать, что Supabase-specific service layer является временным migration state.

## 11. ROADMAP.md

Добавить новый этап:

### Stage MVP — First Clients

P0:
- Auth
- Coach/Client
- Chat
- Media
- Reports
- Coach cabinet
- Client feedback

P1:
- Training persistence

P2:
- Nutrition
- Activity
- Photos/Measurements
- Weight
- Analytics
- Library
- Notifications
- Payments
- AI

## 12. PAYMENT_ARCHITECTURE.md

Оставить как future architecture.

В MVP payments не реализуются.

## 13. PERMISSIONS_ARCHITECTURE.md

Сохранить action-based model.

Добавить MVP actions:

chat.read
chat.send
chat.attach
report.create
report.read_own
report.submit
report.review
report.feedback
media.upload
media.read
training.read
training.create
training.update

Все проверки выполняются server-side.

## 14. SECURITY.md

Добавить:

- user media private by default;
- signed URLs;
- server-side ownership checks;
- no secrets in frontend;
- permanent retention without automatic deletion;
- audit logging for administrative access;
- backup/restore procedures.

## 15. AI_HISTORY.md

Добавить decision record:

05.09.2026 — MVP scope reduced for launch.

Главный критерий:

Stubborn Ram должен сначала стать рабочим инструментом тренера для первых клиентов, а затем расширяться до полной платформы.

Утверждённый MVP:
Auth + Coach/Client + Chat + Reports + Media + Training persistence.

Остальные модули не отменены, а перенесены.

## 16. CHANGELOG.md

Добавить новую версию документации:

### Version 0.7 — MVP architecture

Дата: 05.09.2026

Зафиксировано:

- переход с Supabase на российскую инфраструктуру;
- Selectel как базовый инфраструктурный provider;
- собственный backend;
- PostgreSQL;
- S3;
- Chat;
- Reports;
- Media;
- MVP-first development;
- Training persistence после критического MVP;
- отказ от преждевременного подключения необязательных платных сервисов.

## 17. Важное правило

Если старый документ противоречит CURRENT_MVP.md или MIGRATION_ARCHITECTURE.md по приоритету текущего этапа, для MVP используется новая документация.

При этом долгосрочный Roadmap не удаляется.
