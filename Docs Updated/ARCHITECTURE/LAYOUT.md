# Layout и App Shell Stubborn Ram

Версия: 2.0  
Статус: CURRENT — канонический shell/layout contract с явно отмеченными partial зонами  
Последнее обновление: 2026-09-20

---

# 1. Назначение документа

Этот документ является каноническим источником layout/shell-контрактов Stubborn Ram.

Он определяет:

- общую композицию App shell;
- границы `AppLayout`, `app-shell`, `app-page`, `app-scroll`, `app-tabbar` и `BottomTabBar`;
- единственных владельцев layout-параметров;
- правила safe-area и нижней геометрии;
- правила изменения BottomTabBar;
- допустимые и запрещённые layout-подходы.

Layout не должен превращаться в место для module-specific business logic.

---

# 2. Общая схема

Каноническая композиция:

```text
App
  ↓
Router
  ↓
AppLayout
  ↓
app-shell
  ↓
app-page
  ↓
app-scroll
  ↓
Module Page
```

Нижняя навигация:

```text
app-tabbar
  ↓
BottomTabBar
```

`BottomTabBar` существует в одном экземпляре для App shell и не дублируется внутри module pages.

---

# 3. Ответственность слоёв

## 3.1 `AppLayout`

Отвечает за:

- сборку общего App-каркаса;
- интеграцию content area и bottom navigation area;
- подключение общего `BottomTabBar`;
- внешний Layout contract приложения.

Не отвечает за:

- внутреннюю форму `BottomTabBar`;
- внутренний padding и grid панели;
- module-specific page styles;
- локальную бизнес-логику.

---

## 3.2 `app-shell`

Отвечает за:

- корневой контейнер shell;
- рабочую экранную область;
- общие shell-side gaps;
- внешнюю рамку для content и tabbar regions.

Не должен владеть module-specific scroll или бизнес-логикой.

---

## 3.3 `app-page`

Отвечает за:

- content column;
- ограничение ширины content area;
- внешний визуальный контейнер страницы;
- clipping/shape контентной области, когда это требуется shell.

Не отвечает за:

- положение TabBar;
- резерв пространства под TabBar.

---

## 3.4 `app-scroll`

Единственный владелец scroll-context и reserved space под фиксированную нижнюю панель.

Отвечает за:

- вертикальную/локальную прокрутку соответствующей content area;
- `reserved-space-under-tabbar`;
- page-specific scroll behavior внутри предусмотренного контракта.

Не должен делить ответственность за reserved space с `app-page` или `app-shell`.

---

## 3.5 `app-tabbar`

Отвечает только за внешнюю геометрию TabBar:

- X/Y position;
- расстояние до нижнего края;
- external safe-area integration;
- width/max-width контейнера;
- z-index/layer;
- общую экранную привязку.

Не отвечает за:

- внутреннюю форму панели;
- внутренний padding;
- item grid;
- indicator;
- icon/label sizes.

---

## 3.6 `BottomTabBar`

Отвечает только за внутреннюю геометрию и UI панели:

- форма;
- visual height;
- internal padding;
- grid;
- `item`;
- `icon`;
- `label`;
- `indicator`;
- `chat button`;
- internal breakpoints.

Не отвечает за:

- screen positioning;
- reserved space под панель;
- global shell safe-area policy.

---

# 4. Single Owner Rule

Каждый глобальный layout parameter должен иметь ровно одного владельца.

| Параметр | Единственный владелец |
|---|---|
| `app-bottom-offset` | `AppLayout` |
| `tabbar-x-position` | `app-tabbar` |
| `tabbar-width` | `app-tabbar` |
| `tabbar-max-width` | `app-tabbar` |
| `safe-area-policy` для внешнего размещения | `app-tabbar` |
| `tabbar-layer-z-index` | `app-tabbar` |
| `reserved-space-under-tabbar` | `app-scroll` |
| `app-scroll-behavior` | `app-scroll` |
| `app-content-max-width` | `app-page` |
| `app-shell-side-gap` | `app-shell` |
| `tabbar-visual-height` | `BottomTabBar` |
| `tabbar-radius` | `BottomTabBar` |
| `tabbar-padding` | `BottomTabBar` |
| `tabbar-grid` | `BottomTabBar` |
| `indicator` | `BottomTabBar` |
| `chat-button` | `BottomTabBar` |
| `tab-item-min-height` | `BottomTabBar` |
| `icon-size` | `BottomTabBar` |
| `label-size` | `BottomTabBar` |

Правило:

> если один глобальный параметр редактируется в двух разных слоях, это архитектурная ошибка.

---

# 5. `--app-bottom-offset`

`--app-bottom-offset` — единый Layout-level parameter для внешнего вертикального положения TabBar.

Если задача состоит в том, чтобы поднять или опустить всю панель, изменяется именно этот параметр в AppLayout-level styling.

Не следует для этого:

- менять internal padding `BottomTabBar`;
- добавлять компенсации в module page;
- добавлять второе значение offset в соседнем слое.

---

# 6. Reserved Space

`reserved-space-under-tabbar` принадлежит только `app-scroll`.

Следствие:

```text
TabBar position
≠
content reserved-space
```

Положение панели и резерв контента — разные архитектурные параметры.

Запрещено одновременно компенсировать нижнюю панель через:

- `app-shell`;
- `app-page`;
- `app-scroll`;
- module page.

Единственный владелец reserved space — `app-scroll`.

---

# 7. Safe Area

Safe-area policy разделена на два разных понятия:

1. внешнее размещение панели;
2. внутреннее содержимое самой панели.

Внешнее safe-area positioning принадлежит `app-tabbar`.

Внутренняя геометрия `BottomTabBar` не должна становиться способом компенсации глобальной safe-area.

---

# 8. Independent Scroll Contexts

Layout не владеет одним глобальным vertical scroll для всех модулей.

Каждый page/route может иметь свой scroll behavior.

Архитектурные правила:

- один route не должен случайно менять scroll другого route;
- модульный scroll не переносится в `AppLayout` без глобальной необходимости;
- Chat может иметь специализированный message scroll;
- fixed pages могут не использовать vertical scroll;
- shared Layout не должен ломать module-specific scroll pattern.

Текущий статус scroll behavior:

```text
PARTIALLY IMPLEMENTED
```

Это означает, что базовый Layout contract существует, но полная нормализация scroll patterns всех modules ещё не считается закрытой задачей.

---

# 9. BottomTabBar Single Instance Rule

`BottomTabBar` должен существовать только в общем App shell.

Правило:

```text
AppLayout
  └── BottomTabBar
```

Модульные страницы не должны:

- импортировать `BottomTabBar` ради локального рендера;
- создавать вторую навигационную панель;
- самостоятельно рассчитывать глобальное положение панели.

---

# 10. Startup Screen vs Loading Overlay

Layout-related loading surfaces разделяются:

## Startup Screen

Используется для cold start / startup phase.

## Loading Overlay

Используется для тяжёлых runtime operations уже запущенного приложения.

Эти системы не должны объединяться в одну универсальную «загрузку» только ради сокращения кода.

---

# 11. Scenario A — изменить положение TabBar

Требуется поднять/опустить всю панель.

Изменяется:

```text
--app-bottom-offset
```

Владелец:

```text
AppLayout
```

Не изменяются:

- `BottomTabBar` internal geometry;
- module pages;
- `reserved-space-under-tabbar` только ради этой задачи.

---

# 12. Scenario B — изменить форму панели

Требуется изменить:

- radius;
- visual height;
- internal padding;
- grid;
- indicator;
- icon/label dimensions.

Изменяется только `BottomTabBar` и его internal styles.

`app-tabbar` positioning не должен использоваться для решения internal UI задачи.

---

# 13. Scenario C — изменить резерв под панель

Требуется изменить то, сколько content space резервируется под fixed TabBar.

Изменяется только `app-scroll`.

Нельзя добавлять для этого компенсации в:

- `app-shell`;
- `app-page`;
- modules.

---

# 14. Scenario D — требуется изменение нескольких слоёв

Многослойная правка допустима только после явной фиксации причины.

Перед изменением необходимо определить:

1. почему один слой не покрывает задачу;
2. какие параметры меняются;
3. кто остаётся owner каждого параметра;
4. почему изменение не создаёт duplicate responsibility;
5. как выполняется rollback;
6. какие ручные проверки нужны после изменения.

По умолчанию предпочтение отдаётся однослойной правке.

---

# 15. Архитектурные anti-patterns

Запрещено:

- один параметр имеет двух owners;
- TabBar компенсируется в нескольких местах;
- module page меняется для исправления глобальной geometry;
- `BottomTabBar` меняется для screen positioning;
- Layout меняется для internal visual form;
- одинаковый token дублируется в нескольких layers;
- external и internal geometry смешиваются в одном слое;
- module-specific business logic переносится в AppLayout.

---

# 16. Compatibility Rule

Изменения в Layout должны быть совместимы с существующими module routes.

Перед глобальной правкой проверяются:

- auth routes;
- questionnaire routes;
- app routes;
- training routes;
- placeholder routes;
- deep-link recovery;
- поведение shell на mobile и desktop.

---

# 17. Чего не должен делать module

Module не должен:

- создавать global AppLayout;
- создавать global BottomTabBar;
- управлять глобальным Router;
- добавлять global safe-area compensation;
- изменять `--app-bottom-offset` локально;
- добавлять duplicate reserved-space compensation.

---

# 18. Layout Change Checklist

Перед завершением Layout change проверить:

1. Для каждого изменённого параметра определён единственный owner.
2. Нет дополнительной TabBar compensation в module pages.
3. `reserved-space-under-tabbar` изменяется только внутри `app-scroll`.
4. Internal geometry изменяется только внутри `BottomTabBar`.
5. Global positioning изменяется только через external Layout owner.
6. Router и module routes продолжают работать.
7. Global shell не получил module-specific business logic.
8. Mobile/desktop geometry проверена.
9. Existing loading/startup surfaces не сломаны.
10. Rollback возможен без изменения нескольких несвязанных слоёв.

---

# 19. Source of Truth

| Область | Канонический документ |
|---|---|
| Layout / shell contracts | `LAYOUT.md` |
| Runtime architecture | `ARCHITECTURE.md` |
| Codebase structure | `APP_STRUCTURE.md` |
| Platform model | `PLATFORM.md` |
| Current verified state | `../SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md` |
| Design tokens / visual system | `../PROCESS/DESIGN_SYSTEM.md` |

---

# 20. Что НЕ следует переносить из legacy автоматически

Старый Layout document содержал большой historical narrative о рефакторинге.

В canonical `LAYOUT.md` сохраняются:

- действующие contracts;
- ownership rules;
- anti-patterns;
- operational checklist;
- актуальные ограничения.

Подробная история того, как был выполнен старый рефакторинг, не является частью CURRENT contract и должна оставаться в history/decision documentation, если она вообще нужна.

---

# 21. Заключение

Layout Stubborn Ram должен быть детерминированным:

```text
AppLayout
  ↓
app-shell
  ↓
app-page
  ↓
app-scroll

app-tabbar
  ↓
BottomTabBar
```

Каждый параметр имеет одного owner, а глобальная geometry не исправляется случайными локальными компенсациями.

Это позволяет изменять shell и BottomTabBar предсказуемо и не переносить глобальные проблемы в module pages.
