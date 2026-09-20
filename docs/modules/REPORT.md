# REPORT

## Назначение

Модуль REPORT предназначен для работы с отчётами пользователя.
В текущем branch реализован частичный frontend-экран с тестовой логикой вложений, но полноценный weekly-report lifecycle ещё не реализован как продуктовая система.

## Статус

**PARTIALLY IMPLEMENTED** — есть route и расширенный placeholder UI.

Применимость других статусов:

- **CURRENT**: только текущий frontend-экран и media upload/delete действия в рамках placeholder.
- **PLANNED**: полноценный report lifecycle (DRAFT/SUBMITTED/REVIEWED, review тренера, история).
- **DEFERRED**: расширенные сценарии и правила после базового запуска.
- **NOT VERIFIED**: production-поведение полной системы отчётов.

## Текущая реализация

Подтверждено по коду:

- маршруты `/app/report` и `/app/report-module` ведут на `ReportPlaceholderPage`;
- экран содержит карточки для фото, видео, голосового и текстового комментария;
- реализована загрузка/удаление медиа через `/media/upload`, `/media/:id/complete`, `/media/:id`;
- dedicated `reportService` в текущем frontend не обнаружен.

## UI / Экраны

Текущие экраны REPORT:

- `ReportPlaceholderPage`.

Текущее UI-содержимое:

- загрузка нескольких фотографий (ограничение до 30);
- загрузка одного видео;
- запись/загрузка голосового сообщения;
- поле текстового комментария.

## Жизненный цикл отчёта

Текущий status lifecycle:

- полноценный lifecycle отчёта (`DRAFT -> SUBMITTED -> REVIEWED`) не реализован как рабочий backend-driven процесс;
- UI не содержит подтверждённой модели смены статусов отчёта.

## Отправка клиентом

Текущее состояние:

- подтверждённой отправки отчёта клиентом в dedicated report API нет;
- в текущем UI есть работа с вложениями, но это не эквивалент отправке полноценного отчёта.

## Проверка / ответ тренера

Текущее состояние:

- dedicated review flow тренера для отчётов не обнаружен;
- backend endpoints для `report.review`/feedback по отчёту в текущем snapshot не обнаружены.

## Данные / Хранение

Текущее состояние:

- persistence собственно отчёта (report entity) не подтверждена;
- persistence медиа работает через общий media subsystem;
- связка media с отдельной report-сущностью в текущем backend не подтверждена.

## Статус Backend

Проверка backend показала:

- dedicated report module/routes не обнаружены;
- dedicated report tables/migrations не обнаружены;
- weekly-report persistence subsystem в текущем snapshot отсутствует.

## Media / Вложения

Текущее состояние:

- в REPORT UI есть интеграция с media upload/complete/delete;
- используется общий media backend flow, а не отдельный report storage subsystem.

## Связь с Training

Текущее состояние:

- прямой runtime-интеграции REPORT с Training для формирования отчёта из тренировочных сущностей не обнаружено;
- на уровне маршрутов и services это пока отдельные, не объединённые в lifecycle подсистемы.

## Текущий API

Подтверждённый API, используемый текущим REPORT UI:

- `POST /media/upload`
- `POST /media/:id/complete`
- `GET /media/:id`
- `DELETE /media/:id`

Dedicated `/api/report*` или `/api/reports*` API в текущем backend не подтверждён.

## PARTIALLY IMPLEMENTED

- route и frontend placeholder UI существуют;
- базовые media-вложения в рамках экрана доступны.

## PLANNED

- полноценная report-сущность и её lifecycle;
- отправка отчёта клиентом;
- проверка отчёта тренером и feedback;
- история отчётов и статусная модель.

## DEFERRED / NOT VERIFIED

- **DEFERRED**: расширенные отчётные сценарии, сложная аналитика и расширенные нотификации.
- **NOT VERIFIED**: end-to-end weekly-report flow в production.

## Известные ограничения

- текущий REPORT остаётся placeholder-модулем с частично рабочими вложениями;
- нет dedicated report backend subsystem;
- нельзя считать архитектурные target-описания фактической реализацией.

## Связанные документы

- docs/modules/HOME.md
- docs/modules/Training/TRAINING.md
- docs/modules/Training/TRAINING_UI.md
- docs/modules/COACH_CLIENT_RELATIONSHIP.md
- docs/SYSTEMS/MEDIA.md
- docs/SYSTEMS/PERMISSIONS.md
- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
