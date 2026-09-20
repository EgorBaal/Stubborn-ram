# PROJECT_CONTEXT.md

# Контекст проекта Stubborn Ram

Версия: 1.1  
Статус: актуализировано под целевую архитектуру  
Дата обновления: сентябрь 2026

---

# 1. Название проекта

**Stubborn Ram**

Платформа для онлайн-сопровождения клиентов тренером.

Проект объединяет:

- клиентский кабинет;
- кабинет тренера;
- программы тренировок;
- питание;
- активность;
- отчеты;
- фотографии и замеры;
- вес;
- историю прогресса;
- чат;
- уведомления;
- аналитику;
- подписки и оплату.

---

# 2. Главная цель

Stubborn Ram должен заменить разрозненное использование:

- Google Sheets;
- мессенджеров;
- отдельных файлов;
- скриншотов;
- ручного учета;
- сторонних сервисов для отдельных частей сопровождения.

Вместо этого пользователь и тренер получают единую платформу.

---

# 3. Основная модель продукта

Пользователь владеет своими данными.

Тренер получает доступ к данным клиента через активную coach-client relationship.

Данные не должны копироваться специально для тренера.

Доступ строится через:

```text
User
  ↓
Ownership
  ↓
Coach-Client Relationship
  ↓
Permissions
```

Relationship может быть:

- active;
- archived.

Архивирование связи не удаляет историю пользователя.

---

# 4. Типы пользователей

В платформе существуют:

## Client / User

Пользователь, который использует приложение для собственного сопровождения.

## Coach

Пользователь, который может сопровождать клиентов.

Один пользователь потенциально может выполнять обе функции.

## Admin

Системный уровень доступа для обслуживания платформы.

Роли и статусы не являются единственным механизмом определения доступа.

Конкретные действия регулируются permission system.

---

# 5. Пользовательские данные

Платформа может хранить:

- профиль;
- анкету;
- тренировочные данные;
- питание;
- активность;
- вес;
- замеры;
- фотографии;
- видео;
- отчеты;
- переписку;
- данные прогресса;
- технические данные, необходимые для работы сервиса.

Данные должны иметь единственный canonical source.

Например:

```text
Training → training data
Food → food data
Weight → weight data
Report → report data
Activity → activity data
Photos/Measurements → photos and measurements
Chat → messages
```

Другие модули используют ссылки и запросы к canonical source, а не независимые копии.

---

# 6. Пользовательский жизненный цикл

Базовая концепция:

```text
Landing
   ↓
Registration
   ↓
Email Verification
   ↓
Profile
   ↓
Questionnaire
   ↓
Client Cabinet
```

После аутентификации пользователь должен попадать непосредственно в приложение, а не возвращаться на Landing.

Для нового пользователя предусмотрен Welcome Flow.

---

# 7. Доступ к приложению

Основные источники полного доступа:

1. активный Trial;
2. активная личная подписка;
3. активная подписка coach-client сопровождения.

Если хотя бы один источник активен, пользователь получает полный доступ.

После окончания всех источников:

- история сохраняется;
- просмотр существующих данных остается доступным;
- создание новых данных ограничивается согласно access policy.

---

# 8. Trial

Trial является отдельным источником доступа.

Продолжительность:

```text
10 календарных дней
```

Trial не должен смешиваться с постоянной подпиской.

Система должна хранить состояние Trial и возможность определить, когда он закончился.

---

# 9. Подписки

Личная подписка является самостоятельным источником доступа.

На текущем этапе:

- срок — один календарный месяц;
- автоматическое продление не используется;
- после окончания доступ ограничивается;
- история сохраняется.

Coach subscription является отдельным источником доступа.

Для coach subscription предусмотрен grace period 72 часа согласно платежной архитектуре.

---

# 10. Платформа

Stubborn Ram является web application с mobile-first интерфейсом.

Целевой пользовательский сценарий:

```text
Mobile Browser
      ↓
PWA
      ↓
Stubborn Ram
```

Приложение должно удобно работать:

- в мобильном браузере;
- в PWA standalone mode;
- на планшете;
- на desktop.

---

# 11. Frontend

Основной frontend stack:

- React;
- Vite;
- React Router;
- CSS;
- PWA capabilities.

Frontend отвечает за:

- UI;
- навигацию;
- формы;
- локальное UI state;
- отображение server state;
- взаимодействие с Backend API через Services.

Frontend не является источником истины для безопасности или бизнес-правил.

---

# 12. Структура frontend

Основная структура:

```text
src/
├── app/
│   ├── router/
│   └── layouts/
├── modules/
│   ├── home/
│   ├── training/
│   ├── food/
│   ├── activity/
│   ├── report/
│   ├── photos/
│   ├── weight/
│   ├── chat/
│   ├── analytics/
│   └── profile/
└── shared/
```

Модули развиваются независимо.

`AppLayout` отвечает за общий shell приложения.

`BottomTabBar` является частью shell.

---

# 13. Routing

Маршрутизация централизована.

Основной router:

```text
src/app/router/appRoutes.jsx
```

Модули не создают собственные независимые системы routing.

---

# 14. Целевая backend-архитектура

Целевая схема:

```text
React / PWA
      ↓
Services
      ↓
Backend API
      ↓
┌──────────────────┐
│ PostgreSQL       │
│ Object Storage   │
└──────────────────┘
      ↓
Server-side Services
      ↓
Email / AI / Payments
```

Backend является центральной точкой:

- authentication;
- authorization;
- permissions;
- business logic;
- database access;
- file access;
- external integrations.

---

# 15. Целевая инфраструктура

Основная инфраструктура размещается в российском регионе.

Планируемые основные компоненты:

- Cloud Server;
- Managed PostgreSQL;
- Object Storage;
- CDN;
- DNS.

На стартовом этапе не используются без необходимости:

- Kubernetes;
- Redis;
- отдельный message broker;
- микросервисная архитектура;
- множество отдельных серверов.

Backend начинается как единое приложение с четкими внутренними service/module boundaries.

---

# 16. Database

Целевая база:

```text
PostgreSQL
```

Основные бизнес-сущности:

- profiles;
- coach_client_relationships;
- exercises;
- workouts;
- workout_exercises;
- workout_sets;
- reports;
- chat;
- media;
- food;
- activity;
- weight;
- photos;
- measurements;
- notifications;
- analytics.

Точная физическая схема определяется `DATABASE_SCHEMA.md`.

Не следует создавать production-таблицы без соответствующего архитектурного решения.

---

# 17. Object Storage

Пользовательские:

- фотографии;
- видео;
- документы;
- media chat;
- другие тяжелые файлы

хранятся в Object Storage.

Файлы приватны по умолчанию.

Доступ:

```text
Frontend
 ↓
Backend
 ↓
Permission Check
 ↓
Object Storage
```

Постоянные публичные ссылки на пользовательские файлы не используются.

---

# 18. Media processing

Для тяжелых файлов используется backend/worker processing.

Видео обрабатывается через FFmpeg.

Целевая схема:

```text
Upload
 ↓
Object Storage
 ↓
Worker
 ↓
FFmpeg
 ↓
Processed File
```

На старте worker может находиться на том же сервере, что и Backend.

При росте нагрузки worker можно вынести отдельно без изменения frontend-контракта.

---

# 19. Email

Transactional Email должен отправляться через server-side email service.

Frontend не получает Email credentials.

Email provider должен быть заменяемым через service/adapter.

Перед production-подключением проверяются:

- география обработки данных;
- условия обработки персональных данных;
- необходимые договоры;
- требования российского законодательства.

---

# 20. AI

AI/OCR является server-side integration.

Frontend не получает AI secret.

AI подключается через adapter:

```text
Food
 ↓
Backend
 ↓
AI Service
 ↓
Provider
```

Provider должен быть заменяемым.

Для Food screenshot import исходные изображения используются только для распознавания и не должны храниться дольше необходимого срока.

---

# 21. Payments

Платежи выполняются через внешний payment provider.

Платежные данные карт не хранятся в Stubborn Ram.

Backend получает необходимые технические данные платежа.

Payment provider подключается через `paymentService` / adapter.

На момент данного документа платежный провайдер еще не является завершенным production-модулем.

---

# 22. Chat

Chat является отдельным модулем.

Одна coach-client relationship имеет один основной чат.

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
- sent/read states.

Сообщение может содержать ссылку на объект Training, Report или другого модуля.

Chat не копирует бизнес-данные объекта.

Целевая realtime-модель:

```text
Chat UI
 ↓
chatService
 ↓
Backend / WebSocket
 ↓
PostgreSQL + Object Storage
```

---

# 23. Training

Training является отдельным основным модулем.

Архитектурная модель:

```text
Workout
 ↓
WorkoutExercise
 ↓
Exercise
 ↓
WorkoutSet
```

Exercise имеет собственный `exercise_id`.

Не следует хранить упражнение только как строковое имя.

Поддерживаются:

- системные упражнения;
- персональные упражнения;
- media;
- feedback;
- история;
- coach access;
- object references для Chat.

На текущем этапе часть Training UI уже реализована, но полноценная persistence/data layer еще не завершена.

---

# 24. Food

Food разделяет:

- plan;
- fact.

Основные показатели:

- calories;
- protein;
- fat;
- carbohydrates;
- water;
- salt.

Поддерживаются:

- ручной ввод;
- импорт из FatSecret;
- AI screenshot import;
- история планов;
- daily overrides;
- analytics.

Food должен иметь единый canonical source.

---

# 25. Activity

Activity хранит календарную историю активности.

Может включать:

- шаги;
- cardio;
- extra activity;
- дневные цели;
- периодические цели.

Шаги могут поступать из:

- Apple Health;
- Health Connect;
- manual input.

Доступ тренера и пользователя регулируется permissions.

---

# 26. Weight

Weight является самостоятельным модулем.

Поддерживается:

- календарь;
- несколько измерений в день;
- primary measurement;
- аналитика;
- история.

Первое утреннее измерение натощак может использоваться как primary согласно архитектуре Weight.

История сохраняется независимо от окончания подписки.

---

# 27. Photos and Measurements

Основной объект — контрольная точка.

Может содержать:

- 4 базовые фотографии;
- дополнительные фотографии;
- видео;
- измерения;
- комментарии.

Поддерживаются:

- календарь;
- сравнение;
- история;
- face blur без AI.

Вес не дублируется внутри этого модуля, а используется как reference на Weight canonical source.

---

# 28. Reports

Report является самостоятельной сущностью.

Отчеты используются для:

- регулярного контроля;
- отправки данных клиентом;
- анализа тренером;
- обратной связи.

Фото, видео и другие media должны храниться через общий Media/Object Storage слой.

---

# 29. Home

Home является навигационным центром приложения.

Основные модули:

- Training;
- Food;
- Activity;
- Report;
- Photos/Measurements;
- Weight.

Основная нижняя навигация:

- Home;
- Library;
- Chat;
- Analytics;
- Profile.

Chat может быть недоступен, если у пользователя нет coach relationship.

---

# 30. Analytics

Analytics должна использовать canonical business data.

Например:

```text
Training data
 ↓
Training analytics
```

а не отдельную копию тренировок.

Аналитика не является источником истины для бизнес-данных.

---

# 31. Notifications

Notifications является общей инфраструктурой.

Уведомления могут использоваться для:

- отчетов;
- сообщений;
- изменений подписки;
- безопасности;
- других событий.

Модули не создают собственные независимые notification systems.

---

# 32. Security

Основные правила:

- least privilege;
- server-side permission checks;
- отсутствие secrets во frontend;
- приватный Object Storage;
- audit log для критических административных действий;
- rate limiting;
- backups;
- security notifications;
- re-authentication для критических операций;
- будущая 2FA/MFA.

Пароли пользователей недоступны администраторам.

---

# 33. Персональные данные

Платформа обрабатывает персональные данные.

Целевая инфраструктура размещает основные пользовательские данные в российском регионе.

До production должны быть проверены:

- требования 152-ФЗ;
- локализация;
- трансграничная передача;
- политика обработки ПД;
- согласия;
- договоры с processors/providers;
- сроки хранения;
- удаление;
- incident response.

Российское размещение инфраструктуры само по себе не означает автоматического выполнения всех юридических требований.

---

# 34. Текущая инфраструктура и миграция

Исторически проект использовал:

- Supabase Auth;
- Supabase PostgreSQL;
- Supabase Edge Functions;
- Resend;
- GitHub Pages;
- GitHub Actions.

Эта инфраструктура является текущим/историческим контуром и не должна отключаться до завершения миграции.

Целевая архитектура:

- собственный Backend API;
- PostgreSQL;
- Object Storage;
- CDN;
- server-side integrations.

Миграция выполняется поэтапно с сохранением rollback window.

---

# 35. GitHub

GitHub остается системой хранения исходного кода и может использоваться для CI/CD.

При этом в GitHub запрещено хранить:

- production secrets;
- database passwords;
- private API keys;
- пользовательские персональные данные;
- production backups;
- пользовательские media.

В дальнейшем CI/CD может быть перенесен на собственную инфраструктуру, если это потребуется.

---

# 36. Domain

Основной домен проекта:

```text
stubbornram.ru
```

Домен сохраняется.

При миграции меняется инфраструктура за доменом, а не сам публичный адрес приложения.

DNS переключается только после проверки staging/production target.

---

# 37. PWA

Stubborn Ram должен работать как PWA.

Не планируется обязательная публикация в App Store/Google Play на текущем этапе.

Основные требования:

- manifest;
- icons;
- standalone mode;
- mobile-first;
- корректный safe-area;
- стабильная загрузка;
- корректные маршруты.

---

# 38. Deployment

Целевой deployment должен быть воспроизводимым.

Production build создается из исходного кода.

Перед production deployment необходимо выполнить:

```text
npm run build
```

Deployment не должен зависеть от ручного изменения production-файлов.

---

# 39. Документация

Основные архитектурные документы являются источником истины.

Перед задачей AI обязан прочитать основные документы в установленном порядке.

Если документация противоречит коду:

```text
Documentation > Code
```

Если архитектура изменилась, документация обновляется до или вместе с реализацией согласно workflow проекта.

---

# 40. Текущий статус проекта

На момент обновления:

### Уже существует

- React/Vite frontend;
- модульная структура;
- централизованный router;
- AppLayout;
- BottomTabBar;
- базовая authentication infrastructure;
- текущая Supabase infrastructure;
- базовые UI модулей;
- Training UI prototype;
- часть существующей email infrastructure.

### Не завершено

- полноценная собственная Backend API;
- целевая PostgreSQL schema;
- production Object Storage;
- полноценная persistence Training;
- полноценная coach-client relationship;
- единая production permission implementation;
- полноценный Chat backend;
- Reports data layer;
- Food data layer;
- Activity data layer;
- Weight persistence;
- Photos/Measurements persistence;
- Analytics data layer;
- Notifications;
- production payments;
- окончательная PWA production infrastructure.

---

# 41. Главный порядок развития

После завершения миграции инфраструктуры разработка продолжается по принципу:

```text
Infrastructure
 ↓
Authentication
 ↓
Profiles / Relationships / Permissions
 ↓
Core Data Layer
 ↓
Training
 ↓
Food
 ↓
Reports
 ↓
Photos / Measurements / Weight / Activity
 ↓
Chat
 ↓
Analytics
 ↓
Notifications
 ↓
Payments
 ↓
PWA / optimization
```

Конкретный порядок может корректироваться документацией Roadmap.

---

# 42. Что нельзя делать

Без архитектурного решения нельзя:

- подключать новый backend provider;
- менять database provider;
- добавлять критическую внешнюю интеграцию;
- создавать новую систему permissions;
- создавать отдельный realtime provider;
- создавать дублирующие бизнес-таблицы;
- хранить пользовательские файлы публично;
- переносить персональные данные во frontend analytics;
- менять App Shell ради отдельного модуля;
- начинать большую миграцию без rollback plan.

---

# 43. Главный принцип проекта

Stubborn Ram должен развиваться как единая платформа, а не как набор несвязанных сервисов.

Архитектура должна позволять:

- заменять отдельных провайдеров;
- масштабировать backend;
- добавлять новые модули;
- сохранять пользовательские данные;
- расширять coach/client модель;
- подключать будущие платежи;
- добавлять AI;
- развивать PWA;

без повторной миграции всей системы.

Главный приоритет:

> корректность → безопасность → стабильность → масштабируемость → скорость разработки.
