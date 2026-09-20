# WEIGHT

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PARTIALLY IMPLEMENTED / PLACEHOLDER

## 1. Назначение

Weight предназначен для отслеживания динамики массы тела пользователя.

Canonical metric:

> масса тела.

Раздел не обязан хранить проценты жира, воду, мышечную массу и другие показатели умных весов без отдельного product decision.

## 2. Текущее состояние

Подтверждено:

- маршрут `/app/weight`;
- `WeightPlaceholderPage`;
- navigation from Home.

Не подтверждены:

- weight persistence;
- daily history;
- dedicated backend API;
- graph lifecycle;
- target/period persistence;
- integration with Photo & Measurements.

## 3. Целевая структура

```text
Календарь
↓
Цель периода
↓
План на сегодня (если существует)
↓
Текущий вес
↓
Мини-график
↓
История измерений
↓
Tab Bar
```

## 4. Календарь

Любой день открывается нажатием.

Один и тот же day-screen используется для:

- сегодня;
- вчера;
- исторической даты.

История реализуется через календарь.

## 5. Цель периода

Цель может описывать:

- набор массы;
- снижение массы;
- поддержание;
- подготовку к соревнованиям;
- восстановление.

Карточка содержит:

- название;
- сроки;
- target;
- рекомендации;
- comments;
- кнопку подробного просмотра.

## 6. План на сегодня

Показывается только при наличии индивидуальных назначений.

Например:

- контрольное взвешивание натощак;
- ожидаемый диапазон;
- комментарий после читмила;
- рекомендации после перелета;
- рекомендации после углеводной загрузки.

## 7. Current weight

Целевая summary card может показывать:

- основное текущее измерение;
- изменение относительно предыдущего основного измерения;
- расстояние до цели;
- средний вес за 7 дней;
- link «Новая запись».

Возможны indicators:

- новый минимум;
- новый максимум.

## 8. Новая запись

Поля:

- вес;
- тип измерения;
- необязательный комментарий.

Типы:

- утром натощак;
- после еды;
- после тренировки;
- после читмила;
- вечером;
- другое.

## 9. Несколько измерений в день

Один calendar day может иметь неограниченное количество измерений.

Каждое хранит:

- время;
- значение;
- тип;
- comment.

Они принадлежат одному календарному дню и не должны перезаписывать друг друга.

## 10. Primary measurement rule

Для summary/analytics/reporting используется:

1. первое измерение с типом «Утром натощак», если оно существует;
2. иначе — первое измерение дня.

Это правило относится к вычислению primary measurement и не означает удаления/изменения остальных measurements.

## 11. Мини-график

Целевой default:

- последние 30 дней.

Нажатие открывает полный график.

Расширенная аналитика находится в Analytics module.

## 12. История

Целевая history отображает:

```text
Дата — Вес
```

Для выбранного дня можно показать дополнительные measurements и comments.

## 13. Coach / self-managed mode

Без тренера пользователь самостоятельно управляет целями и фактическими measurements.

С тренером тренер может назначать period/day goals, а пользователь вносит фактические данные.

Редактирование trainer assignments должно контролироваться permissions.

## 14. Analytics

Weight data является canonical source для:

- weight charts;
- average weight;
- gain/loss dynamics;
- relation to target;
- period comparison;
- связи с Food;
- связи с Activity;
- связи с Photos/Measurements.

## 15. Notifications

Целевые in-app events:

- требуется контрольное взвешивание;
- вес сегодня еще не внесен;
- новый минимум;
- цель периода достигнута.

Full notification backend сейчас не реализован.

## 16. Architecture

Each measurement:

- unique ID.

Each calendar day:

- stable internal ID, если day aggregate сохраняется как entity.

Все данные сохраняются бессрочно в рамках lifecycle policy.

Прошлые записи не изменяются автоматически.

Модель должна быть расширяемой для дополнительных measurement parameters без поломки существующих записей.

## 17. Cross-domain ownership

Weight является canonical source для своей массы тела.

Photo & Measurements ссылается на Weight, а не копирует вес.

Reports и Analytics получают weight data из Weight domain.

## 18. Current / Planned

**CURRENT**

- route;
- placeholder UI.

**PLANNED**

- daily measurements;
- primary measurement rule;
- history;
- graphs;
- goals;
- analytics;
- report integration;
- photo integration.

**DEFERRED / NOT VERIFIED**

- advanced graphs;
- expanded measurement parameters;
- production lifecycle.

## 19. Связанные документы

- `docs/modules/HOME.md`
- `docs/modules/PHOTO_AND_MEASUREMENTS.md`
- `docs/modules/FOOD.md`
- `docs/modules/ACTIVITY.md`
- `docs/modules/REPORT.md`
- `docs/modules/ANALYTICS.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
