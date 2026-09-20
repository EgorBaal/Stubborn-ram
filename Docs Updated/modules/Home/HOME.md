# HOME

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PARTIALLY IMPLEMENTED / SHELL

## 1. Назначение

Home — центральный навигационный экран authenticated application.

Его задача:

> Показать пользователю, что важно сейчас, и быстро направить его к нужному действию.

Home не является главным экраном глубокой аналитики и не должен становиться большим dashboard warehouse.

## 2. Текущее состояние

Подтверждено:

- route `/app/home`;
- `HomePage`;
- `HomeHeader`;
- `NotificationSection`;
- `ModuleGrid`;
- AuthContext dependency;
- переходы через router.

Текущий контент в основном статичен/preset и не получает полноценный dynamic data feed из dedicated Home API.

Несколько targets ведут в placeholder modules.

## 3. Целевая структура

```text
Header
↓
2–3 status cards
↓
6 primary module cards
↓
BottomTabBar
```

Общий App Shell и BottomTabBar принадлежат shell-layer, хотя UX Home задает их ожидаемое место и поведение.

## 4. Верхняя панель

Целевой HomeHeader содержит:

- логотип Stubborn Ram;
- приветствие пользователя;
- уведомления;
- avatar/identity indicator.

Runtime уже показывает identity/date/avatar-related information, но полный динамический Home header lifecycle не является отдельным backend domain.

## 5. Status cards

Целевая Home-поверхность должна показывать 2–3 действительно значимых события, например:

- новый комментарий/feedback тренера;
- новое сообщение;
- обновление программы;
- требуется внести вес;
- пришло время отчета;
- длительное отсутствие активности.

Карточки должны быть динамическими по состоянию пользователя.

Для самостоятельного пользователя показываются системные/личные события.

При наличии coach context могут добавляться coaching events.

## 6. Основные module cards

Целевой Home содержит шесть крупных входов:

- Training;
- Food;
- Activity;
- Report;
- Photo & Measurements;
- Weight.

Карточки не обязаны показывать полную статистику. Их главная роль — навигация.

## 7. Navigation principle

Нажатие на карточку открывает соответствующий полноценный module route.

Home не должен превращать каждую карточку в modal workflow.

Пример целевого направления:

```text
Training
↓
Training module
↓
history / create / programs / templates
```

То же правило используется для остальных domains.

## 8. Bottom navigation

BottomTabBar — постоянная часть App Shell.

Целевая структура:

- Home;
- Library;
- Chat;
- Analytics;
- Profile.

Подключение тренера не должно перестраивать нижнюю навигацию.

## 9. Chat state

Кнопка Chat присутствует в shell.

Целевой product behavior:

- без допустимого coach relationship Chat может быть визуально неактивным;
- при наличии допустимого coach/client context Chat становится активным.

Текущий Chat backend отсутствует, поэтому фактическая доступность сейчас определяется shell/navigation level, а не полноценным relationship engine.

## 10. Dynamic data

Целевой Home должен получать canonical data из backend/service layer, а не создавать отдельные Home copies.

Пример:

```text
Modules / Notifications / Access context
↓
Backend aggregation
↓
Home API
↓
HomePage
```

## 11. Notifications boundary

`NotificationSection` сейчас является частью Home, но полноценный Notification domain еще не реализован.

Home не должен становиться permanent storage for notifications.

## 12. UX principles

- минимум визуального шума;
- крупные понятные карточки;
- быстрый переход к действию;
- постоянная нижняя навигация;
- единый визуальный язык;
- одинаковая shell architecture при самостоятельной работе и работе с тренером;
- добавление coach features без полной перестройки navigation architecture.

## 13. Data ownership

Home не владеет данными:

- Training;
- Food;
- Activity;
- Weight;
- Photos;
- Reports;
- Chat;
- Notifications.

Он только отображает canonical/derived state.

## 14. Current / Planned

**CURRENT**

- Home shell;
- module navigation;
- NotificationSection;
- ModuleGrid;
- authenticated identity display.

**PARTIALLY IMPLEMENTED**

- dynamic notification cards;
- placeholder module targets;
- personalization.

**PLANNED**

- backend-driven Home feed;
- dynamic prioritization;
- deeper event integration;
- fewer placeholder destinations.

**DEFERRED / NOT VERIFIED**

- advanced recommendations;
- home analytics widgets;
- production-grade personalization parity.

## 15. Связанные документы

- `docs/ARCHITECTURE/LAYOUT.md`
- `docs/ARCHITECTURE/PLATFORM.md`
- `docs/modules/NOTIFICATIONS.md`
- `docs/modules/CHAT.md`
- `docs/modules/REPORT.md`
- `docs/modules/Training/TRAINING.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
