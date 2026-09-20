# HOME

## Назначение

Home является основным in-app экраном входа для authenticated users.
Он обеспечивает быструю навигацию к ключевым product modules и показывает quick action cards.

## Статус

- В целом: PARTIALLY IMPLEMENTED.
- Home route и UI shell: CURRENT.
- Dynamic notification feed и backend-driven контент Home: PARTIALLY IMPLEMENTED.

## Текущая Реализация

Реализовано во frontend:

- Route: /app/home.
- HomePage читает authenticated user из AuthContext.
- Header отображает logo, текущую дату и avatar/initials пользователя.
- NotificationSection отображает кликабельные notification cards.
- ModuleGrid отображает шесть navigation cards к module routes.

Текущая реализация в основном статична/preset на уровне components и не использует выделенные home API calls.

## UI / Структура Экрана

Текущая композиция экрана:

- HomeHeader
- NotificationSection
- ModuleGrid

Глобальная app shell и нижняя навигация предоставляются AppLayout и BottomTabBar, а не самим модулем Home.

## Данные / Зависимости

Основные зависимости:

- AuthContext для отображения данных user identity (name/email/avatar metadata).
- react-router navigation для переходов между modules.
- локальные массивы components для notification и контента module cards.

Модуль Home сейчас не использует выделенный backend endpoint для dynamic content hydration.

## Пользовательский Flow

Текущий flow:

1. Authenticated user открывает /app/home.
2. Экран отображает header с user-identification.
3. User нажимает notification card или module card.
4. Router выполняет переход на соответствующий module route.

## Текущие Components

- src/modules/home/HomePage.jsx
- src/modules/home/components/HomeHeader.jsx
- src/modules/home/components/NotificationSection.jsx
- src/modules/home/components/ModuleGrid.jsx

## PARTIALLY IMPLEMENTED

- Notification cards являются статическими definitions, а не live backend-driven notification entities.
- Несколько home navigation targets ведут на placeholder modules (например заглушки report/activity module).
- Логика user-specific prioritization/personalization для home cards не реализована как выделенное runtime-поведение.

## PLANNED

- Dynamic home data feed на основе module state и user context.
- Единый notification domain с backend persistence и обработкой read-state.
- Расширенная готовность modules с меньшим числом placeholder-переходов.

## DEFERRED / NOT VERIFIED

- NOT VERIFIED: production parity для адаптивной логики персонализации Home.
- DEFERRED: расширенные home analytics widgets и cross-module recommendation logic.

## Известные Ограничения

- Контент Home в основном статичен и задан в коде.
- Семантика notification cards сейчас опережает реализованные backend capabilities.
- Сам модуль Home не обеспечивает состояние доступности chat; навигация находится на уровне shell.

## Связанные Документы

- docs/ARCHITECTURE/LAYOUT.md
- docs/ARCHITECTURE/PLATFORM.md
- docs/modules/CHAT.md
- docs/modules/Training/TRAINING.md
- docs/modules/REPORT.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
