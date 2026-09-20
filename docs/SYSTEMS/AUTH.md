# AUTH

## Назначение

Каноническое описание подсистемы authentication и session для Stubborn Ram.
Этот документ описывает текущее реализованное поведение, verified production-поведение, известные пробелы и deferred security-расширения.

## Статус

- В целом: CURRENT с документированными ограничениями.
- Согласованность с foundation remediation: F1-SEC-01 PARTIALLY VERIFIED, F1-SEC-02 VERIFIED, F1-SEC-03 VERIFIED.

## Текущая Архитектура

Статус: CURRENT

Runtime chain:

Frontend
-> src/services/auth/authService.js
-> src/shared/lib/apiClient.js
-> Backend Auth API (Fastify)
-> PostgreSQL tables users/profiles/sessions/auth_tokens

Подтверждённые границы:

- Frontend не обращается к PostgreSQL напрямую.
- Auth API работает на server-side и использует cookie-based подход.

## Модель Идентичности

Статус: CURRENT

- Основная идентичность: users.id (UUID).
- Связь профиля: profiles.user_id (одна строка profile на каждый user_id).
- Email является уникальным credential, но системным ключом связи выступает user_id.

## Регистрация

Статус: CURRENT

Реализованный flow:

1. POST /api/auth/register validates credentials (Zod).
2. Backend creates user + profile in one DB transaction.
3. Backend creates email verification token.
4. Backend attempts email delivery.
5. API returns emailVerificationRequired=true and verificationEmailSent flag.

Примечания по evidence:

- Account не откатывается при ошибке отправки email.
- Это поведение согласовано с resend recovery path.

## Подтверждение Email

Статус: CURRENT

Реализовано:

- Verification endpoint: POST /api/auth/verify-email.
- Token type email_verification in auth_tokens.
- Valid token marks users.email_verified_at and token used_at in one transaction.
- Resend endpoint: POST /api/auth/resend-verification.

Ограничения:

- Login блокируется ошибкой EMAIL_NOT_VERIFIED до прохождения verification.

## Вход

Статус: CURRENT

- Endpoint: POST /api/auth/login.
- Проверяет email и password hash.
- Применяет обязательный gate проверки email.
- Создаёт server session и устанавливает secure cookie.

## Session Lifecycle

Статус: CURRENT

Текущая механика:

- Session token stored as hash in sessions.token_hash.
- Cookie name: stubbornram_session.
- Cookie flags: httpOnly, secure, sameSite none, path /.
- Cookie maxAge: 30 days.
- DB expiration: auth.service SESSION_DAYS = 30.
- Session touch: last_used_at updated during session lookup.

Очистка:

- Очистка истёкших sessions выполняется при запуске и далее каждые 24h scheduler tick.
- Реализовано в backend/server.js удалением sessions, где expires_at < now().

## Выход

Статус: CURRENT

- Endpoint: POST /api/auth/logout.
- Удаляет текущую session по token hash и очищает cookie.

Выход со всех устройств:

- Отдельный endpoint/capability logout-all-devices: DEFERRED / NOT IN CURRENT SCOPE.
- Текущая массовая инвалидизация есть только в reset-password complete flow.

## Пароль / Восстановление

Статус: CURRENT

Реализованные flows:

- Request reset: POST /api/auth/reset-password/request.
- Complete reset: POST /api/auth/reset-password/complete.
- Завершение reset обновляет password hash, помечает token как used и удаляет все user sessions.

## Frontend Flow

Статус: CURRENT

Подтверждённая frontend-интеграция:

- src/services/auth/authService.js uses apiClient request paths:
  - /auth/register
  - /auth/login
  - /auth/session
  - /auth/logout
  - /auth/resend-verification
  - /auth/verify-email
  - /auth/reset-password/request
  - /auth/reset-password/complete
- src/contexts/AuthContext.jsx restores session via getSession on app start.
- apiClient uses credentials include for cookie-based auth.

Не подтверждено как реализованное в этой подсистеме:

- Welcome flow и post-verification profile lifecycle как принудительный runtime gate.
  Статус: NOT VERIFIED в текущем auth runtime baseline.

## Backend Flow

Статус: CURRENT

Реализованные контроли:

- Zod input validation for auth payloads.
- Per-endpoint rate limits on critical auth routes.
- Email verification and password reset token lifecycle in auth_tokens.
- Session persistence in sessions table.

Защита по Origin:

- Методы /api, меняющие состояние, требуют allowed Origin header.
- Чужой origin отклоняется с 403 INVALID_ORIGIN.
  Статус: VERIFIED (F1-SEC-02).

## Сущности Базы Данных

Статус: CURRENT

Базовые auth-сущности:

- users
- profiles
- sessions
- auth_tokens

Важные ограничения:

- users.email unique.
- sessions.token_hash unique.
- auth_tokens.token_hash unique.
- auth_tokens unique active token per user+type where used_at is null.
- FKs to users.id with cascade behavior where defined.

## API Endpoints

Статус: CURRENT

Auth endpoints:

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/session
- POST /api/auth/logout
- POST /api/auth/resend-verification
- POST /api/auth/verify-email
- POST /api/auth/reset-password/request
- POST /api/auth/reset-password/complete

## Границы Безопасности

Статус: CURRENT с документированными ограничениями

Подтверждено:

- Cookie-based sessions, server-side token hashing.
- Allowed-origin gate for state-changing API methods.
- Session cleanup scheduler baseline.

Отложено:

- Усиление CSRF token имеет статус DEFERRED.
- pgAdmin MFA находится вне scope auth-подсистемы и остаётся DEFERRED в platform hardening.

## Текущее Verified-Поведение

- Registration success path работает в production.
- Resend verification работает в production.
- Email verification и login/session flows реализованы и verified для нормального пути.
- Baseline очистки session развернут и production-verified.
- Baseline защиты по Origin развернут и production-verified.

## Partially Verified / Известные Пробелы

- F1-SEC-01 остаётся PARTIALLY VERIFIED:
  - production success/resend path verified;
  - simulation ошибки отправки email в production остаётся NOT VERIFIED по safe-policy.
- Отдельная capability logout-all-devices не реализована как standalone endpoint.
- Механизм CSRF token не реализован.

## Planned

- Явная capability logout-all-devices.
- Дополнительные auth hardening-расширения поверх текущего baseline.

## Deferred

- Усиление CSRF token (поверх текущего origin baseline).
- Более широкие hardening-пункты, отслеживаемые в remediation/system state.

## Связанные Документы

- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/ARCHITECTURE/ARCHITECTURE.md
- docs/ARCHITECTURE/PLATFORM.md
- docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/architecture/AUTH_ARCHITECTURE.md
