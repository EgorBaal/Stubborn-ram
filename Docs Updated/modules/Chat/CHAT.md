# CHAT

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** NOT IMPLEMENTED / PLACEHOLDER

## 1. Назначение

Chat является рабочим пространством общения между тренером и клиентом.

Он дополняет coaching workflow и позволяет обсуждать данные платформы непосредственно рядом с существующими объектами, не создавая копий данных.

Главная продуктовая задача:

> Быстро обсудить конкретный объект платформы без ручного поиска этого объекта.

## 2. Текущее состояние

Подтверждено:

- маршрут `/app/chat`;
- `ChatPage`;
- placeholder UI.

Не обнаружены как полноценная runtime subsystem:

- chat backend;
- message persistence;
- dedicated chat API;
- WebSocket/SSE/polling;
- chat service;
- relationship-based chat access enforcement;
- chat media flow.

Это соответствует текущему System State: Chat пока не реализован как рабочий backend-driven домен.

## 3. Основной принцип

Целевая модель:

> Один чат на одну пару тренер–клиент.

Внутри одной переписки обсуждаются:

- тренировки;
- питание;
- активность;
- вес;
- контрольные точки;
- отчеты;
- организационные вопросы.

Отдельные чаты внутри тренировок, упражнений, подходов, веса, питания или фото не создаются.

Отдельные object-comment threads внутри Chat также не являются основной моделью.

## 4. MVP scope

В актуальном MVP базовый chat scope включает:

- текст;
- фотографии;
- видео;
- документы при необходимости.

Более ранняя утвержденная концепция содержит дополнительные возможности. Они сохраняются как product target, но не считаются текущей runtime-реализацией.

В частности, voice messages, reply, search, edit/delete и drafts не должны автоматически трактоваться как уже реализованные.

## 5. Целевой rich-chat слой

Утвержденная продуктовая концепция предусматривает:

- текстовые сообщения;
- голосовые сообщения;
- фотографии;
- видео;
- документы;
- object references;
- Reply;
- поиск;
- редактирование собственных сообщений;
- удаление собственных сообщений;
- черновики.

Не предусматриваются:

- GIF;
- стикеры;
- реакции;
- каналы;
- истории;
- social-status layer;
- другие функции мессенджеров, не нужные для coaching workflow.

## 6. Объекты платформы

Ключевой UX-принцип:

> Chat хранит ссылку на существующий объект, а не копию объекта.

Примеры attachable objects:

- тренировка;
- упражнение;
- конкретный подход;
- день питания;
- запись веса;
- контрольная точка;
- фотография;
- отчет;
- другие самостоятельные рабочие объекты.

Разделы верхнего уровня сами по себе не являются attachable objects.

## 7. Attach-object UX

Целевой сценарий:

1. Пользователь выбирает «Прикрепить объект платформы».
2. Поверх Chat открывается существующая навигационная структура приложения.
3. Пользователь идет по обычному интерфейсу нужного раздела.
4. На уровне конкретного attachable object появляется небольшой переключатель выбора.
5. Пользователь выбирает объект.
6. Возвращается в Chat с object reference.

Не должен создаваться отдельный parallel picker для всей платформы.

## 8. Object card

Прикрепленный объект отображается компактной карточкой.

Карточка содержит только необходимое:

- тип;
- название;
- дату.

Длинные описания в message stream не дублируются.

## 9. Просмотр объекта

При нажатии на object card:

- не происходит обязательного ухода со страницы Chat;
- объект открывается поверх чата как modal/overlay;
- после закрытия пользователь возвращается в переписку;
- при необходимости может быть предложен переход в полный соответствующий модуль.

## 10. История

Все сообщения относятся к одному разговору данной coach/client pair.

Не создаются отдельные history streams для:

- тренировок;
- упражнений;
- подходов;
- веса;
- питания;
- фотографий;
- отчетов.

Это сохраняет единую историю общения и исключает duplicate conversations.

## 11. Reply, поиск и статусы

Целевой rich-chat слой:

### Reply

Ответ привязывается к исходному сообщению и показывает его компактный фрагмент.

### Search

Целевой поиск:

- по словам;
- по датам.

### Delivery/read

Минимальная продуктовая модель:

- отправлено;
- прочитано.

Точный runtime status model будет определен при реализации backend.

## 12. Черновики

Целевая модель предусматривает автоматическое сохранение незавершенного текста.

После повторного открытия чата draft восстанавливается.

Draft indicator должен отличаться от unread indicator.

## 13. Client / Coach symmetry

Интерфейс Chat для клиента и тренера должен оставаться единым.

Различия определяются доступными пользователю объектами и permissions, а не созданием двух разных chat products.

## 14. Ownership и permissions

Chat не меняет ownership объектов.

Например:

```text
Workout
owner = Client

Chat
contains object reference → Workout
```

Доступ к переписке и attachable objects должен контролироваться Backend.

Целевой security chain:

```text
Authentication
↓
Relationship / Access context
↓
Permission check
↓
Chat business logic
↓
Persistence / Media
```

Frontend не является security boundary.

## 15. Media

Вложения Chat должны использовать общий Media subsystem.

Не создается отдельное файловое хранилище только для Chat.

Целевое направление:

```text
Chat Message
↓
Media Link
↓
Media
↓
Private Object Storage
```

## 16. Persistence

Целевые server-side entities концептуально включают как минимум:

- conversation/pair context;
- messages;
- object references;
- message attachments;
- reply relation;
- timestamps;
- read state;
- draft state, если draft хранится server-side.

Физическая PostgreSQL schema определяется отдельным database design после принятия implementation scope.

## 17. Что не реализовано сейчас

- backend messages;
- conversations;
- realtime;
- media attachments in chat;
- object references;
- read state;
- drafts;
- search;
- reply;
- relationship-based access runtime.

## 18. Будущие расширения

Сохраняются как later-stage:

- attachment нескольких объектов одним сообщением;
- voice transcription;
- другие расширенные messaging capabilities.

Текущая базовая концепция ориентируется на принцип «одно сообщение — один object reference».

## 19. Definition of Done

Chat считается реализованным для рабочего MVP, когда подтверждено:

- одна coach/client conversation;
- отправка базовых MVP message types;
- persistence;
- read state;
- доступ только для допустимого relationship/access context;
- media через общий Media;
- object reference без копирования canonical data;
- loading/empty/error states;
- server-side permission checks.

## 20. Связанные документы

- `docs/modules/COACH_CLIENT_RELATIONSHIP.md`
- `docs/modules/REPORT.md`
- `docs/modules/Training/TRAINING.md`
- `docs/modules/COMMENTS.md`
- `docs/SYSTEMS/MEDIA.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEMS/AUTH.md`
- `docs/SYSTEMS/SECURITY.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
