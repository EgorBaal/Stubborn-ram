# SYSTEM_STATE_FINAL.md — Stubborn Ram

**Актуальное состояние проекта и инфраструктуры**  
**Дата формирования документа:** 20.09.2026  
**Актуальность фактов:** 19.09.2026 — по последним доступным audit/remediation материалам.

> Этот файл является компактной единой картой фактического состояния Stubborn Ram.
> Здесь собраны только актуальные сведения, необходимые для понимания того,
> где находится система, как связаны её слои, как работают подтверждённые
> цепочки, что реально реализовано, что является частичным/заглушкой и что
> отложено.
>
> Подробная история исправлений и forensic-доказательства остаются в AUDIT-документах.
> Подробные продуктовые спецификации отдельных модулей остаются в их канонических
> документах.

---

# 0. ОПРЕДЕЛЕНИЯ И ТЕРМИНЫ

Этот раздел — краткий словарь терминов, которые используются в SYSTEM_STATE_FINAL.md.
Он нужен для быстрого понимания системы без необходимости разбираться в техническом жаргоне.

0.1. Проект и окружения

1. Stubborn Ram — название текущей PWA/CRM-платформы для тренера и клиентов.

2. Frontend — клиентская часть приложения, которую видит пользователь в браузере: экраны, кнопки, формы, навигация и визуальное поведение. В проекте построена на React + Vite.

3. Backend — серверная часть приложения. Получает запросы от Frontend, выполняет авторизацию, бизнес-логику, проверки доступа, работает с PostgreSQL, файлами и внешними сервисами. В проекте используется Fastify.

4. Local / Localhost — локальная копия проекта на компьютере разработчика. Используется для разработки и проверки до публикации. Frontend: http://localhost:5173; Backend: http://127.0.0.1:3000; API: http://127.0.0.1:3000/api.

5. Production — опубликованная рабочая версия системы, которой пользуются реальные пользователи. Основные адреса: https://stubbornram.ru, https://api.stubbornram.ru, https://admin.stubbornram.ru.

6. Runtime — фактически запущенная версия программы, а не просто файлы, лежащие в репозитории. Например, Production runtime Backend — процесс, который реально запущен через PM2 на сервере.

7. Repository / репозиторий — набор файлов проекта, который отслеживается системой Git. В нём хранятся исходный код и документация проекта.

8. Git — система контроля версий. Сохраняет историю изменений файлов проекта и позволяет возвращаться к предыдущим версиям.

9. GitHub — удалённый репозиторий, в котором хранится отправленная (push) история проекта. Для Stubborn Ram он также участвует в публикации Frontend через GitHub Pages.

10. GitHub Pages — сервис публикации статического Frontend проекта. Текущий Production Frontend публикуется через workflow .github/workflows/deploy.yml.

11. git push — отправка локального commit в GitHub. Сам по себе git push не является Backend-деплоем на Production.

12. Deploy / deployment — перенос подготовленной версии в Production для фактического запуска. Для Frontend и Backend используются отдельные механизмы.

0.2. Основные части архитектуры

13. Архитектура — способ, которым части системы разделены и связаны между собой.

14. API — программный интерфейс, через который одна часть системы обращается к другой. В Stubborn Ram Frontend отправляет API-запросы в Backend.

15. API endpoint — конкретный адрес и операция API, например GET /api/auth/session или PUT /api/training/workouts/:id.

16. Route — серверный маршрут, который обрабатывает определённый API endpoint.

17. HTTP request — запрос от клиента к серверу. Может быть GET, POST, PUT, DELETE, OPTIONS и т. д.

18. HTTP response — ответ сервера на запрос. Содержит HTTP status code и обычно данные в JSON.

19. Status code — числовой результат HTTP-запроса. Например 200 — успешное выполнение, 201 — ресурс создан, 401 — пользователь не авторизован, 403 — доступ запрещён, 404 — ресурс или маршрут не найден.

20. JSON — текстовый формат структурированных данных, которым Frontend и Backend обмениваются через API.

21. Service layer — слой Frontend-сервисов, в котором находятся функции работы с конкретной областью приложения: auth, training, media и т. д. Сервис обращается к apiClient, а не к Backend напрямую.

22. apiClient — общий Frontend-модуль для выполнения API-запросов. В проекте: src/shared/lib/apiClient.js.

23. Каноническая цепочка API — основной путь запроса в приложении:

Component
↓
Service
↓
apiClient
↓
Backend API
↓
Fastify
↓
PostgreSQL / Storage

24. Component — Frontend-компонент React, который отвечает за часть интерфейса или поведения экрана.

25. Business logic / бизнес-логика — правила, по которым система принимает решения и выполняет действия пользователя.

26. Placeholder — экран или модуль-заглушка. Интерфейс существует, но полноценная функциональность за ним ещё не реализована.

27. Shell / application shell — базовая оболочка приложения: маршруты, навигация, общий UI и инфраструктурные механизмы, на которых работают отдельные модули.

0.3. Frontend и PWA

28. React — библиотека, на которой построен интерфейс Stubborn Ram.

29. Vite — инструмент сборки и локальной разработки Frontend. Локальный запуск выполняется через npm run dev.

30. React Router — система маршрутизации Frontend. В проекте используется createBrowserRouter и guarded routes.

31. Route (Frontend) — путь внутри приложения, например /app/training или /app/report.

32. Guarded route / защищённый маршрут — маршрут, доступ к которому разрешается только после проверки авторизации.

33. PWA (Progressive Web App) — веб-приложение, которое может работать как установленное приложение на устройстве. В текущей системе есть manifest и application shell, но нет полного offline-слоя.

34. Manifest — файл с описанием PWA, её названием, иконками и режимом запуска. В проекте: public/manifest.json.

35. Service Worker — специальный браузерный скрипт для offline-кэширования, фоновых обновлений и других PWA-возможностей. В текущем состоянии не реализован.

36. Deep-link — прямой переход браузера сразу на внутренний маршрут приложения, а не только на главную страницу.

37. 404.html — файл, который участвует в восстановлении внутренних маршрутов при публикации Frontend через GitHub Pages. В проекте находится в public/404.html.

0.4. Backend и сервер

38. Fastify — Node.js-фреймворк, используемый Stubborn Ram для HTTP/API Backend.

39. Node.js — среда выполнения JavaScript на сервере. Используется для запуска Backend.

40. server.js — основной entry point Backend. Локально находится в backend/server.js; Production runtime использует /opt/stubbornram/backend/server/server.js.

41. PM2 — менеджер процессов Node.js. Запускает Backend, следит за процессом и обеспечивает его автоматический запуск после перезагрузки сервера. Production process: stubbornram-backend.

42. Nginx — веб-сервер и reverse proxy перед Production Backend. Принимает HTTPS-запросы к api.stubbornram.ru и передаёт их на 127.0.0.1:3000.

43. Reverse proxy — сервер-посредник. Пользователь обращается к публичному адресу, а proxy передаёт запрос внутреннему Backend.

44. HTTPS — защищённая версия HTTP с шифрованием соединения. Используется для Production-доменов.

45. SSL/TLS certificate — сертификат, который подтверждает HTTPS-домен и позволяет установить защищённое TLS-соединение.

46. Domain / домен — адрес сервиса в интернете. В проекте:

stubbornram.ru — Frontend;

api.stubbornram.ru — Backend API;

admin.stubbornram.ru — pgAdmin.

47. Port / порт — сетевой номер, на котором слушает сервис. В проекте:

3000 — Fastify;

5432 — PostgreSQL;

5050 — pgAdmin;

443 — HTTPS;

80 — HTTP;

22 — SSH.

48. Bind / listener — внутренний адрес и порт, на котором конкретный сервис принимает соединения. Например Fastify в Production слушает 127.0.0.1:3000.

49. SSH — протокол удалённого безопасного доступа к Linux-серверу. В проекте используется для административного доступа к Selectel-серверу.

50. Selectel Cloud Server — Production-сервер проекта. На нём находятся Production Backend, PostgreSQL и pgAdmin.

51. systemd — система управления службами Linux. В проекте через неё работает, в частности, pgadmin4.service.

0.5. База данных

52. База данных (БД) — место, где система хранит структурированную информацию: пользователей, тренировки, сессии, media-метаданные и другие сущности.

53. PostgreSQL — система управления реляционной базой данных, которую использует Stubborn Ram.

54. Local PostgreSQL — отдельная база для разработки и тестирования на компьютере. 127.0.0.1:5432, database stubbornram, user stubbornram_app.

55. Production PostgreSQL — отдельная рабочая база Production. Она находится на Selectel-сервере и не используется как локальная тестовая база.

56. Database table / таблица — структура внутри БД для хранения однотипных записей. Например users, workouts, sessions, media.

57. Row / строка — одна конкретная запись в таблице БД.

58. Column / колонка — отдельное поле записи таблицы, например user_id, email, created_at.

59. Primary key (PK) — уникальный идентификатор записи в таблице.

60. Foreign key (FK) — связь одной таблицы с другой через идентификатор, например auth_tokens.user_id → users.id.

61. UUID — формат уникального идентификатора, используемый для ключевых сущностей текущей схемы.

62. Constraint / ограничение — правило БД, которое не позволяет сохранить некорректные данные. Примеры: primary key, foreign key, unique.

63. Unique constraint / unique index — правило, запрещающее дубликаты значения или комбинации значений.

64. Migration / миграция — версионируемое изменение структуры БД. Миграции находятся в backend/migrations/.

65. node-pg-migrate — инструмент, который применяет миграции PostgreSQL в проекте.

66. pgmigrations — таблица, в которой node-pg-migrate хранит информацию о применённых миграциях.

67. Transaction / транзакция — группа связанных операций БД, которая выполняется целиком или откатывается целиком. Используются BEGIN / COMMIT / ROLLBACK.

68. Read-only verification — проверка состояния БД или сервера без изменения данных и схемы.

69. Production DB snapshot — снимок количества записей и состава таблиц на конкретную дату. Это не постоянное значение и может изменяться.

70. 5918_training_templates — локальная миграция, создающая таблицы шаблонов тренировок. В Production она намеренно не применена и обозначена как CONTROLLED DIVERGENCE.

0.6. Авторизация и безопасность

71. Authentication / аутентификация — проверка, кто пользователь и имеет ли он действительную сессию.

72. Authorization / авторизация — проверка, имеет ли уже определённый пользователь право выполнять конкретное действие или читать данные.

73. Ownership check — проверка, принадлежат ли данные конкретному пользователю. Например workout проверяется по user_id, media — по owner_id.

74. Session / сессия — серверно поддерживаемое состояние авторизации пользователя между запросами.

75. Session cookie — cookie браузера, через которую клиент передаёт идентификатор сессии Backend.

76. HttpOnly — настройка cookie, которая запрещает JavaScript в браузере напрямую читать её значение.

77. Secure — настройка cookie, при которой она передаётся только через HTTPS.

78. SameSite — настройка cookie, определяющая правила её передачи между разными сайтами. В проекте для session cookie используется SameSite=none.

79. Token / токен — случайная секретная строка, используемая системой для подтверждения определённого действия или состояния.

80. auth_tokens — таблица для одноразовых verification/reset token-ов.

81. Argon2 — алгоритм хеширования паролей, используемый для хранения паролей в безопасном виде.

82. SHA-256 — криптографический хеш. В проекте используется, в частности, для хранения хеша session/token значений вместо исходного токена.

83. crypto.randomBytes(32) — генерация случайных 32 байт, используемая для session/token entropy.

84. CSRF — атака, при которой злоумышленник пытается заставить браузер авторизованного пользователя выполнить нежелательный state-changing запрос. В проекте минимальный Origin baseline уже проверяется; более широкий token-based CSRF enhancement отложен.

85. CORS — механизм браузерного контроля, определяющий, каким источникам разрешено делать cross-origin API-запросы. В проекте используется фиксированный allowlist.

86. Origin — источник веб-запроса: схема + домен + порт. Backend использует Origin-проверки для state-changing auth-запросов.

87. Rate limiting — ограничение количества запросов за определённый промежуток времени для защиты от злоупотреблений.

88. RBAC (Role-Based Access Control) — модель доступа на основе ролей. Например отдельные роли тренера и клиента. В текущем runtime полноценный RBAC не реализован.

89. MFA / 2FA — многофакторная/двухфакторная аутентификация. Для pgAdmin в текущем состоянии отложена.

90. getAuthenticatedUser() — Backend-проверка, которая получает и проверяет текущего авторизованного пользователя для защищённого маршрута.

0.7. Файлы и Object Storage

91. Object Storage — отдельное файловое хранилище для фото, видео, документов и других объектов. В проекте используется S3-compatible storage.

92. S3 / S3-compatible API — стандартный API для работы с объектным хранилищем. В проекте используется существующий Selectel S3-compatible endpoint.

93. Bucket — контейнер в Object Storage, внутри которого хранятся объекты проекта.

94. Object — отдельный файл, сохранённый в Object Storage.

95. Object key — путь/ключ, под которым объект хранится в bucket. В проекте ключ формируется сервером по user/media identity.

96. Signed URL — временная подписанная ссылка, позволяющая выполнить ограниченное действие с конкретным объектом без раскрытия постоянных credentials.

97. Signed upload URL — временная ссылка для загрузки файла в Object Storage.

98. Signed download URL — временная ссылка для скачивания файла из приватного Object Storage.

99. Media — данные о загруженных файлах в приложении: метаданные, ownership, статус и связь с объектом в Object Storage.

100.  media — PostgreSQL-таблица с metadata/ownership для media объектов.

101.  media_links — таблица связей media с другими сущностями. В подтверждённом Production snapshot на 19.09.2026 она была пустой.

102.  Media status — состояние media object в приложении. Используются UPLOADING, READY, PROCESSING, FAILED.

103.  storage.service.js — Backend-сервис работы с Object Storage.

104.  mediaService — Frontend-сервис работы с Media API.

0.8. Email и внешние сервисы

105. Unisender Go — внешний сервис отправки email, который используется Backend для verification и password recovery писем.

106. Email provider / провайдер email — внешний сервис, через который Backend отправляет письма.

107. Provider API — API внешнего сервиса, к которому обращается приложение. Для email это server-side вызов Unisender Go.

108. SMTP — стандартный протокол отправки email. В текущем проекте наличие полноценного рабочего SMTP path для pgAdmin MFA не подтверждено.

0.9. Training и данные приложения

109. Training / тренировки — основной продуктовый модуль, связанный с историей тренировок, упражнениями, подходами и материалами.

110. Workout — одна конкретная тренировка.

111. WorkoutExercise — упражнение внутри конкретной тренировки.

112. WorkoutSet — отдельный подход внутри конкретного упражнения.

113. Каноническая модель Training:

Workout
↓
WorkoutExercise
↓
WorkoutSet

114. Exercise catalog — каталог упражнений, который сейчас доступен для чтения через GET /api/training/exercises.

115. Training Materials — материалы, прикреплённые к подходу тренировки: комментарий и media.

116. Training Templates — шаблоны тренировок. В текущем Production runtime полноценный templates subsystem отсутствует; локальная миграция 5918 предусмотрена, но в Production не применена.

0.10. Документация и статусы

117. Canonical document — единственный актуальный документ, который считается основным для конкретного домена или системы.

118. System State — единая краткая карта текущего состояния системы: где что находится, как всё связано и что реально работает.

119. Audit — доказательный отчёт о том, что проверялось, какие факты подтверждены и какие проблемы/ограничения обнаружены. Audit не является заменой профильным canonical docs.

120. Remediation Log — журнал фактически выполненных исправлений и их проверки.

121. Roadmap — план развития и последовательность дальнейших работ.

122. Decision / Decision Record — зафиксированное архитектурное или продуктово-техническое решение и его обоснование.

123. Archive / legacy — старые или исторические документы, которые нужны для истории, сравнения или понимания происхождения текущего состояния, но не являются текущим canonical source.

124. Process documentation — документы с правилами разработки, ведения проекта, проверки и публикации изменений.

125. Module documentation — документация конкретного пользовательского модуля: его назначение, статус, поведение, UI, связи и дальнейшее развитие.

126. CURRENT — актуальное текущее состояние, подтверждённое для использования как текущая часть системы.

127. PARTIAL — часть функциональности подтверждена, но система ещё не полностью завершена.

128. PLACEHOLDER — существует UI/оболочка, но полноценная функциональность отсутствует.

129. NOT IMPLEMENTED — соответствующая runtime-функциональность не реализована.

130. DEFERRED / FUTURE — задача или возможность сознательно отложена на будущее и не входит в текущий обязательный scope.

131. VERIFIED / FIXED — VERIFIED — факт или исправление подтверждено проверкой в указанной области.

132. PARTIALLY VERIFIED — основная часть сценария подтверждена, но отдельный участок остаётся непроверенным.

133. NOT VERIFIED — достаточного доказательства выполнения/состояния пока нет.

134. CONTROLLED DIVERGENCE — намеренное различие между Local и Production, которое известно, объяснено и не требует автоматического устранения. В текущем проекте так классифицирована миграция 5918.

135. RUNTIME MISMATCH — фактически запущенная система отличается от текущего состояния репозитория или ожидаемой runtime-композиции.

136. Foundation Remediation — этап стабилизации существующего технического фундамента без разработки новых продуктовых модулей.

0.11. Быстрая карта «что за что отвечает»

React / Vite
→ интерфейс и сборка Frontend

Service
→ логика обращения конкретного модуля к API

apiClient
→ общий механизм API-запросов Frontend

Fastify
→ HTTP/API Backend

PostgreSQL
→ структурированные данные

Object Storage / S3
→ файлы пользователей

Nginx
→ принимает Production HTTPS и передаёт API в Backend

PM2
→ запускает и контролирует Backend-процесс

pgAdmin
→ веб-интерфейс администрирования PostgreSQL

Git
→ история версий проекта

GitHub
→ удалённое хранение Git-репозитория

GitHub Pages
→ публикация Production Frontend

Unisender Go
→ отправка email

SYSTEM_STATE_FINAL.md
→ единая карта текущего проекта

Каноническая документация проекта хранится в папке `Docs Updated/`.
Legacy-путь `docs/...` не является текущим источником истины, если реальная структура репозитория указывает на `Docs Updated/`.

AUDIT
→ доказательная база

Remediation Log
→ история исправлений и их проверки

Roadmap
→ план дальнейших работ

0.12. Основные адреса и пути

Production Frontend
https://stubbornram.ru

Production API
https://api.stubbornram.ru/api

Admin / pgAdmin
https://admin.stubbornram.ru

Local Frontend
http://localhost:5173

Local Backend
http://127.0.0.1:3000

Local API
http://127.0.0.1:3000/api

Local PostgreSQL
127.0.0.1:5432

Production PostgreSQL
127.0.0.1:5432 (на Selectel-сервере)

Production Fastify
127.0.0.1:3000 (на Selectel-сервере)

Production pgAdmin
127.0.0.1:5050 (внутренний listener)

Local Backend source
D:\CRM-Platform Stubborn Ram\backend

Production Backend runtime
/opt/stubbornram/backend/server

Примечание: этот раздел описывает термины именно в контексте Stubborn Ram.
Для деталей конкретного модуля, endpoint-а, таблицы или security-механизма
следует переходить к соответствующему canonical document.

# 1. ПРОЕКТ

**Название:** Stubborn Ram

**Тип:** PWA/CRM-платформа для тренера и клиентов.

**Основная идея:** единая система с клиентским и тренерским контуром, где frontend,
Backend API, PostgreSQL и общее Object Storage работают как согласованная архитектура.

**Основные продуктовые направления:**

- кабинет пользователя;
- тренировки;
- отчёты;
- чат/коммуникации;
- питание;
- вес / фото / замеры;
- аналитика;
- библиотека;
- уведомления;
- тренер-клиент взаимодействие.

Большая часть перечисленных направлений пока является planned/placeholder и не
считается реализованной только из-за наличия UI-маршрута.

---

# 2. ФУНДАМЕНТАЛЬНАЯ МОДЕЛЬ LOCAL VS PRODUCTION

Принятое правило:

```text
LOCAL = разработка + проверка
PRODUCTION = опубликованная рабочая система
```

1. Localhost и Production должны быть функционально одинаковыми системами после
   переноса готовой версии.
2. Local может временно опережать Production во время разработки.
3. Local и Production разделены по данным и инфраструктуре:
   - разные БД;
   - разные media/file storage;
   - разные secrets/env;
   - разные адреса/домены;
   - тестовые данные в Local и реальные данные в Production.
4. Production DB не используется как локальная тестовая БД.
5. Изменения сначала проверяются локально, затем отдельным шагом публикуются в Production.

---

# 3. ЕЖЕДНЕВНЫЙ ЦИКЛ РАЗРАБОТКИ

## Утром: локальный запуск

1. Открыть VS Code.
2. Открыть проект:

```text
D:\CRM-Platform Stubborn Ram
```

3. Открыть терминал VS Code.
4. Запустить локальный Backend:

```powershell
cd "D:\CRM-Platform Stubborn Ram\backend"
npm start
```

5. Запустить локальный Frontend штатной командой Vite-проекта:

```powershell
npm run dev
```

Локальный frontend использует:

```text
http://localhost:5173
```

Локальный Backend:

```text
http://127.0.0.1:3000
```

Local API base:

```text
http://127.0.0.1:3000/api
```

## В процессе работы

```text
изменил
↓
локально проверил
↓
при необходимости проверил DB/migration
↓
повторно проверил flow
↓
подготовил production rollout
```

Миграции запускаются отдельно и не выполняются автоматически при `npm start`.

```text
npm start
```

только запускает Backend.

```text
npm run migrate
```

запускает миграции отдельно.

## Сохранность версии

Git хранит код и документацию:

```text
Код + docs → Git / GitHub
```

Git не является хранилищем:

```text
PostgreSQL data   → PostgreSQL
Фото/видео        → Object Storage
Secrets           → .env / server config
```

---

# 4. КАК ПУБЛИКУЕТСЯ PRODUCTION

## Frontend

Production frontend публикуется через GitHub Pages.

Подтверждённый workflow:

```text
push в main
↓
.github/workflows/deploy.yml
↓
npm run build
↓
GitHub Pages
↓
stubbornram.ru
```

Последний проверенный workflow запуск в audit был успешным.

## Backend

Backend обновляется отдельным production rollout в текущий runtime path.

Подтверждённый механизм, использованный в Foundation Remediation:

```text
backend package / deployment artifact
↓
/opt/stubbornram/backend/server
↓
PM2 restart
↓
verify
```

В ходе Foundation Remediation использовался существующий package rollout с
`dg1-backend-package.tgz` и `_dg1_deploy.sh`.

`git push` сам по себе не является backend deploy.

---

# 5. БАЗОВАЯ АРХИТЕКТУРА

## Local

```text
Windows
↓
React + Vite
↓
Service layer
↓
apiClient
↓
Fastify Backend
↓
PostgreSQL
```

## Production frontend/API

```text
stubbornram.ru
↓
GitHub Pages
```

```text
api.stubbornram.ru
↓
Nginx / HTTPS
↓
Fastify Backend
↓
PostgreSQL
```

## Media

```text
React
↓
Service
↓
Backend Media API
↓
Signed URL
↓
Private Object Storage / S3
```

### Главное архитектурное правило frontend

Каноническая цепочка:

```text
Component
↓
Service
↓
apiClient
↓
Backend API
↓
Fastify
↓
PostgreSQL / Storage
```

Допустимое исключение:

```text
mediaService
↓
signed S3 upload URL
↓
PUT directly to Object Storage
```

Это не считается backend bypass.

Известное исключение/долг:

```text
ReportPlaceholderPage
↓
direct backend fetch
↓
hardcoded localhost URL
```

Оно вынесено в deferred scope.

---

# 6. FRONTEND

## Основной стек

Подтверждено:

- React;
- Vite;
- React Router с `createBrowserRouter`;
- guarded application routes;
- общий `src/shared/lib/apiClient.js`;
- service layer для основных реализованных цепочек.

## Текущая структура слоёв

```text
src/
├── app/
├── modules/
├── services/
├── shared/
├── components/
├── pages/
├── contexts/
├── loading/
├── assets/
└── public/
```

Отдельного `src/api/` слоя нет. Роль общего API-слоя выполняет
`src/shared/lib/apiClient.js`.

## Визуальная основа

Текущий frontend использует подтверждённое направление:

- тёмный минималистичный визуальный стиль;
- шрифт Comfortaa;
- карточная структура интерфейса.

Подробные визуальные решения отдельных экранов не дублируются здесь и должны
храниться в канонических module/design documentation.

## Home / ModuleGrid

Home использует `ModuleGrid` со статическим массивом модулей/route-links.

Это shell-навигация, а не доказательство реализации каждого модуля.

---

# 7. BACKEND

**Локальный путь:**

```text
D:\CRM-Platform Stubborn Ram\backend
```

**Entry point:**

```text
backend/server.js
```

**Основные repository modules:**

```text
backend/modules/
├── auth/
├── db/
├── email/
├── leads/
├── training/
├── media/
└── storage/
```

### Backend architecture

1. Fastify является HTTP/API-слоем.
2. Route handlers содержат validation, orchestration и SQL; отдельного repository/data-access слоя нет.
3. Для auth/leads используется Zod.
4. Для training/media значительная часть validation реализована manual guards.
5. Критичные multi-step DB operations используют `BEGIN / COMMIT / ROLLBACK`.

---

# 8. API ARCHITECTURE

## Реально используемые сервисные цепочки

### Auth

```text
AuthContext
↓
authService
↓
apiClient
↓
/api/auth/*
```

### Leads / questionnaire

```text
Questionnaire
↓
leadService
↓
apiClient
↓
POST /api/leads
```

### Training

```text
TrainingPage
↓
trainingService
↓
apiClient
↓
/api/training/*
```

### Training materials

```text
TrainingExerciseCard
↓
trainingMaterialsService
↓
apiClient
↓
GET/PUT /api/training/sets/:setId/materials
```

### Media

```text
Photo/Media UI
↓
mediaService
↓
apiClient
↓
/api/media/*
```

После создания signed URL бинарный upload выполняется напрямую в S3 по signed URL.

---

# 9. LOCAL POSTGRESQL

Local Backend использует локальную PostgreSQL.

Подключение:

```text
Host: 127.0.0.1
Port: 5432
Database: stubbornram
User: stubbornram_app
```

Конфигурация миграций:

```text
backend/database.cjs
```

Миграции:

```text
backend/migrations/
```

Диапазон актуальных migration files:

```text
1788859125911 ... 1788859125921
```

`1788859125918_training_templates.js` существует локально, но отсутствие `5918`
в Production является осознанной `CONTROLLED DIVERGENCE` на текущем foundation scope.

---

# 10. PRODUCTION POSTGRESQL

Production PostgreSQL находится на том же Selectel Cloud Server, что и
production Backend, но остаётся отдельной Production DB относительно Local DB.

Внешний прямой доступ к PostgreSQL закрыт.

Production listener:

```text
127.0.0.1:5432
```

Database:

```text
stubbornram
```

Application role:

```text
stubbornram_app
```

## Production inventory на 19.09.2026

Подтверждены 12 таблиц:

```text
auth_tokens
exercises
leads
media
media_links
pgmigrations
profiles
sessions
training_set_notes
users
workout_exercises
workout_sets
```

Дополнительно подтверждена sequence:

```text
pgmigrations_id_seq
```

### Snapshot объёма данных

```text
exercises           232

auth_tokens          14
sessions              7
users                 5
profiles              4
leads                 3
workout_exercises     3
media                 2
workout_sets         2
pgmigrations         10
media_links           0
training_set_notes    0
```

Всего:

```text
272 строки без pgmigrations
282 строк включая pgmigrations
```

Это point-in-time read-only snapshot на 19.09.2026, а не постоянный счётчик.

### Production migration state

Применены:

```text
5911
5912
5913
5914
5915
5916
5917
5919
5920
5921
```

Отсутствует:

```text
5918 — training_templates
```

### Главный вывод по 5918

`5918` создаёт только template tables.

Подтверждено, что текущие in-scope foundation flows не требуют этих таблиц.

Поэтому:

```text
5918 = CONTROLLED DIVERGENCE
```

Применение `5918` не является текущей задачей.

---

# 11. DATABASE / ОСНОВНЫЕ СУЩНОСТИ

## Пользователи и авторизация

```text
users
profiles
sessions
auth_tokens
```

## Leads

```text
leads
```

## Training

```text
exercises
workouts
workout_exercises
workout_sets
training_set_notes
```

## Media

```text
media
media_links
```

## Training Templates

Локальный migration layer предусматривает:

```text
training_templates
training_template_exercises
training_template_sets
```

Но эти таблицы отсутствуют в Production.

### Каноническая модель тренировки

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Шаблон не заменяет фактическую историю тренировки.

---

# 12. AUTH / СЕССИИ

## Реализованные основные flows

```text
Registration
↓
Email verification
↓
Login
↓
Session restore
↓
Current-session logout
```

Также реализованы:

- password reset request;
- password reset complete;
- resend verification.

### Registration

```text
RegisterModal
↓
signUp
↓
POST /api/auth/register
↓
validation
↓
duplicate-email check
↓
transaction: users + profiles
↓
auth_tokens
↓
verification email
```

При регистрации текущая сессия не создаётся.
Login требует подтверждённый email.

### Login

```text
POST /api/auth/login
↓
validate credentials
↓
verify Argon2 hash
↓
check email_verified_at
↓
create session
```

### Session

Сессия использует cookie:

```text
name: stubbornram_session
HttpOnly: true
Secure: true
SameSite: none
Path: /
maxAge: 30 days
```

Session token:

- генерируется через `crypto.randomBytes(32)`;
- в БД хранится только SHA-256 hash token.

### Password security

Используется:

```text
argon2.hash
argon2.verify
```

Plaintext password в БД не хранится.

Password reset использует одноразовый токен с expiry и после успешного reset
инвалидирует существующие sessions.

### Email verification / recovery tokens

Подтверждено:

- entropy через `randomBytes(32)`;
- SHA-256 hash перед сохранением;
- expiration;
- `used_at` для single-use;
- user binding через `auth_tokens.user_id`;
- ограничение дубликатов активных токенов через partial unique index.

---

# 13. SECURITY

## Что реально подтверждено

### Authentication / ownership

Защищённые существующие маршруты используют `getAuthenticatedUser()`.

Ownership checks подтверждены для существующих data paths.

Примеры:

```text
workouts → user_id
media → owner_id
set materials → ownership через workout.user_id
```

### Минимальная CSRF / Origin защита

Для cookie-auth реализована проверка допустимого Origin.

Production verification подтверждала:

```text
разрешённый Origin → 200
foreign Origin → 403
OPTIONS preflight → 204
```

Более широкое token-based CSRF enhancement остаётся deferred/future.

### CORS

Allowlist содержит production и local origins.

`credentials: true` используется совместно с cookie-auth.

### Rate limiting

Подтверждены route-specific limits для критических auth endpoints.

Leads также имеет ограничение.

Глобальный rate limit остаётся выключенным:

```text
global: false
```

### XSS / input handling

В проверенном frontend не обнаружены прямые опасные DOM sinks уровня
`dangerouslySetInnerHTML`.

Пользовательские значения в email HTML проходят `escapeHtml()`.

### SQL

В проверенных routes используются параметризованные SQL queries.

### Database role

Production application DB role не является superuser и не имеет прав
создавать роли/БД согласно audit verification.

## Ограничения безопасности, которые остаются

1. Полноценный role-based trainer/client RBAC не реализован.
2. `logout-all-devices` не реализован и отложен.
3. Расширенная token-based CSRF защита не реализована.
4. Для части тяжёлых authenticated endpoints отсутствует отдельный route-level rate limit.
5. Полный control-plane security набор S3 не может быть подтверждён provider API:
   `GetPublicAccessBlock` и `GetBucketPolicyStatus` возвращают `501 NotImplemented`.
6. Полный production chaos/failure baseline не проводился.

---

# 14. PRODUCTION SERVER

**Провайдер:** Selectel Cloud Server.

**Public IP:**

```text
161.104.49.107
```

## Backend runtime

```text
/opt/stubbornram/backend/server
```

PM2 application:

```text
stubbornram-backend
```

Fastify bind:

```text
127.0.0.1:3000
```

PM2 autostart включён.

## Nginx

API domain:

```text
api.stubbornram.ru
```

Proxy:

```text
api.stubbornram.ru
↓
127.0.0.1:3000
```

Внешний прямой доступ к `3000` закрыт.

## Production public surfaces

```text
22   SSH
80   HTTP ingress
443  HTTPS ingress
```

Внешний прямой доступ к:

```text
3000 Fastify
5432 PostgreSQL
5050 pgAdmin
```

закрыт.

---

# 15. ADMIN PANEL / PGADMIN

Домен:

```text
admin.stubbornram.ru
```

После remediation:

- HTTPS исправлен;
- сертификат соответствует `admin.stubbornram.ru`;
- HTTP редиректит на HTTPS;
- pgAdmin обновлён до `9.18`;
- `pgadmin4.service` активен;
- внутренний listener: `127.0.0.1:5050`;
- прямой внешний доступ к `5050` закрыт.

Сохранён профиль PostgreSQL:

```text
Stubborn Ram PostgreSQL
host: 127.0.0.1
port: 5432
db: stubbornram
user: stubbornram_app
```

Browser login и соединение с PostgreSQL через pgAdmin были проверены.

### 2FA / MFA

Не реализовано в текущем admin hardening.

Статус:

```text
DEFERRED / FUTURE
```

Причина: нет подтверждённого рабочего SMTP path для email MFA и не настроен
authenticator MFA.

---

# 16. OBJECT STORAGE / MEDIA

## Storage architecture

Production и Local используют существующий S3-compatible storage layer.

Storage service:

```text
backend/modules/storage/storage.service.js
```

Storage plugin:

```text
backend/modules/storage/storage.plugin.js
```

Используется AWS SDK / S3-compatible API.

## Production configuration

Подтверждены runtime variables:

```text
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

Значения секретов в документацию не записываются.

## Media tables

```text
media
media_links
```

`media` поддерживает статусы:

```text
UPLOADING
READY
PROCESSING
FAILED
```

Media ownership:

```text
owner_id
↕
authenticated user
```

Object key формируется сервером по user/media identity.

## Media API

Подтверждённые endpoints:

```text
POST /api/media/upload
POST /api/media/:id/complete
GET  /api/media/:id
DELETE /api/media/:id
```

### Upload flow

```text
authenticated request
↓
create media row (UPLOADING)
↓
signed upload URL
↓
PUT object to S3 signed URL
↓
complete
↓
headObject validation
↓
READY / FAILED
```

### Download flow

```text
GET /api/media/:id
↓
authentication + ownership
↓
signed download URL
↓
private object
```

### Production verification

Подтверждён полный synthetic production flow:

```text
upload-init
↓
signed upload
↓
complete
↓
signed download
↓
content match
↓
delete
```

Anonymous direct object read/write были заблокированы (`403`).

## S3 control-plane limitation

Read-only проверены:

- `GetBucketAcl`;
- `GetBucketPolicy`.

Provider возвращает:

```text
GetPublicAccessBlock → 501 NotImplemented
GetBucketPolicyStatus → 501 NotImplemented
```

Поэтому provider-level полный набор control-plane атрибутов остаётся частично
непроверяемым, хотя фактическое private behavior production bucket подтверждено.

---

# 17. TRAINING

## Статус

Training core — рабочая и подтверждённая foundation-часть системы.
Общий Training domain остаётся `PARTIAL`, потому что отдельные подсистемы
(exercises CRUD, templates и часть edge/reliability behavior) ещё не завершены.

## Каноническая persistence-модель

```text
Workout
↓
WorkoutExercise
↓
WorkoutSet
```

Основные таблицы:

```text
exercises
workouts
workout_exercises
workout_sets
training_set_notes
```

## Training History

Flow:

```text
TrainingHistoryPage
↓
getCompletedWorkouts()
↓
apiClient
↓
GET /api/training/workouts
↓
Backend
↓
workouts
```

Подтверждено:

- список истории;
- открытие `/app/training/:id`;
- загрузка workout detail;
- delete workout;
- update workout;
- loading/error/empty states.

## Create / Edit Workout

Entry points:

```text
/app/training/create
/app/training/new
/app/training/:id
```

Editor:

```text
TrainingPage
↓
ExercisePickerOverlay / ExerciseList
↓
exercises / sets / comments / time / type
↓
saveCompletedWorkout() или updateWorkout()
```

Backend writes выполняются транзакционно для:

```text
workouts
workout_exercises
workout_sets
```

Поддерживается:

- порядок упражнений/подходов через `position`;
- start/end;
- duration;
- workout type;
- comment;
- update existing workout;
- UI lock через `isSaving`.

## Training persistence verification

Подтвержден runtime smoke:

```text
PUT /api/training/workouts/:id
↓
200
↓
reload
↓
сохранённые данные остаются
```

Проверка выполнялась на Local и Production для существующего workout flow.

## Exercises

Реализовано:

```text
GET /api/training/exercises
```

Frontend поддерживает search/filter.

Не реализовано:

- полноценный user-exercise CRUD;
- backend exercise CRUD endpoints;
- pagination.

Кнопка создания упражнения ведёт в placeholder builder.

## Training Materials

API:

```text
GET /api/training/sets/:setId/materials
PUT /api/training/sets/:setId/materials
```

Frontend write-path подключён через:

```text
TrainingExerciseCard
↓
trainingMaterialsService.saveSetMaterials
↓
apiClient
↓
PUT /api/training/sets/:setId/materials
```

Подтверждено runtime:

- изменение комментария через UI;
- PUT = `200`;
- GET refresh = `200`;
- persistence после reload;
- deny path = `404 SET_NOT_FOUND`.

Для media в материалах используется существующий media service и общий S3 layer.

## Training Templates

Current runtime status:

```text
PLACEHOLDER
```

В текущем runtime отсутствуют:

- templates service;
- templates API routes;
- production template tables;
- реальный persistence flow.

`5918_training_templates` существует в local migration layer, но не применён в Production.

---

# 18. REPORTS

Текущий runtime:

```text
/app/report
```

Страница — placeholder/media shell.

Не реализованы как полноценная система:

- report backend;
- report persistence;
- DRAFT / SUBMITTED / REVIEWED lifecycle;
- report-specific API;
- report-specific media binding.

Известное архитектурное исключение:

```text
ReportPlaceholderPage
↓
direct backend fetch
↓
hardcoded localhost URL
```

Статус:

```text
PLACEHOLDER / FRONTEND-ONLY / DEFERRED
```

---

# 19. CHAT / COMMUNICATION

Route:

```text
/app/chat
```

Текущий runtime:

```text
static UI shell / placeholder
```

Не обнаружены:

- `chatService`;
- `/api/chat*`;
- chat DB tables;
- WebSocket;
- SSE;
- polling;
- backend persistence.

Comments также представлены placeholder UI.

Статус:

```text
NOT IMPLEMENTED / PLACEHOLDER
```

---

# 20. NUTRITION

Route:

```text
/app/nutrition
```

Текущий runtime:

```text
NutritionPlaceholderPage
```

Нет подтверждённых:

- nutrition service;
- `/api/nutrition*`;
- nutrition DB tables;
- persistence flow.

Статус:

```text
NOT IMPLEMENTED / PLACEHOLDER
```

---

# 21. PROGRAMS

Route:

```text
/app/training/programs
```

UI shell существует.

Нет:

- service layer;
- backend API;
- production DB model;
- assignment/permission runtime model.

Статус:

```text
NOT IMPLEMENTED / PLACEHOLDER
```

---

# 22. TRAINER / CLIENT RELATIONSHIP И PERMISSIONS

Текущая рабочая модель существующих защищённых путей:

```text
Authentication
↓
Ownership check
↓
Business logic
↓
DB / Storage
```

Полного RBAC нет.

Не реализованы как runtime subsystem:

- `coach_client_relationships` или аналогичные таблицы;
- role-based trainer/client guards;
- invitation/assignment flow;
- action-based permissions matrix;
- переключение тренерского/клиентского кабинета.

Это остаётся продуктовой planned capability.

---

# 23. PROFILE / HOME / QUESTIONNAIRE

## Profile

Current status:

```text
PARTIAL
```

Подтверждено:

- чтение identity/profile-related fields из session;
- logout.

Полного profile edit persistence flow нет.

## Home / Dashboard

Home существует как application shell.

`ModuleGrid` отображает статический набор module links.

Полноценного dashboard data API нет.

Статус:

```text
PARTIAL / SHELL
```

## Questionnaire

### Coaching questionnaire

Подтверждён путь:

```text
Questionnaire
↓
leadService
↓
POST /api/leads
↓
Zod validation
↓
leads
```

Есть local draft/restore behavior.

### Program questionnaire

Остаётся placeholder.

---

# 24. WEIGHT / ACTIVITY / PHOTO / MEASUREMENTS / LIBRARY / ANALYTICS / NOTIFICATIONS

## Weight

Placeholder/front-only state.

## Activity

Placeholder/front-only state.

## Photo & measurements

Есть frontend shell и использование общего media infrastructure там, где это
реально подключено, но полноценного domain persistence flow не подтверждено.

## Library

Placeholder/front-only state; полноценного backend/data flow не подтверждено.

## Analytics

Placeholder screen; backend analytics subsystem не подтверждён.

## Notifications

В Home есть статические notification cards.

Не обнаружены:

- notification service;
- `/api/notifications`;
- DB persistence;
- Web Push / PushManager registration.

Статус:

```text
PLACEHOLDER / STATIC UI
```

---

# 25. PWA / APPLICATION SHELL

Подтверждено:

- `public/manifest.json` существует;
- manifest доступен runtime;
- `display: standalone` и icons присутствуют;
- `public/404.html` участвует в route recovery;
- `index.html` восстанавливает deep-link path;
- `AuthProvider` восстанавливает session при старте;
- `AuthGuard` защищает private routes.

Не реализовано:

- Service Worker registration;
- `sw.js` runtime;
- offline caching;
- update strategy;
- push notifications.

Runtime check:

```text
GET /manifest.json → 200
GET /sw.js → 404
```

Статус:

```text
PARTIAL
```

---

# 26. EMAIL

Provider:

```text
Unisender Go
```

Backend использует server-side provider adapter.

В email flows задействованы:

- registration verification;
- resend verification;
- password recovery.

### Ограничение

Production failure-сценарий «user создан, email provider failed» не воспроизведён
в безопасном режиме.

Поэтому F1-SEC-01 остаётся:

```text
PARTIALLY VERIFIED
```

при наличии recovery path через resend verification.

---

# 27. LEADS

Таблица:

```text
leads
```

Lead creation/persistence подтверждены через questionnaire/coaching flow.

Backend validation использует Zod.

Для публичного endpoint действует route-specific rate limit.

---

# 28. ДОКУМЕНТАЦИЯ ПРОЕКТА

Актуальная логика документации:

```text
ARCHITECTURE   → общая техническая архитектура и структура
SYSTEMS        → сквозные технические системы
modules        → продуктовые модули
flows          → жизненные/пользовательские процессы
PROCESS        → правила разработки и ведения проекта
ROADMAP        → планы
DECISIONS      → принятые решения
SYSTEM_STATE   → текущая единая карта системы
AUDIT          → доказательная база и история аудита
ARCHIVE        → исторические/legacy материалы
internal       → внутренние служебные материалы
```

## Роль этого файла

`SYSTEM_STATE_FINAL.md`

→ единая краткая карта текущего состояния.

Он не заменяет:

- forensic audit;
- remediation log;
- roadmap;
- module-specific product specifications.

Специализированные документы являются детализацией соответствующих разделов.

---

# 29. СОХРАННОСТЬ ДАННЫХ

Клиентские данные находятся отдельно от Git:

```text
PostgreSQL
Object Storage
```

Production secrets не должны попадать в документацию или Git.

Backend `.env` используется как конфигурационный источник secrets и не должен
копироваться из Local в Production или наоборот.

При production backend rollout в Foundation Remediation соблюдалось правило:

```text
NO MIGRATIONS
NO .env overwrite
```

для code-only deployment scope.

Подтверждены rollback backups отдельных production runtime/admin artifacts.

При этом единая долгосрочная backup/restore политика с полным retention/SLA
не является предметом этого System State и требует отдельной фиксации, если она будет утверждена.

---

# 30. DEVELOPMENT RULES

Основной порядок:

```text
ПРОВЕРКА
↓
ОБСУЖДЕНИЕ / РЕШЕНИЕ
↓
ИЗМЕНЕНИЕ
↓
ВЕРИФИКАЦИЯ
↓
ПУБЛИКАЦИЯ
```

Для DB changes:

```text
изменение схемы
↓
migration
↓
verification
↓
только затем production application
```

Для infrastructure changes:

```text
факт
↓
read-only verification
↓
decision gate при необходимости
↓
backup
↓
change
↓
restart/reload
↓
verify
↓
rollback при необходимости
```

Не следует выдавать placeholder UI за реализованный subsystem.

Не следует выдавать planned/deferred как current implementation.

---

# 31. ЧТО УЖЕ РЕАЛИЗОВАНО И ПОДТВЕРЖДЕНО

## Foundation / Infrastructure

- Selectel production server;
- Nginx;
- HTTPS API;
- PM2;
- Fastify backend;
- production PostgreSQL;
- pgAdmin 9.18;
- HTTPS admin panel;
- internal-only PostgreSQL/Backend/pgAdmin ports;
- GitHub Pages frontend deployment;
- Local PostgreSQL;
- migration system.

## Application

- React + Vite application shell;
- guarded routes;
- Auth core;
- session restore;
- current-session logout;
- password reset;
- email verification;
- resend verification;
- leads/questionnaire coaching flow;
- training history;
- create/update/delete workout;
- exercises read/search/filter;
- training materials read/write path;
- ownership checks;
- shared media/S3 backend layer;
- production media flow;
- PWA manifest/deep-link shell.

---

# 32. ЧТО ОСТАЁТСЯ PARTIAL / PLACEHOLDER / DEFERRED

## Partial

- security foundation как целое;
- sessions как целое;
- Profile;
- Home/Dashboard;
- Questionnaire;
- Training domain;
- Exercises;
- Training Materials как часть broader training UX;
- S3 control-plane verification;
- PWA;
- unified error handling;
- global API architecture consistency.

## Placeholder / Not Implemented

- RBAC trainer/client;
- trainer-client relationship subsystem;
- profile edit persistence;
- dashboard data API;
- training templates runtime;
- exercise CRUD;
- Reports backend/persistence;
- Chat backend/realtime;
- Nutrition data flow;
- Programs data flow;
- Notifications backend/push;
- Analytics backend;
- полноценная Library data flow;
- Comments subsystem.

## Deferred / Future

- report direct-fetch bypass remediation;
- logout-all-devices;
- broader token-based CSRF enhancement;
- pgAdmin 2FA/MFA;
- future template runtime enablement;
- дальнейшие product-development features по основному roadmap.

---

# 33. FOUNDATION REMEDIATION — ФИНАЛЬНОЕ СОСТОЯНИЕ

**Статус:**

```text
COMPLETED WITH DOCUMENTED LIMITATIONS
```

Закрыты и подтверждены в рамках Foundation:

- F1-PST-01 — Training materials write path — `FIXED — VERIFIED`;
- F1-PST-02 — materials error/ownership consistency — `VERIFIED`;
- F1-API-01 — in-scope API contract — `VERIFIED`;
- F1-ENV-01 — Local/Production consistency — `FIXED — VERIFIED`;
- F1-MEDIA-DEPLOY — production media/storage alignment — `FIXED — VERIFIED`;
- F1-NV-01 — production object storage — `FIXED — VERIFIED`;
- F1-NV-02 — production stability/failure baseline — `VERIFIED`;
- F1-NV-03 — external/private infrastructure visibility — `VERIFIED`;
- F1-SEC-02 — minimal CSRF/origin baseline — `FIXED — VERIFIED`;
- F1-SEC-03 — expired session cleanup — `FIXED — VERIFIED`.

### Частично подтверждено

```text
F1-SEC-01
```

Причина: production email-failure сценарий не воспроизводился по safe-policy.

### Current blocked items

```text
0
```

Исторические `BLOCKED` entries были закрыты или переведены в documented
limitations после более поздних verification steps.

---

# 34. КРАТКАЯ КАРТА СИСТЕМЫ

```text
                         STUBBORN RAM
                              │
                ┌─────────────┴─────────────┐
                │                           │
             LOCAL                     PRODUCTION
                │                           │
        React + Vite                    Frontend
                │                           │
            Service                      GitHub Pages
                │                           │
            apiClient                      │
                │                           │
            Fastify <────────────── api.stubbornram.ru
                │                           │
        ┌───────┴────────┐                  │
        │                │                  │
   PostgreSQL        Object Storage         │
        │                │                  │
        └──────────┬─────┘                  │
                   │                        │
              persisted data          authenticated users
```

Основной рабочий слой приложения:

```text
Frontend
↓
Service
↓
apiClient
↓
Backend API
↓
Fastify
↓
PostgreSQL
```

Файловый слой:

```text
Backend Media API
↓
signed URL
↓
Private S3 Object Storage
```

Авторизация:

```text
Cookie session
↓
Backend auth
↓
users / sessions / auth_tokens
↓
ownership checks
```

---

# 35. КОМАНДЫ БЫСТРОГО ДОСТУПА

## Запустить локальный Backend

```powershell
cd "D:\CRM-Platform Stubborn Ram\backend"
npm start
```

## Запустить локальный Frontend

```powershell
npm run dev
```

## Проверить Local health

```powershell
Invoke-WebRequest http://127.0.0.1:3000/health | Select-Object StatusCode,Content
```

## Подключиться к Local PostgreSQL

```powershell
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -p 5432 -U stubbornram_app -d stubbornram
```

## Посмотреть таблицы

```sql
\dt
```

## Посмотреть применённые миграции

```sql
SELECT name, run_on FROM pgmigrations ORDER BY name;
```

## Dry-run миграций

```powershell
npm run migrate -- up --dry-run -f database.cjs
```

## Применить миграции

```powershell
npm run migrate -- up -f database.cjs
```

Перед production применением миграций требуется отдельная проверка scope и decision.

---

# 36. ИСТОЧНИКИ АКТУАЛЬНОГО СОСТОЯНИЯ

Этот System State собран по следующим материалам:

1. `PROJECT_FULL_AUDIT_2026-09-19.md`
   - основной forensic/factual inventory;
   - архитектура frontend/backend;
   - API chains;
   - security;
   - database;
   - production runtime;
   - module status;
   - PWA;
   - documentation conflicts;
   - final actual system model.

2. `PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md`
   - фактические изменения после первоначального audit;
   - runtime verification;
   - security/media/training remediation;
   - production rollout;
   - final Foundation closure.

3. `PROJECT_REMEDIATION_ROADMAP_2026-09-19.md`
   - scope Foundation;
   - decision gates;
   - normalized backlog;
   - deferred items;
   - Definition of Done;
   - финальное состояние Foundation.

4. `SYSTEM_STATE_UPDATED_FULL.md`
   - использован как структурный шаблон и формат единой карты системы;
   - устаревшие факты из него не переносятся автоматически.

При конфликте между промежуточными и финальными записями приоритет имеет
более позднее подтверждённое состояние из remediation/closure и поздних
addendum audit.

---

# 37. ТЕКУЩАЯ ТОЧКА ПРОЕКТА

Foundation Remediation завершён с документированными ограничениями.

Стабильный текущий фундамент:

```text
React/Vite
↓
Service + apiClient
↓
Fastify
↓
PostgreSQL
```

и:

```text
Backend Media API
↓
Private S3 Object Storage
```

Рабочее ядро включает:

```text
Auth
Session
Leads / Questionnaire
Training
Training Materials
Media
Production infrastructure
```

Следующая работа — не новый Foundation remediation pass, а развитие продукта
по основному roadmap с сохранением текущего verified baseline.

Главное правило дальнейшего ведения документации:

```text
Фактическое изменение системы
↓
проверка
↓
обновление профильного canonical document
↓
обновление SYSTEM_STATE_FINAL
```

`PROJECT_FULL_AUDIT`, `PROJECT_FOUNDATION_REMEDIATION_LOG` и
`PROJECT_REMEDIATION_ROADMAP` сохраняются как доказательная и историческая база,
а не как единственное место хранения текущего системного состояния.
