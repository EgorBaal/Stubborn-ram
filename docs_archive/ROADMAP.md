# ROADMAP.md

# Roadmap проекта Stubborn Ram

Версия: 0.5  
Последнее обновление: сентябрь 2026

---

# Назначение документа

Roadmap определяет последовательность развития Stubborn Ram.

Проект развивается поэтапно.

Главный принцип:

> Сначала устойчивый фундамент, затем бизнес-функции, затем расширение и масштабирование.

Каждый этап должен иметь понятный результат и проверяться до перехода к следующему крупному этапу.

---

Текущее состояние проекта
Статус:
🟡 Базовая инфраструктура и ключевые backend-модули уже реализованы; продолжается поэтапное развитие платформы
До текущего этапа проект уже получил:

- Landing Page;
- стартовую анкету;
- первый App Shell;
- базовую маршрутизацию;
- HOME;
- Header;
- Notification Section;
- Module Grid;
- BottomTabBar;
- страницы основных разделов;
- авторизацию через Backend API;
- persistent sessions;
- password reset;
- базовую Training persistence через Backend API + PostgreSQL;
- модульную структуру frontend;
- архитектурную документацию.
  Исторически проект использовал Supabase/PostgreSQL/Edge Functions/Resend. Legacy-артефакты и отдельные документы миграции сохраняются как исторический контекст и до полного cleanup репозитория.
  Сейчас согласована целевая архитектура:
  React / PWA
  ↓
  Services
  ↓
  Backend API
  ↓
  PostgreSQL + Object Storage
  ↓
  Server-side integrations

---

# ЭТАП 1 — Landing Page

Статус: ✅ Завершено

Реализовано:

- главный экран;
- Hero;
- «Кто стоит за Stubborn Ram»;
- «Что вы получите»;
- FAQ;
- результаты клиентов;
- адаптивная верстка;
- единый визуальный стиль.

---

# ЭТАП 2 — Анкета клиента

Статус: ✅ Завершено

Реализовано:

- экран приветствия;
- пошаговая анкета;
- прогресс-бар;
- навигация;
- валидация;
- экран успешной отправки;
- сохранение заявок.

Историческая цепочка анкеты:

```text
Пользователь
↓
Анкета
↓
Supabase
↓
PostgreSQL
↓
Edge Function
↓
Email
```

Эта цепочка является частью текущего legacy-контура и будет заменена целевой backend-реализацией после миграции.

---

# ЭТАП 3 — Архитектурная база

Статус: 🟡 В процессе / завершается

Цель:

Зафиксировать архитектуру до реализации production data layer.

Включает:

- ARCHITECTURE.md;
- DATABASE_SCHEMA.md;
- PERMISSIONS_ARCHITECTURE.md;
- SECURITY.md;
- CODING_RULES.md;
- DEVELOPMENT_RULES.md;
- DESIGN_SYSTEM.md;
- PROJECT_CONTEXT.md;
- WORKFLOW.md;
- AI_HISTORY.md;
- CHANGELOG.md.

Результат:

- единая архитектура;
- единая permission model;
- ownership;
- canonical data;
- модульная frontend-структура;
- правила разработки;
- security baseline.

---

# ЭТАП 4 — App Shell

Статус: 🟢 Каркас реализован

Реализовано:

- базовая маршрутизация;
- AppLayout;
- Home;
- Header;
- Notification Section;
- Module Grid;
- BottomTabBar;
- страницы основных разделов;
- Mobile First.

Оставшиеся общие задачи shell выполняются отдельно и не должны блокировать миграцию backend.

---

# ЭТАП 5 — Infrastructure Migration

Статус: ✅ Завершено

Цель:

Перейти на устойчивую целевую серверную инфраструктуру без повторного изменения фундамента без необходимости.

Реализовано:

- Cloud Server;
- PostgreSQL 16;
- Backend API;
- Nginx;
- HTTPS;
- DNS;
- PM2;
- pgAdmin;
- production health check.

Целевая цепочка:

Frontend
↓
HTTPS
↓
Nginx
↓
Backend API
↓
Fastify
↓
PostgreSQL

---

# ЭТАП 6 — Backend Foundation

Статус: ✅ Завершено

Цель:

Создать и запустить собственную основу Backend для production.

Реализовано:

- Backend API;
- environment/secrets;
- database connection;
- migrations;
- PostgreSQL connection pool;
- validation;
- error handling;
- rate limiting;
- health checks;
- production process management;
- Nginx reverse proxy;
- HTTPS;
- server-side integrations.

Результат:

Frontend получает единую серверную точку входа.

Текущая цепочка:

Frontend
↓
Backend API
↓
Fastify
↓
PostgreSQL

Следующие расширения Backend выполняются по мере миграции соответствующих модулей:

- authorization;
- permissions;
- audit log;
- Object Storage;
- WebSocket;
- workers.

---

# ЭТАП 7 — Authentication & Account

Статус: ✅ Завершено

Цель:

Перевести Authentication на собственную Backend API архитектуру.

Реализовано:

- регистрация;
- Email verification;
- login;
- logout;
- persistent sessions;
- password recovery;
- resend verification;
- session endpoint;
- route protection;
- access state;
- profile creation;
- password hashing через argon2;
- session cookie;
- auth route rate limiting.

Production flows проверены:

регистрация
↓
подтверждение Email
↓
вход
↓
сессия
↓
выход

Также проверено восстановление пароля.

Supabase Auth больше не является текущим механизмом Authentication.

Дальнейшее расширение:

- смена Email;
- security notifications;
- 2FA/MFA.

---

# ЭТАП 8 — Core Data Platform

Статус: 🟡 Частично реализовано

Цель:

Создать основные сущности и связи, на которых строятся все модули.

Уже реализовано:

- базовая модель пользователей;
- Authentication infrastructure;
- PostgreSQL;
- ownership для Training;
- server-side authentication;
- базовые server-side ownership checks.

Training использует собственную persistence-модель:

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

В production реализованы:

- `exercises`;
- `workouts`;
- `workout_exercises`;
- `workout_sets`.

Не реализовано:

- `coach_client_relationships`;
- полноценная permissions model;
- access sources;
- archive states;
- общая relationship-based authorization.

Эти сущности реализуются отдельным этапом до полноценного Client & Coach Platform.

---

# ЭТАП 9 — Client & Coach Core Platform

Статус: 🔜

Цель:

Запустить полноценные кабинеты клиента и тренера на единой архитектуре.

## Client

- Home;
- Profile;
- Library;
- доступные модули;
- статус доступа;
- coach relationship.

## Coach

- список клиентов;
- карточка клиента;
- доступ к разрешенным данным;
- основные действия тренера.

Данные не копируются между кабинетами.

Для реализации требуется:

- `coach_client_relationships`;
- полноценная permissions model;
- relationship-based access;
- archive states;
- исторический доступ.

---

# ЭТАП 10 — Media Storage

Статус: 🔜

Цель:

Создать единую систему хранения пользовательских файлов.

Включает:

- Object Storage;
- private access;
- upload;
- permission check;
- file metadata;
- image processing;
- video processing;
- preview;
- deletion/retention;
- storage service.

Для видео:

```text
Upload
↓
Object Storage
↓
Worker / FFmpeg
↓
Processed Video
```

На старте worker может работать на Backend server.

---

# ЭТАП 11 — Training

Статус: 🟡 Базовая persistence реализована; дальнейшие расширения остаются отдельным этапом

Цель:

Продолжить развитие существующего Training UI поверх уже реализованной persistence-модели.

Модель:

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Включает:

- exercises;
- system/personal exercises;
- workout creation;
- workout history;
- sets;
- media;
- feedback;
- coach access;
- permissions;
- persistence;
- Chat object references.

Для Training media:

- максимум 8 видео на тренировку;
- максимум 45 секунд на видео;
- compression;
- удаление оригинала после успешной обработки.

---

# ЭТАП 12 — Food

Статус: 🔜

Цель:

Создать полноценный модуль питания.

Разделение:

```text
Plan
Fact
```

Включает:

- calories;
- protein;
- fat;
- carbohydrates;
- water;
- salt;
- manual input;
- FatSecret integration;
- AI screenshot import;
- plan history;
- daily overrides;
- analytics.

AI/OCR работает только через Backend API.

---

# ЭТАП 13 — Progress Data

Статус: 🔜

Включает связанные модули:

## Weight

- calendar;
- multiple measurements;
- primary measurement;
- history;
- analytics.

## Photos & Measurements

- контрольные точки;
- 4 базовые фотографии;
- дополнительные фотографии;
- video;
- measurements;
- comments;
- calendar;
- comparison;
- face blur without AI.

Weight остается canonical source.

## Activity

- steps;
- cardio;
- extra activity;
- daily goals;
- period goals;
- Apple Health;
- Health Connect;
- manual input.

---

# ЭТАП 14 — Weekly Reports

Статус: 🔜

Цель:

Создать полный цикл регулярного отчета.

```text
Client
↓
Create Report
↓
Media / Weight / Measurements / Activity
↓
Submit
↓
Coach
↓
Review
↓
Feedback
```

Включает:

- отчет клиента;
- даты;
- media;
- комментарии;
- просмотр тренером;
- ответ тренера;
- историю;
- permissions;
- notifications.

---

# ЭТАП 15 — Chat & Notifications

Статус: 🔜

Chat реализуется отдельным крупным этапом.

Целевая схема:

```text
Chat UI
↓
chatService
↓
Backend / WebSocket
↓
PostgreSQL + Object Storage
```

Поддерживаются:

- text;
- voice;
- photo;
- video;
- documents;
- object references;
- replies;
- search;
- drafts;
- sent/read.

Notifications включают:

- новые сообщения;
- отчеты;
- важные изменения;
- security events;
- другие согласованные события.

---

# ЭТАП 16 — Analytics

Статус: 🔜

Цель:

Создать аналитику поверх canonical business data.

Источники:

- Training;
- Food;
- Activity;
- Weight;
- Reports;
- Progress.

Analytics не создает отдельные копии бизнес-данных.

Внутренняя аналитика является основной для приватных пользовательских данных.

Публичная веб-аналитика подключается отдельно и только в пределах согласованной privacy architecture.

---

# ЭТАП 17 — Payments

Статус: 🔜

Цель:

Добавить платную модель платформы.

Включает:

- personal subscription;
- coach subscription;
- Trial;
- access source;
- payment status;
- grace period;
- refunds;
- payment history.

Платежи подключаются через `paymentService`.

Карточные данные не хранятся в Stubborn Ram.

---

# ЭТАП 18 — External Integrations

Статус: 🔜

Подключаются только необходимые интеграции.

Планируемые направления:

- FatSecret;
- AI/OCR;
- Apple Health;
- Health Connect;
- Email;
- Payments;
- другие сервисы при необходимости.

Каждый provider подключается через adapter/service.

Перед подключением проверяются:

- стоимость;
- стабильность;
- API limits;
- обработка данных;
- география;
- юридические условия;
- возможность замены.

---

# ЭТАП 19 — Production Hardening

Статус: 🔜

Перед полноценным production release:

- backups;
- restore testing;
- monitoring;
- error logging;
- audit log;
- rate limiting;
- security checks;
- storage checks;
- permissions checks;
- performance checks;
- mobile/PWA checks;
- domain;
- SSL;
- deployment;
- rollback procedure.

---

# ЭТАП 20 — Production Release

Статус: 🔜

Цель:

Стабильный production релиз платформы.

Проверяются:

- регистрация;
- вход;
- доступ;
- профиль;
- coach relationship;
- Training;
- Food;
- Reports;
- Progress;
- Chat;
- Notifications;
- Analytics;
- Payments;
- PWA;
- backup/restore;
- monitoring.

---

# ЭТАП 21 — Масштабирование

Статус: ⬜ После production

Только после появления реальной нагрузки рассматриваются:

- отдельный worker server;
- Redis;
- очереди;
- read replicas;
- дополнительные backend instances;
- CDN optimization;
- разделение сервисов;
- Kubernetes;
- другие инфраструктурные изменения.

Никакой из этих компонентов не добавляется заранее только ради «правильной архитектуры».

---

# Важный порядок разработки

Основная последовательность:

```text
Infrastructure Migration
↓
Backend Foundation
↓
Authentication
↓
Core Data / Relationships / Permissions
↓
Client & Coach Platform
↓
Media Storage
↓
Training
↓
Food
↓
Progress Data
↓
Weekly Reports
↓
Chat & Notifications
↓
Analytics
↓
Payments
↓
Integrations
↓
Production Hardening
↓
Production Release
↓
Scaling
```

Это не означает, что каждый экран должен ждать завершения всей цепочки. Небольшие UI-задачи могут выполняться параллельно, если они не меняют архитектурный фундамент.

---

# Правило перехода между этапами

Следующий крупный этап начинается, когда предыдущий:

- реализован;
- проверен;
- задокументирован;
- не имеет критических незакрытых проблем;
- не создает блокирующего технического долга.

---

# Главное правило Roadmap

Не возвращаться к фундаментальной миграции после ее завершения без серьезной причины.

Сначала строится:

```text
устойчивая инфраструктура
+
правильная модель данных
+
безопасность
+
permissions
+
модульная архитектура
```

После этого основное время разработки направляется на продукт:

```text
Training
Food
Reports
Progress
Chat
Analytics
Payments
```

Цель Roadmap:

> как можно быстрее закончить фундаментальный переезд, после чего продолжить полноценную разработку приложения без повторного перестраивания основы.
