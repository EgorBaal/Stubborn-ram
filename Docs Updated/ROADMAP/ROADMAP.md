# ROADMAP.md — Stubborn Ram

**Версия:** 1.0  
**Дата актуализации:** 20.09.2026  
**Статус:** АКТУАЛЬНЫЙ КАНОНИЧЕСКИЙ ROADMAP

---

# 1. Назначение

Roadmap фиксирует последовательность развития Stubborn Ram: от завершённого технического фундамента к продуктовым функциям, затем к production release и масштабированию.

Roadmap описывает планы и границы этапов, а не подменяет `SYSTEM_STATE_FINAL.md`.

Актуальное фактическое состояние системы определяется `SYSTEM_STATE_FINAL.md`, профильными каноническими документами и более поздними подтверждёнными audit/remediation evidence.

Foundation Remediation завершён с документированными ограничениями. Дальнейшая работа идёт как развитие продукта по основному Roadmap, а не как продолжение отдельного Foundation-прохода.

---

# 2. Текущий baseline

**Актуальность фактов:** 19.09.2026.

На текущем фундаменте подтверждены:

- React + Vite frontend и общий Application Shell;
- централизованная маршрутизация;
- Backend API на Fastify;
- PostgreSQL;
- production infrastructure на Selectel;
- Nginx + HTTPS + PM2;
- собственная Auth-система;
- persistent sessions, email verification, password reset и current-session logout;
- leads/questionnaire coaching flow;
- Training core persistence;
- Training materials read/write path;
- ownership checks в существующих защищённых путях;
- private Object Storage/media flow с signed URLs;
- базовая production verification для текущей foundation-поверхности.

Foundation не означает, что вся продуктовая платформа уже реализована.

Сохраняются partial / placeholder области:

- Profile;
- Home/Dashboard data layer;
- общий Training domain;
- Exercises CRUD;
- Training Templates runtime;
- trainer/client relationship subsystem;
- relationship-based authorization;
- Reports backend/persistence;
- Chat backend/realtime;
- Nutrition;
- Programs;
- Notifications backend/push;
- Analytics backend;
- полноценная Library data flow;
- Comments.

---

# 3. MVP — целевой scope первых клиентов

Первоначальный MVP остаётся отдельной продуктовой границей внутри общего Roadmap.

**MVP target scope:**

- Auth;
- Coach / Client relationship;
- Chat;
- Reports;
- Media;
- базовая Training persistence.

Главный пользовательский результат MVP:

```text
Coach
↓
Client relationship
↓
Communication
↓
Weekly Report
↓
Media
↓
Coach Review
↓
Feedback
```

Важно: этот список описывает **целевой MVP scope**, а не утверждает, что все перечисленные подсистемы уже реализованы.

Модули, не входящие в MVP, не отменяются. Они продолжают существовать в основном Roadmap как последующие этапы.

---

# 4. Этапы Roadmap

## ЭТАП 1 — Landing Page

**Статус:** ✅ Завершено

Состав:

- главный экран;
- Hero;
- блок «Кто стоит за Stubborn Ram»;
- «Что вы получите»;
- FAQ;
- результаты клиентов;
- адаптивная верстка;
- единый визуальный стиль.

---

## ЭТАП 2 — Анкета клиента / Leads

**Статус:** ✅ Завершено

Состав:

- экран приветствия;
- пошаговая анкета;
- прогресс;
- навигация;
- валидация;
- успешная отправка;
- сохранение заявок;
- frontend leadService через Backend API;
- сохранение leads в PostgreSQL;
- email через серверный email layer.

Исторический Supabase/Resend lead-flow относится к legacy и не является целевой архитектурой.

---

## ЭТАП 3 — Architecture & Documentation Foundation

**Статус:** ✅ Foundation documentation aligned

Назначение:

- единая техническая архитектура;
- frontend/backend boundaries;
- service/API contract;
- ownership;
- permissions model;
- security baseline;
- database model;
- правила разработки;
- design system;
- workflow и AI-development rules;
- единая система canonical documentation.

Фундаментальная архитектурная база сформирована.

Дальнейшие архитектурные изменения выполняются отдельными согласованными этапами.

---

## ЭТАП 4 — Application Shell

**Статус:** 🟢 Каркас реализован / развитие продолжается

Состав:

- централизованный router;
- AppLayout;
- Home;
- Header;
- Notification Section;
- Module Grid;
- BottomTabBar;
- базовые страницы модулей;
- Mobile First;
- PWA shell/deep-link behavior.

Полноценный offline/service-worker слой пока не реализован и относится к последующему PWA развитию.

---

## ЭТАП 5 — Infrastructure Migration

**Статус:** ✅ Завершено

Результат:

- Selectel Cloud Server;
- PostgreSQL 16;
- собственный Backend API;
- Nginx;
- HTTPS;
- DNS;
- PM2;
- pgAdmin;
- production health checks.

Базовая production-цепочка:

```text
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
```

---

## ЭТАП 6 — Backend Foundation

**Статус:** ✅ Завершено

Результат:

- Backend API;
- environment/secrets;
- PostgreSQL connection;
- migrations;
- connection pool;
- validation;
- error handling;
- rate limiting;
- health checks;
- production process management;
- reverse proxy;
- HTTPS;
- server-side integrations.

Backend является единой серверной точкой входа для приложения.

---

## ЭТАП 7 — Authentication & Account

**Статус:** ✅ Завершено в текущем foundation scope

Подтверждены:

- registration;
- email verification;
- login;
- current-session logout;
- persistent sessions;
- password reset;
- resend verification;
- session endpoint;
- route protection;
- profile creation;
- password hashing;
- session cookie;
- auth rate limiting.

Следующие расширения остаются отдельными задачами:

- смена Email;
- дополнительные security-сценарии;
- 2FA/MFA.

---

## ЭТАП 8 — Core Data Platform

**Статус:** 🟡 Частично реализовано

Уже сформировано:

- пользовательская identity-модель;
- PostgreSQL;
- ownership;
- server-side authentication;
- базовые ownership checks;
- Training persistence model.

Каноническая Training-модель:

```text
WORKOUT
↓
WORKOUT_EXERCISE
↓
WORKOUT_SET
```

Остаются незавершёнными:

- `coach_client_relationships`;
- полноценная relationship-based authorization;
- расширенная permission model;
- access sources;
- archive states;
- исторический доступ через relationship lifecycle.

---

## ЭТАП 9 — Client & Coach Core Platform

**Статус:** 🔜 Запланировано

Цель — полноценный client/coach контур на общей архитектуре.

### Client

- Home;
- Profile;
- Library;
- доступные модули;
- статус доступа;
- coach relationship.

### Coach

- список клиентов;
- карточка клиента;
- доступ к разрешённым данным;
- основные coach actions.

Принципы:

- данные не копируются между кабинетами;
- клиент остаётся владельцем своих данных;
- доступ тренера определяется relationship + permissions;
- история данных не удаляется только из-за изменения relationship.

---

## ЭТАП 10 — Media Platform Extensions

**Статус:** 🟡 Базовый media foundation завершён; расширения запланированы

Базовый production private-media flow уже подтверждён.

Дальнейшее развитие:

- расширение media lifecycle;
- preview;
- image processing;
- video processing;
- retention/cleanup policies;
- дополнительные media permissions;
- storage service;
- worker-based processing.

Целевая цепочка:

```text
Module
↓
mediaService
↓
Backend
↓
Permission Check
↓
Signed URL
↓
Private Object Storage
```

Для тяжёлой обработки:

```text
Upload
↓
Object Storage
↓
Worker / FFmpeg
↓
Processed Media
```

---

## ЭТАП 11 — Training

**Статус:** 🟡 Core persistence реализована; Training domain остаётся частично завершённым

Основные направления дальнейшего развития:

- exercises;
- system/personal exercises;
- workout creation;
- workout history;
- sets;
- media;
- coach access;
- permissions;
- feedback;
- Chat object references;
- Training Templates;
- расширение материалов;
- дальнейшее развитие UI и data layer.

Каноническая модель:

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Training Templates пока не считаются реализованными в production runtime.

---

## ЭТАП 12 — Food

**Статус:** 🔜 Запланировано

Цель — полноценный модуль питания.

Разделение:

```text
Plan
Fact
```

Состав:

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

AI/OCR подключается только через Backend API и provider adapter.

---

## ЭТАП 13 — Progress Data

**Статус:** 🔜 Запланировано

### Weight

- calendar;
- multiple measurements;
- primary measurement;
- history;
- analytics.

### Photos & Measurements

- контрольные точки;
- 4 базовые фотографии;
- дополнительные фотографии;
- video;
- measurements;
- comments;
- calendar;
- comparison;
- face blur without AI.

Weight остаётся canonical source для веса.

### Activity

- steps;
- cardio;
- extra activity;
- daily goals;
- period goals;
- Apple Health;
- Health Connect;
- manual input.

---

## ЭТАП 14 — Weekly Reports

**Статус:** 🔜 Запланировано

Цель — полный регулярный отчёт клиента.

Целевой цикл:

```text
Client
↓
Create Report
↓
Media / Progress Data
↓
Submit
↓
Coach
↓
Review
↓
Feedback
```

Состав:

- период отчёта;
- текст;
- media;
- комментарии;
- просмотр тренером;
- feedback;
- история;
- permissions;
- notifications.

Целевая модель статусов:

```text
DRAFT
↓
SUBMITTED
↓
REVIEWED
```

Report feedback является отдельным объектом и не превращается в сообщения Chat.

---

## ЭТАП 15 — Chat & Notifications

**Статус:** 🔜 Запланировано

### Chat

Целевая схема:

```text
Chat UI
↓
chatService
↓
Backend API
↓
PostgreSQL
+
Object Storage
```

Для realtime:

```text
Backend
↓
WebSocket
↓
Client
```

PostgreSQL остаётся source of truth.

Основная функциональность:

- text;
- voice;
- photo;
- video;
- documents;
- object references;
- replies;
- search;
- drafts;
- sent/read state.

### Notifications

Планируемые события:

- новые сообщения;
- новые отчёты;
- важные изменения;
- security events;
- другие утверждённые системные события.

Полноценный notification backend/push слой пока не реализован.

---

## ЭТАП 16 — Analytics

**Статус:** 🔜 Запланировано

Цель — аналитика поверх canonical business data.

Источники:

- Training;
- Food;
- Activity;
- Weight;
- Reports;
- Progress.

Analytics не создаёт независимые копии исходных бизнес-данных.

---

## ЭТАП 17 — Payments

**Статус:** 🔜 Запланировано

Цель — платная модель платформы.

Планируемые сущности и функции:

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

## ЭТАП 18 — External Integrations

**Статус:** 🔜 Запланировано

Потенциальные направления:

- FatSecret;
- AI/OCR;
- Apple Health;
- Health Connect;
- Email;
- Payments;
- другие provider integrations при необходимости.

Для каждой интеграции:

- provider-independent adapter;
- API contract;
- проверка обработки данных;
- география;
- стоимость;
- ограничения;
- возможность замены.

---

## ЭТАП 19 — Production Hardening

**Статус:** 🔜 Запланировано

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
- mobile checks;
- PWA checks;
- deployment checks;
- rollback procedure.

Foundation Remediation уже закрыл базовый технический foundation, но этот этап шире и относится к полноценной production readiness платформы.

---

## ЭТАП 20 — Production Release

**Статус:** 🔜 Запланировано

Цель — стабильный production release полной продуктовой платформы.

Проверяются как единая система:

- registration;
- login;
- access;
- profile;
- coach relationship;
- Training;
- Food;
- Progress;
- Reports;
- Chat;
- Notifications;
- Analytics;
- Payments;
- PWA;
- backup/restore;
- monitoring.

---

## ЭТАП 21 — Масштабирование

**Статус:** ⬜ После production release и появления реальной нагрузки

Рассматриваются только при наличии реальной потребности:

- отдельный worker server;
- Redis;
- очереди;
- read replicas;
- дополнительные backend instances;
- CDN optimization;
- разделение сервисов;
- Kubernetes;
- другие инфраструктурные изменения.

Никакой дополнительный инфраструктурный слой не добавляется заранее только ради «правильной архитектуры».

---

# 5. Основная последовательность

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
Media Platform Extensions
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
External Integrations
↓
Production Hardening
↓
Production Release
↓
Scaling
```

Последовательность относится к крупным этапам.

Небольшие UI- и локальные задачи могут выполняться раньше или параллельно, если они не изменяют архитектурный фундамент и не создают конфликтов с текущим Roadmap.

---

# 6. Правило перехода между крупными этапами

Следующий крупный этап начинается после того, как предыдущий:

- реализован в пределах своего scope;
- проверен;
- задокументирован;
- не имеет критических незакрытых проблем;
- не создаёт блокирующего технического долга.

`Planned` не означает `Implemented`.

`Deferred` не означает `Open defect`.

`Historical` не означает `Current`.

---

# 7. Отдельные deferred technical items

Эти пункты не должны смешиваться с завершённым Foundation:

- report direct-fetch bypass remediation;
- logout-all-devices;
- broader token-based CSRF enhancement;
- pgAdmin 2FA/MFA;
- future Training Templates runtime enablement.

Они остаются отдельными задачами согласно профильным документам и текущему System State.

---

# 8. Legacy и переход от старой инфраструктуры

Legacy удаляется только после:

```text
New implementation
↓
Verification
↓
Production verification
↓
Rollback window
↓
Legacy removal
```

Исторические Supabase-артефакты не считаются частью целевой runtime-архитектуры.

Удаление legacy является отдельным cleanup-этапом.

---

# 9. Главное правило Roadmap

После завершения фундаментальной миграции не возвращаться к перестройке основы без подтверждённой серьёзной причины.

Основной фокус развития:

```text
Core Platform
+
Training
+
Food
+
Progress
+
Reports
+
Chat
+
Analytics
+
Payments
```

Roadmap не является источником факта о том, что функция уже работает.

При фактическом изменении системы:

```text
изменение
↓
проверка
↓
обновление профильного canonical document
↓
обновление SYSTEM_STATE_FINAL
```
