# COMMENTS

## Назначение

Модуль COMMENTS предназначен для пользовательского доступа к взаимодействию coach/client через комментарии.
В текущей ветке он служит входным экраном-заглушкой и точкой навигации из Home.

## Статус

- В целом: PARTIALLY IMPLEMENTED.
- Standalone UI модуля comments: PARTIALLY IMPLEMENTED.
- Выделенная comments backend subsystem: PLANNED.

## Текущая Реализация Frontend

Реализовано во frontend:

- Маршрут существует: /app/comments.
- CommentsPage отображает статическое сообщение о разработке.
- В уведомлениях Home есть карточка со ссылкой на /app/comments.

Текущий модуль не отображает списки comments, состояние thread/read или действия записи.

## Где Сейчас Присутствуют Comments

Текущие comment-related поверхности в codebase:

- Страница модуля comments: заглушка по адресу /app/comments.
- Текстовые comments уровня workout и exercise внутри flows редактора training.
- Модель training set materials включает семантику note/feedback на уровне set.

Эти поверхности пока не объединены в единый полный продуктовый comments flow.

## Данные / Persistence

- CommentsPage сама не вызывает backend и не сохраняет данные.
- Модуль Training сохраняет workout/exercise comments через payloads workout CRUD.
- Persistence для training set note/media обрабатывается endpoints training materials.

Текущее состояние смешанное: данные comments есть в persistence домена training, но persistence standalone-модуля comments отсутствует.

## Интеграция с Training

Интеграция сейчас существует только как косвенная связь:

- Уведомление Home может перевести пользователя на comments route.
- Модуль Training хранит comments внутри workout и set-related entities.
- Модуль Comments пока не агрегирует и не отображает persisted training comments.

## Статус Backend

- Выделенные backend module/routes для standalone-фичи comments не обнаружены.
- Существующая comment persistence в backend ограничена training-scope (например обработка set materials/note и поля comment в workout).
- Поэтому comments как независимая продуктовая subsystem сейчас не реализована во всём backend.

## Текущий Flow

1. User может перейти на /app/comments (напрямую или из уведомления Home).
2. Отображается сообщение-заглушка.
3. Для фактических persisted данных comment-like пользователь сейчас взаимодействует через flows Training, а не через модуль Comments.

## PLANNED

- Выделенная data model и API contract для comments module.
- Единый опыт списка и детализации comments с backend-driven данными.
- Явное соответствие между comments module и training-linked сущностями note/feedback.

## DEFERRED / NOT VERIFIED

- NOT VERIFIED: production parity для полного standalone lifecycle comments.
- DEFERRED: расширенная moderation, filtering и семантика notification-read для домена comments.

## Известные Ограничения

- Standalone comments module сейчас на уровне заглушки.
- Нет независимой persistence или querying comments со страницы comments.
- Пользователь не может создавать/редактировать comments со страницы comments в текущей ветке.

## Связанные Документы

- docs/modules/HOME.md
- docs/modules/Training/TRAINING.md
- docs/modules/Training/TRAINING_UI.md
- docs/modules/Training/TRAINING_API.md
- docs/SYSTEMS/PERMISSIONS.md
- docs/SYSTEMS/AUTH.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
