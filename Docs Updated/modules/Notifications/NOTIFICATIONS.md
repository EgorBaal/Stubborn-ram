# NOTIFICATIONS

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PARTIALLY IMPLEMENTED / STATIC UI

## 1. Назначение

Notifications — домен событийных сигналов, которые помогают пользователю быстро увидеть важное состояние платформы и перейти к действию.

## 2. Текущее состояние

Подтверждено:

- `NotificationSection` на Home;
- кликабельные notification cards;
- навигация к связанным разделам.

Не подтверждено:

- отдельный notification center;
- backend persistence;
- read/unread lifecycle;
- notification API;
- push registration;
- Web Push backend.

Поэтому текущий notification layer нельзя считать полноценным самостоятельным доменом.

## 3. Home boundary

Notification UI может отображаться на Home, но Home не должен становиться хранилищем уведомлений.

Целевая схема:

```text
Domain event
↓
Notification service/domain
↓
Notification state
↓
Home / Notification Center
```

## 4. Типы событий

Целевые примеры:

- новое сообщение;
- новый report / ожидание проверки;
- feedback тренера;
- новое назначение;
- требуется добавить вес;
- запланирована контрольная точка;
- активность не выполнена;
- другое важное событие домена.

Каждое событие должно ссылаться на реальное действие/объект, если такая связь существует.

## 5. Read state

Целевая модель должна различать как минимум:

- unread;
- read.

Read state должен храниться server-side, если уведомления становятся persistent.

## 6. Navigation

Нажатие на notification должно приводить пользователя к связанному действию или объекту.

Notification не должна дублировать содержимое объекта.

## 7. Access и permissions

Уведомление может показываться только пользователю, для которого соответствующий event допустим.

Получение/открытие связанного объекта дополнительно проверяется backend.

## 8. Push

Push не входит в текущий базовый implementation.

Push и другие external delivery channels являются отдельным этапом после in-app notification foundation.

## 9. Current / Planned

**CURRENT**

- Home NotificationSection;
- static navigation cards;
- basic visual indicators.

**PLANNED**

- notification backend;
- persistence;
- read state;
- notification center;
- event generation.

**DEFERRED**

- push;
- сложная orchestration;
- advanced notification preferences.

## 10. Архитектурные требования

- notification не является canonical source of business data;
- события должны ссылаться на доменные источники;
- duplicate business data не создается;
- security/access checks остаются server-side.

## 11. Связанные документы

- `docs/modules/HOME.md`
- `docs/modules/CHAT.md`
- `docs/modules/REPORT.md`
- `docs/modules/COMMENTS.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEMS/SECURITY.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
