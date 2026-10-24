# TRAINING_API

Статус: CURRENT CANONICAL  
Фактическая база: backend/API + последующие remediation evidence  
Актуальность: 2026-09-19

---

## 1. API boundary

Основная цепочка:

```text
Training UI
    ↓
trainingService / trainingMaterialsService
    ↓
apiClient
    ↓
/api/training/*
    ↓
Fastify training routes
    ↓
PostgreSQL
```

Frontend не должен напрямую обращаться к PostgreSQL.

---

## 2. Core endpoints

CURRENT:

```text
GET    /api/training/exercises
GET    /api/training/workouts
GET    /api/training/workouts/:id
POST   /api/training/workouts
PUT    /api/training/workouts/:id
DELETE /api/training/workouts/:id
GET    /api/training/sets/:setId/materials
PUT    /api/training/sets/:setId/materials
```

---

## 3. Frontend service boundary

Current architecture target and later verified foundation chain:

```text
TrainingPage
  ↓
trainingService
  ↓
apiClient
```

Materials:

```text
TrainingExerciseCard
  ↓
trainingMaterialsService
  ↓
apiClient
```

Earlier Training docs contained direct-fetch/hardcoded-host claims. These are superseded for the current documented baseline by later remediation evidence showing the service → apiClient path.

---

## 4. GET exercises

```text
GET /api/training/exercises
```

Purpose:

Получить доступный системный exercise catalog.

Current semantics:

- system exercises have `user_id IS NULL`;
- list используется Exercises UI и exercise selection flow;
- full personal exercise CRUD не является current complete feature.

---

## 5. GET workouts list

```text
GET /api/training/workouts
```

Requires:

- authenticated session.

Ownership:

- results scoped to authenticated user.

Used by:

```text
TrainingHistoryPage
  ↓
trainingService
  ↓
apiClient
```

---

## 6. GET workout by ID

```text
GET /api/training/workouts/:id
```

Requires:

- authenticated session;
- ownership match.

Returns:

- workout fields;
- nested exercises;
- nested sets.

Used to hydrate:

```text
TrainingPage
```

---

## 7. POST workout

```text
POST /api/training/workouts
```

Request body includes:

```text
title
trainingDate
startTime
endTime
trainingType
comment
exercises[]
```

Exercise item:

```text
exerciseId
position
exerciseComment
supersetAfter
trackedParameters[]
sets[]
```

`trackedParameters` is the exercise-level UI configuration used by `WorkoutExercise` and stored as `tracked_parameters` in PostgreSQL when the migration is applied. It is independent from `WorkoutSet` values and does not affect `intensityMethods`.

Set payload contains supported performance fields and intensity methods.

Backend persists:

```text
workouts
workout_exercises
workout_sets
```

Core operation is authenticated.

---

## 8. PUT workout

```text
PUT /api/training/workouts/:id
```

Requires:

- authenticated session;
- workout ownership.

Used for:

- existing workout edit;
- workout-level fields;
- exercise/sets state.

Backend controls the nested persistence/update behavior.

Do not encode a historical implementation detail such as “delete and recreate everything” as an architectural invariant unless current code/evidence confirms it.

---

## 9. DELETE workout

```text
DELETE /api/training/workouts/:id
```

Requires:

- authenticated session;
- ownership.

Delete cascades to dependent child records according to DB constraints.

History UI removes the local item after successful API response.

---

## 10. Training Materials GET

```text
GET /api/training/sets/:setId/materials
```

Requires:

- authenticated session;
- access through workout ownership context.

Frontend:

```text
TrainingExerciseCard
  ↓
trainingMaterialsService.getSetMaterials
  ↓
apiClient
```

---

## 11. Training Materials PUT

```text
PUT /api/training/sets/:setId/materials
```

Body includes:

```text
comment
mediaIds[]
```

Current write path:

```text
TrainingExerciseCard
  ↓
trainingMaterialsService.saveSetMaterials
  ↓
apiClient
  ↓
PUT /api/training/sets/:setId/materials
```

Latest remediation evidence marked this write path FIXED / VERIFIED.

Verification included:

- successful PUT;
- subsequent GET;
- persistence after reload;
- deny/ownership behavior.

---

## 12. Authentication

All current Training endpoints listed above require authenticated session where applicable.

Unauthenticated API access is rejected by backend authentication layer.

Training does not implement a separate frontend-only permission boundary.

---

## 13. Ownership

Current workout ownership:

```text
workouts.user_id = authenticated user
```

Materials access/update is checked through the set → workout ownership relationship.

Полная relationship-aware coach/client permission model остаётся separate planned authorization layer.

---

## 14. Error contract

Current backend style includes:

```text
400 INVALID_*
401 UNAUTHENTICATED
404 WORKOUT_NOT_FOUND
404 SET_NOT_FOUND
409 conflict-style material errors
```

Exact endpoint-specific error payload may vary.

Frontend should not infer success solely from local state; API response is authoritative for persistence.

---

## 15. Response data

Workout list:

```text
workouts[]
```

Typical fields include:

```text
id
title
createdAt
...
```

Workout detail:

```text
workout
  +
nested workout_exercises
  +
nested workout_sets
```

Materials read:

```text
materials[]
```

Materials write confirms the updated set/material context according to backend contract.

---

## 16. Transaction and persistence boundary

Backend is responsible for database consistency.

Frontend sequence:

```text
collect UI state
    ↓
service
    ↓
apiClient
    ↓
backend validation/auth/ownership
    ↓
DB transaction/persistence
```

The UI should not treat an optimistic local update as permanent until the backend response succeeds.

---

## 17. Template API

No current active template lifecycle API is part of the Training backend baseline.

Expected future endpoints such as:

```text
GET    /api/training/templates
POST   /api/training/templates
GET    /api/training/templates/:id
PUT    /api/training/templates/:id
DELETE /api/training/templates/:id
```

belong to PLANNED Training 2.0 behavior.

Their presence in a specification does not imply runtime implementation.

---

## 18. Program / Protocol API

No current active Program/Protocol CRUD API is part of Training baseline.

Target contracts must remain separate from:

```text
/api/training/workouts
```

because Program/Protocol are source entities, while Workout is a concrete execution instance.

---

## 19. API contract principles

Training API must:

- authenticate at backend;
- enforce ownership at backend;
- preserve database relationships;
- return structured data;
- use stable IDs;
- avoid frontend direct DB/storage access;
- keep current and planned endpoints explicitly separated.

---

## 20. Legacy-to-current correction log

Earlier Training documentation contained:

```text
trainingService -> direct fetch -> hardcoded host
materials write -> missing / stash-only
```

These statements are no longer canonical current-state claims.

Later evidence established:

```text
trainingService -> apiClient
trainingMaterialsService -> apiClient
saveSetMaterials -> PUT /api/training/sets/:setId/materials
```

This is an example of why current Training documentation must be synchronized against the latest remediation evidence and not only copied from a prior source.

---

## 21. Related systems

```text
SYSTEMS/AUTH.md
SYSTEMS/PERMISSIONS.md
SYSTEMS/SECURITY.md
SYSTEMS/DATABASE.md
SYSTEMS/MEDIA.md
TRAINING_DATA_MODEL.md
TRAINING_UI.md
TRAINING_TEMPLATES.md
```
