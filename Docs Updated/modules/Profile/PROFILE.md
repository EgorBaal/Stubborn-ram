# PROFILE

**Статус документа:** CANONICAL MODULE DOCUMENT  
**Версия:** 1.0  
**Текущее runtime-состояние:** PARTIALLY IMPLEMENTED

## 1. Назначение

Profile — пользовательская account surface внутри App Shell.

Он показывает identity/account context и является точкой входа в account/settings-related actions.

## 2. Текущее состояние

Подтверждено:

- route `/app/profile`;
- `ProfilePage`;
- identity data из AuthContext;
- avatar/name/email отображение;
- account/support/about sections;
- logout action;
- navigation through App Shell.

Не реализовано как полноценный Profile lifecycle:

- edit personal data;
- persisted profile settings/preferences;
- отдельный profile update API;
- полный edit validation/save/reload flow.

## 3. Identity boundary

Profile потребляет identity state, но не управляет Authentication.

Целевая граница:

```text
Auth
↓
authenticated identity
↓
Profile UI
```

Authentication остается в `AUTH`/authService.

## 4. Текущий UI

Текущие surfaces:

- identity hero block;
- account section list;
- support section list;
- about section list;
- sign-out action.

## 5. Logout

Текущий logout использует auth service, после чего session обновляется и пользователь покидает protected app surface.

Logout current session — runtime capability.

Logout-all-devices остается отдельной deferred capability.

## 6. Целевой Profile

В будущем Profile может поддерживать:

- личные данные;
- avatar/profile media;
- preferences;
- account settings;
- security settings;
- support entry points;
- about/application information.

Конкретные поля и persistence contract требуют отдельного API/data decision.

## 7. Permissions

User должен иметь возможность менять только собственные profile data в рамках разрешенных actions.

Admin context не должен означать автоматический доступ к password/secrets.

## 8. Error / Loading / Empty

При появлении edit flows должны быть предусмотрены:

- loading;
- validation errors;
- save success;
- save failure;
- retry, если безопасно.

## 9. Current / Planned

**CURRENT**

- identity view;
- logout;
- static support/about/account UI.

**PLANNED**

- profile edit;
- persisted preferences;
- profile update API;
- better support/account flows.

**DEFERRED / NOT VERIFIED**

- production-grade profile edit lifecycle;
- advanced profile features;
- logout-all-devices.

## 10. Связанные документы

- `docs/SYSTEMS/AUTH.md`
- `docs/SYSTEMS/PERMISSIONS.md`
- `docs/SYSTEMS/SECURITY.md`
- `docs/ARCHITECTURE/PLATFORM.md`
- `docs/ARCHITECTURE/LAYOUT.md`
- `docs/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`
