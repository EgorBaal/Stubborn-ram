# LAYOUT

Статус: CURRENT
Последнее обновление: 2026-09-19

## Назначение

Канонический документ layout/shell-контрактов Stubborn Ram.
Определяет границы общей оболочки и модульного содержимого.

## App Shell

Статус: CURRENT

Базовая shell-композиция:

- верхняя/служебная зона приложения;
- центральная контентная область;
- нижняя навигация (BottomTabBar);
- глобальные overlays/loading.

Shell должен оставаться единым для модулей и не дублироваться внутри отдельных страниц.

## Router + Layout Contract

Статус: CURRENT

- Router определяет route -> page mapping.
- Layout определяет общие UI-границы и shared chrome.
- Модули должны подключаться в shell через router, не создавая альтернативный глобальный layout.

## Scroll и Контентная Область

Статус: PARTIALLY IMPLEMENTED

- Разные модули могут требовать разные scroll-patterns.
- Layout не должен жестко ломать module-specific scroll logic.
- Тонкая нормализация scroll-поведения остаётся частью эволюции модулей.

## Bottom Navigation

Статус: CURRENT

- BottomTabBar является частью общей оболочки.
- Используется как единая точка доступа к ключевым разделам приложения.
- Module-level экраны не должны дублировать global navigation.

## State / Loading Surface

Статус: CURRENT

- Глобальные loading-поверхности и shared overlays размещаются на shell-уровне.
- Module-local loading/error состояния остаются внутри модулей.

## Ограничения

- Layout не должен становиться местом бизнес-логики конкретного модуля.
- Изменения в layout должны быть обратно совместимы с текущими module routes.

## Связанные Канонические Документы

- Runtime architecture: `docs/ARCHITECTURE/ARCHITECTURE.md`
- App/code structure map: `docs/ARCHITECTURE/APP_STRUCTURE.md`
- Platform model context: `docs/ARCHITECTURE/PLATFORM.md`
- Global state index: `docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md`
