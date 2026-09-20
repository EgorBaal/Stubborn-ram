# ANALYTICS

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Актуальное runtime-состояние:** PARTIALLY IMPLEMENTED / PLACEHOLDER

## 1. Назначение

Analytics — агрегирующий продуктовый модуль, который показывает динамику и взаимосвязи между canonical data других доменов.

Основной принцип:

> Analytics не должен становиться вторым источником истины.

Канонические данные принадлежат своим доменам:

```text
Training
Food
Activity
Weight
Photo & Measurements
Reports
```

Analytics получает из них данные и строит производные представления.

## 2. Текущее состояние

В runtime подтверждено:

- маршрут `/app/analytics`;
- `AnalyticsPage`;
- доступ через общий App Shell.

Не подтверждены:

- analytics backend;
- отдельный analytics API;
- полноценные виджеты;
- фильтры периодов;
- сравнительный анализ;
- production analytics lifecycle.

Следовательно, текущий модуль является стартовой точкой/placeholder.

## 3. Целевая модель

Analytics должна работать поверх canonical entities и не дублировать их как самостоятельные business records без отдельного архитектурного решения.

Целевой поток:

```text
Module canonical data
↓
Backend analytics aggregation
↓
Analytics API
↓
AnalyticsPage / widgets
```

## 4. Целевые домены аналитики

Модуль должен быть расширяемым и в дальнейшем получать данные из:

- Training;
- Food;
- Activity;
- Weight;
- Photo & Measurements;
- Reports.

## 5. Периоды

Пользователь должен иметь возможность анализировать выбранный период.

Целевые сценарии:

- неделя;
- месяц;
- пользовательский диапазон;
- сравнение двух периодов.

Конкретный набор периодов считается product specification и не является текущей реализацией.

## 6. Целевые показатели

В зависимости от готовности источников могут отображаться:

### Training

- частота тренировок;
- объем;
- динамика выполнения;
- отдельные производительные показатели.

### Food

- средние калории;
- белок;
- жиры;
- углеводы;
- вода;
- соль, если она присутствует в canonical Food data.

### Activity

- средние шаги;
- выполнение плана;
- кардио;
- длительность активности.

### Weight

- изменение массы;
- среднее значение;
- динамика относительно цели.

### Photo & Measurements

- изменения замеров;
- сравнение контрольных точек;
- фото-сравнение.

### Reports

- история отправки;
- динамика отчетов;
- производные показатели, если они действительно нужны продукту.

## 7. Визуальная логика

Analytics может использовать:

- графики;
- сводные карточки;
- сравнительные блоки;
- временные шкалы.

Визуализация не должна менять canonical data.

## 8. Доступ

Просмотр аналитики должен использовать общую permission/access model.

Тренерский просмотр в будущем должен работать через разрешенный coach/client access, а не через копирование пользовательских данных.

## 9. Текущее / планируемое

**CURRENT**

- `/app/analytics`;
- `AnalyticsPage`;
- shell-навигация.

**PLANNED**

- backend aggregation;
- analytics API;
- period filters;
- cross-domain metrics;
- charts and comparisons;
- coach/client-aware access.

**NOT VERIFIED / DEFERRED**

- production analytics lifecycle;
- finalized metric catalog;
- extended visualizations;
- recommendation logic.

## 10. Архитектурные требования

- не создавать duplicate source-of-truth;
- использовать canonical module data;
- агрегаты должны быть воспроизводимы из источников;
- backend является источником бизнес-логики;
- frontend не принимает security decisions;
- расширение нового аналитического показателя не должно ломать существующие домены.

## 11. Связанные документы

- `docs/modules/Training/TRAINING.md`
- `docs/modules/FOOD.md`
- `docs/modules/ACTIVITY.md`
- `docs/modules/WEIGHT.md`
- `docs/modules/PHOTO_AND_MEASUREMENTS.md`
- `docs/modules/REPORT.md`
- `docs/modules/HOME.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
