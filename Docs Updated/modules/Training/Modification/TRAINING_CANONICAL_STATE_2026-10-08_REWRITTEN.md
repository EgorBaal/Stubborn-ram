# TRAINING --- КАНОНИЧЕСКОЕ СОСТОЯНИЕ, РЕШЕНИЯ И ФАКТИЧЕСКАЯ РЕАЛИЗАЦИЯ

**Проект:** Stubborn Ram\
**Модуль:** Training\
**Дата актуализации:** 08.10.2026\
**Статус:** актуализированный рабочий канонический документ; содержит последнее подтверждённое состояние Training
основной документации Training

------------------------------------------------------------------------

## 1. Назначение документа

Этот документ объединяет два ранее использовавшихся рабочих документа:

-   `TRAINING_LIFECYCLE_RECONCILIATION_2026-10-07`
-   `WORKOUT_LIFECYCLE_VIEW_EDIT_TRAINER_CHANGE_PLAN_2026-10-07_UPDATED`

и актуализирует их с учётом решений, которые были приняты и реализованы
в последующей работе над Training.

Главная цель документа --- зафиксировать **не план**, а максимально
близкое к текущему состоянию проекта описание:

1.  какие архитектурные решения являются каноническими;
2.  от каких старых решений отказались;
3.  что уже реализовано и проверено;
4.  как сейчас должен вести себя Training;
5.  какие части относятся к будущим Client/Trainer/Permissions;
6.  какие вопросы ещё остаются отдельными задачами;
7.  какие старые разделы основной документации необходимо будет
    переписать.

Этот документ должен использоваться как промежуточный источник истины
перед последующей актуализацией основной документации:

-   `TRAINING.md`
-   `TRAINING_DATA_MODEL.md`
-   `TRAINING_UI.md`
-   `TRAINING_API.md`
-   `TRAINING_TEMPLATES.md`
-   `TRAINING_2_0_DECISIONS.md`

При дальнейшем обновлении основной документации приоритет имеет
фактический runtime и подтверждённые решения из этого документа.

------------------------------------------------------------------------

# 2. КЛЮЧЕВОЕ КАНОНИЧЕСКОЕ РЕШЕНИЕ

## 2.1. Workout больше не имеет пользовательского lifecycle

От старой модели окончательно отказались:

``` text
active
completed
unfinished
active → completed
Finish = completion
resume active Workout
```

В новой модели Workout **не проходит пользовательский lifecycle**.

Правильная модель:

``` text
Новая тренировка
      ↓
создание Workout в Backend
      ↓
реальный Workout ID
      ↓
Workout сразу является исторической сущностью
      ↓
непрерывный autosave
      ↓
Закрыть
      ↓
History
```

Workout существует как полноценная сущность с момента создания.

Пустой Workout также является валидной сущностью.

------------------------------------------------------------------------

# 3. БАЗОВАЯ DOMAIN MODEL

Базовая структура сохраняется:

``` text
User
  ↓
Workout
  ↓
WorkoutExercise
  ↓
WorkoutSet
```

Отдельно существует каталог упражнений:

``` text
Exercise
```

`WorkoutExercise` связывает конкретное упражнение с конкретным Workout.

`WorkoutSet` относится к конкретному `WorkoutExercise`.

Таким образом:

``` text
Exercise
   ↑
WorkoutExercise
   ↑
Workout
   ↑
User
```

и:

``` text
WorkoutExercise
   ↓
WorkoutSet
```

Основные архитектурные принципы остаются:

-   PostgreSQL --- source of truth;
-   Backend --- API boundary;
-   frontend не обращается к Backend напрямую из UI-модулей;
-   цепочка:

``` text
UI
 ↓
service
 ↓
apiClient
 ↓
Backend
 ↓
PostgreSQL
```

-   используются реальные стабильные Database IDs;
-   существующий Workout редактируется без создания копии;
-   Media остаётся отдельной подсистемой;
-   Templates / Programs / Protocols остаются отдельным будущим scope.

------------------------------------------------------------------------

# 4. СОЗДАНИЕ НОВОЙ ТРЕНИРОВКИ

## 4.1. Главное правило

Каждое нажатие:

``` text
Новая тренировка
```

создаёт **новый Workout**.

Не допускается:

``` text
New
 ↓
поиск active Workout
 ↓
открытие старого Workout
```

Не допускается:

-   `getActiveWorkout()` как механизм создания;
-   поиск первого подходящего Workout;
-   resume старого Workout;
-   наследование данных предыдущей тренировки;
-   fallback-создание второго Workout;
-   создание нового Workout при Finish.

Канонический путь:

``` text
Новая тренировка
 ↓
один POST
 ↓
один новый Workout ID
 ↓
TrainingPage работает с этим ID
```

Один пользовательский `New` = ровно один новый Workout.

## 4.2. Реализация

Это уже реализовано.

Новая тренировка создаётся через canonical creation path.

Frontend получает реальный Workout ID от Backend и открывает именно
созданный Workout.

Повторное нажатие `Новая тренировка` создаёт другой Workout ID.

------------------------------------------------------------------------

# 5. ПУСТОЙ WORKOUT

Пустой Workout является валидной исторической сущностью.

Сценарий:

``` text
Новая тренировка
 ↓
ничего не введено
 ↓
Закрыть
 ↓
History
```

Workout должен остаться в History.

Он может быть позже:

-   открыт;
-   отредактирован;
-   дополнен;
-   удалён.

Пустой Workout не считается ошибкой и не должен удаляться автоматически
только потому, что в нём нет упражнений.

------------------------------------------------------------------------

# 6. ПОСТОЯННЫЙ WORKOUT ID

Все изменения одной тренировки относятся к одному Workout ID:

``` text
Workout X
 ├─ title
 ├─ training_date
 ├─ start_time
 ├─ end_time
 ├─ training_type
 ├─ comment
 ├─ exercises
 ├─ sets
 └─ materials
```

Добавление:

-   Exercise;
-   Set;
-   комментария;
-   параметров;
-   материалов;

не создаёт новый Workout.

Редактирование существующей тренировки также не создаёт копию.

------------------------------------------------------------------------

# 7. REAL DATABASE IDs

Frontend не должен считать локальный UUID authoritative ID сущности,
пока соответствующая запись реально не создана в Database.

Особенно критично это для `WorkoutSet`.

Правильная последовательность:

``` text
Create Set
 ↓
Backend создаёт Set
 ↓
Frontend получает реальный Set ID
 ↓
дальнейшие операции используют реальный Set ID
```

Это устраняет класс ошибок `SET_NOT_FOUND`, возникавших при работе с ещё
не существующим локальным Set ID.

Persistence `Workout`, `WorkoutExercise` и `WorkoutSet` реализовано и
проверено.

------------------------------------------------------------------------

# 8. AUTOSAVE

Autosave является постоянным механизмом работы Training.

Он не зависит от:

-   `Finish`;
-   `Закрыть`;
-   завершения тренировки;
-   специальной финальной отправки всего Workout.

Изменения сохраняются в существующий Workout.

Цепочка:

``` text
UI
 ↓
service
 ↓
apiClient
 ↓
Backend
 ↓
PostgreSQL
```

Последнее успешно подтверждённое Backend состояние считается сохранённым
состоянием.

Для текстовых/числовых изменений допустим короткий debounce.

Структурные операции должны сохраняться после успешной backend-операции.

Важный архитектурный принцип:

**не следует без необходимости отправлять полный Workout при каждом
изменении одного поля.**

Фактическая текущая реализация autosave Workout при этом использует
полноформатный `PUT /api/training/workouts/:id` с текущим snapshot
Workout. Поэтому partial update не следует описывать как общий механизм
autosave всего Workout.

Partial update / patch-builder подтверждён для Set-level операций:
изменение `Weight`, `Reps` и других параметров Set отправляет только
изменённые поля и не должно затирать независимые значения.

------------------------------------------------------------------------

# 9. ВАЖНОЕ ИСПРАВЛЕНИЕ AUTOSAVE: PARTIAL UPDATE

Во время проверки Set был обнаружен критический баг.

Сценарий:

``` text
Weight = 100
↓
ввод Reps = 3
```

Изменение `Reps` приводило к исчезновению ранее сохранённого `Weight`.

Причина была не в UI, а в `trainingService.js`: обновление Set
отправляло полный набор полей, включая `undefined`, которые Backend
фактически интерпретировал как `null`.

Решение для Set:

-   использовать patch-builder;
-   отправлять только изменённые поля Set;
-   не перезаписывать остальные поля Set пустыми значениями.

Это Set-level механизм. Основной Workout autosave фактически использует
полный текущий snapshot Workout через `PUT`.

После исправления проверено:

``` text
Weight = 100
Reps = 3
```

оба значения сохраняются независимо и переживают reload.

Это является обязательным принципом для дальнейших изменений Set:

> Изменение одного параметра не должно уничтожать ранее сохранённые
> независимые параметры.

------------------------------------------------------------------------

# 10. VIEW / PREVIEW И EDIT

Для существующего Workout принята двухрежимная UI-модель:

``` text
View / Preview
Edit
```

Это **не lifecycle status**.

Это два режима интерфейса для одной и той же сущности.

Канонический flow:

``` text
History
 ↓
View / Preview
 ↓
Изменить
 ↓
Edit
 ↓
autosave
 ↓
Закрыть
 ↓
History
```

Один и тот же:

``` text
Workout ID
WorkoutExercise IDs
WorkoutSet IDs
```

не должен заменяться копией.

------------------------------------------------------------------------

# 11. VIEW / PREVIEW --- ТЕКУЩЕЕ ПОВЕДЕНИЕ

При открытии существующего Workout из History пользователь попадает в
Preview.

Preview является read-only.

В Preview нельзя случайно:

-   изменить Set;
-   изменить Exercise;
-   изменить параметры;
-   изменить комментарии;
-   добавить Exercise;
-   добавить Set;
-   удалить Exercise;
-   удалить Set;
-   удалить Media;
-   добавить Media;
-   редактировать материалы.

Для изменения используется:

``` text
Изменить
```

после чего открывается Edit того же Workout.

------------------------------------------------------------------------

# 12. PREVIEW --- HEADER

В Preview:

-   `Изменить` находится слева;
-   `Закрыть` находится справа;
-   кнопки находятся на одной вертикали;
-   название Workout находится между ними;
-   стрелка Back удалена.

Название должно занимать центральную область между кнопками.

Если название не помещается, оно может переноситься по словам и сдвигать
содержимое ниже.

Это отличается от History, где длинное название должно быть в одну
строку с `ellipsis`.

------------------------------------------------------------------------

# 13. PREVIEW --- WORKOUT COMMENT

Если комментария Workout нет:

``` text
блок комментария не показывается
```

Если комментарий существует:

-   он отображается;
-   он read-only;
-   изменить его можно только в Edit.

------------------------------------------------------------------------

# 14. PREVIEW --- EXERCISE CARDS

В Preview все Exercise cards по умолчанию закрыты.

Пользователь может открыть конкретное упражнение отдельно.

Таким образом:

``` text
Preview
 ├─ Exercise 1 — collapsed
 ├─ Exercise 2 — collapsed
 ├─ Exercise 3 — collapsed
 └─ ...
```

Открытие одной карточки не должно превращать весь Preview в Edit.

------------------------------------------------------------------------

# 15. PREVIEW --- EXERCISE COMMENT

Если у Exercise нет комментария:

``` text
блок комментария скрыт
```

Если комментарий существует:

-   отображается;
-   read-only;
-   редактирование выполняется только в Edit.

------------------------------------------------------------------------

# 16. PREVIEW --- MATERIALS

В Preview используется существующая Materials infrastructure.

Логика:

``` text
Preview
 ↓
materials trigger / left swipe
 ↓
materials panel
 ↓
read-only photos / video / comments
```

В Preview отсутствуют mutation controls.

То есть в Preview не должно быть:

-   Add;
-   Delete;
-   Edit;
-   других управляющих действий изменения данных.

Материалы отображаются как существующие данные.

В Edit используется тот же контекст материалов, но он остаётся
редактируемым.

------------------------------------------------------------------------

# 17. SWIPE

Правое swipe-действие в Preview для copy/delete было удалено.

То есть Preview больше не использует правый swipe для изменения данных.

Левый swipe сохраняет доступ к дополнительным данным/материалам.

Цель:

``` text
Left swipe
 ↓
materials / additional data
 ↓
read-only in Preview
```

В Edit соответствующие действия остаются рабочими.

------------------------------------------------------------------------

# 18. EDIT

Edit работает с уже существующим Workout.

Правила:

-   новый Workout не создаётся;
-   новый ID не создаётся;
-   Workout не копируется;
-   изменения сохраняются в тот же Workout;
-   используется тот же autosave;
-   после `Закрыть` пользователь возвращается в History.

Пример:

``` text
Workout X
 ↓
Preview
 ↓
Изменить
 ↓
Edit
 ↓
изменить данные
 ↓
autosave
 ↓
Закрыть
 ↓
History
```

------------------------------------------------------------------------

# 19. CLOSE

Кнопка:

``` text
Закрыть
```

не является завершением Workout.

Она:

-   не меняет lifecycle;
-   не меняет status;
-   не создаёт Workout;
-   не создаёт копию;
-   не является отдельным финальным save;
-   возвращает пользователя в History.

Это обычный выход из текущего экрана.

Старое название/смысл `Завершить` в новой модели не используется.

------------------------------------------------------------------------

# 20. HISTORY

History показывает все существующие и не удалённые Workout.

Не используется разделение:

``` text
active
completed
unfinished
```

В History могут находиться:

-   пустые Workout;
-   частично заполненные;
-   полностью заполненные;
-   старые;
-   недавно созданные;
-   отредактированные.

History работает с persisted Workout.

Открытие карточки ведёт к View/Preview.

------------------------------------------------------------------------

# 21. HISTORY --- ВИЗУАЛЬНЫЕ ПРАВИЛА

Для длинного названия Workout в History:

-   одна строка;
-   `ellipsis`;
-   фиксированная ширина области;
-   отсутствие горизонтального scroll;
-   правая часть карточки остаётся видимой.

Это отдельное правило History и не заменяет правило переноса названия в
Preview.

------------------------------------------------------------------------

# 22. ПРЕДЗАГРУЗКА ПРИ ПЕРЕХОДЕ HISTORY → WORKOUT

Во время runtime QA была обнаружена визуальная проблема:

``` text
History
 ↓
Loading
 ↓
Workout
```

Пользователь видел промежуточное состояние при открытии существующей
тренировки.

Простой loading gate убрал неправильные данные, но оставлял визуальный
переход через Loading.

Поэтому реализована preload-схема.

Теперь:

``` text
History card click
 ↓
getWorkoutById(workout.id)
 ↓
получение данных
 ↓
navigate(/app/training/:id, { preloadedWorkout })
 ↓
TrainingPage сразу использует готовый Workout
```

TrainingPage при наличии preloaded data не делает второй GET.

Прямой URL и reload продолжают использовать обычную загрузку по ID.

Runtime QA проверял состояние сразу после клика, включая интервал
`0 ms`, а также 50/100/200/300/500/1000 ms.

Подтверждено отсутствие промежуточного Loading/Spinner состояния при
переходе из History в существующий Workout.

После этого пользователь также подтвердил, что визуальный flash, по его
наблюдению, больше не проявляется.

------------------------------------------------------------------------

# 23. CREATE / VIEW / EDIT --- ЕДИНЫЙ ID

Новая тренировка:

``` text
New
 ↓
Workout ID X
```

Далее:

``` text
Edit X
 ↓
Close
 ↓
History
 ↓
Preview X
 ↓
Edit X
```

Ни на одном этапе не создаётся:

``` text
Workout Y
```

если пользователь не нажал отдельную `Новая тренировка`.

------------------------------------------------------------------------

# 24. DATE

При создании Workout:

``` text
training_date = текущая локальная календарная дата
```

Дата автоматически фиксируется при создании.

Повторное открытие Workout не должно автоматически заменять дату текущей
датой.

Пользователь может вручную изменить дату.

Ручное значение имеет приоритет.

В текущей UI реализации ручное изменение даты было также проверено
пользователем: дата была изменена с 7 октября на 8 октября и сохранилась
как пользовательское значение.

------------------------------------------------------------------------

# 25. START TIME

`start_time` автоматически фиксируется при создании/первом начале
Workout.

Повторные открытия не должны автоматически менять Start time.

Пользователь может изменить Start time вручную.

Ручное значение имеет приоритет над автоматикой.

Runtime QA подтвердил:

``` text
manual start = 20:00
```

после сохранения и повторного открытия значение сохраняется.

------------------------------------------------------------------------

# 26. END TIME

`end_time` имеет динамическую автоматическую логику.

При выходе из Edit в пределах одного календарного дня:

``` text
Edit
 ↓
Close
 ↓
end_time = актуальное время выхода
```

При следующем Edit-сеансе того же дня end time может обновиться до более
позднего времени выхода.

Пример:

``` text
20:00 start
21:00 Close
→ end = 21:00

22:00 Edit
22:30 Close
→ end = 22:30
```

Если пользователь вручную задаёт End time, ручное значение имеет
приоритет.

------------------------------------------------------------------------

# 27. PREVIEW НЕ МЕНЯЕТ END TIME

Открытие существующего Workout в Preview не считается продолжением
Edit-сеанса.

Поэтому:

``` text
History
 ↓
Preview
```

не должно автоматически менять `end_time`.

Runtime QA это подтвердил.

------------------------------------------------------------------------

# 28. ДЛИТЕЛЬНОСТЬ

Продолжительность рассчитывается на основе сохранённых start/end
значений.

Проверено:

``` text
21:13 → 21:15 = 2 минуты
```

и:

``` text
20:00 → 00:30 = 4 часа 30 минут
```

Текущая реализация принимает ручное значение `00:30` после `20:00` как
продолжительность 4:30.

Это является фактическим поведением текущего runtime.

Отдельное правило о том, как именно должна интерпретироваться ручная End
time при переходе через полночь, следует считать самостоятельным
продуктовым решением, если потребуется изменить эту семантику.

------------------------------------------------------------------------

# 29. APP CLOSE / CRASH / HOME

Поскольку Workout создаётся сразу и autosave работает постоянно:

следующие события не должны создавать новый lifecycle:

-   Home;
-   Chat;
-   переход в другой модуль;
-   сворачивание приложения;
-   закрытие приложения;
-   crash;
-   разряд телефона.

Сохраняется последнее успешно подтверждённое Backend состояние.

Полноценный offline-first с очередью локальных mutations и последующей
синхронизацией не входит в текущий scope.

------------------------------------------------------------------------

# 30. DELETE

Удаление Workout должно учитывать всю связанную domain/media структуру:

``` text
Workout
 ↓
WorkoutExercise
 ↓
WorkoutSet
 ↓
Notes
 ↓
Media links
 ↓
Media / Object Storage
```

Удаление из PostgreSQL и удаление физических media objects --- не одно и
то же.

DB cascade может удалить relational records, но не гарантирует удаление
физических объектов из Object Storage.

Поэтому полный media cleanup является отдельным техническим вопросом.

Базовое удаление Workout из Database уже исправлено и работает.

------------------------------------------------------------------------

# 31. MEDIA

Media остаётся отдельной shared subsystem.

Важное исправление:

`SET_NOT_FOUND` был связан с использованием Set ID до фактического
создания Set в Database.

Теперь Media может работать с реальным Database Set ID после успешного
создания Set.

Отдельная проблема:

``` text
Storage upload 404 / ERR_ABORTED
```

не считается автоматически решённой исправлением Set lifecycle.

Эти две проблемы не смешиваются.

------------------------------------------------------------------------

# 32. COMMENTS

Комментарии являются частью сохраняемых данных Workout / Exercise / Set
в зависимости от контекста.

Правило режимов:

### Preview

``` text
read-only
```

### Edit

``` text
editable
autosave
```

Если комментария нет, соответствующий UI-блок может быть скрыт в
Preview.

------------------------------------------------------------------------

# 33. EXERCISE

Exercise --- отдельная сущность каталога.

При выборе Exercise внутри Workout создаётся/используется:

``` text
WorkoutExercise
```

а не новый Workout.

Удаление Exercise из Workout не означает удаление Exercise из
глобального каталога.

WorkoutExercise имеет собственную persisted identity.

------------------------------------------------------------------------

# 34. SET

Set является дочерней сущностью WorkoutExercise.

При добавлении Set:

``` text
existing WorkoutExercise
 ↓
new WorkoutSet
```

Не создаётся новый Workout.

Каждый Set должен иметь реальный Database ID до операций, которые
требуют ссылки на Set.

Изменение одного параметра Set не должно обнулять другие параметры.

------------------------------------------------------------------------

# 35. TECHNIQUES

В текущей реализации были обнаружены и проверены структуры для
нескольких техник, включая:

-   Drop-set;
-   Isometry;
-   Cluster;
-   Rest-pause;
-   Tempo superset;
-   Partial reps.

Они хранятся как часть данных техники/Set и не должны исчезать только
потому, что пользователь изменил обычный параметр Set.

Superset также присутствует в текущей модели через связь/параметр вроде
`supersetAfter`.

Полный отдельный runtime-аудит всех комбинаций техник не должен
считаться выполненным только на основании наличия кода.

------------------------------------------------------------------------

# 36. SWIPE / COPY / DELETE EXERCISE

В Edit соответствующие действия остаются частью редактирования.

В Preview mutation-действия скрыты.

Особенно важно:

``` text
Preview ≠ Edit
```

Нельзя считать наличие обработчика в общем компоненте доказательством
того, что действие доступно пользователю в Preview.

------------------------------------------------------------------------

# 37. UI TAP HIGHLIGHT

Был обнаружен системный синий tap highlight браузера на
мобильном/тач-интерфейсе.

Это не был пользовательский `:active` стиль.

Исправление сделано глобально в:

``` text
src/index.css
```

через:

``` css
-webkit-tap-highlight-color: transparent;
```

Runtime проверил:

-   кнопки;
-   карточки History;
-   Training buttons;
-   ссылки;
-   создание новой тренировки;
-   навигацию.

Computed style показывает прозрачный tap highlight.

Навигация продолжает работать.

------------------------------------------------------------------------

# 38. АРХИТЕКТУРА CLIENT / TRAINER --- БУДУЩИЙ SCOPE

Будущая модель должна использовать один canonical Workout.

Не создавать:

``` text
Client Workout
+
Trainer Workout
```

для одной и той же тренировки.

Должен существовать:

``` text
один Workout
```

с отдельными:

-   ownership;
-   permissions;
-   authorship;
-   UI modes.

------------------------------------------------------------------------

# 39. OWNERSHIP И AUTHOR

Предварительная будущая модель:

``` text
Workout owner = client
```

Тренер не получает ownership Workout только потому, что имеет доступ к
нему.

Если тренер создаёт материал:

``` text
author = trainer
```

Если клиент создаёт материал:

``` text
author = client
```

Ownership и authoring --- разные понятия.

Точные поля и механизмы необходимо определить после отдельного аудита
Database и Backend.

------------------------------------------------------------------------

# 40. TRAINER

Целевая модель:

Тренер может получить разрешённый доступ к Workout клиента.

Тренер может:

-   просматривать Workout;
-   видеть результаты;
-   видеть упражнения;
-   видеть подходы;
-   видеть параметры;
-   видеть комментарии;
-   видеть Media;
-   добавлять собственные разрешённые материалы.

По умолчанию тренер не должен изменять фактические client results.

Например:

``` text
120 kg × 8
```

не должен превращаться тренером в:

``` text
130 kg × 8
```

без отдельного разрешения/семантики.

Trainer materials должны существовать рядом с client materials, а не
заменять их.

------------------------------------------------------------------------

# 41. AUTHORIZATION

Frontend не является источником истины для permissions.

Backend должен определять:

-   View;
-   Edit;
-   создание trainer content;
-   изменение собственного content;
-   удаление собственного content;
-   другие действия.

Предварительная модель:

### Workout owner

``` text
View
Edit
Own content
```

### Trainer с разрешённой Client/Trainer relationship

``` text
View
Trainer content additions
Own trainer materials
No client-result edit by default
```

### Другой пользователь

``` text
No access
```

Это пока будущая permission architecture, а не утверждение, что вся она
уже реализована.

------------------------------------------------------------------------

# 42. API

Канонический базовый набор Workout endpoints:

``` text
GET    /api/training/workouts
GET    /api/training/workouts/:id
POST   /api/training/workouts/start
PUT    /api/training/workouts/:id
DELETE /api/training/workouts/:id
```

Смысл:

``` text
POST
→ создать новый Workout

GET list
→ получить History

GET by ID
→ получить конкретный Workout

PUT
→ изменить существующий Workout

DELETE
→ удалить существующий Workout
```

Granular операции для Exercise/Set/Media существуют или развиваются
отдельно в зависимости от текущего API.

Не следует создавать дублирующие endpoints только потому, что старые
документы предполагали другую lifecycle-модель.

------------------------------------------------------------------------

# 43. BACKEND / FRONTEND BOUNDARY

Обязательная архитектура:

``` text
Training UI
 ↓
trainingService
 ↓
apiClient
 ↓
Backend API
 ↓
PostgreSQL
```

UI-компоненты не должны напрямую выполнять произвольные `fetch` к
Backend.

Это решение является частью общего P1-1 архитектурного фундамента
проекта.

------------------------------------------------------------------------

# 44. TEMPLATES / PROGRAMS / PROTOCOLS

Это не входит в текущую core implementation.

Будущая семантика:

``` text
Template
 ↓ COPY
independent Workout
 ↓
History
```

или:

``` text
Program
 ↓
Protocol
 ↓ COPY
Workout
 ↓
History
```

После COPY создаётся независимый Workout.

Дальнейшие изменения такого Workout не должны менять исходный
Template/Program/Protocol.

------------------------------------------------------------------------

# 45. REPORTS / ANALYTICS

Будущие Reports / Analytics должны использовать canonical Workout.

Если существующий Workout изменён позднее, связанные показатели должны
учитывать актуальное состояние, если отдельно не принято решение о
snapshots/versioning.

Snapshot system пока не вводится.

Перед реализацией Reports/Analytics необходимо отдельно проверить:

-   History;
-   Client Dashboard;
-   Trainer Dashboard;
-   Progress;
-   Reports;
-   Analytics.

------------------------------------------------------------------------

# 46. OFFLINE

Offline-first не является текущей задачей.

В будущем может появиться:

``` text
local backup
 ↓
mutation queue
 ↓
reconnect
 ↓
sync
 ↓
replay
```

Но сейчас source of truth:

``` text
PostgreSQL / Backend
```

Последнее успешно подтверждённое сервером состояние считается
сохранённым.

------------------------------------------------------------------------

# 47. ЧТО БЫЛО ОТМЕНЕНО

Следующие решения больше не являются каноническими:

## 47.1. Active Workout

Отказались от:

``` text
getActiveWorkout()
```

как пользовательского механизма resume.

Причина:

в Database могли существовать несколько active Workout, и выбор первого
был ненадёжным.

## 47.2. Resume previous active

Отказались от:

``` text
New
 ↓
если active существует
 ↓
открыть active
```

Теперь:

``` text
New
 ↓
always new Workout
```

## 47.3. Finish lifecycle

Отказались от:

``` text
Finish
 ↓
active → completed
```

Теперь:

``` text
Закрыть
 ↓
History
```

## 47.4. Completed as lifecycle

`completed` больше не определяет, является ли Workout текущим,
историческим или доступным для редактирования.

## 47.5. History filtering by status

History больше не должен зависеть от `active/completed`.

## 47.6. Multiple creation paths

Устаревшие fallback-пути, способные создавать второй Workout, должны
быть удалены или перестроены.

------------------------------------------------------------------------

# 48. LEGACY DB FIELDS

В Database физически всё ещё существуют:

``` text
status
completed_at
```

Они изолированы от новой lifecycle-бизнес-логики, но физически не удалены
из schema/API.

Текущее подтверждённое состояние:

-   новые Workout не используют эти поля для lifecycle;
-   `status` / `completed_at` не определяют пользовательское состояние
    Workout;
-   они могут присутствовать в API response как legacy fields со
    значением `null`;
-   frontend Training не использует их для resume/History/lifecycle;
-   физическое удаление этих полей требует отдельного schema/API audit.

Итого: legacy lifecycle business logic удалён/изолирован, но legacy
DB/API fields физически ещё существуют.

------------------------------------------------------------------------

# 49. ФАКТИЧЕСКО РЕАЛИЗОВАНО И ПРОВЕРЕНО

По результатам последовательной реализации и runtime QA подтверждены
следующие части.

## Core persistence

-   создание реального Workout;
-   реальный Workout ID;
-   реальный WorkoutExercise ID;
-   реальный WorkoutSet ID;
-   persistence Set;
-   существующий Workout по ID;
-   History с persisted Workout;
-   delete Workout;
-   базовый API flow.

## New

-   каждый New создаёт новый ID;
-   старый Workout не resume;
-   один New не создаёт второй Workout;
-   новый Workout открывается сразу в Edit.

## History

-   History показывает persisted Workout;
-   пустые Workout остаются;
-   карточка открывает конкретный ID;
-   длинные названия не вызывают horizontal overflow.

## View/Edit

-   History → Preview;
-   Preview read-only;
-   Preview → Edit;
-   Edit работает с тем же ID;
-   Close → History;
-   повторное открытие сохраняет данные;
-   New и Existing имеют корректные режимы.

## Autosave

Проверены:

-   title;
-   comment;
-   Exercise;
-   Set;
-   Set parameters;
-   Weight;
-   Reps;
-   partial update одного параметра без потери другого;
-   persistence после reload;
-   реальный UI flow New → Exercise → Set → Weight/Reps → изменение
    Weight/Reps → Backend → Database;
-   autosave после исправления stale parent state в `TrainingPage`;
-   отсутствие `exercises: []` после добавления упражнения в canonical
    parent state.

## Set integrity

Исправлен баг:

``` text
Weight → Reps
```

который приводил к потере Weight.

Для Set используется partial update изменённых полей.

Основной autosave Workout фактически отправляет полный текущий snapshot
через `PUT /api/training/workouts/:id`; это не granular PATCH всего
Workout.

## Preview

Проверены:

-   header;
-   Edit / Close;
-   title positioning;
-   hidden empty Workout comment;
-   read-only existing comment;
-   collapsed Exercise cards;
-   hidden empty Exercise comments;
-   read-only materials;
-   photo viewer;
-   отсутствие mutation controls.

## Materials

Проверены:

-   существующие photos;
-   materials panel;
-   existing comment;
-   Preview read-only;
-   Edit mutation controls.

Видео не было полностью подтверждено runtime на реальном загруженном
video в одной из проверок, поэтому полное video-runtime coverage не
следует выдавать за полностью проведённый тест.

## Swipe

-   right swipe copy/delete удалён из Preview;
-   left swipe используется для доступа к дополнительным
    данным/materials;
-   Preview mutation controls скрыты.

## Date/Time

Проверены:

-   local creation date;
-   creation start time;
-   persistence after reload;
-   Preview не меняет end;
-   Close сохраняет end;
-   повторный Edit может обновлять end;
-   manual Start;
-   manual End;
-   duration;
-   второй Workout;
-   History;
-   local-time behavior.

Ручное изменение даты также было выполнено пользователем и сохранилось.

## Navigation / UX

-   preload существующего Workout при переходе из History;
-   устранение видимого Loading/Spinner flash;
-   direct URL/reload fallback;
-   New Workout не ломается;
-   глобальный tap highlight убран.

------------------------------------------------------------------------

# 50. ЧТО НЕ СЛЕДУЕТ СЧИТАТЬ ПОЛНОСТЬЮ ЗАКРЫТЫМ

Несмотря на значительный объём runtime QA, отдельно остаются:

1.  полный runtime-аудит всех комбинаций техник;
2.  полный runtime-аудит video materials;
3.  полноценный Object Storage cleanup при Delete;
4.  Storage `404 / ERR_ABORTED`;
5.  будущая Client/Trainer permission architecture;
6.  trainer authoring;
7.  ownership/author fields;
8.  reports/analytics impact;
9.  offline queue;
10. Templates / Programs / Protocols.

Отдельно закрыты и не относятся к оставшимся core-хвостам:

-   legacy lifecycle `active/completed` и связанные business rules;
-   legacy `POST /api/training/workouts` как второй creation path;
-   frontend autosave blocker, связанный с delayed child → parent sync;
-   stale parent `exerciseCards`, из-за которого ранее отправлялся
    `exercises: []`.

Эти исправления подтверждены финальным runtime QA и не должны
возвращаться в новую реализацию.

Оставшиеся пункты являются отдельными задачами и не должны смешиваться
с уже закрытым core lifecycle.

------------------------------------------------------------------------

# 51. ВАЖНОЕ РАЗЛИЧИЕ: FACT / INFERENCE / PROPOSAL

Для дальнейшей работы с Training необходимо всегда разделять:

## FACT

Подтверждено:

-   кодом;
-   Database;
-   runtime QA;
-   существующей документацией.

## INFERENCE

Логический вывод из текущей реализации.

## PROPOSAL

Будущее решение.

Особенно это важно для:

-   Client/Trainer;
-   permissions;
-   authoring;
-   ownership;
-   offline;
-   reports;
-   snapshots;
-   Templates/Programs.

Нельзя описывать будущую модель как уже существующую архитектуру.

------------------------------------------------------------------------

# 52. ТЕКУЩИЙ КАНОНИЧЕСКИЙ FLOW

## New

``` text
Новая тренировка
 ↓
POST
 ↓
real Workout ID
 ↓
Edit
 ↓
continuous autosave
```

## Existing

``` text
History
 ↓
preload Workout
 ↓
Preview
 ↓
Изменить
 ↓
Edit
 ↓
autosave
 ↓
Закрыть
 ↓
History
```

## New empty

``` text
New
 ↓
Workout created
 ↓
nothing entered
 ↓
Закрыть
 ↓
History
```

## Separate new Workout

``` text
New #1
 ↓
Workout A

New #2
 ↓
Workout B
```

`A !== B`.

------------------------------------------------------------------------

# 53. КАНОНИЧЕСКИЙ КОНТРАКТ TRAINING

1.  `Новая тренировка` всегда создаёт новый Workout.
2.  Workout получает реальный ID сразу.
3.  С момента создания Workout является полноценной исторической
    записью.
4.  Пустой Workout допустим.
5.  Workout не имеет пользовательского статуса
    `active/completed/unfinished`.
6.  Autosave является постоянным механизмом.
7.  Все изменения одной тренировки относятся к одному Workout ID.
8.  History показывает все существующие не удалённые Workout.
9.  History не зависит от lifecycle status.
10. Открытие Workout из History начинается с Preview/View.
11. Edit включается только через `Изменить`.
12. View и Edit используют один Workout ID.
13. `Закрыть` не является completion.
14. `Закрыть` возвращает в History.
15. Back arrow на экране Workout не используется.
16. Date автоматически фиксируется при создании.
17. Date может быть изменена вручную.
18. Manual date имеет приоритет.
19. Start time автоматически фиксируется при создании/первом начале.
20. Start time может быть изменён вручную.
21. Manual start имеет приоритет.
22. End time обновляется автоматикой при выходе из Edit в рамках
    соответствующей логики текущего дня.
23. Preview не меняет End time.
24. Manual End имеет приоритет.
25. Exercise является отдельной сущностью каталога.
26. Workout содержит WorkoutExercise.
27. WorkoutExercise содержит WorkoutSet.
28. Добавление Exercise не создаёт новый Workout.
29. Добавление Set не создаёт новый Workout.
30. Set operations используют реальный Database Set ID.
31. Изменение одного параметра Set не должно уничтожать остальные
    параметры.
32. Preview является read-only.
33. Edit является editable.
34. Materials в Preview доступны для просмотра, но mutation controls
    скрыты.
35. Правый swipe copy/delete в Preview отсутствует.
36. Левый swipe ведёт к дополнительным данным/materials.
37. History card не создаёт горизонтальный overflow из-за длинного
    названия.
38. Переход History → existing Workout использует preload, когда данные
    доступны через этот путь.
39. Frontend работает через service → apiClient → Backend.
40. PostgreSQL остаётся source of truth.
41. Templates / Programs / Protocols пока не входят в core
    implementation.
42. Client/Trainer permissions пока являются отдельным будущим scope.
43. Offline-first пока не входит в scope.
44. Полный media/Object Storage cleanup требует отдельной проверки.
45. Legacy `status` / `completed_at` могут физически существовать в
    schema/API, но старые active/completed business rules не должны
    возвращаться в новую реализацию.
46. Основной Workout autosave фактически использует полноформатный
    `PUT` snapshot; Set-level partial update является отдельным
    механизмом и не должен описываться как granular PATCH всего Workout.

------------------------------------------------------------------------

# 54. ЧТО НУЖНО СДЕЛАТЬ С ОСНОВНОЙ ДОКУМЕНТАЦИЕЙ

Следующий большой документальный этап --- не создавать ещё один план, а
**переписать существующую основную документацию Training по фактическому
состоянию, подтверждённому последним runtime QA**.

В первую очередь необходимо убрать или переписать все места, где ещё
описывается:

``` text
active
completed
unfinished
active → completed
Finish
resume active
getActiveWorkout как пользовательский flow
Finish fallback create
```

Вместо этого должна быть описана:

``` text
immediate Workout creation
real Workout ID
persistent historical entity
empty Workout validity
continuous autosave
History
Preview
Edit
Close
same Workout ID
date semantics
start_time semantics
end_time semantics
manual override priority
real Set IDs
Preview materials
```

Отдельно необходимо обновить UI documentation:

-   Preview;
-   Edit;
-   header;
-   comments;
-   collapsed exercises;
-   materials;
-   swipe behavior;
-   History title behavior;
-   preload behavior, если это относится к документируемой UX
    architecture.

Отдельно необходимо обновить API documentation:

-   canonical creation;
-   list;
-   by ID;
-   update;
-   delete;
-   persistence semantics.

Отдельно необходимо обновить Data Model:

-   Workout без пользовательского lifecycle;
-   WorkoutExercise;
-   WorkoutSet;
-   real IDs;
-   ownership/authoring только там, где уже подтверждено.

Отдельно необходимо обновить Templates documentation только в той части,
которая уже определена; сами Templates/Programs остаются будущим scope.

------------------------------------------------------------------------

# 55. КАК ИСПОЛЬЗОВАТЬ ЭТОТ ДОКУМЕНТ ДАЛЬШЕ

Этот файл не должен становиться ещё одной параллельной «вечной»
документацией.

Его назначение:

``` text
этот документ
      ↓
сверка с текущим кодом/runtime
      ↓
обновление основной документации Training
      ↓
основная документация становится canonical
```

После того как:

-   `TRAINING.md`;
-   `TRAINING_DATA_MODEL.md`;
-   `TRAINING_UI.md`;
-   `TRAINING_API.md`;
-   `TRAINING_TEMPLATES.md`;
-   `TRAINING_2_0_DECISIONS.md`

будут переписаны и проверены на отсутствие старых решений, именно они
должны стать основной документацией модуля.

После этого данный файл может использоваться как история перехода/архив
решений, а не как второй competing source of truth.

------------------------------------------------------------------------

# 56. ИТОГОВОЕ СОСТОЯНИЕ

Training прошёл переход от старой модели:

``` text
active
 ↓
Finish
 ↓
completed
```

к новой модели:

``` text
New
 ↓
persistent Workout
 ↓
continuous autosave
 ↓
History
```

При этом один и тот же Workout может быть:

``` text
Preview
↕
Edit
```

без создания копии.

Текущая архитектура уже включает:

``` text
real IDs
persistent Workout
persistent WorkoutExercise
persistent WorkoutSet
autosave
History
Preview
Edit
Close
date/time persistence
materials
partial Set updates
preload
read-only Preview
```

Будущими отдельными слоями остаются:

``` text
Client / Trainer
Permissions
Authoring
Ownership refinement
Storage cleanup
Offline
Reports / Analytics
Templates / Programs / Protocols
```

Главный принцип:

> **Один canonical Workout. Один реальный Workout ID. Данные сохраняются
> непрерывно. View/Edit --- это режимы интерфейса, а не lifecycle.
> History показывает сохранённые Workout. `Закрыть` не завершает
> тренировку --- он только закрывает экран.**
