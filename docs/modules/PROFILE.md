# PROFILE

## Назначение

Profile предоставляет user-facing функциональность account screen внутри app shell.
Сейчас он работает как identity summary и страница входа в account/settings с logout action.

## Статус

- В целом: PARTIALLY IMPLEMENTED.
- Profile route и рендеринг экрана: CURRENT.
- Полный lifecycle управления profile data: PLANNED.

## Текущая Реализация

Реализовано во frontend:

- Route: /app/profile.
- ProfilePage показывает avatar, display name и email из authenticated user context.
- Для групп account/support/about отображаются статические section lists.
- Logout action вызывает auth service signOut, затем обновляет session и выполняет redirect на landing route.

Выделенный flow редактирования/сохранения profile в текущем поведении страницы не реализован.

## Связь с Identity

Экран Profile связан с identity и зависит от auth session state:

- UI читает user из AuthContext.
- Hydration session в AuthContext использует authService getSession.
- Endpoint backend auth session возвращает user identity payload (id/email и profile-linked поля через join).

Этот модуль потребляет identity data, но сам не определяет authentication lifecycle.

## UI / Экраны

Текущий набор экранов:

- ProfilePage (single module screen in current branch).

Текущие UI sections на экране:

- Hero identity block (avatar/name/email).
- Account section list.
- Support section list.
- About section list.
- Sign-out button.

## Данные

Текущие входные данные:

- Объект user из AuthContext (user metadata и email).
- Методы auth service, используемые напрямую в модуле: signOut.

Отсутствует в текущей реализации:

- выделенный API contract profile read/update для personal fields;
- persisted flow обновления settings/preferences со страницы profile;
- явный flow загрузки/редактирования profile media из этого модуля.

## Текущий Flow

1. User открывает /app/profile.
2. Экран отображает identity block из текущей session.
3. User может выполнить logout.
4. Session обновляется, и user перенаправляется на public route.

## PARTIALLY IMPLEMENTED

- Строки section в Profile в основном являются презентационными и пока не связаны с реализованными sub-flows.
- Profile опирается на payload auth session, а не на выделенный profile feature API.
- На странице есть временное test action loading-overlay, и он не является частью стабильной product functionality Profile.

## PLANNED

- Flows редактирования personal data и profile preferences.
- Связанные support/about actions с реализованными destinations.
- Выделенные lifecycle persistence и validation для profile.

## DEFERRED / NOT VERIFIED

- NOT VERIFIED: полный production-grade lifecycle profile (edit/validate/save/reload).
- DEFERRED: расширенные profile capabilities за пределами baseline identity summary.

## Известные Ограничения

- Текущий profile в основном является статической композицией с ограниченным интерактивным поведением.
- Нет явной in-module обработки error/success для редактирования profile data, потому что edit flow не реализован.
- Качество отображения identity зависит от наличия auth payload/user metadata.

## Связанные Документы

- docs/SYSTEMS/AUTH.md
- docs/SYSTEMS/PERMISSIONS.md
- docs/ARCHITECTURE/PLATFORM.md
- docs/ARCHITECTURE/LAYOUT.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
