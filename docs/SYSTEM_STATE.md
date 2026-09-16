# Stubborn Ram --- SYSTEM_STATE.md

> Единый рабочий файл состояния инфраструктуры проекта Stubborn Ram.
> Обновляется после каждого завершённого технического шага или изменения
> архитектуры. Назначение: быстро восстановить актуальную картину
> системы в новом чате без повторного объяснения проекта.

## 1. Цель этого рабочего цикла

Привести серверную, базовую и локальную инфраструктуру Stubborn Ram к
современной, понятной и безопасной схеме разработки:

-   локальная разработка отдельно от production;
-   локальная БД отдельно от production БД;
-   понятный и повторяемый процесс миграций;
-   backend является единственной точкой доступа приложения к БД;
-   production БД не используется для тестов;
-   секреты не попадают в Git;
-   сервер и PostgreSQL не открываются наружу без необходимости;
-   резервное копирование и восстановление должны быть понятны;
-   deployment должен быть повторяемым и предсказуемым;
-   структура backend, конфигурации и документация должны
    соответствовать реальному состоянию системы.

## 2. Главный принцип работы

Для каждого технического изменения:

**ПРОВЕРКА → ОБСУЖДЕНИЕ → ИЗМЕНЕНИЕ → ПРОВЕРКА → ФИКСАЦИЯ СОСТОЯНИЯ**

Опасные изменения production без предварительной проверки и понятного
плана не выполняются.

Не изменяем уже применённые production-миграции. Не удаляем таблицы или
данные без отдельного согласованного плана.

## 3. Целевая архитектура

### LOCAL

Windows → React/Vite → локальный Fastify backend → локальная PostgreSQL
БД

### PRODUCTION

stubbornram.ru → Nginx/HTTPS → Fastify backend → PostgreSQL на Selectel

Frontend не обращается напрямую к PostgreSQL.

Production и local database должны быть физически/логически разделены.

## 4. Известное production-состояние на начало этого цикла

-   Cloud Server: Selectel
-   OS: Ubuntu 24.04
-   Server IP: `161.104.49.107`
-   SSH user: `stubbornram`
-   Backend directory: `/opt/stubbornram/backend/server`
-   Backend: Node.js / Fastify
-   Backend listens on: `127.0.0.1:3000`
-   Process manager: PM2
-   API domain: `api.stubbornram.ru`
-   Reverse proxy: Nginx
-   HTTPS: Let's Encrypt
-   PostgreSQL: 16.x
-   Production DB name: `stubbornram`
-   Application DB role: `stubbornram_app`
-   PostgreSQL is intended to remain private and not directly exposed to
    the frontend.

### Important

Пароли, API keys, private keys and other secrets **не записываются в
этот файл**.

Этот файл описывает только расположение, роли, структуру и способ работы
с секретами.

## 5. Production backend

Фактический backend root:

`/opt/stubbornram/backend/server`

Ожидаемая структура:

-   `.env`
-   `database.cjs`
-   `migrations/`
-   `modules/`
-   `node_modules/`
-   `package.json`
-   `package-lock.json`
-   `server.js`

Backend configuration currently uses:

-   `DB_HOST`
-   `DB_PORT`
-   `DB_NAME`
-   `DB_USER`
-   `DB_PASSWORD`

## 6. Database / migrations --- текущее состояние

Production migrations known to be applied:

1.  `1788859125911_init.js`
2.  `1788859125912_sessions.js`
3.  `1788859125913_auth_tokens.js`
4.  `1788859125914_leads.js`
5.  `1788859125915_training.js`
6.  `1788859125916_seed_exercises.js`
7.  `1788859125917_auth_tokens_active_unique.js`

Migration:

`1788859125918_training_templates.js`

на начало этого цикла **НЕ применена в production** и не должна
применяться до отдельного решения.

Она добавляет:

-   `training_templates`
-   `training_template_exercises`
-   `training_template_sets`

и не заменяет существующие workout-таблицы.

## 7. Известная проблема, которую необходимо стандартизировать

В production `package.json` migration script сейчас:

`"migrate": "node-pg-migrate"`

`node-pg-migrate` ожидает `DATABASE_URL`, тогда как backend использует
отдельные `DB_*` переменные.

`database.cjs` умеет собирать `databaseUrl` из `DB_*`, но способ запуска
миграций ещё не приведён к единому, понятному стандарту.

Это один из пунктов текущей проверки.

## 8. Local development --- текущее состояние

Local project path:

`D:\CRM-Platform Stubborn Ram`

Local `.env` был восстановлен на основе `.env.example`.

`.env.example` содержит:

-   `NODE_ENV=development`
-   `DB_HOST=127.0.0.1`
-   `DB_PORT=5432`
-   `DB_NAME=stubbornram`
-   `DB_USER=stubbornram_app`
-   `DB_PASSWORD=`
-   `UNISENDER_API_KEY=`
-   `TRAINER_EMAIL=`

На начало этого цикла локальный PostgreSQL не установлен/не запущен.

При запуске local backend ранее получена:

`connect ECONNREFUSED 127.0.0.1:5432`

**Важно:** PostgreSQL локально пока не устанавливаем автоматически.
Сначала выбираем и проектируем нормальный local development workflow
(например, локальный PostgreSQL или Docker), затем устанавливаем только
выбранный вариант.

## 9. Security requirements

- Production DB password never appears in chat.
- Secrets stay in environment/configuration outside Git.
- PostgreSQL should not be publicly exposed.
- Потеря одного рабочего компьютера не должна приводить к потере доступа к production.
- SSH-пароль не включаем только ради возможности входа с другого устройства.
- Для каждого устройства используем отдельную SSH-пару ключей.
- Приватные ключи не копируем между устройствами и не передаём в чат.
- Должен существовать резервный способ восстановления доступа, в том числе через аварийную консоль/панель Selectel.
- SSH access should remain secured.
- Production changes require backup/rollback consideration.
- Local test data must not accidentally target production DB.

## 10. Current workflow

Planned standard workflow:

1.  Change code locally.
2.  Run local PostgreSQL/test environment.
3.  Run/test migrations locally.
4.  Test backend locally.
5.  Verify migration safety.
6.  Backup production when appropriate.
7.  Apply migration to production.
8.  Deploy backend/frontend.
9.  Verify production.
10. Record the resulting state in this file.

## 11. Current technical step

**Step 0 --- Inventory and live verification of production
infrastructure.**

No infrastructure changes have been made during this step.

Planned diagnostic command after SSH:

``` bash
echo "=== SYSTEM ==="; uname -a; echo "=== NODE ==="; node -v; echo "=== NPM ==="; npm -v; echo "=== PM2 ==="; pm2 -v; echo "=== NGINX ==="; nginx -v 2>&1; echo "=== POSTGRES ==="; psql --version; echo "=== LISTENING PORTS ==="; ss -lntp
```

Expected next action:

-   inspect the real output;
-   compare it with the documented state;
-   identify discrepancies;
-   only then decide the next safe change.

## 12. Change log

### 2026-09-14 --- Initialization of infrastructure cleanup cycle

**Checked / established:** - This chat is dedicated to standardizing
Stubborn Ram infrastructure. - Target architecture: local React → local
Fastify → local PostgreSQL; production React → Nginx/HTTPS → Fastify →
production PostgreSQL. - Production DB must remain separate from
local/test DB. - Migration process needs standardization. - Secrets must
not be stored in this state file or exposed in chat. - Local PostgreSQL
is currently unavailable and will not be installed until the local
development strategy is chosen. - A persistent state file is established
as the single source of truth for the infrastructure work.

**Changed:** - Created this `SYSTEM_STATE.md` as the working state
document.

**Not changed:** - No production server configuration. - No production
database. - No production migrations. - No backend code. - No frontend
code. - No PostgreSQL installation. - No Git operations.

**Next step:** - Perform the live production infrastructure diagnostic
and compare the actual server state with this document.

### 2026-09-14 — SSH security and recovery requirements

**Проверили:**
- `pubkeyauthentication yes`
- `passwordauthentication no`
- `kbdinteractiveauthentication no`
- `permitrootlogin without-password`
- SSH-вход с текущего компьютера проходит без запроса SSH-пароля, что соответствует использованию ключевой аутентификации.

**Выяснили:**
- SSH-пароль и пароль `sudo` — разные механизмы.
- Текущий SSH-парольный вход отключён.
- Для работы с другого компьютера потребуется отдельная SSH-пара ключей.
- Нельзя полагаться на единственный приватный ключ на одном компьютере: при его потере обычный SSH-доступ с нового устройства будет невозможен.
- Потеря SSH-ключа не означает потерю самого сервера: необходим заранее предусмотренный recovery-доступ.

**Принято как требование к итоговой инфраструктуре:**
- не включать SSH-вход по паролю ради удобства;
- использовать отдельный SSH-ключ для каждого устройства;
- предусмотреть резервный ключ/резервный способ доступа;
- использовать аварийную консоль/панель Selectel как recovery-механизм;
- проверить и документировать процедуру восстановления доступа;
- не хранить приватные ключи в Git, чате или этом state-файле.

**Изменили:**
- Только документацию `SYSTEM_STATE.md`.

**Не изменили:**
- SSH-конфигурацию;
- пользователей;
- SSH-ключи;
- firewall;
- production backend;
- production PostgreSQL;
- миграции.

**Следующий шаг:**
- продолжить аудит SSH-доступа: определить пользователей и разрешённые ключи, не изменяя конфигурацию.

### 2026-09-14 — SSH authorized key count verified

**Проверили:**
- В `/opt/stubbornram/.ssh/authorized_keys` найден ровно **1** SSH-публичный ключ.
- `authorized_keys2` отсутствует, что нормально.
- Каталог `.ssh` имеет права `700`.
- `authorized_keys` имеет права `600`.
- Пользователь-владелец файлов: `stubbornram`.

**Вывод:**
- Сейчас у пользователя `stubbornram` настроен один разрешённый SSH-ключ.
- Если единственное устройство с соответствующим приватным ключом будет потеряно, обычный SSH-вход с нового устройства будет невозможен до восстановления доступа.
- Это не является текущей неисправностью, но требует отдельного recovery-плана.

**Изменили:**
- Ничего в системе.
- Обновлена только документация.

**Не изменили:**
- SSH-конфигурацию;
- `authorized_keys`;
- пользователей;
- firewall;
- production backend;
- PostgreSQL.

**Следующий шаг:**
- Проверить firewall (UFW) и фактические внешние правила доступа, чтобы убедиться, что наружу действительно доступны только необходимые сервисы.

### 2026-09-14 — UFW firewall verified

**Проверили:**
- UFW активен.
- Входящие соединения по умолчанию запрещены: `deny (incoming)`.
- Исходящие соединения разрешены.
- Разрешён вход TCP `22` (SSH) для IPv4 и IPv6.
- Разрешён вход TCP `80` и `443` (HTTP/HTTPS через Nginx) для IPv4 и IPv6.
- Логирование UFW включено на уровне `low`.

**Сопоставление с предыдущей проверкой портов:**
- `22` соответствует SSH.
- `80/443` соответствуют Nginx.
- PostgreSQL `5432`, Fastify `3000` и pgAdmin `5050` наружу через UFW не разрешены и ранее были привязаны к localhost.
- Таким образом, текущая firewall-модель соответствует целевой архитектуре: PostgreSQL/backend/pgAdmin не должны быть доступны напрямую из интернета.

**Изменили:**
- Ничего в firewall или сервере.
- Обновлена только документация.

**Не изменили:**
- правила UFW;
- SSH;
- Nginx;
- PostgreSQL;
- backend;
- production database.

**Следующий шаг:**
- Проверить Fail2ban и его SSH jail, затем перейти к проверке фактической конфигурации Nginx/HTTPS.

### 2026-09-14 — Fail2ban base status verified

**Проверили:**
- Fail2ban отвечает и работает.
- Найден ровно 1 jail.
- Активный jail: `sshd`.

**Вывод:**
- Защита SSH через Fail2ban включена на уровне наличия `sshd` jail.
- Этого вывода пока недостаточно, чтобы подтвердить его параметры: лимиты попыток, время блокировки, окно наблюдения и текущие заблокированные IP ещё не проверялись.

**Изменили:**
- Ничего в Fail2ban или сервере.
- Обновлена только документация.

**Не изменили:**
- конфигурацию Fail2ban;
- UFW;
- SSH;
- пользователей и SSH-ключи;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Проверить детали `sshd` jail: состояние, количество неудачных попыток, текущие баны и параметры защиты.

### 2026-09-14 — Fail2ban SSH jail detailed status verified

**Проверили:**
- Jail `sshd` активен.
- Сейчас не заблокировано IP: `Currently banned: 0`.
- За всё время работы jail заблокировано `126` IP: `Total banned: 126`.
- Зафиксировано `1462` неудачных события авторизации: `Total failed: 1462`.
- Сейчас есть `1` текущее неудачное событие: `Currently failed: 1`.
- Фильтр использует systemd journal для `sshd.service` / `sshd`.

**Вывод:**
- Fail2ban не просто установлен: он реально обнаруживал неудачные SSH-аутентификации и блокировал источники атак.
- `126` заблокированных IP подтверждает, что SSH уже подвергался автоматическим попыткам входа из интернета.
- Текущих банов нет — это само по себе не проблема; активные баны зависят от текущих событий и срока блокировки.
- Конкретные значения `maxretry`, `findtime`, `bantime`, backend/action и текущая конфигурация jail пока не проверялись.

**Безопасность:**
- При сочетании `passwordauthentication no`, SSH-ключей, UFW и Fail2ban текущая базовая модель SSH выглядит хорошо.
- Но SSH порт 22 открыт всему интернету, поэтому защита от автоматического сканирования/атак остаётся актуальной.

**Изменили:**
- Ничего в Fail2ban или сервере.
- Обновлена только документация.

**Не изменили:**
- конфигурацию Fail2ban;
- UFW;
- SSH;
- пользователей и SSH-ключи;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Проверить фактические параметры `sshd` jail (`maxretry`, `findtime`, `bantime`, action/backend), прежде чем решать, требуется ли усиление.

### 2026-09-14 — Fail2ban SSH protection parameters verified

**Проверили:**
- `maxretry = 5`
- `findtime = 600` секунд (10 минут)
- `bantime = 600` секунд (10 минут)

**Как это работает:**
- Источник может получить до 5 неудачных SSH-аутентификаций в пределах 10 минут.
- После достижения лимита Fail2ban блокирует источник на 10 минут.
- Это объясняет общую модель текущей защиты, но не является основанием для изменения настроек без дополнительной оценки.

**Вывод:**
- Настройка является рабочей базовой защитой от автоматического перебора SSH.
- С учётом отключённой парольной SSH-аутентификации основной риск brute-force по паролю уже существенно снижен.
- Однако SSH остаётся доступен из интернета, поэтому Fail2ban продолжает иметь практическую пользу.
- Решение об усилении `bantime`/других параметров пока не принимаем.

**Изменили:**
- Ничего в Fail2ban или сервере.
- Обновлена только документация.

**Не изменили:**
- конфигурацию Fail2ban;
- UFW;
- SSH;
- пользователей и SSH-ключи;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Проверить фактические SSH-конфигурационные файлы и эффективные настройки доступа, после чего перейти к Nginx/HTTPS.

### 2026-09-14 — SSH configuration files verified

**Проверили:**
- `/etc/ssh/sshd_config` подключает дополнительные конфигурации через:
  `Include /etc/ssh/sshd_config.d/*.conf`
- В основном конфигурационном файле явно указано:
  - `PermitRootLogin prohibit-password`
  - `PasswordAuthentication no`
  - `KbdInteractiveAuthentication no`
- В проверенных конфигурационных файлах не обнаружены отдельные `AllowUsers`, `AllowGroups`, `DenyUsers` или `DenyGroups`.
- Отдельной директивы `Port` или `ListenAddress` в просмотренных строках не найдено; ранее фактический `ss` подтвердил, что SSH слушает `0.0.0.0:22` и `[::]:22`.

**Вывод:**
- Основная конфигурация подтверждает отключение парольной и keyboard-interactive SSH-аутентификации.
- `PermitRootLogin prohibit-password` разрешает root только без пароля (например, ключом); это ещё не означает, что root фактически имеет разрешённый ключ.
- Подключаемая директория `sshd_config.d` существует как потенциальный источник дополнительных настроек, но текущая проверка не обнаружила в ней конфликтующих директив из выбранного списка.
- Пока оснований менять SSH-конфигурацию нет.

**Изменили:**
- Ничего в SSH.
- Обновлена только документация.

**Не изменили:**
- `/etc/ssh/sshd_config`;
- `/etc/ssh/sshd_config.d/`;
- `authorized_keys`;
- пользователей;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Перед завершением SSH-аудита отдельно проверить, существует ли root SSH-ключ и какие дополнительные конфигурационные файлы реально загружены. После этого перейти к Nginx/HTTPS.

### 2026-09-14 — Root and stubbornram SSH key fingerprint comparison

**Проверили:**
- Fingerprint ключа в `/opt/stubbornram/.ssh/authorized_keys`:
  `SHA256:X9KxKHw1++0RFNJtfOkK8PWn7JREdJ+lJo9UbPAmcvg` (ED25519)
- Fingerprint ключа в `/root/.ssh/authorized_keys`:
  `SHA256:X9KxKHw1++0RFNJtfOkK8PWn7JREdJ+lJo9UbPAmcvg` (ED25519)
- Fingerprints полностью совпадают.

**Вывод:**
- Один и тот же публичный SSH-ключ разрешает вход и как `stubbornram`, и как `root`.
- Следовательно, текущее устройство с соответствующим приватным ключом потенциально может использовать этот ключ для root SSH-входа.
- `PermitRootLogin prohibit-password` допускает такой вход по ключу.
- `stubbornram` уже имеет `sudo`, поэтому отдельный root SSH-доступ не нужен для обычной административной работы.
- Удалять root-ключ или менять `PermitRootLogin` прямо сейчас нельзя: сначала должен быть проверен recovery-план и подтверждён безопасный альтернативный доступ.

**Изменили:**
- Ничего на сервере.
- Обновлена только документация.

**Не изменили:**
- `/root/.ssh/authorized_keys`;
- `/opt/stubbornram/.ssh/authorized_keys`;
- `PermitRootLogin`;
- SSH;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Обсудить и спроектировать безопасную схему SSH/recovery для нескольких устройств.
- После появления подтверждённого резервного доступа решить, нужен ли root SSH вообще.

### 2026-09-14 — SSH recovery architecture agreed for current device setup

**Пользовательская ситуация:**
- Основное рабочее устройство: один текущий ПК.
- Ноутбука нет.
- Нужна возможность восстановить SSH-доступ, если основной ПК или его приватный ключ будет потерян.
- Нужен один или несколько резервных SSH-ключей, хранящихся отдельно от основного ПК.

**Принцип, который принимаем:**
- Основной ПК использует свой отдельный SSH-ключ.
- Резервный ключ/ключи создаются отдельно и не хранятся только на основном ПК.
- Приватные ключи не передаются в чат и не помещаются в Git.
- Резервный доступ должен быть проверен до отключения root SSH-доступа.
- В качестве дополнительного аварийного механизма рассматриваем консоль/панель Selectel.
- После создания и проверки recovery-доступа можно безопасно решить вопрос об отключении прямого SSH-входа root.
- Не создаём несколько резервных ключей без необходимости: сначала определяем простую и понятную схему хранения и восстановления.

**Текущее состояние:**
- Один и тот же ED25519 публичный ключ сейчас разрешён для `stubbornram` и `root`.
- SSH password authentication отключён.
- `stubbornram` имеет `sudo`.
- Прямой root SSH-доступ пока не отключён.

**Важно:**
- Это архитектурное решение, а не выполненное изменение.
- Пока никаких ключей не создавали, не удаляли и не меняли SSH-конфигурацию.

**Следующий шаг:**
- Спроектировать конкретный recovery-вариант для одного ПК: основной ключ + один резервный ключ в отдельном безопасном месте + аварийная консоль Selectel.
- Затем создать и проверить резервный ключ, и только после успешной проверки менять root SSH-доступ.

### 2026-09-14 — Recovery public key verified locally

**Проверили:**
- Файл резервного публичного ключа существует:
  `C:\Users\Stubborn Ram\.ssh\stubbornram-recovery.pub`
- Размер файла: `103` байта.
- Содержимое публичного ключа не выводили и не передавали в чат.

**Вывод:**
- Резервная SSH-пара ключей была создана ранее.
- Публичная часть находится в ожидаемом месте.
- На сервер публичный ключ пока не добавляли.
- Текущий production SSH-доступ не изменён.

**Изменили:**
- Только документацию.

**Не изменили:**
- `/opt/stubbornram/.ssh/authorized_keys`;
- `/root/.ssh/authorized_keys`;
- SSH-конфигурацию;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Безопасно добавить публичный `stubbornram-recovery.pub` к пользователю `stubbornram`, сохранив существующий рабочий ключ.
- Затем проверить вход по резервному ключу.

### 2026-09-14 — Recovery public key added to stubbornram

**Проверили / выполнили:**
- Публичный ключ `stubbornram-recovery.pub` добавлен в конец:
  `/opt/stubbornram/.ssh/authorized_keys`
- Команда завершилась без ошибки и вернула PowerShell prompt.
- Передавался только публичный `.pub`-файл.
- Существующий ключ не удалялся и не заменялся.

**Важно:**
- Это подтверждает успешное выполнение команды добавления, но ещё не подтверждает, что новый ключ действительно работает для SSH-входа.
- Резервный приватный ключ пока остаётся на основном ПК и ещё не перенесён в отдельное безопасное место.
- Root SSH-доступ пока не изменён.

**Изменили:**
- Добавлена новая публичная SSH-ключевая запись для `stubbornram`.
- Обновлена документация.

**Не изменили:**
- старый SSH-ключ;
- `/root/.ssh/authorized_keys`;
- SSH-конфигурацию;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Проверить на сервере, что в `authorized_keys` теперь ровно два ключа, не раскрывая их содержимое.
- Затем выполнить отдельный тест входа новым recovery-ключом.

### 2026-09-14 — Recovery key presence verified on server

**Проверили:**
- После добавления recovery-ключа файл `/opt/stubbornram/.ssh/authorized_keys` содержит `2` публичных ключа.
- Команда проверки не раскрывала содержимое ключей.
- Подключение текущим основным SSH-ключом по-прежнему работает.

**Вывод:**
- Старый рабочий ключ сохранён.
- Новый recovery-публичный ключ присутствует на сервере.
- Следующий обязательный этап — проверить фактический вход новым приватным recovery-ключом, а не только наличие записи.
- До успешного теста recovery-ключа root SSH-доступ не изменяем.

**Изменили:**
- Только состояние `authorized_keys`: добавлена вторая публичная ключевая запись на предыдущем шаге.
- Обновлена документация.

**Не изменили:**
- первый SSH-ключ;
- `/root/.ssh/authorized_keys`;
- SSH-конфигурацию;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Закрыть текущую SSH-сессию и выполнить тестовый вход с явным указанием `stubbornram-recovery` как IdentityFile.
- Проверить, что вход происходит именно новым ключом.

### 2026-09-14 — Recovery SSH key successfully tested

**Проверили:**
- Выполнен SSH-вход с явным указанием приватного ключа:
  `stubbornram-recovery`
- SSH запросил passphrase резервного ключа.
- После ввода passphrase вход успешно выполнен как пользователь `stubbornram`.
- Это подтверждает, что recovery-пара ключей работает фактически, а не только присутствует в `authorized_keys`.

**Вывод:**
- У пользователя теперь есть рабочий основной SSH-доступ и рабочий recovery SSH-доступ.
- Recovery passphrase защищает приватный recovery-ключ.
- Потеря основного ПК больше не означает автоматическую потерю доступа к серверу, при условии что резервный приватный ключ и его passphrase сохранены отдельно и доступны для восстановления.
- Прямой root SSH-доступ пока не изменён.

**Изменили:**
- Ничего в конфигурации сервера на этом шаге.
- Обновлена только документация.

**Не изменили:**
- `/root/.ssh/authorized_keys`;
- `/opt/stubbornram/.ssh/authorized_keys` (кроме ранее добавленной recovery-записи);
- SSH-конфигурацию;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Безопасно организовать хранение recovery-приватного ключа и его passphrase отдельно от рабочего ПК.
- После подтверждения, что recovery-комплект действительно сохранён, вернуться к вопросу отключения прямого root SSH-доступа.

### 2026-09-14 — Recovery private key copied to separate USB storage

**Проверили:**
- На USB-накопителе `E:` создана папка `StubbornRam-Recovery`.
- В ней визуально подтверждено наличие файла `stubbornram-recovery`.
- Это резервная копия приватного recovery-ключа.
- Публичный ключ уже находится на production-сервере и успешно прошёл тест входа.

**Вывод:**
- Recovery-комплект теперь имеет отдельное физическое хранилище.
- Основной рабочий ПК пока продолжает хранить копию recovery-приватного ключа; её пока не удаляем.
- Passphrase от recovery-ключа не записывается в этот файл и не хранится рядом с ключом на флешке.

**Изменили:**
- Только физическое расположение резервной копии приватного recovery-ключа: добавлена копия на USB `E:`.
- Обновлена документация.

**Не изменили:**
- SSH-конфигурацию;
- `/root/.ssh/authorized_keys`;
- `/opt/stubbornram/.ssh/authorized_keys`;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Не удалять recovery-ключ с ПК до отдельной проверки резервного комплекта.
- Проверить, что резервный файл на USB имеет корректный размер и после этого решить, достаточно ли текущего recovery-хранилища.
- Затем перейти к безопасному отключению прямого root SSH-доступа только после подтверждения recovery-сценария.

### 2026-09-14 — Recovery USB copy size verified

**Проверили:**
- `E:\StubbornRam-Recovery\stubbornram-recovery` существует.
- Размер резервной копии на USB: `464` байта.
- Файл является приватной частью recovery-пары; его содержимое не выводилось.

**Вывод:**
- Резервная копия физически присутствует на USB.
- Одного совпадения размера недостаточно, чтобы математически подтвердить идентичность копии с оригиналом, поэтому перед удалением с ПК требуется сравнение SHA-256.

**Изменили:**
- Ничего на сервере или ПК.
- Обновлена только документация.

**Не изменили:**
- recovery-ключ на ПК;
- recovery-ключ на USB;
- SSH-конфигурацию;
- `authorized_keys`;
- root SSH-доступ;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Сравнить SHA-256 оригинального recovery-приватного ключа на ПК и его копии на USB.

### 2026-09-14 — Recovery private key backup integrity verified

**Проверили:**
- SHA-256 оригинала recovery-приватного ключа на ПК:
  `5EE86C00B13CDA809781E94F2604486718624A7564B2B700919CF683862D3C93`
- SHA-256 копии на USB:
  `5EE86C00B13CDA809781E94F2604486718624A7564B2B700919CF683862D3C93`
- Хэши полностью совпадают.

**Вывод:**
- Копия `E:\StubbornRam-Recovery\stubbornram-recovery` идентична оригинальному recovery-приватному ключу на ПК.
- Recovery-пара ключей ранее успешно прошла реальный SSH-вход.
- Резервная копия на USB теперь проверена на целостность.
- Passphrase от recovery-ключа остаётся отдельным секретом и не записывается в этот файл.

**Изменили:**
- Ничего на сервере.
- Обновлена только документация.

**Не изменили:**
- recovery-ключ на ПК;
- recovery-ключ на USB;
- SSH-конфигурацию;
- `authorized_keys`;
- root SSH-доступ;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Recovery-контур считается подготовленным на уровне ключа и резервной копии.
- Перед отключением прямого root SSH необходимо ещё определить безопасную процедуру восстановления с нового ПК и убедиться, что recovery-ключ можно использовать с USB без постоянного хранения его на рабочем ПК.
- После этого можно безопасно рассмотреть отключение root SSH.

### 2026-09-14 — Recovery SSH works; non-interactive sudo test was inconclusive

**Проверили:**
- Recovery SSH-ключ успешно аутентифицирует пользователя `stubbornram`.
- Попытка проверить `sudo` через удалённую команду без TTY:
  `ssh ... "sudo -v && echo RECOVERY_SUDO_OK"`
  завершилась сообщением `sudo: a terminal is required to read the password`.
- Это не означает отказа в `sudo`: команда выполнялась без интерактивного терминала, поэтому `sudo` не смог запросить пароль пользователя.

**Вывод:**
- Recovery SSH-доступ подтверждён.
- Возможность `sudo` через recovery-ключ пока не проверена именно в интерактивной SSH-сессии.
- Серверную конфигурацию этим тестом не изменяли.

**Изменили:**
- Ничего на сервере.
- Обновлена только документация.

**Не изменили:**
- SSH-конфигурацию;
- `authorized_keys`;
- root SSH-доступ;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Повторить проверку `sudo` через SSH с выделенным TTY (`ssh -t`), чтобы `sudo` мог штатно запросить пароль.

### 2026-09-14 — Recovery SSH + sudo fully verified

**Проверили:**
- Recovery приватный ключ успешно проходит SSH-аутентификацию.
- Через recovery-ключ пользователь `stubbornram` получил `sudo`.
- `sudo -v` успешно завершился.
- Получен контрольный результат: `RECOVERY_SUDO_OK`.
- Для проверки использовался выделенный TTY, поэтому `sudo` смог штатно запросить пароль.

**Вывод:**
- Полная цепочка аварийного административного доступа подтверждена:
  `recovery private key → SSH → stubbornram → sudo`.
- Recovery-доступ теперь подтверждён не только для входа, но и для административных действий.
- Прямой SSH-доступ root пока не отключён; он остаётся как текущий дополнительный путь до завершения безопасного перехода.

**Изменили:**
- Ничего в конфигурации сервера.
- Обновлена только документация.

**Не изменили:**
- `PermitRootLogin`;
- `/root/.ssh/authorized_keys`;
- `/opt/stubbornram/.ssh/authorized_keys`;
- UFW;
- Fail2ban;
- Nginx;
- PostgreSQL;
- backend.

**Следующий шаг:**
- Перед изменением root SSH определить и документировать точную процедуру восстановления на новом ПК с USB recovery-ключом.
- После этого отдельно изменить SSH-конфигурацию, отключив прямой root SSH-вход, и проверить, что основной и recovery-доступ `stubbornram + sudo` продолжают работать.

### 2026-09-14 — Non-interactive sudo limitation encountered during root SSH pre-check

**Проверили:**
- Попытка выполнить `sudo sshd -T | grep '^permitrootlogin '` через обычный non-interactive SSH завершилась:
  `sudo: a terminal is required to read the password`.
- Причина: `sudo` на сервере требует интерактивный TTY для запроса пароля.
- Это не является ошибкой SSH и не меняет текущую конфигурацию.

**Вывод:**
- Для команд с `sudo` через удалённый SSH нужно использовать `ssh -t` либо входить интерактивно.
- Текущее значение `PermitRootLogin` уже было подтверждено ранее как `prohibit-password` через локальную команду на сервере.
- Изменение root SSH-доступа пока не выполнялось.

**Изменили:**
- Ничего на сервере.
- Обновлена только документация.

**Следующий шаг:**
- Проверить `PermitRootLogin` через SSH с выделенным TTY, без изменения конфигурации.

### 2026-09-14 — Added root SSH hardening configuration (not yet applied)

**Проверили:**
- Перед изменением `sshd -T` подтвердил: `permitrootlogin without-password`.
- Recovery SSH-доступ через пользователя `stubbornram` ранее успешно проверен.

**Изменили на сервере:**
- Создан файл `/etc/ssh/sshd_config.d/99-stubbornram-hardening.conf`.
- В файл записано:
  `PermitRootLogin no`

**Важно:**
- SSH-служба пока не перезапускалась и не перезагружалась.
- Новое правило ещё не применено к новым SSH-подключениям.
- Прямой root SSH-доступ пока фактически не проверялся после изменения.
- Основной и recovery ключи не удалялись.
- `/root/.ssh/authorized_keys` не изменялся.

**Следующий шаг:**
- Выполнить синтаксическую проверку итоговой конфигурации SSH (`sshd -t`) до её применения.

### 2026-09-14 — SSH configuration syntax validated

**Проверили:**
- Выполнен `sudo sshd -t`.
- Результат: `SSH_CONFIG_OK`.
- Синтаксических ошибок в итоговой SSH-конфигурации нет.

**Текущее состояние:**
- Правило `PermitRootLogin no` уже записано в `/etc/ssh/sshd_config.d/99-stubbornram-hardening.conf`.
- SSH-служба ещё не перезагружалась/перезапускалась, поэтому правило ещё не применено к новым подключениям.
- Текущая SSH-сессия закрылась штатно после проверки.

**Изменили:**
- Никаких дополнительных изменений на сервере.

**Следующий шаг:**
- Применить проверенную конфигурацию через `systemctl reload ssh`, не закрывая заранее отдельную рабочую SSH-сессию, затем проверить доступ пользователя `stubbornram`.

### 2026-09-14 — Applied SSH root-login hardening

**Проверили:**
- `sshd -t` ранее вернул `SSH_CONFIG_OK`.
- После этого выполнен `sudo systemctl reload ssh`.
- Результат: `SSH_RELOAD_OK`.

**Изменили:**
- Проверенная SSH-конфигурация применена через reload.
- Правило `PermitRootLogin no` теперь должно действовать для новых SSH-подключений.

**Не изменили:**
- SSH-пользователь `stubbornram` не изменён.
- Основной SSH-ключ не изменён.
- Recovery-ключ не изменён и не удалён.
- `/root/.ssh/authorized_keys` пока не изменялся.
- SSH-порт 22 не изменялся.

**Следующий шаг:**
- Отдельно проверить, что обычный SSH-вход под `stubbornram` по-прежнему работает после reload.
- Затем проверить фактическое эффективное значение `permitrootlogin` и отдельно протестировать запрет прямого root-входа.

### 2026-09-14 — Main SSH access verified after hardening reload

**Проверили:**
- Выполнен новый SSH-вход под `stubbornram` после применения `PermitRootLogin no`.
- Результат: `USER_LOGIN_OK`.

**Вывод:**
- Основной SSH-доступ пользователя `stubbornram` продолжает работать.
- Применение root SSH hardening не заблокировало основной доступ.

**Изменили:**
- Ничего дополнительно.

**Следующий шаг:**
- Проверить фактическое эффективное значение `permitrootlogin` после reload.
- После этого отдельно проверить, что прямой SSH-вход под `root` действительно запрещён.

### 2026-09-14 — Effective root SSH prohibition verified

**Проверили:**
- После `systemctl reload ssh` выполнен `sudo sshd -T`.
- Результат:
  `permitrootlogin no`

**Вывод:**
- `PermitRootLogin no` не только записан в конфигурацию, но и фактически применяется OpenSSH.
- Прямой SSH-вход под `root` теперь запрещён.
- Основной SSH-вход под `stubbornram` ранее успешно проверен после reload (`USER_LOGIN_OK`).

**Изменили:**
- Никаких дополнительных изменений на сервере на этом шаге.

**Следующий шаг:**
- Отдельно проверить recovery-доступ с резервным ключом на USB.
- После подтверждения recovery можно решить, нужно ли отдельно удалять старый root `authorized_keys`; пока он намеренно не трогался.

### 2026-09-14 — Recovery SSH access verified after root hardening

**Проверили:**
- Recovery SSH-ключ `stubbornram-recovery` успешно использован для входа под `stubbornram`.
- Команда вернула:
  `RECOVERY_LOGIN_OK`
- Ключ потребовал passphrase, как и ожидалось.

**Вывод:**
- Резервный способ SSH-доступа работает после отключения прямого root SSH.
- Основной доступ `stubbornram` и recovery-доступ `stubbornram` оба подтверждены.
- Recovery-ключ остаётся отдельным резервным ключом; его private key и passphrase не раскрывались.

**Изменили:**
- На сервере на этом шаге ничего не меняли.
- `/root/.ssh/authorized_keys` пока не изменялся.

**Следующий шаг:**
- Обсудить и отдельно решить судьбу существующего `/root/.ssh/authorized_keys`.
- Перед любым удалением сначала проверить содержимое/отпечатки ключей без вывода приватных данных и убедиться, что удаление действительно безопасно.

### 2026-09-14 — Recovery SSH key verified after root hardening

**Проверили:**
- Recovery-ключ `stubbornram-recovery` после применения `PermitRootLogin no` успешно подключился к серверу под пользователем `stubbornram`.
- Результат: `RECOVERY_LOGIN_OK`.
- Recovery-ключ находится на отдельном USB-носителе; его passphrase не записывается в документацию.

**Вывод:**
- Основной SSH-доступ работает.
- Резервный SSH-доступ работает.
- Прямой SSH-вход под `root` запрещён.
- Базовая схема SSH-восстановления после hardening подтверждена.

**Изменили:**
- Ничего дополнительно на сервере.
- Ключи не удалялись.
- `/root/.ssh/authorized_keys` пока не изменялся.

**Следующий шаг:**
- Отдельно решить вопрос с существующим `/root/.ssh/authorized_keys`: определить, нужно ли его удалить после подтверждения текущей recovery-схемы. Это отдельное изменение и пока не выполняется.

### 2026-09-14 — Root authorized_keys inspected

**Проверили:**
- `/root/.ssh/authorized_keys` существует.
- Права: `-rw-------`.
- Владелец: `root:root`.
- Размер: 81 байт.
- В файле находится один ED25519-ключ.
- Fingerprint: `SHA256:X9KxKHw1++0RFNJtfOkK8PWn7JREdJ+lJo9UbPAmcvg`.

**Вывод:**
- Это тот же старый ключ, который ранее был обнаружен и в `stubbornram` `authorized_keys`.
- Несмотря на наличие ключа в root `authorized_keys`, эффективный `PermitRootLogin no` запрещает прямой SSH-вход под root.
- Файл пока не удалялся.

**Следующий шаг:**
- После отдельного подтверждения удалить старый `/root/.ssh/authorized_keys`, не затрагивая `stubbornram` `authorized_keys` и recovery-ключ.
- Затем удалить локальные файлы recovery-ключа с основного ПК, сохранив копию только на USB. Перед удалением локальных файлов отдельно проверить, что USB-копия доступна и совпадает по SHA256.

### 2026-09-14 — Removed obsolete root SSH authorized key

**Проверили:**
- Перед удалением `/root/.ssh/authorized_keys` было подтверждено:
  - файл существовал с правами `600`, владелец `root:root`;
  - содержал один старый ED25519 public key;
  - fingerprint совпадал с ранее известным старым ключом;
  - `PermitRootLogin no` уже был эффективно применён.

**Изменили на сервере:**
- Удалён файл `/root/.ssh/authorized_keys`.
- Результат команды: `ROOT_AUTHORIZED_KEYS_REMOVED`.

**Не изменили:**
- `/opt/stubbornram/.ssh/authorized_keys` не изменялся.
- Основной ключ пользователя `stubbornram` не изменялся.
- Recovery-ключ пользователя `stubbornram` не изменялся.
- `PermitRootLogin no` не изменялся.
- SSH-порт и firewall не изменялись.

**Следующий шаг:**
- Проверить основной SSH-вход после удаления root authorized_keys.
- Проверить recovery SSH-вход после удаления root authorized_keys.
- Затем удалить локальную копию recovery private key с ПК, оставив резервную копию на USB.

### 2026-09-14 — Main SSH access verified after root key removal

**Проверили:**
- После удаления `/root/.ssh/authorized_keys` выполнен обычный SSH-вход под `stubbornram`.
- Результат: `MAIN_LOGIN_OK`.

**Вывод:**
- Основной SSH-доступ не пострадал.
- Удаление root `authorized_keys` не повлияло на доступ пользователя `stubbornram`.

**Изменили:**
- Никаких дополнительных изменений на сервере.

**Следующий шаг:**
- Повторно проверить recovery SSH-ключ после удаления root `authorized_keys`.
- Затем удалить локальную копию recovery private key с ПК, сохранив копию на USB.

### 2026-09-14 — Recovery SSH access verified after root key removal

**Проверили:**
- После удаления `/root/.ssh/authorized_keys` recovery-ключ `stubbornram-recovery` успешно подключился к серверу под `stubbornram`.
- Результат: `RECOVERY_LOGIN_OK`.

**Итог SSH hardening:**
- Основной SSH-доступ `stubbornram` работает.
- Recovery SSH-доступ `stubbornram` работает.
- `PermitRootLogin no` эффективно применяется.
- Старый `/root/.ssh/authorized_keys` удалён.
- Recovery private key всё ещё находится на ПК и имеет резервную копию на USB.
- Никакие рабочие ключи пользователя `stubbornram` не удалялись.

**Следующий шаг:**
- Удалить локальные файлы recovery private/public key с Windows-ПК, предварительно убедившись, что USB-копия сохранена. На сервере при этом ничего менять не нужно.

### 2026-09-14 — Local recovery key removed from PC

**Проверили:**
- `Test-Path` для `C:\Users\Stubborn Ram\.ssh\stubbornram-recovery` вернул `False`.
- `Test-Path` для `C:\Users\Stubborn Ram\.ssh\stubbornram-recovery.pub` вернул `False`.

**Вывод:**
- Локальная копия recovery private/public key на основном Windows-ПК отсутствует.
- Резервная копия recovery private key остаётся на отдельном USB-носителе.
- Recovery-доступ к серверу ранее успешно проверен до удаления локальной копии.

**Итог SSH hardening:**
- `PermitRootLogin no` эффективно применяется.
- `/root/.ssh/authorized_keys` удалён.
- Основной SSH-доступ `stubbornram` проверен и работает.
- Recovery SSH-доступ `stubbornram` проверен и работает.
- Recovery-ключ удалён с основного ПК.
- Recovery-ключ на USB сохранён.

**Следующий шаг:**
- Зафиксировать завершение SSH hardening и перейти к следующему пункту инфраструктурной проверки только после согласования.

### 2026-09-14 — PostgreSQL network binding verified

**Проверили:**
- PostgreSQL слушает `127.0.0.1:5432`.
- PostgreSQL также слушает IPv6 loopback `[::1]:5432`.
- Процесс: `postgres`, PID 2797.
- Публичного bind на `0.0.0.0:5432` или `[::]:5432` не обнаружено.

**Вывод:**
- PostgreSQL принимает подключения только локально на сервере.
- Production PostgreSQL напрямую из интернета не доступен по TCP/5432.
- Это соответствует целевой архитектуре.

**Изменили:**
- Ничего.

**Следующий шаг:**
- Проверить UFW и убедиться, что 5432 не разрешён firewall, а наружу открыты только необходимые порты.

### 2026-09-15 — PM2 error log review: historical Training module startup errors

**Проверили:**
- `pm2 status`: `stubbornram-backend` online, uptime ~2D, 21 restarts.
- Последние 100 строк error log через `pm2 logs stubbornram-backend --err --lines 100 --nostream`.

**Обнаружено:**
- В error log есть ошибки ESM при запуске backend:
  1. `server.js:11` импортирует `trainingRoutes` как default из `./modules/training/training.routes.js`, но модуль не экспортирует `default`.
  2. `training.routes.js` импортирует `getAuthenticatedUser` из `../auth/auth.session.js`, но модуль не экспортирует `getAuthenticatedUser`.
- Эти сообщения объясняют как минимум часть исторических перезапусков PM2.
- По текущему состоянию процесса это не означает, что ошибка происходит сейчас: процесс online и работает около 2 дней; log содержит исторические записи.

**Изменили:**
- На сервере ничего не изменяли.
- PM2 не перезапускали.
- Код Training/Auth не меняли.

**Важно:**
- Не исправлять эти ошибки вслепую на production. Сначала сравнить текущие локальные файлы `server.js`, `training.routes.js`, `auth.session.js` и состояние production, затем определить причину расхождения.

**Следующий шаг:**
- Проверить текущие production-файлы, связанные с двумя ошибками, только чтением, чтобы понять, являются ли ошибки устаревшими или отражают актуальное расхождение кода.

### 2026-09-15 — SYSTEM_STATE.md write access restored

**Проверили:**
- `SYSTEM_STATE.md` существует и содержит предыдущую историю проекта.
- Проблема записи была связана с правами файла: файл принадлежал `root`, а текущая рабочая среда не имела права записи.

**Изменили:**
- Исправлены только права самого `SYSTEM_STATE.md`, чтобы рабочая среда могла его обновлять.
- Содержимое файла не удалялось и не перезаписывалось целиком.

**Важно:**
- На production-сервере ничего не изменяли.
- Файлы проекта и серверные файлы не удаляли.

**Следующий шаг:**
- Продолжать инфраструктурную проверку только с обязательной фиксацией каждого существенного шага в `SYSTEM_STATE.md`.

### 2026-09-15 — Continuation after pause

**Правило работы:**
- `SYSTEM_STATE.md` является обязательным живым журналом инфраструктуры Stubborn Ram.
- После каждого существенного технического шага фиксировать: что проверили, результат, что изменили, что не изменили, следующий шаг.
- Не удалять никакие файлы/объекты без отдельного конкретного разрешения пользователя.

**Точка продолжения:**
- SSH hardening завершён и проверен.
- PostgreSQL network binding проверен.
- UFW проверен.
- Nginx default site отключён, `nginx -t` и reload успешно выполнены.
- API через `api.stubbornram.ru` отвечает HTTP 404 на `/`, что не считается ошибкой само по себе.
- PM2: `stubbornram-backend` online, uptime около 2 дней, `restart_time=21`, `unstable_restarts=0`.
- Старые ошибки Training/Auth найдены в PM2 error log; текущие production-файлы `server.js`, `training.routes.js`, `auth.session.js` согласованы, поэтому эти ошибки считаются историческими до отдельного доказательства обратного.
- Последняя проверка перед паузой: `pm2 describe stubbornram-backend`.
- Следующий запланированный шаг: проверить автозапуск PM2 через systemd, только чтение.

### 2026-09-15 — PM2 autostart verified

**Проверили:**
- `systemctl is-enabled pm2-stubbornram` → `enabled`.
- `systemctl is-active pm2-stubbornram` → `active`.

**Вывод:**
- systemd unit PM2 включён в автозапуск.
- PM2 сейчас активен.
- После перезагрузки сервера systemd должен автоматически запускать PM2.

**Изменили:**
- Ничего.

**Следующий шаг:**
- Проверить, какой именно PM2 process list сохранён для автозапуска и что в нём присутствует `stubbornram-backend`, без изменения состояния.

### 2026-09-15 — PM2 saved process list verified

**Проверили:**
- На production-сервере выполнена проверка `/opt/stubbornram/.pm2/dump.pm2`.
- В сохранённом PM2 dump присутствует процесс `stubbornram-backend`.
- В dump зафиксированы корректные для текущей production-конфигурации параметры:
  - `pm_exec_path=/opt/stubbornram/backend/server/server.js`
  - `pm_cwd=/opt/stubbornram/backend/server`
  - `exec_interpreter=node`
  - `node_version=24.20.0`
  - `autostart=true`
  - `autorestart=true`
  - `watch=false`
- Сохранённый процесс имеет статус `online`, `restart_time=0`, `unstable_restarts=0` в самом dump.

**Вывод:**
- Текущий backend `stubbornram-backend` присутствует в сохранённом PM2 process list.
- В сочетании с ранее проверенными `pm2-stubbornram = enabled/active` это подтверждает корректную базовую схему автозапуска PM2 после перезагрузки.
- Фактическую перезагрузку production-сервера для проверки пока не выполняли.

**Изменили:**
- Ничего.

**Удалили:**
- Ничего.

**Следующий шаг:**
- Перейти к следующему инфраструктурному блоку — резервному копированию PostgreSQL. Сначала только проверка текущего состояния/наличия backup-механизма, без создания или удаления файлов.

### 2026-09-15 — PostgreSQL backup timer initial check

**Проверили:**
- На production-сервере выполнена команда `sudo systemctl list-timers --all | grep -Ei 'backup|postgres|pg_dump'`.
- Найден только системный `dpkg-db-backup.timer` / `dpkg-db-backup.service`.
- Таймер `dpkg-db-backup` относится к системной базе пакетов Debian/Ubuntu и сам по себе не является резервным копированием PostgreSQL Stubborn Ram.
- Таймеров/сервисов с явным назначением `postgres`, `pg_dump` или PostgreSQL backup в выводе не обнаружено.

**Вывод:**
- На основании этой проверки отдельного systemd timer для резервного копирования PostgreSQL не обнаружено.
- Это ещё не доказывает отсутствие backup-механизма вообще: резервное копирование может быть реализовано через cron, скрипт, внешний сервис или другой механизм.
- Перед любыми изменениями необходимо дополнительно проверить cron и существующие backup-скрипты/каталоги.

**Изменили:**
- Ничего.

**Удалили:**
- Ничего.

**Следующий шаг:**
- Проверить пользовательские и системные cron-задачи на наличие PostgreSQL/backup/pg_dump, без изменения состояния.

### 2026-09-15 — PostgreSQL backup: cron check
- Проверено: `/etc/cron*` и `/var/spool/cron` на наличие заданий, связанных с `pg_dump`, `pg_dumpall`, PostgreSQL или backup.
- Результат: найдено только `/etc/cron.daily/dpkg`, вызывающее `/usr/libexec/dpkg/dpkg-db-backup`.
- Это системный backup базы данных пакетов Ubuntu/Debian и не является резервным копированием production PostgreSQL Stubborn Ram.
- PostgreSQL backup через cron в проверенных каталогах не обнаружен.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: проверить другие возможные механизмы резервного копирования на сервере перед проектированием/созданием PostgreSQL backup.

### 2026-09-15 — PostgreSQL backup files: filesystem check
- Проверено: `/opt`, `/var/backups`, `/root`, `/home` на наличие SQL/dump/backup-файлов и файлов, связанных с PostgreSQL/Stubborn Ram.
- Найдено:
  - `/opt/stubbornram/backend/database/001_create_leads.sql`
  - `/opt/stubbornram/backend/database/002_leads_rls.sql`
  - `/root/stubbornram-database-2026-09-12.dump`
- Первые два файла являются SQL-файлами старой/отдельной database-структуры и сами по себе не являются подтверждением актуального production backup.
- Файл `/root/stubbornram-database-2026-09-12.dump` выглядит как существующий дамп PostgreSQL, но его содержимое, дата создания и соответствие текущей production БД ещё не проверены.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: только чтение метаданных и проверка содержимого существующего `.dump`, прежде чем проектировать новый backup-механизм.

### 2026-09-15 — Existing PostgreSQL dump: metadata check
- Проверен файл `/root/stubbornram-database-2026-09-12.dump`.
- Размер: 29K.
- Время изменения: 2026-09-12 08:01:33.437826883 UTC.
- Владелец: `root:root`.
- Права: `-rw-r--r--`.
- Вывод: файл действительно существует и является небольшим PostgreSQL dump-файлом по имени/расширению, но пока не подтверждено, что он содержит актуальную production БД или что из него можно корректно восстановить базу.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: прочитать только метаданные/оглавление dump-файла для определения его формата, базы и объектов, не выполняя восстановление.

### 2026-09-15 — Existing PostgreSQL dump: TOC inspection
- Проверено оглавление `/root/stubbornram-database-2026-09-12.dump` через `pg_restore -l`.
- Формат: PostgreSQL CUSTOM, compression gzip.
- Архив создан: 2026-09-12 08:01:33 UTC.
- `dbname`: `stubbornram`.
- Dump Version: 1.15-0.
- Создан из PostgreSQL 16.15 и `pg_dump` 16.15.
- TOC Entries: 40.
- Дамп содержит актуально выглядящие для production объекты: `users`, `profiles`, `sessions`, `auth_tokens`, `leads`, `pgmigrations`, их данные, индексы, PK/FK и связанные ограничения.
- Важное наблюдение: в TOC у `auth_tokens` присутствует индекс `auth_tokens_user_id_type_index`, но по одному имени индекса нельзя подтвердить, что в нём уже есть новое partial UNIQUE-ограничение для активных токенов. Это потребует отдельной проверки, если будем устанавливать точное состояние дампа относительно текущих миграций.
- Вывод: это настоящий PostgreSQL custom dump production-базы/базы с именем `stubbornram`, но пока не подтверждено, что он является полноценным и пригодным текущим backup по состоянию на момент проверки.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: сравнить миграционное состояние (`pgmigrations`) в dump с текущим production состоянием, не выполняя восстановление.

### 2026-09-15 — PostgreSQL dump migration extraction attempt
- Попытались вывести данные таблицы `public.pgmigrations` из dump командой `pg_restore --data-only --table=public.pgmigrations`.
- Результат: `pg_restore` сообщил, что требуется указать `-d/--dbname` или `-f/--file`.
- Причина: `pg_restore` не выводит восстановленные данные в stdout без явного указания файла назначения.
- Изменения: ничего не изменяли в production БД и на сервере.
- Удаления: ничего не удаляли.
- Следующий шаг: повторить безопасную операцию с выводом в stdout через `-f -`, только для чтения dump.

### 2026-09-15 — PostgreSQL dump: pgmigrations TOC verification
- Повторно проверен TOC dump-файла `/root/stubbornram-database-2026-09-12.dump` по `pgmigrations`.
- Подтверждено наличие `TABLE DATA public pgmigrations` с TOC ID `3470`.
- Также присутствуют сама таблица `pgmigrations`, sequence, default, sequence set и primary key.
- Предыдущий вывод через `pg_restore --data-only --table=public.pgmigrations -f -` не показал строки данных, несмотря на наличие `TABLE DATA` в TOC. Причина пока не установлена; больше не делаем вывод о содержимом `pgmigrations` без дополнительной проверки.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: извлечь конкретный TOC-объект `3470` в SQL/временный вывод безопасным способом, чтобы увидеть фактические данные миграций в dump.

### 2026-09-15 — PostgreSQL dump: TOC extraction attempt
- Попытались извлечь конкретный TOC-объект `3470` через process substitution `<(...)`.
- Результат: `pg_restore` не смог открыть `/dev/fd/63` (`No such file or directory`).
- Причина связана с особенностями файловой системы `/dev/fd` при передаче process-substitution в `pg_restore`, а не с повреждением dump-файла.
- Production PostgreSQL не подключалась и не изменялась.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: использовать безопасный временный файл для списка TOC вместо `/dev/fd`, после чего снова прочитать объект `3470`.

### 2026-09-15 — PostgreSQL dump: temporary TOC list created
- По явному разрешению создан временный файл `/tmp/stubbornram-pgmigrations.list`.
- Назначение: безопасно передать `pg_restore` конкретный TOC-объект `3470` (`TABLE DATA public pgmigrations`) без использования `/dev/fd`.
- Production PostgreSQL не подключалась и не изменялась.
- Другие файлы не изменялись.
- Удаления: ничего не удаляли.
- Следующий шаг: прочитать данные `pgmigrations` из существующего dump через созданный временный TOC-файл.

### 2026-09-15 — PostgreSQL dump: migration state extracted
- Из существующего dump `/root/stubbornram-database-2026-09-12.dump` успешно извлечены данные `public.pgmigrations`.
- Backup содержит только миграции:
  1. `1788859125911_init` — 2026-09-10 06:15:51.66196
  2. `1788859125912_sessions` — 2026-09-10 06:27:58.618322
  3. `1788859125913_auth_tokens` — 2026-09-10 06:29:38.69238
  4. `1788859125914_leads` — 2026-09-11 08:46:38.57826
- Следовательно, dump от 2026-09-12 содержит состояние БД только до миграции `5914` и не содержит более поздних миграций `5915`, `5916`, `5917` (и тем более `5918`, которая ранее не применялась в production).
- Это важный факт: существующий dump является исторической копией и не является backup текущего production состояния на 2026-09-15.
- Изменения: production БД не изменяли; dump не изменяли.
- Удаления: ничего не удаляли.
- Временный файл `/tmp/stubbornram-pgmigrations.list` пока оставлен, как было отдельно согласовано.
- Следующий шаг: проверить текущее production состояние `pgmigrations` напрямую, затем спроектировать нормальную автоматическую backup-систему с политикой хранения и проверкой восстановления.

### 2026-09-15 — Production PostgreSQL migration state verified
- Напрямую проверена production БД `stubbornram`, таблица `public.pgmigrations`.
- Текущее состояние: применены 7 миграций:
  1. `1788859125911_init`
  2. `1788859125912_sessions`
  3. `1788859125913_auth_tokens`
  4. `1788859125914_leads`
  5. `1788859125915_training`
  6. `1788859125916_seed_exercises`
  7. `1788859125917_auth_tokens_active_unique`
- Миграция `5918` в production не применена.
- Сравнение с dump от 2026-09-12: dump содержит только первые 4 миграции (`5911`–`5914`), поэтому он отстаёт от текущей production БД на три применённые миграции.
- Это подтверждает, что существующий dump нельзя использовать как актуальную точку восстановления текущей production БД без потери изменений, внесённых миграциями `5915`–`5917`.
- Изменения: production БД не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: определить и согласовать production backup policy и механизм автоматического создания/хранения/проверки PostgreSQL backup.

### 2026-09-15 — AWS CLI / Object Storage configuration check
- Проверено: `aws configure list` на production-сервере.
- Результат:
  - profile: не задан;
  - access_key: не задан;
  - secret_key: не задан;
  - region: `ru-6`, источник `imds`.
- Вывод: AWS CLI установлен, но локальные AWS/S3 credentials не настроены. Наличие region `ru-6` само по себе не подтверждает подключение Object Storage.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: проверить, есть ли на сервере существующая конфигурация/переменные окружения для S3/Object Storage, не раскрывая секретные значения.

### 2026-09-15 — Production `.env`: S3/Object Storage variable-name check
- Безопасно проверен только список имён переменных в `/opt/stubbornram/backend/server/.env`, отфильтрованных по `s3|aws|storage|bucket|object`.
- Результат: ничего не найдено.
- Значения `.env` не выводились и не раскрывались.
- Вывод: в текущем production `.env` нет переменных с очевидными именами для S3/AWS/Object Storage. Это дополнительно подтверждает, что Object Storage пока не подключено на уровне backend environment.
- Изменения: ничего не изменяли.
- Удаления: ничего не удаляли.
- Следующий шаг: проверить документацию/инфраструктурные файлы проекта на наличие уже принятого решения по backup-хранилищу или Object Storage, прежде чем выбирать и подключать новый сервис.

## 2026-09-15 — Зафиксированы ключевые требования документации для дальнейших действий

По актуальным документам проекта зафиксированы только сведения, необходимые для продолжения инфраструктурной работы:

- Целевая архитектура: React/PWA → Services/API Client → Backend API (Fastify) → PostgreSQL / Object Storage / Workers.
- Production сейчас: stubbornram.ru → Nginx/HTTPS → Fastify → PostgreSQL 16; Unisender Go используется для email.
- PostgreSQL является source of truth для структурированных данных.
- Object Storage (Selectel Object Storage / S3-compatible) — целевой компонент для медиа, но **ещё не внедрён в production**. Сейчас его не подключаем без отдельного обоснования и проверки.
- Training persistence уже реализован в production; повторную миграцию тренировочной структуры не делать без отдельной причины.
- Изменения БД выполняются только через migrations. Перед опасными миграциями нужен backup и проверенный rollback.
- Резервное копирование обязательно: минимум PostgreSQL, отдельное хранение backup, понятная retention policy и реальная проверка восстановления. Для Object Storage защита/backup также потребуется после его внедрения.
- Production и test DB должны быть разделены.
- Frontend не должен обращаться к PostgreSQL напрямую; серверные permission/ownership checks обязательны.
- Инфраструктурные изменения проходят порядок: ПРОВЕРКА → ОБСУЖДЕНИЕ → ДОКУМЕНТАЦИЯ → СОГЛАСОВАНИЕ → ИЗМЕНЕНИЕ → ПРОВЕРКА.
- При риске потери данных, проблемах безопасности или подключении нового внешнего сервиса работу останавливаем до отдельного обсуждения.
- Текущий приоритет пользователя: **сначала полностью привести в порядок и проверить инфраструктуру, затем вернуться к Training 2.0**.
- Текущий следующий этап: **PostgreSQL Backup**. Пока выполняем только read-only проверки; ничего не создаём, не удаляем и не меняем до обсуждения и явного разрешения.
- Предыдущая проверка `.env` показала отсутствие очевидных переменных S3/AWS/Object Storage; это подтверждает, что Object Storage пока не подключён. Значения секретов не раскрывались.

Из этих документов дальнейшие действия определяются так: сначала проверить фактическое состояние PostgreSQL backup/WAL archiving, затем обсудить безопасную схему backup/restore, задокументировать её и только после согласования внедрять.

## 2026-09-15 — PostgreSQL backup: проверка инструмента

Проверено на production-сервере:
- `pg_dump --version` → `pg_dump (PostgreSQL) 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)`.
- Инструмент `pg_dump` установлен и соответствует версии production PostgreSQL 16.15.
- Ничего не создавалось, не удалялось и не изменялось.

В совокупности с предыдущей проверкой:
- `archive_mode = off`;
- `archive_command = (disabled)`;
- `wal_level = replica`.

Следующий шаг: проверить фактическое наличие/состояние существующих backup-файлов и каталогов в production. До обсуждения схемы backup никаких изменений не вносить.

## 2026-09-15 — PostgreSQL backup: поиск существующих backup-файлов

Проверен production по `/opt`, `/var/backups`, `/var/lib/postgresql` на файлы `*.dump`, `*.sql`, `*.sql.gz`, `*.dump.gz`.

Результат:
- Реальных PostgreSQL backup-файлов в этих каталогах не найдено.
- Найдены только служебные/исходные SQL-файлы проекта:
  - `node_modules/node-pg-migrate/templates/migration-template.sql` — 34 bytes;
  - `/opt/stubbornram/backend/database/001_create_leads.sql` — 619 bytes;
  - `/opt/stubbornram/backend/database/002_leads_rls.sql` — 146 bytes.
- Эти файлы не являются резервными копиями production PostgreSQL.
- Ничего не создавалось, не удалялось и не изменялось.

Текущее состояние backup: подтверждено отсутствие готового файлового PostgreSQL backup-механизма; `pg_dump` установлен, WAL archiving/PITR не настроен.
Следующий шаг: проверить наличие отдельного каталога/сервиса/cron-механизма для backup, не создавая ничего нового.

## 2026-09-15 — PostgreSQL backup: проверка каталогов

Проверены каталоги `/opt`, `/var/backups`, `/srv`, `/backup`, `/backups` на наличие каталогов с названиями `backup/backups/dump/postgres/pgsql`.

Результат:
- найден только стандартный каталог `/var/backups`;
- отдельного `/backup`, `/backups`, `/srv/...` или PostgreSQL-specific backup-каталога не обнаружено;
- это не подтверждает наличие backup-механизма в `/var/backups`, только отсутствие дополнительных каталогов по проверенному критерию;
- ничего не создавалось, не удалялось и не изменялось.

Итог проверки backup на текущем этапе: `pg_dump` установлен, но готового PostgreSQL backup-механизма или очевидного отдельного каталога хранения не найдено; WAL archiving/PITR отключён.
Следующий шаг: отдельно проверить содержимое `/var/backups` и связанные системные задания/сервисы, затем перейти к обсуждению схемы backup.

## 2026-09-15 — PostgreSQL backup: содержимое `/var/backups`

Проверено содержимое `/var/backups`.

Результат:
- каталог содержит только системные backup-файлы Ubuntu/Debian: `dpkg.*`, `apt.extended_states.*`, `alternatives.tar.*`, `dpkg.diversions.*`, `dpkg.statoverride.*`;
- PostgreSQL backup-файлов (`pg_dump`, `.dump`, `.sql` и аналогичных) нет;
- найденные системные файлы не являются резервными копиями production БД Stubborn Ram;
- ничего не создавалось, не удалялось и не изменялось.

Итог текущей проверки:
- PostgreSQL 16.15;
- `pg_dump` установлен;
- `archive_mode=off`, `archive_command=(disabled)`, `wal_level=replica`;
- отдельного backup-каталога/механизма не обнаружено;
- `/var/backups` содержит только системные Ubuntu/Debian backup-файлы;
- **резервное копирование production PostgreSQL фактически ещё не настроено**.

Переходим от диагностики к обсуждению схемы backup. До отдельного согласования никаких backup-файлов, каталогов, cron/systemd-задач или PostgreSQL-настроек не создаём и не изменяем.

## 2026-09-15 — Object Storage: первый production bucket создан

Изменение выполнено в Selectel:
- создан приватный S3 bucket `stubbornram-media`;
- локация: Москва / `ru-6`;
- класс хранения: Стандартный;
- чтение объектов: Приватный;
- тип адресации: vHosted;
- версионирование: выключено;
- Object Lock: выключен;
- на момент проверки: 0 объектов, 0 Б.

Назначение bucket: единое приватное хранилище пользовательских файлов Stubborn Ram (фото, видео, документы, вложения Chat/Reports/Training и будущих модулей) через backend.

Проверка после создания:
- Selectel показал сообщение «Бакет создан и готов к работе»;
- bucket отображается в панели как `stubbornram-media`;
- локация отображается как Москва / `ru-6`;
- объектов пока нет.

Изменение касается только создания нового bucket. Никакие существующие файлы, БД, backend, Nginx или другие инфраструктурные объекты не изменялись и не удалялись.

Следующий шаг: отдельно проверить вкладки «Конфигурация», «Подключение» и «Политика доступа» и определить безопасный способ подключения backend. S3-ключи пока не создаём, пока не проверим необходимую модель доступа.


## 2026-09-15 — Object Storage: сервисный пользователь и S3-ключ

Изменение выполнено в Selectel IAM:
- создан отдельный сервисный пользователь `stubbornram-backend`;
- область доступа: проект `My First Project`;
- роль: `s3.bucket.user`;
- пользователь не добавлен в группы и дополнительных разрешений не получил;
- создан S3-ключ `stubbornram-backend-s3` для этого сервисного пользователя;
- Access Key и Secret Key были сгенерированы Selectel и сохранены пользователем вне чата; Secret Key в чат не передавался.

Проверка после создания:
- сервисный пользователь отображается активным;
- роль `s3.bucket.user` назначена проекту `My First Project`;
- S3-ключ отображён как созданный;
- секретные значения не раскрывались в переписке.

Ничего из существующей инфраструктуры Stubborn Ram (PostgreSQL, backend, Nginx и т. п.) не изменялось и не удалялось.

Следующий шаг: настроить и проверить Bucket Policy для `stubbornram-media`, ограничив доступ сервисного пользователя только необходимыми операциями с этим bucket. До согласования точных разрешений policy не создавать.

## 2026-09-15 — Selectel: проверка переименования проекта

Проверка выполнена после переименования проекта в панели Selectel:
- текущее название проекта: `CRM StubbornRam`;
- сервисный пользователь: `stubbornram-backend`;
- роль: `s3.bucket.user`;
- разрешение отображается для проекта `CRM StubbornRam`;
- S3-ключ `stubbornram-backend-s3` ранее создан для этого же проекта и отдельно не изменялся.

Результат:
- переименование проекта корректно отразилось в IAM;
- сервисный пользователь и его роль продолжают ссылаться на тот же проект;
- изменений в backend, PostgreSQL, Nginx, bucket или S3-ключе не требуется.

Ничего не удалялось и не изменялось, кроме ранее выполненного переименования проекта в панели Selectel.

Следующий шаг: открыть `stubbornram-media` в Selectel S3 и проверить раздел «Политика доступа» перед созданием Bucket Policy.


## 2026-09-15 — Object Storage Bucket Policy

- Проверено: в Selectel S3 bucket `stubbornram-media` (CRM StubbornRam, Москва / ru-6) сохранена политика доступа `stubbornram-backend-media`.
- Правило настроено для сервисного пользователя `stubbornram-backend`; личная учётная запись пользователя из правила удалена до сохранения.
- Набор действий: `Редактор`.
- Ресурсы: `stubbornram-media` и `stubbornram-media/*`.
- Результат: политика успешно сохранена и отображается в разделе «Политика доступа».
- Не изменено: backend, `.env`, PostgreSQL, Nginx, S3-ключ и настройки bucket.
- Следующий шаг: подготовить безопасное подключение S3 к backend; перед изменением `.env` сначала проверить текущую конфигурацию backend и определить точные переменные S3.


## 2026-09-15 — Local backend S3 preparation

- Проверено: локальный проект находится в `D:\CRM-Platform Stubborn Ram`.
- Проверено: backend расположен в `backend/` и содержит `migrations/`, `modules/`, `node_modules/`, `.env`, `.env.example`, `.gitignore`, `database.cjs`, `package.json`, `package-lock.json`, `server.js`.
- Проверено: `backend/package.json` ранее не содержал S3 SDK.
- Изменено: установлен `@aws-sdk/client-s3` в `backend`; подтверждена версия `3.1132.0`.
- Проверено: `npm audit` после установки показал `0 vulnerabilities`.
- Проверено: `backend/.env` содержит текущие переменные без S3; значения секретов не раскрывались.
- Проверено: `backend/.env.example` не содержит S3-переменных.
- Проверено: `backend/.gitignore` содержит `.env`; `git check-ignore -v .\backend\.env` подтвердил, что файл игнорируется.
- Проверено: локальные версии Node.js `v24.18.0`, npm `11.16.0`.
- Проверено: текущая структура `backend/modules/`: `auth`, `db`, `email`, `leads`, `training`.
- Не изменено: `server.js`, `.env`, `.env.example`, PostgreSQL, production backend, Nginx и существующая S3-конфигурация.
- Следующий шаг: определить структуру отдельного S3-модуля в `backend/modules/` после проверки существующих модулей; затем отдельно согласовать переменные окружения и реализацию подключения.


## 2026-09-15 — Documentation files identified for S3/Storage review

- Проверено: в `docs/` найдены документы, относящиеся к Storage/S3 и архитектурным правилам: `MEDIA.md`, `MIGRATION_ARCHITECTURE.md`, `ARCHITECTURE_LAYOUT.md`, `architecture/PLATFORM_ARCHITECTURE.md`, `architecture/PERMISSIONS_ARCHITECTURE.md`, `architecture/SECURITY.md`, `core/ARCHITECTURE.md`, `core/CODING_RULES.md`, `core/DEVELOPMENT_RULES.md`.
- Изменено: ничего в проектной документации не изменялось; выполнен только поиск файлов.
- Следующий шаг: прочитать в первую очередь `MEDIA.md` и связанные правила, чтобы реализовать Storage/S3 в соответствии с уже зафиксированной архитектурой.

## 2026-09-15 — Architecture/security documentation review for Object Storage

- Проверено: загружены и изучены `MEDIA.md`, `PERMISSIONS_ARCHITECTURE.md`, `SECURITY.md`, `ARCHITECTURE.md`, `CODING_RULES.md`, `DEVELOPMENT_RULES.md`.
- Подтверждено: целевой Storage — private S3-compatible Object Storage; PostgreSQL хранит metadata и связи, бинарные файлы — в Object Storage; frontend не получает storage credentials; доступ к файлам проходит через Backend permission/ownership/relationship checks и временные signed URLs.
- Подтверждено: Storage должен быть изолирован за server-side service/adapter и не должен быть напрямую доступен из React; это соответствует общей цепочке Services → Backend API → PostgreSQL/Object Storage.
- Подтверждено: для Media MVP предусмотрены `media.upload` и `media.read`; автоматическое lifecycle-удаление пользовательских материалов не используется.
- Подтверждено: секреты S3 должны находиться только на сервере и не попадать во frontend/Git; permissions проверяются сервером.
- Проверено: текущий локальный backend уже содержит `@aws-sdk/client-s3@3.1132.0`; `@aws-sdk/s3-request-presigner` пока не установлен.
- Изменено: ничего в коде или документации проекта не изменялось на этом шаге; выполнен только архитектурный review.
- Не изменено: backend `.env`, `.env.example`, `server.js`, PostgreSQL, production backend, Nginx, bucket configuration и S3 credentials.
- Следующий шаг: проверить раздел S3-ключей и наличие ключа именно для service user `stubbornram-backend`; ключ пока не создавать и секрет в чат не передавать.


## 2026-09-15 — Проверка S3-ключей для Object Storage

- Проверено: в Selectel → S3 → S3-ключи уже существует ключ `stubbornram-backend-s3`.
- Владелец ключа: service user `stubbornram-backend`.
- Регион интерфейса: `ru-6`.
- Подтверждено: отдельный S3-ключ для backend уже создан; новый ключ на этом шаге создавать не требуется.
- Не изменено: bucket `stubbornram-media`, его policy, backend-код, `.env`, PostgreSQL, production backend.
- Важно: secret key в чат не передавался и не должен передаваться.
- Следующий шаг: безопасно проверить доступные действия для существующего ключа через меню `⋮`, не удаляя и не перевыпуская ключ.


## 2026-09-15 — Local `.env` prepared for Selectel Object Storage

- Проверено по экрану редактора: в `backend/.env` добавлены S3-переменные `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
- Подтверждено: endpoint `https://s3.ru-6.storage.selcloud.ru`, region `ru-6`, bucket `stubbornram-media`.
- Подтверждено: Access Key и Secret Key относятся к ранее созданному ключу `stubbornram-backend-s3`; сами секретные значения в чат не передавались.
- Не изменено: `.env.example`, `server.js`, storage-модуль, PostgreSQL, production backend.
- Следующий шаг: безопасно проверить наличие и названия S3-переменных без вывода их значений, затем перейти к созданию отдельного `storage`-модуля.


## 2026-09-15 — Проверка S3-переменных локального `.env`

- Проверено: команда чтения `backend/.env` без вывода значений подтвердила наличие всех пяти переменных: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`.
- Результат: все пять переменных имеют значение (`<SET>`).
- Изменено: ничего; выполнена только проверка.
- Секреты: значения `S3_ACCESS_KEY` и `S3_SECRET_KEY` не выводились в терминал и не передавались в чат.
- Следующий шаг: создать отдельный S3 Storage-модуль в backend после согласования минимального интерфейса и затем проверить его подключение.


---

# STUBBORN RAM — FOUNDATION PRINCIPLES

Версия: 1.0
Дата: сентябрь 2026
Статус: принятое архитектурное решение

## 1. Главный принцип

Stubborn Ram строится как расширяемая платформа.

Новые функции и модули должны добавляться поверх существующего фундамента, а не требовать его разрушения или повторной миграции.

## 2. Данные клиентов

Данные клиентов — приоритет №1.

При изменении:
- структуры;
- интерфейса;
- модулей;
- интеграций;
- провайдеров;
- способов обработки данных

накопленные данные не должны теряться, необратимо удаляться или без необходимости переноситься в новые независимые копии.

Новые возможности должны по возможности работать с уже существующими данными.

## 3. Расширяемость

Архитектура должна заранее оставлять возможность добавлять:
- новые модули;
- новые типы данных;
- AI;
- внешние сервисы и интеграции;
- новые способы обработки media;
- дополнительные функции внутри существующих модулей.

При этом сейчас не требуется реализовывать неизвестные будущие функции.

Принцип: предусмотреть возможность расширения, но не усложнять систему без текущей необходимости.

## 4. Разработка поэтапно

Не разрабатываем весь будущий Stubborn Ram одновременно.

Работа ведется вертикальными этапами:

1. архитектурный фундамент;
2. один конкретный модуль;
3. рабочая persistence;
4. Backend API;
5. необходимые permissions/security;
6. пользовательский сценарий;
7. проверка;
8. переход к следующему модулю.

Модуль считается достаточно готовым для использования, когда его основная цепочка работает, даже если дополнительные функции будут добавлены позже.

## 5. Backend — фундамент

Backend, безопасность и инфраструктура развиваются вместе с продуктом.

Backend является центральной точкой:
- authentication;
- access;
- permissions;
- business logic;
- PostgreSQL;
- Object Storage;
- внешних интеграций.

Frontend не должен напрямую обходить Backend для работы с данными или приватными файлами.

## 6. Media / Object Storage

Object Storage является общей инфраструктурой хранения файлов.

Один Media layer должен постепенно обслуживать:
- Training;
- Reports;
- Chat;
- Photos & Measurements;
- будущие модули.

Не создавать отдельное файловое хранилище для каждого модуля.

Сами файлы хранятся в Object Storage, metadata и связи — в PostgreSQL.

## 7. Принцип незаметных изменений

Будущие архитектурные изменения должны по возможности быть внутренними для системы.

Пользовательский интерфейс и поведение существующих функций не должны без необходимости ломаться из-за развития Backend, Database, Storage или добавления новых модулей.

## 8. Текущий подход

Сейчас не пытаемся угадать весь окончательный продукт.

Сначала доводим фундамент и существующие основные функции до рабочего состояния.

Ближайшая практическая цель:
- подключить существующий private Object Storage к Backend;
- сделать рабочее сохранение media;
- затем использовать этот фундамент для Training;
- после проверки постепенно подключать Reports, Chat и другие модули.

## 9. Запрет

Нельзя ради нового функционала:
- удалять накопленные клиентские данные;
- создавать дублирующие источники истины без архитектурной необходимости;
- ломать существующую persistence;
- менять общую инфраструктуру без необходимости;
- реализовывать неизвестные будущие функции заранее только «на всякий случай».

## Итог

Сначала создаём надежный фундамент.

Затем добавляем модули по одному.

Каждый новый слой должен расширять систему, а не ломать предыдущий.

Главный приоритет:

**сохранность данных → безопасность → стабильность → расширяемость → функциональность → скорость разработки.**


### 2026-09-15 — S3 Presigner dependency installed locally
- Проверка: `backend/package.json` показал наличие `@aws-sdk/client-s3` и отсутствие `@aws-sdk/s3-request-presigner`.
- Изменение: в локальном `backend` выполнено `npm install @aws-sdk/s3-request-presigner`.
- Результат: пакет установлен; npm сообщил `added 1 package`, аудит `134 packages`, `0 vulnerabilities`.
- Дополнительно: npm вывел предупреждение `allow-scripts` для `argon2@0.45.1`; это отдельное предупреждение политики выполнения install scripts, не ошибка установки S3-пакета.
- Production/backend/БД/S3-конфигурация не изменялись.
- Следующий шаг: проверить фактическую структуру текущего Backend и точку подключения Storage перед созданием `storage.service.js`.


### 2026-09-15 — Проверка структуры Training перед созданием Storage
- Проверен каталог `backend/modules/training` локального Backend.
- Команда: `Get-ChildItem .\modules\training -Recurse -File | Select-Object FullName`.
- Результат: каталог содержит как минимум файл `training.route.js`, но вывод PowerShell обрезал длинный путь (`training.route...`), поэтому точную структуру файлов пока нельзя считать полностью установленной.
- Изменения в коде: нет.
- Production: не изменялся.
- PostgreSQL: не изменялся.
- Object Storage: не изменялся.
- Следующий шаг: повторно вывести точные имена файлов без форматирования, затем определить фактический паттерн модуля перед созданием `storage.service.js`.


### 2026-09-15 — Проверка структуры Training routes перед созданием Storage
- Проверен фактический файл `backend/modules/training/training.routes.js`.
- Training сейчас реализован одним route-модулем, который напрямую использует `app.pg` и `getAuthenticatedUser`.
- Маршруты работают с PostgreSQL непосредственно внутри route-файла; отдельного `training.service.js` в проверенной структуре нет.
- Проверенный файл не изменялся.
- Для Storage это означает: не копируем структуру Training автоматически; сначала определяем минимальный независимый Storage service и его регистрацию в Backend.
- Следующий шаг: проверить регистрацию модулей/routes в `server.js` перед созданием Storage.


## 2026-09-15 — S3 environment template preparation
- Verified `backend/package.json`: `@aws-sdk/client-s3` was already installed; `@aws-sdk/s3-request-presigner` was then installed successfully with 0 vulnerabilities.
- Verified current Backend structure: `modules/training/training.routes.js` is the existing Training route module; `server.js` registers auth, leads, and training routes and exposes PostgreSQL as `app.pg`.
- Verified `backend/.env.example` contained DB/Unisender variables and no S3 variables before the change.
- Verified `backend/.gitignore` contains `.env`; `git check-ignore -v .\\.env` confirmed `backend/.gitignore:1:.env` ignores the real Backend `.env`.
- Changed only `backend/.env.example`: added the five S3 configuration variable names `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, with empty values. No real secrets were added.
- Production server, PostgreSQL, S3 bucket, and application code were not changed.
- Next: verify the resulting `.env.example` contents, then proceed to the S3 Storage service design/implementation one step at a time.


## 2026-09-15 — Storage plugin connected in local server.js

- Verified the local `storage.service.js` module imports successfully and exports the four agreed Storage operations.
- Created and verified `backend/modules/storage/storage.plugin.js`, which exposes the Storage service through Fastify as `app.storage`.
- User manually corrected `backend/server.js` after an earlier PowerShell replacement accidentally inserted literal `` `r`n `` text.
- Current intended `server.js` state includes:
  - `import storagePlugin from "./modules/storage/storage.plugin.js";`
  - `await app.register(storagePlugin);`
- No Production changes, PostgreSQL changes, or S3 object changes were made.
- Next step: syntax/structural verification of `server.js` before starting the local backend.

### 2026-09-15 — Local PostgreSQL service verification
- Проверка: `Get-Service *postgres*` в PowerShell из `D:\CRM-Platform Stubborn Ram\backend`.
- Результат: служба `postgresql-x64-16` существует и имеет статус `Running`.
- Изменено: ничего в проекте или конфигурации Stubborn Ram не изменялось; подтверждено, что локальный PostgreSQL 16 установлен и запущен как Windows-служба.
- Следующий шаг: проверить доступность `psql` из командной строки и затем подключение к локальному PostgreSQL.

### 2026-09-15 — Проверка доступности psql
- Команда: `psql --version`.
- Результат: PowerShell не распознал `psql` как команду (`CommandNotFoundException`).
- Вывод: PostgreSQL 16 как Windows-служба работает, но каталог с `psql.exe` пока не добавлен в PATH текущей среды.
- Изменено: ничего в проекте Stubborn Ram не изменялось.
- Production: не изменялся.
- Следующий шаг: проверить наличие `psql.exe` в стандартном каталоге PostgreSQL 16 и только после этого решить, добавлять ли его в PATH.

### 2026-09-15 — Локальный PostgreSQL CLI: проверка версии
- `psql.exe` найден в `C:\Program Files\PostgreSQL\16\bin\psql.exe`.
- Прямая проверка версии успешно выполнена: `psql (PostgreSQL) 16.15`.
- Вывод: локальный PostgreSQL 16.15 установлен корректно, служба работает, клиент `psql` работает; в PATH Windows каталог PostgreSQL пока не добавлен.
- Изменено: проект Stubborn Ram, база данных и конфигурация PostgreSQL не изменялись.
- Production: не изменялся.

### 2026-09-15 — Контекст показанного pgAdmin
- Пользователь показал веб-интерфейс `admin.stubbornram.ru/browser/` с подключением `Stubborn Ram PostgreSQL` и базой `stubbornram`.
- Это существующий Production pgAdmin/Production PostgreSQL и он не является недавно установленным локальным PostgreSQL на Windows.
- Показанный интерфейс подтверждает наличие Production базы и таблиц, но никаких действий в Production по этому скриншоту не выполнялось.

### 2026-09-15 — Local PostgreSQL 16.15 CLI verification
- Проверено наличие `C:\Program Files\PostgreSQL\16\bin\psql.exe`: `True`.
- Проверена версия прямым запуском executable: `psql (PostgreSQL) 16.15`.
- Вывод: локальный PostgreSQL 16.15 установлен корректно; предыдущая ошибка `psql --version` была только из-за отсутствия PostgreSQL `bin` в PATH.
- Изменений в проекте и базе данных на этом шаге не выполнялось.
- Следующий шаг: безопасно проверить локальные `DB_*` настройки `.env` без вывода пароля, затем создать/подготовить локальную БД `stubbornram`.

### 2026-09-15 — Local DB environment verification
- Verified local backend `.env` database connection settings without exposing the password: `DB_HOST=127.0.0.1`, `DB_PORT=5432`, `DB_NAME=stubbornram`, `DB_USER=stubbornram_app`.
- Result: local backend is configured to use PostgreSQL on localhost port 5432, database `stubbornram`, application role `stubbornram_app`.
- No files or database objects were changed by this verification.

## 2026-09-15 — Local PostgreSQL administrator connection verified
- Verified local PostgreSQL administrator authentication using `psql` 16.15 against `127.0.0.1:5432`.
- Connection succeeded to database `postgres` as user `postgres`.
- No database objects or project files were changed in this step.
- Next: inspect whether local role `stubbornram_app` and database `stubbornram` already exist before creating anything.

### 2026-09-15 — Local Backend database connection verified
- Started the local Backend from `D:\CRM-Platform Stubborn Ram\backend` with `npm start` after configuring the local `DB_PASSWORD` in `.env`.
- Backend started successfully and logged `Server listening at http://127.0.0.1:3000`.
- The previous local PostgreSQL `ECONNREFUSED 127.0.0.1:5432` condition is resolved.
- No Production services, database, or data were changed in this step.

### 2026-09-15 — Local Backend database health check
- With the local Backend running, checked `http://127.0.0.1:3000/health` from a separate PowerShell window.
- Result: HTTP 200; response `{"ok":true,"service":"stubbornram-backend","database":true}`.
- This confirms the local Fastify Backend is running and has an active database connection to the local PostgreSQL instance.
- No database schema or application data was changed in this verification; Production was not touched.

### 2026-09-15 — Local Backend ↔ PostgreSQL health verification
- Started the local Backend from `D:\CRM-Platform Stubborn Ram\backend` with `npm start`.
- Verified the Backend starts successfully on `127.0.0.1:3000`.
- Verified `GET /health` returns HTTP `200` with `{"ok":true,"service":"stubbornram-backend","database":true}`.
- This confirms the local Backend is connected to the local PostgreSQL database through the configured `stubbornram_app` credentials.
- No Production services or Production database were changed.
- Next technical step: inspect local migration state before applying any migrations; no migration is being run yet.
