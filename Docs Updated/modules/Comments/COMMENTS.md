# COMMENTS

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PLACEHOLDER / PARTIALLY IMPLEMENTED

## 1. Назначение

COMMENTS описывает отдельную пользовательскую поверхность для комментариев, но не объединяет без различий все comment-like данные платформы.

В системе уже существуют комментарии/заметки внутри доменов, прежде всего Training.

Поэтому необходимо различать:

- комментарий как поле/часть canonical entity;
- note/feedback внутри Training;
- report feedback;
- standalone Comments domain.

## 2. Текущее состояние

Подтверждено:

- маршрут `/app/comments`;
- placeholder page;
- навигационная доступность через Home.

Также существуют persisted comment-like данные в Training, включая workout/exercise comment semantics и training set materials/notes.

Не реализовано как отдельная общая subsystem:

- standalone comments persistence;
- unified comments query API;
- полноценное чтение/редактирование comments из `/app/comments`;
- единый lifecycle standalone comments.

## 3. Главный архитектурный принцип

Нельзя создавать duplicate source-of-truth только ради отображения комментария в отдельном модуле.

Если комментарий является частью объекта Training, canonical owner остается Training.

Если будет утвержден самостоятельный comment object, он должен иметь собственную ownership/author semantics и явную связь с целевым объектом.

## 4. Не смешивать Comments и Chat

Chat:

- двусторонняя переписка;
- один conversation на coach/client pair;
- message stream.

Comments:

- комментарий к объекту или отдельная comment entity;
- не должен автоматически становиться дополнительным чатом.

## 5. Не смешивать Comments и Report Feedback

Feedback тренера к отчету является частью Report domain.

Он должен оставаться Report-linked data и не переноситься в standalone Comments только ради общей выдачи.

## 6. Целевое направление

При отдельном implementation scope Comments может агрегировать:

- standalone comments;
- комментарии к разрешенным объектам;
- ссылки на связанные объекты.

При этом canonical source должен оставаться у владельца соответствующего объекта.

## 7. Permissions

Любое чтение/создание/редактирование standalone comment в будущем должно проходить backend authorization.

Авторство и ownership должны различаться:

```text
owner
author
target object
```

## 8. Текущее / планируемое

**CURRENT**

- `/app/comments`;
- placeholder;
- Training-scoped persisted notes/comments.

**PLANNED**

- решение о необходимости standalone comments domain;
- API/query model;
- object linkage;
- permissions;
- единая user-facing history surface, если она потребуется.

**DEFERRED / NOT VERIFIED**

- moderation;
- advanced filtering;
- notification lifecycle for comments;
- production standalone comments subsystem.

## 9. Связанные документы

- `docs/modules/CHAT.md`
- `docs/modules/REPORT.md`
- `docs/modules/Training/TRAINING.md`
- `docs/modules/Training/TRAINING_API.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEMS/AUTH.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
