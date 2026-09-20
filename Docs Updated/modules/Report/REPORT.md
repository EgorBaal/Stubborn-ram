# REPORT

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PLACEHOLDER / FRONTEND-ONLY

## 1. Назначение

Weekly Report — самостоятельный объект взаимодействия клиента и тренера.

Он позволяет клиенту собрать материалы за отчетный период, отправить их тренеру и получить feedback.

Report не заменяет Chat.

Chat может содержать ссылку на Report object, но не хранит его содержимое как копию.

## 2. Текущее состояние

Подтверждено:

- routes `/app/report` и `/app/report-module`;
- `ReportPlaceholderPage`;
- UI для фото, видео, voice/text input;
- media upload/complete/read/delete через общий Media API.

Не подтверждены как рабочая report subsystem:

- report backend;
- report persistence;
- DRAFT/SUBMITTED/REVIEWED lifecycle;
- report-specific API;
- report-specific media binding;
- coach review backend;
- report feedback persistence.

Отдельный `reportService` в текущем runtime не подтвержден.

## 3. Product role

В MVP Report является одним из центральных объектов coach/client workflow.

Целевой scenario:

```text
Client
↓
Create report
↓
Draft
↓
Submit
↓
Coach review
↓
Feedback
↓
Client reads feedback
```

## 4. Ownership

Report принадлежит клиенту.

Coach не становится владельцем report из-за relationship или review permission.

Ownership и authorship различаются:

```text
owner_id = Client
author_id = creator of the relevant record/feedback
```

Ownership не меняется при:

- смене тренера;
- архивировании relationship;
- реактивации relationship;
- изменении permissions.

## 5. Lifecycle

Целевая модель:

```text
DRAFT
↓
SUBMITTED
↓
REVIEWED
```

### DRAFT

- отчет создан;
- клиент может продолжать редактирование.

### SUBMITTED

- отчет отправлен;
- доступен тренеру для review;
- отправленная версия фиксирует состояние данных на момент submit.

### REVIEWED

- тренер завершил review;
- feedback сохранен.

## 6. Historical snapshot

Submitted report должен сохранять историческое состояние информации, которую он включает на момент отправки.

При открытии исходной canonical entity пользователь может видеть ее более новое текущее состояние.

Это не должно изменять archived report version.

## 7. Кто создает отчет

В MVP отчет создает клиент.

Отдельное создание report тренером от имени клиента требует отдельного архитектурного решения.

## 8. Период

По умолчанию отчет формируется за последние 7 дней.

Пользователь может выбрать:

- другой диапазон;
- отдельные дни.

По умолчанию могут включаться data из основных fitness domains, если они доступны.

Пользователь может включить/исключить конкретные module elements в пределах утвержденного report composition model.

## 9. Canonical data

Report должен получать данные из canonical module sources.

Не следует копировать domain data как независимые permanent copies.

Разрешается хранить в Report то, что относится непосредственно к самому отчету, его анкете/ответам и immutable submitted snapshot semantics.

## 10. Report data

Целевая модель содержит как минимум концептуально:

- id;
- owner/client;
- report period;
- created_at;
- submitted_at;
- reviewed_at;
- status;
- client text;
- relationship context;
- questionnaire answers;
- selected modules/elements;
- timestamps;
- ответы/материалы, относящиеся непосредственно к report.

Физическая PostgreSQL schema определяется отдельно.

## 11. Media

Report использует общий Media layer.

Целевой поток:

```text
Report
↓
Media Link
↓
Media
↓
Private Object Storage
```

PostgreSQL хранит metadata/link, а binary data остается в Object Storage.

Текущий UI уже использует общий Media flow для attachments.

## 12. Attachments

Текущий placeholder UI поддерживает:

- до 30 photo uploads;
- одно video;
- voice input;
- text comment.

Эти UI capabilities не равны полноценному report submission lifecycle.

Целевая Report model должна позволять хранить допустимые report materials через общую Media architecture, включая фотографии, видео, документы и другие поддерживаемые файлы.

## 13. Coach review

Тренер может видеть report только при наличии допустимого relationship/access context и соответствующего permission.

Целевая backend-проверка:

```text
Authentication
↓
Relationship/access context
↓
Ownership relationship
↓
report.review
↓
Report
```

## 14. Feedback

Feedback является частью Report domain, но не Chat.

Feedback может относиться:

- ко всему report;
- к module;
- к конкретной entity;
- к максимально атомарному объекту, если это действительно нужно.

Целевая минимальная структура:

- id;
- linked object/report;
- author;
- text;
- timestamps;
- soft-delete state;
- linked media, если разрешено.

Legacy product specification предусматривает для одной feedback point:

- до 500 символов;
- до 2 изображений;
- до 1 видео.

Эти лимиты относятся к target product contract и не являются текущей runtime capability.

Feedback может редактироваться и удаляться автором в пределах принятой policy. Удаление feedback — soft delete; история может показывать маркер удаления. Тренер может оставить feedback даже при отсутствии комментария клиента.

## 15. Redaction / history rules

Coach не изменяет исходные данные клиента.

Coach добавляет feedback.

После `SUBMITTED` client не редактирует отправленную версию.

## 16. Relationship archive

Архивирование relationship не должно удалять:

- reports;
- feedback;
- media;
- history.

Исторический доступ тренера после архивирования определяется отдельной relationship/access policy.

Новые данные после завершения cooperation не становятся автоматически доступны старому coach.

## 17. Chat integration

Chat не копирует Report.

Вместо этого message может содержать reference:

```text
Chat Message
↓
Object Reference
↓
Report
```

## 18. Permissions

Целевые actions:

```text
report.create
report.read_own
report.submit
report.review
report.feedback
```

Окончательная server-side permission decision остается за Backend.

Frontend может скрывать controls, но не является security boundary.

## 19. UI states

Report UI должен иметь как минимум:

- loading;
- empty;
- error;
- draft;
- submitted;
- reviewed.

Ошибки backend не должны превращаться в silent failure.

## 20. Notifications

Для MVP достаточно in-app indicators, например:

- новый report ожидает review;
- coach оставил feedback.

Push/email являются later-stage delivery channels.

## 21. История

Report history сохраняется постоянно в рамках lifecycle policy.

Окончание access source или archive relationship не должно автоматически удалять report.

Если исходная entity после submit удалена, archived report сохраняет структуру и может показывать deletion marker.

## 22. Backend API

Целевой frontend flow:

```text
ReportPage
↓
reportService
↓
apiClient
↓
Backend API
↓
Permissions / Ownership / Relationship
↓
PostgreSQL
```

Прямой frontend access к PostgreSQL запрещен.

## 23. Definition of Done

Для MVP Report готов, когда:

- client creates report;
- draft save works;
- submit works;
- coach can read submitted report;
- coach can leave feedback;
- client can read feedback;
- history persists;
- attached media persists;
- private media uses signed access;
- backend permission checks work;
- Chat can reference Report;
- loading/error/empty states are handled.

## 24. Не входит в базовый MVP

- AI report analysis;
- automatic progress scoring;
- public reports;
- group reports;
- multiple coaches per report;
- automatic transcription;
- advanced report analytics;
- complex recurring notification rules.

## 25. Связанные документы

- `docs/modules/CHAT.md`
- `docs/modules/COACH_CLIENT_RELATIONSHIP.md`
- `docs/modules/Training/TRAINING.md`
- `docs/SYSTEMS/MEDIA.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEMS/SECURITY.md`
- `docs/SYSTEMS/AUTH.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
