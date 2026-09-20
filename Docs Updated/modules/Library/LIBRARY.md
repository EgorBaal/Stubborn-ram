# LIBRARY

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PARTIALLY IMPLEMENTED / PLACEHOLDER

## 1. Назначение

Library — централизованный контентный слой Stubborn Ram для доступа к материалам, которые не являются частью canonical operational data доменов пользователя.

## 2. Текущее состояние

Подтверждено:

- маршрут `/app/library`;
- `LibraryPage`;
- доступ через App Shell.

Не подтверждены:

- полноценный content catalog;
- library backend;
- content entities;
- category/filter lifecycle;
- детальный content viewer;
- production content persistence.

## 3. Целевая модель

Library должна предоставлять:

- каталог;
- категории;
- карточки контента;
- детальную страницу материала;
- навигацию по контенту;
- в будущем — searchable/filterable content layer.

## 4. Content boundary

Library не должна становиться копией Training/Food/etc.

Материалы могут ссылаться на domain entities или обучающие сценарии, но canonical operational data остается в своих модулях.

## 5. Целевой UI

Концептуально:

```text
Library
↓
Categories / Filters
↓
Content cards
↓
Content detail
```

Точный набор категорий и типов контента будет отдельным product decision.

## 6. Доступ

Контент должен отдаваться с учетом общих access/permission rules.

При появлении coach-only материалов доступ определяется permission layer, а не только скрытием карточки.

## 7. Backend

Целевой backend потребует отдельного content API и persistence только после утверждения content model.

Не создавать production tables без принятого schema decision.

### Exercise Info from Training - PLANNED / DESIGN TARGET

Из карточки упражнения в Training пользователь сможет открыть страницу упражнения в Library.

Целевое содержимое:

- видео техники;
- описание выполнения;
- основные ошибки;
- рекомендации;
- мышечные группы;
- другая обучающая информация.

После закрытия пользователь возвращается обратно в текущую тренировку.

Это является связью между Training и Library и не означает, что полноценный Library content backend уже реализован.

## 8. Current / Planned

**CURRENT**

- route;
- base screen;
- shell navigation.

**PLANNED**

- content catalog;
- category model;
- details;
- search/filter;
- backend lifecycle.

**DEFERRED**

- персональные рекомендации;
- advanced personalization;
- сложный content ranking.

## 9. Связанные документы

- `docs/modules/HOME.md`
- `docs/modules/Training/TRAINING.md`
- `docs/ARCHITECTURE/PLATFORM.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
