# Stubborn Ram — MVP Migration Architecture

Версия: 1.0
Дата: 05.09.2026
Статус: УТВЕРЖДЕНО ДЛЯ РЕАЛИЗАЦИИ

## 1. Архитектурное решение

Основная инфраструктура MVP:

- Selectel Cloud Server;
- Selectel Managed PostgreSQL;
- Selectel S3;
- собственный Backend API;
- WebSocket внутри backend для чата;
- FFmpeg worker для видео;
- emailService;
- frontend React/Vite;
- GitHub как исходный код и CI/CD, пока в GitHub не попадают пользовательские персональные данные.

## 2. Почему не Supabase

Supabase был удобен для прототипа, но не соответствует выбранной стратегии локализации российских пользовательских данных.

Новая архитектура не должна зависеть от Supabase.

После успешной миграции:

- Supabase Auth → собственный Auth;
- Supabase Postgres → Selectel Managed PostgreSQL;
- Supabase Storage → Selectel S3;
- Supabase Edge Functions → Backend API / Worker;
- Supabase Realtime, если фактически использовался, → собственный WebSocket.

## 3. Backend

Один backend на старте.

Не создавать микросервисы.

Backend отвечает за:

- auth;
- permissions;
- coach-client relationship;
- chat;
- reports;
- media access;
- training API;
- signed upload/download URLs;
- системные операции.

При росте нагрузки worker можно вынести на отдельный сервер без изменения frontend API.

## 4. PostgreSQL

PostgreSQL является canonical source of truth для структурированных данных.

Минимальные сущности MVP:

- users/auth;
- profiles;
- coach_client_relationships;
- chats;
- chat_messages;
- reports;
- report_feedback;
- media;
- media_links.

Training добавляет:

- exercises;
- workouts;
- workout_exercises;
- workout_sets.

Точные поля и индексы фиксируются в DATABASE_SCHEMA.md перед созданием production schema.

## 5. Object Storage

S3 используется для:

- фотографии;
- видео;
- документы;
- вложения чата;
- вложения отчётов;
- медиа тренировок.

Правила:

- private bucket;
- уникальный object key;
- metadata в PostgreSQL;
- signed URLs;
- серверная проверка доступа;
- отсутствие публичных ссылок на пользовательские файлы;
- отсутствие автоматического удаления MVP-файлов.

## 6. Upload flow

Клиент:

1. выбирает файл;
2. frontend сообщает backend metadata;
3. backend проверяет пользователя и создаёт upload authorization;
4. frontend загружает файл непосредственно в S3;
5. backend фиксирует media record;
6. для видео создаётся задача обработки;
7. после успешной обработки сохраняется оптимизированная версия;
8. оригинал удаляется только если это явно разрешено правилами конкретного media-типа.

ВАЖНО:

Для отчётов пользовательские материалы должны сохраняться постоянно. Поэтому автоматическое удаление оригиналов допускается только после подтверждения, что требуемая итоговая версия действительно сохранена и политика хранения этого типа файла это разрешает.

## 7. Video processing

Не обрабатывать большие видео внутри HTTP-запроса.

Flow:

Upload → S3 → Queue/Job → FFmpeg worker → optimized video → S3 → PostgreSQL metadata

На старте worker может работать на том же Cloud Server.

Если нагрузка вырастет, worker переносится на отдельный сервер.

## 8. Chat

Один chat на одну coach-client relationship.

PostgreSQL хранит историю.

WebSocket используется только для realtime-доставки.

Если WebSocket временно недоступен:

- сообщение всё равно сохраняется через HTTP API;
- история загружается из PostgreSQL;
- приложение не должно терять сообщения.

Таким образом realtime не является источником истины.

## 9. Reports

Минимальный lifecycle:

DRAFT
→ SUBMITTED
→ REVIEWED

Клиент:

- создаёт отчёт;
- добавляет текст;
- добавляет media;
- отправляет.

Тренер:

- получает новый отчёт;
- открывает его;
- просматривает media;
- пишет feedback;
- может прикрепить media;
- отправляет feedback.

Клиент:

- получает сохранённый feedback;
- может открыть старые отчёты.

История не перезаписывается таким образом, чтобы потерять исходный отчёт.

## 10. Permissions

Проверка прав обязательна на backend.

Базовые правила:

Client:
- видит собственные данные;
- видит собственные отчёты;
- видит свой чат;
- видит feedback своего coach.

Coach:
- видит данные только связанных клиентов;
- видит отчёты своих клиентов;
- пишет feedback только своим клиентам;
- не получает доступ к клиентам других тренеров.

Admin:
- отдельная роль;
- доступ только к административным операциям;
- действия должны логироваться.

## 11. Frontend

Frontend не должен знать:

- SQL;
- S3 credentials;
- PostgreSQL credentials;
- внутренние секреты;
- структуру инфраструктуры.

Frontend работает через services:

authService
chatService
reportService
mediaService
trainingService
coachClientService

Существующие модули должны подключаться к этим services, а не к инфраструктуре напрямую.

## 12. Routes MVP

Основные клиентские маршруты:

/app/home
/app/chat
/app/chat/:chatId
/app/report
/app/report/:reportId
/app/training
/app/training/create
/app/training/new
/app/training/:id
/app/profile

Основные coach-маршруты должны быть отдельной частью coach area.

Точные URL фиксируются в router documentation перед реализацией.

## 13. Что оплачиваем сейчас

Минимальный оплачиваемый набор:

- Cloud Server;
- Managed PostgreSQL;
- S3.

Условно бесплатные/уже имеющиеся:

- домен;
- GitHub/source control.

Подключаем только по необходимости:

- CDN;
- email provider;
- дополнительные worker servers;
- payments;
- AI;
- analytics;
- push infrastructure.

## 14. Что сознательно НЕ покупаем сейчас

Не покупать заранее:

- Redis;
- Kubernetes;
- отдельный сервер под каждый сервис;
- платный CDN без реальной необходимости;
- AI;
- аналитические SaaS;
- платёжный шлюз;
- push provider;
- отдельный chat SaaS;
- сторонний video SaaS.

## 15. Главный принцип расходов

Каждый внешний сервис должен отвечать на вопрос:

«Какую функцию MVP он обеспечивает прямо сейчас?»

Если ответ — «понадобится потом», сервис не подключается и не оплачивается сейчас.

## 16. Definition of Done для миграции

Миграция не считается завершённой, пока:

- пользователь может зарегистрироваться;
- пользователь может войти;
- тренер может видеть своего клиента;
- чат работает;
- сообщения сохраняются;
- фото загружаются и открываются;
- видео загружаются и открываются;
- клиент создаёт отчёт;
- отчёт отправляется тренеру;
- тренер открывает отчёт;
- тренер отправляет feedback;
- клиент открывает feedback;
- старые отчёты доступны;
- старые файлы доступны;
- права доступа проверяются сервером;
- основные данные находятся в российской инфраструктуре;
- frontend больше не зависит от Supabase;
- production проходит build/test;
- старый Supabase ещё не удалён до завершения rollback window.

## 17. Правило против повторной миграции

Новая инфраструктура должна сразу проектироваться как production foundation.

Даже если MVP маленький:

- PostgreSQL не заменяется временной БД;
- S3 не заменяется локальным диском;
- backend API не заменяется frontend-прямыми запросами;
- media не хранится в базе;
- auth не строится на временных костылях;
- provider-specific код изолируется service layer.

Это позволяет расширять Stubborn Ram без второй большой миграции.
