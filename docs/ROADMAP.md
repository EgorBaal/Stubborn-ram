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

# Текущее состояние проекта

Статус:

🟡 Архитектурная миграция / подготовка к реализации

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
- частично реализованную авторизацию;
- модульную структуру frontend;
- архитектурную документацию.

Исторически backend был построен на Supabase/PostgreSQL/Edge Functions/Resend. Этот контур сохраняется до завершения миграции.

Сейчас согласована целевая архитектура:

```text
React / PWA
↓
Services
↓
Backend API
↓
PostgreSQL + Object Storage
↓
Server-side integrations
```

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

Статус: 🔜 Следующий крупный этап

Цель:

Один раз перейти на устойчивую целевую инфраструктуру и больше не менять фундамент без необходимости.

Целевая инфраструктура:

- Cloud Server;
- Managed PostgreSQL;
- Object Storage;
- CDN;
- DNS;
- Backend API;
- server-side workers.

Не добавлять на старте без реальной необходимости:

- Kubernetes;
- Redis;
- отдельный message broker;
- микросервисную архитектуру.

## Порядок

```text
Backup current system
↓
Provision target infrastructure
↓
PostgreSQL
↓
Object Storage
↓
Backend Foundation
↓
Data Migration
↓
Verification
↓
Production Switch
↓
Rollback Window
↓
Decommission old infrastructure
```

Старая Supabase-инфраструктура не удаляется до завершения rollback window.

---

# ЭТАП 6 — Backend Foundation

Статус: 🔜 После подготовки инфраструктуры

Цель:

Создать основу собственного backend.

Включает:

- Backend API;
- environment/secrets;
- database connection;
- migrations;
- service/repository layer;
- authentication foundation;
- authorization foundation;
- permissions;
- validation;
- error handling;
- rate limiting;
- logging;
- audit log;
- health checks.

Результат:

Frontend получает единую серверную точку входа.

---

# ЭТАП 7 — Authentication & Account

Статус: 🟡 Архитектура согласована, реализация частичная

Цель:

Перевести authentication на целевую Backend API архитектуру.

Включает:

- регистрация;
- Email verification;
- login;
- logout;
- persistent sessions;
- password recovery;
- смена Email;
- security notifications;
- profile creation;
- route protection;
- access state.

В дальнейшем:

- 2FA/MFA.

---

# ЭТАП 8 — Core Data Platform

Статус: 🔜

Цель:

Создать основные сущности и связи, на которых строятся все модули.

Включает:

- profiles;
- coach_client_relationships;
- ownership;
- authorship;
- permissions;
- access sources;
- system statuses;
- archive states.

Главный принцип:

```text
User
↓
Ownership
↓
Relationship
↓
Permissions
```

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

Статус: 🟡 UI prototype частично реализован

Цель:

Перевести существующий Training UI в полноценный persistent module.

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
