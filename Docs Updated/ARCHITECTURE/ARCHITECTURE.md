# Архитектура проекта Stubborn Ram

Версия: 2.0  
Статус: CURRENT — фактическая техническая архитектура с явно отмеченными частичными и отложенными зонами  
Последнее обновление: 2026-09-20

---

# 1. Назначение документа

Этот документ является канонической технической архитектурой Stubborn Ram.

Он описывает:

- фактическую runtime-архитектуру приложения;
- границы frontend, services, backend и data layers;
- правила взаимодействия с PostgreSQL, Object Storage и внешними сервисами;
- архитектурные ограничения, которые обязательны для новых изменений;
- текущие подтверждённые исключения и partial/deferred зоны.

Документ не является подробной спецификацией отдельных бизнес-модулей. Детальная логика Training, Reports, Chat, Media и других доменов должна описываться в соответствующих module/system documents.

---

# 2. Главный архитектурный принцип

Stubborn Ram развивается как модульная система с минимально необходимой сложностью:

> новый модуль должен добавляться без переписывания существующего проекта, а отдельный модуль должен оставаться максимально заменяемым.

Основные следствия:

- один слой имеет одну понятную ответственность;
- глобальная инфраструктура не дублируется внутри модулей;
- бизнес-правила и security enforcement не переносятся во frontend;
- внешние провайдеры подключаются через backend-side adapters/services;
- новые решения сначала используют существующую инфраструктуру и расширяют её только при реальной необходимости.

---

# 3. Каноническая runtime-цепочка

Для обычного прикладного запроса используется:

```text
User
  ↓
React App / PWA
  ↓
Module / Page / Component
  ↓
Service
  ↓
src/shared/lib/apiClient.js
  ↓
Backend API (Fastify)
  ↓
PostgreSQL / Object Storage
```

Для backend-интеграций внешние провайдеры подключаются на серверной стороне:

```text
Backend API
  ↓
Backend service / adapter
  ↓
Email / Payments / AI / OCR / другие внешние провайдеры
```

Frontend не получает прямой доступ к PostgreSQL, приватному Object Storage или секретам внешних провайдеров.

---

# 4. Frontend layer

## 4.1 Runtime stack

Подтверждённая основа frontend:

- React;
- Vite;
- React Router;
- `createBrowserRouter`;
- guarded application routes;
- общий `src/shared/lib/apiClient.js`;
- service layer для реализованных API-цепочек.

## 4.2 Ответственность frontend

Frontend отвечает за:

- UI;
- навигацию;
- формы;
- локальное UI state;
- отображение server state;
- вызов application services;
- пользовательские loading/error/empty состояния.

Frontend не является источником истины для:

- authentication security;
- permissions;
- ownership enforcement;
- критических бизнес-правил;
- database integrity.

## 4.3 API boundary

Канонический frontend API path:

```text
UI
  ↓
Service
  ↓
apiClient
  ↓
Backend API
```

Прямой backend `fetch` из UI не считается допустимым архитектурным путём.

Подтверждённое разрешённое исключение:

```text
mediaService
  ↓
signed S3 upload URL
  ↓
PUT напрямую в Object Storage
```

Это не заменяет backend API: backend предварительно создаёт и авторизует signed URL.

---

# 5. Services и API Client

## 5.1 `apiClient`

`src/shared/lib/apiClient.js` является общим transport layer frontend.

Его ответственность:

- HTTP-запросы;
- базовая конфигурация API;
- передача auth state;
- обработка transport errors;
- единая форма результата `{data,error,status}` там, где она используется текущей реализацией.

Отдельного `src/api/` слоя в текущем проекте нет.

## 5.2 Services

Service layer изолирует UI от backend implementation details.

Подтверждённые текущие сервисные точки:

```text
src/services/auth/authService.js
src/services/leads/leadService.js
src/shared/lib/apiClient.js
src/modules/training/services/trainingService.js
src/modules/training/services/trainingMaterialsService.js
src/modules/media/services/mediaService.js
```

Общие правила:

- Service может вызывать `apiClient`;
- Service может использовать другой Service, когда это архитектурно оправдано;
- Service не импортирует UI или CSS;
- Service не должен содержать прямой SQL;
- Service не получает database/storage credentials.

## 5.3 Допустимый вызов Service

Hook не обязателен для каждой операции. Допустимы оба варианта:

```text
Component → Service → apiClient → Backend
```

и:

```text
Component → Hook → Service → apiClient → Backend
```

Hook применяется там, где требуется отдельная переиспользуемая state/async логика.

---

# 6. Router и Application Shell

## 6.1 Router

Маршрутизация централизована в:

```text
src/app/router/appRoutes.jsx
```

Router отвечает за route → page mapping.

Модульные страницы не должны создавать альтернативную глобальную routing system.

## 6.2 AppLayout

`AppLayout` отвечает за общий application shell.

Базовая композиция:

```text
App
  ↓
Router
  ↓
AppLayout
  ↓
Outlet
  ↓
Module Page
```

`BottomTabBar` является частью общего shell и не должен дублироваться внутри module pages.

Подробный контракт Layout вынесен в `LAYOUT.md`.

---

# 7. Независимость модулей

Каждый функциональный модуль отвечает за своё предметное содержимое.

Модуль не должен владеть:

- глобальной навигацией;
- общим App shell;
- размещением `BottomTabBar`;
- глобальным TopBar;
- глобальной Loading System;
- чужой module-specific бизнес-логикой.

Основной принцип:

> модуль должен быть заменяемым без изменения остальных модулей и глобальной инфраструктуры, кроме явно определённых интеграционных контрактов.

При добавлении новой функции сначала проверяется, существует ли уже подходящий shared/service/infrastructure layer.

---

# 8. Independent Scroll Contexts

Прокрутка не должна становиться глобальной ответственностью AppLayout.

Архитектурные правила:

- каждый route/page имеет собственный scroll context в соответствии со своей UX-моделью;
- scroll одного модуля не должен влиять на другой модуль;
- `Chat` может использовать специализированный message-scroll context;
- фиксированные страницы могут не использовать вертикальный scroll;
- общая инфраструктура не должна навязывать один scroll pattern всем модулям.

Конкретные Layout-компенсации под `BottomTabBar` принадлежат только Layout-контракту, описанному в `LAYOUT.md`.

---

# 9. Startup Screen и Loading Overlay

Startup Screen и Loading Overlay являются разными подсистемами.

## Startup Screen

Назначение:

- холодный запуск приложения;
- первичная подготовка уже открытого application shell;
- отсутствие зависимости от локальных loading-state отдельных операций.

Startup Screen не должен использоваться как универсальный loader для обычных runtime-операций.

## Loading Overlay

Loading Overlay предназначен для длительных операций уже запущенного приложения.

Общие правила:

- глобальный механизм используется повторно для подходящих тяжёлых операций;
- модули не создают отдельную глобальную loader-систему без архитектурной необходимости;
- module-local loading/error state остаётся внутри модуля, если глобальный overlay не нужен.

---

# 10. Backend API

Fastify Backend является серверной точкой входа приложения.

Backend отвечает за:

- authentication;
- session handling;
- authorization/ownership checks в существующих data paths;
- business rules;
- validation;
- PostgreSQL access;
- Object Storage access;
- signed URL generation;
- server-side external integrations.

Подтверждённые repository modules:

```text
backend/modules/
├── auth/
├── db/
├── email/
├── leads/
├── training/
├── media/
└── storage/
```

Entry point:

```text
backend/server.js
```

## 10.1 Текущая внутренняя организация backend

На текущем этапе отдельного repository/data-access layer нет.

SQL и orchestration в значительной степени находятся внутри route handlers.

Validation использует смешанную стратегию:

- Zod для auth/leads;
- manual guards/checks для значительной части training/media.

Критичные multi-step write flows используют `BEGIN / COMMIT / ROLLBACK`, когда это требуется целостностью операции.

Это фактическая текущая архитектура; создание отдельного repository layer не считается обязательным без отдельного архитектурного решения.

---

# 11. PostgreSQL

PostgreSQL является каноническим источником структурированных данных.

В текущем verified foundation используются, в частности:

```text
users
profiles
sessions
auth_tokens
leads
exercises
workouts
workout_exercises
workout_sets
training_set_notes
media
media_links
```

Каноническая физическая схема описывается отдельно в `DATABASE_SCHEMA.md`.

Архитектурное правило:

> изменение структуры данных сначала требует соответствующего migration/schema решения и только после этого применяется к целевой базе.

Frontend не содержит SQL и не подключается к PostgreSQL напрямую.

---

# 12. Object Storage и Media

Object Storage является каноническим хранилищем пользовательских файлов.

Принцип разделения:

```text
PostgreSQL
→ metadata / ownership / references

Object Storage
→ binary files
```

Пользовательские файлы приватны по умолчанию.

Доступ к приватным объектам строится через backend authorization и signed URLs.

Подтверждённая media-цепочка:

```text
Frontend
  ↓
mediaService
  ↓
Backend Media API
  ↓
signed upload/download URL
  ↓
Private S3-compatible Object Storage
```

Для upload бинарные данные после получения signed URL могут отправляться напрямую в S3 по `PUT`.

Production synthetic flow для текущего media foundation подтверждён по цепочке:

```text
upload-init
→ signed upload
→ complete
→ signed download
→ content match
→ delete
```

Provider-level control-plane проверки S3 остаются частично ограниченными возможностями провайдера: часть API возвращает `501 NotImplemented`. Это не отменяет подтверждённое private data-plane behavior.

Подробная media-архитектура относится к каноническому `SYSTEMS/MEDIA.md`.

---

# 13. Workers и тяжёлые операции

Тяжёлые операции должны быть спроектированы так, чтобы не блокировать обычный HTTP lifecycle.

Worker-style обработка предусмотрена для задач вроде:

- обработки видео;
- конвертации;
- сжатия media;
- других длительных операций.

Текущее состояние:

```text
Worker separation — PARTIALLY IMPLEMENTED
```

На раннем этапе worker может находиться на том же сервере, что и backend. При росте нагрузки он может быть вынесен отдельно без изменения frontend API contract.

---

# 14. Email и внешние интеграции

## Email

Email отправляется server-side.

Каноническая схема:

```text
Frontend
  ↓
Service
  ↓
Backend API
  ↓
backend email service
  ↓
Email Provider
```

Frontend не получает provider credentials.

Текущий backend использует server-side интеграцию с Email Provider; конкретный provider не должен становиться частью frontend architecture.

## Payments / AI / OCR

Будущие integrations должны подключаться через backend-side adapter/service.

Frontend не должен зависеть от конкретного provider implementation.

Текущая production maturity этих integrations не должна выводиться из самой target architecture.

---

# 15. Error Handling и Failure Boundaries

Transport errors централизуются в `apiClient`, а module services могут нормализовать domain-specific ошибки.

Архитектурные правила:

- backend не должен отдавать frontend stack traces или секретные внутренние данные;
- frontend не должен решать security-critical вопрос только по тексту локальной ошибки;
- failure в realtime-канале не должен означать потерю persisted data, если модуль поддерживает realtime;
- для новых API-цепочек должны быть определены success/error/empty states.

Текущая система error handling ещё не является полностью унифицированной во всех модулях и считается `PARTIAL`.

---

# 16. Security boundaries

Security authority находится на server-side.

Критические правила:

- authentication подтверждается backend;
- ownership проверяется backend;
- permissions проверяются backend-side там, где соответствующая subsystem реализована;
- frontend checks являются UX-слоем, а не security boundary;
- database credentials не попадают во frontend;
- Object Storage credentials не попадают во frontend;
- private media не выдаются через постоянные публичные ссылки.

Текущие ограничения security maturity описываются в `SYSTEMS/SECURITY.md` и `SYSTEM_STATE`.

Не считать полностью реализованными только по этому документу:

- полноценный RBAC trainer/client;
- logout-all-devices;
- расширенное token-based CSRF enhancement;
- некоторые дополнительные route-level hardening controls.

---

# 17. Local и Production

## Local

```text
Windows development host
  ↓
React / Vite
  ↓
Fastify Backend
  ↓
Local PostgreSQL
```

Media path:

```text
React
  ↓
Service
  ↓
Backend Media API
  ↓
S3-compatible Object Storage
```

## Production

Frontend:

```text
stubbornram.ru
  ↓
GitHub Pages
```

Backend:

```text
api.stubbornram.ru
  ↓
Nginx / HTTPS
  ↓
Fastify Backend
  ↓
Production PostgreSQL
  ↓
Private S3-compatible Object Storage
```

Local и Production имеют отдельные runtime secrets/configuration и отдельные persistence environments.

---

# 18. PWA

Подтверждённая текущая база PWA:

- manifest;
- application shell;
- reload/deep-link recovery logic.

Не считать завершёнными только на основании наличия manifest:

- полноценный Service Worker layer;
- offline strategy;
- update strategy;
- полное production device verification поведения PWA.

Статус PWA в текущем foundation: `PARTIAL`.

---

# 19. Масштабирование

Основная система стартует как модульный монолит.

Не требуется заранее вводить:

- микросервисную архитектуру;
- Kubernetes;
- Redis;
- отдельный message broker;
- множество backend servers.

При росте нагрузки допускаются:

- отдельный Worker;
- дополнительные backend resources;
- CDN;
- storage optimization;
- другие точечные инфраструктурные изменения.

Публичный frontend API contract и основной service boundary по возможности сохраняются стабильными.

---

# 20. Архитектурные правила разработки

1. Новая функциональность должна использовать существующую инфраструктуру там, где она уже решает задачу.
2. UI не обращается напрямую к Backend implementation details, DB или private storage.
3. Backend является security authority.
4. Один глобальный shell не дублируется внутри modules.
5. Один параметр глобальной геометрии имеет одного владельца.
6. Module-specific задача не исправляется изменением глобального shell без доказанной глобальной необходимости.
7. Не следует вводить новый Context/Provider/service только ради локальной задачи, если существующая инфраструктура уже подходит.
8. Не следует переписывать frontend только ради изменения backend provider.
9. Не следует смешивать текущую реализацию и target architecture без явной маркировки статуса.
10. Любая документация должна различать `CURRENT`, `PARTIAL`, `DEFERRED`, `PLANNED` и `NOT VERIFIED`.

---

# 21. Известные архитектурные отклонения

На текущем verified baseline известны следующие исключения:

## 21.1 Report direct backend fetch

`src/modules/report/ReportPlaceholderPage.jsx` содержит direct backend request и hardcoded localhost base.

Это нарушает канонический service-layer contract.

Статус:

```text
KNOWN ARCHITECTURAL BYPASS
DEFERRED
```

Он относится к placeholder/report scope и не должен использоваться как шаблон для новой разработки.

## 21.2 Training component complexity

`TrainingExerciseCard.jsx` содержит значительный объём UI и state logic.

Это технический долг/complexity issue, а не основание автоматически переписывать Training.

---

# 22. Source of Truth по архитектурным областям

| Область | Канонический документ |
|---|---|
| Runtime architecture | `ARCHITECTURE.md` |
| Platform model / ownership / access | `PLATFORM.md` |
| Project/codebase structure | `APP_STRUCTURE.md` |
| App shell / layout contracts | `LAYOUT.md` |
| Database schema | `../SYSTEMS/DATABASE.md` и специализированная schema documentation |
| Authentication | `../SYSTEMS/AUTH.md` |
| Security | `../SYSTEMS/SECURITY.md` |
| Permissions | `../SYSTEMS/PERMISSIONS.md` |
| Media | `../SYSTEMS/MEDIA.md` |
| Current verified system state | `../SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` |

При конфликте между архитектурным желанием и фактическим runtime состояние фиксируется как `CURRENT/PARTIAL/DEFERRED`, а не подменяется target state.

---

# 23. Заключение

Каноническая техническая архитектура Stubborn Ram строится вокруг стабильной границы:

```text
Frontend
  ↓
Service
  ↓
apiClient
  ↓
Backend API
  ↓
PostgreSQL / Object Storage
```

Frontend остаётся UI/application layer, Backend — security and business authority, PostgreSQL — source of truth для структурированных данных, Object Storage — source of truth для binary media.

Архитектура допускает постепенное расширение модулей и инфраструктуры без перехода к избыточной сложности.
