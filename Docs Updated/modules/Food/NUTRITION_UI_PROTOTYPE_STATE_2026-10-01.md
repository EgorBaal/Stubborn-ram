# NUTRITION / FOOD --- текущая прототипная версия и состояние модуля

**Дата фиксации:** 2026-10-01\
**Статус:** FRONTEND UI PROTOTYPE / БОЛВАНКА\
**Важно:** это НЕ конечная production-версия Nutrition/Food. Текущий
экран был сделан как frontend-only образец, чтобы зафиксировать
визуальную композицию и базовый UX до полноценной реализации модуля.

## 1. Источник требований

Канонический документ: - `FOOD.md`.

Canonical Food предусматривает разделение:

``` text
Plan
Fact
```

Целевой модуль включает: - calories; - protein; - fat; -
carbohydrates; - water; - salt; - manual input; - FatSecret; - AI
screenshot import; - plan history; - daily overrides; - analytics.

AI/OCR в целевой архитектуре должен работать через Backend API/provider
adapter.

Текущий экран НЕ реализует этот production scope.

## 2. Что было сделано

Созданы/изменены локально: -
`src/modules/nutrition/NutritionPage.jsx`; -
`src/modules/nutrition/NutritionPage.css`; -
`src/modules/nutrition/NutritionPlaceholderPage.jsx` переведён на новую
страницу.

Route `/app/nutrition` уже существовал, поэтому Router не менялся.

Также не изменялись: - AppLayout; - BottomTabBar; - Training; -
Activity; - Weight; - Home; - global CSS; - backend; - API.

## 3. Визуальный референс

Для Nutrition использовался предоставленный пользователем визуальный
референс.

Из него бралась: - общая композиция; - календарь; - цель периода; -
выделенный plan block; - большой блок nutrition metrics; - Add Data; -
Food Data; - визуальная иерархия.

При этом: - верхний status bar из картинки НЕ копировался; - нижний Tab
Bar из картинки НЕ копировался; - используется существующий shell
Stubborn Ram; - конкретные значения из референса НЕ являются
пользовательскими данными.

## 4. Основная структура экрана

Текущий прототип содержит:

1.  Header «Питание».
2.  Календарь.
3.  Цель периода.
4.  План на сегодня --- только при наличии назначения.
5.  КБЖУ.
6.  Вода.
7.  Соль.
8.  Добавить данные.
9.  Данные питания.
10. Существующий Tab Bar.

Selected date является центральным состоянием экрана.

## 5. Empty state

Начальное состояние полностью пустое.

В текущем прототипе: - period plan = `null`; - daily assignments
отсутствуют; - nutrition facts отсутствуют; - food details отсутствуют.

Показатели отображаются как нулевые значения/empty state: - калории:
`0`; - белки: `0`; - жиры: `0`; - углеводы: `0`; - вода: `0`; - соль:
`0`.

План не задан.

Никакие значения из визуального референса не были использованы как fake
user data.

Не были добавлены: - 3057 ккал; - 182 г белка; - 58 г жиров; - 392 г
углеводов; - 2.8 л воды; - 3.5 л воды; - 6 г соли; - любые продукты; -
реальные приёмы пищи; - любые придуманные цели или назначения.

## 6. Calendar

В Nutrition есть локальный календарь.

Он используется для: - выбора даты; - переключения Nutrition screen; -
будущего просмотра истории через дату.

Отдельная страница «Сегодня» или «История» не создавалась.

Calendar UX ориентирован на существующий Training/Weight/Activity
pattern.

## 7. Goal

Есть локальная карточка:

`Цель периода`

В empty state: - `Не задана`.

Есть centered modal для редактирования/просмотра.

Production goal model ещё не реализован.

Canonical FOOD предусматривает более широкий Plan/Goal model, чем
текущая UI-болванка.

## 8. Daily Plan

В соответствии с требованиями план должен показываться только при
наличии назначения на selected date.

В initial empty state plan скрыт.

Текущая UI-модель предусматривает локальные данные для: - period plan; -
daily assignments.

Но это не production trainer assignment system.

## 9. Nutrition metrics

Основной блок содержит: - Калории; - Белки; - Жиры; - Углеводы; -
Вода; - Соль.

Основной целевой принцип:

``` text
PLAN ↔ FACT
```

То есть в полноценном модуле должна быть возможность видеть факт
относительно плана.

В текущем empty state план не задан, поэтому fake target values не
создаются.

Сложная runtime color-threshold logic специально не выдумывалась, потому
что точные thresholds не были закреплены.

## 10. Соль

Соль является полноценной метрикой Food.

Она не должна потеряться при дальнейшей реализации.

В будущем у неё должны быть: - plan; - fact; - history; - привязка к
выбранному дню.

В текущей болванке реального источника соли нет.

## 11. Добавить данные

Есть блок:

`Добавить данные`.

Предусмотрены три frontend-only сценария:

1.  `Ввести вручную`
2.  `Синхронизировать с FatSecret`
3.  `Импортировать скриншоты (AI)`

Важно: - FatSecret API не подключён; - AI/OCR не подключён; - backend не
вызывается; - изображения не отправляются; - persistence нет.

Это UI-заглушки для будущих функций.

## 12. Manual input

Предусмотрена centered modal для ручного ввода.

Будущие поля: - калории; - белки; - жиры; - углеводы; - вода; - соль.

Поля не должны быть заполнены автоматически.

Локальное изменение состояния допустимо только как frontend
demonstration; стартовое состояние после reload остаётся пустым.

## 13. FatSecret

Кнопка существует только как frontend placeholder.

Реальная интеграция не реализована.

Не считать FatSecret connected.

## 14. AI / OCR

Кнопка существует как frontend placeholder.

Реального: - upload; - OCR; - AI; - backend processing; - хранение
изображений

нет.

Canonical Food предусматривает AI screenshot import в будущем, но
текущий прототип его не реализует.

## 15. Food Data

Есть сворачиваемый блок:

`Данные питания`.

Он предназначен для будущего отображения: - завтрака; - обеда; -
ужина; - перекусов; - продуктов; - граммовок.

В текущем initial state никаких продуктов и приёмов пищи нет.

## 16. Local data model

Текущая frontend-модель логически разделяет:

-   `selectedDateKey`;
-   `periodPlan`;
-   `dailyAssignments`;
-   `nutritionFacts`;
-   `foodDetails`.

Начальное состояние: - `periodPlan = null`; - `dailyAssignments = []`; -
`nutritionFacts = {}`; - `foodDetails = {}`.

Это временная frontend model, а НЕ production database model.

## 17. Plan ↔ Fact

Это один из главных принципов canonical FOOD.

Текущий прототип уже визуально ориентирован на Plan/Fact.

Но полноценная логика: - планов периода; - daily overrides; - истории
планов; - определения плана, действовавшего на конкретную дату; -
фактического питания; - источников факта; - объединения источников

ещё НЕ реализована.

## 18. Scroll architecture

Nutrition сделан по тому же общему принципу, что Training Builder и
Activity.

Схема:

``` text
App Shell
↓
Nutrition page
↓
nutrition-content
↓
inner scroll
↓
fixed existing Tab Bar
```

Основной внутренний scroll: - `.nutrition-content`.

Проверено: - `body` не скроллится; - `document` не скроллится; - при
большом контенте растёт `scrollHeight` именно Nutrition content.

В тестах: - viewport 390×844: `clientHeight 617`, `scrollHeight 871`; -
viewport 390×667: `clientHeight 440`, `scrollHeight 871`.

То есть при этих размерах внутренний Nutrition scroll появляется внутри
модуля.

## 19. Нижняя геометрия

Во время разработки отдельно проверялось, чтобы Nutrition не повторил
проблему с Activity/Weight:

-   не должен появляться огромный внешний gap;
-   Tab Bar остаётся штатным;
-   контент заканчивается перед Tab Bar;
-   body/document не становятся scroll-контейнером.

Root Nutrition в процессе проверки был переведён на использование
доступной высоты (`height: 100%`), после чего scroll проверялся
повторно.

Это техническое решение прототипа НЕ считать окончательной архитектурой
без повторной проверки при следующем этапе.

## 20. Modals

Проверены centered overlays.

В частности: - цель периода; - ручной ввод; - другие frontend-only
сценарии добавления.

Overlay занимает viewport, а dialog находится в центре.

Bottom sheet не используется.

## 21. Русский язык / UTF-8

Nutrition проверялся на mojibake.

Известных повреждённых последовательностей в модуле не обнаружено.

При следующем возвращении к модулю эту проверку нужно повторить после
любых изменений.

## 22. Build

`npm run build` успешно проходил.

Также после исправления локальной ошибки с отсутствующим `Plus` импортом
страница была повторно собрана и проверена.

## 23. Что НЕ реализовано

Не считать production-ready: - backend; - API; - PostgreSQL; -
persistence; - FatSecret; - AI/OCR; - image upload; - provider
adapter; - trainer permissions; - plan history; - daily overrides; -
nutrition analytics; - real source synchronization; - production food
database.

Canonical `FOOD.md` описывает более широкий целевой модуль.

## 24. Что обязательно проверить при возвращении

1.  Прочитать актуальный `FOOD.md`.
2.  Проверить актуальный `SYSTEM_STATE`.
3.  Проверить route.
4.  Проверить реальные Nutrition-файлы.
5.  Проверить selected date.
6.  Проверить calendar/month picker.
7.  Проверить period plan.
8.  Проверить daily assignments.
9.  Проверить Plan ↔ Fact.
10. Проверить calories.
11. Проверить protein.
12. Проверить fat.
13. Проверить carbohydrates.
14. Проверить water.
15. Проверить salt.
16. Проверить Add Data.
17. Проверить manual input.
18. Проверить будущую FatSecret architecture.
19. Проверить AI/OCR architecture.
20. Проверить Food Data.
21. Проверить внутренний scroll.
22. Проверить body/document scroll.
23. Проверить нижнюю геометрию.
24. Проверить centered overlays.
25. Проверить empty state.
26. Проверить русский язык/UTF-8.
27. Проверить отсутствие fake data.
28. Проверить build.
29. Сверить фактический код с canonical `FOOD.md`.

## 25. Что считать текущим результатом

Nutrition/Food сейчас --- **только frontend визуальная и UX-болванка**.

Она была сделана, чтобы: - зафиксировать будущую композицию; - проверить
календарь; - проверить Plan/Fact визуальную структуру; - проверить
КБЖУ + воду + соль; - проверить Add Data; - проверить Food Data; -
проверить modal UX; - проверить внутренний scroll; - проверить empty
state.

Это НЕ финальная версия.

При возвращении к Food текущий JSX/CSS нужно рассматривать как отправную
точку, а не как утверждённую production-архитектуру.
