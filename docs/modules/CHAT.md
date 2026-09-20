# CHAT

## Назначение

Модуль CHAT предназначен для общения пользователя и тренера внутри приложения.
В текущем branch модуль существует как точка входа по маршруту `/app/chat`, но полноценная продуктовая chat-система ещё не реализована.

## Статус

**PARTIALLY IMPLEMENTED** — реализован маршрут и базовый экран-заглушка.

Применимость других статусов для текущего состояния:

- **CURRENT**: только базовая доступность экрана.
- **PLANNED**: полноценный lifecycle сообщений, диалогов и вложений.
- **DEFERRED**: расширенные функции чата (после базового запуска).
- **NOT VERIFIED**: production-поведение полноценного chat flow.

## Текущая реализация

Подтверждено по frontend-коду:

- маршрут `/app/chat` подключён в router;
- `ChatPage` отображает текст о том, что модуль находится в разработке;
- отдельной логики сообщений/диалогов/статусов сообщений в модуле нет.

## UI / Экраны

Текущий набор экранов:

- `ChatPage`.

Текущее содержимое:

- заголовок "Чат с тренером";
- сообщение "Модуль находится в разработке.".

## Текущий flow

1. Пользователь открывает `/app/chat` через нижнюю навигацию.
2. Отображается placeholder-экран.
3. Дальнейший chat flow (список диалогов, сообщения, отправка, чтение) отсутствует в текущей реализации.

## Данные / Хранение

Текущее состояние:

- `ChatPage` не выполняет запросы к backend;
- нет client-side модели сообщений в модуле;
- нет подтверждённого chat persistence слоя (conversations/messages) в текущем backend.

Важно:

- comments и training notes не считаются реализацией полноценного chat persistence.

## Связь Coach / Client

Концептуально chat связан с доменом coach/client взаимодействия, но в текущем branch:

- runtime-проверки relationship для chat не реализованы как отдельный chat flow;
- модуль не содержит подтверждённой логики выбора/ограничения диалогов по relationship.

## Интеграция с Media

Текущий статус интеграции media в CHAT:

- в `ChatPage` отсутствуют upload/attach сценарии;
- отдельной интеграции с `mediaService` для chat-модуля нет.

## Статус Backend

Текущее состояние backend:

- dedicated backend module/routes для chat не обнаружены;
- dedicated chat-таблицы/миграции для сообщений и диалогов не обнаружены.

Вывод:

- backend chat subsystem в текущем snapshot отсутствует.

## Текущий API

Текущий API для CHAT:

- отсутствует подтверждённый dedicated `/api/chat*` или `/api/messages*` контракт в текущем backend.

## PARTIALLY IMPLEMENTED

- есть маршрут `/app/chat`;
- есть placeholder UI.

## PLANNED

- список диалогов и экран переписки;
- отправка/получение сообщений;
- статус доставки/прочтения;
- вложения и object references;
- связь chat-доступа с coach/client relationship и permissions.

## DEFERRED / NOT VERIFIED

- **DEFERRED**: расширенные UX-функции (поиск, reply-цепочки, расширенная модерация).
- **NOT VERIFIED**: end-to-end chat lifecycle в production, так как subsystem отсутствует.

## Известные ограничения

- модуль ограничен экраном-заглушкой;
- отсутствуют backend API и persistence для сообщений;
- нельзя считать концептуальное описание чата фактической реализацией.

## Связанные документы

- docs/modules/COACH_CLIENT_RELATIONSHIP.md
- docs/modules/COMMENTS.md
- docs/SYSTEMS/PERMISSIONS.md
- docs/SYSTEMS/AUTH.md
- docs/SYSTEMS/MEDIA.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
