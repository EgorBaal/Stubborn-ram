# GitHub Copilot instructions for Stubborn Ram

This repository has canonical project documentation under `Docs Updated/`.

## 1. Canonical sources and precedence

Use these project documents as the primary context for architecture and product decisions. Always verify the actual repository structure before assuming a document path is current; the project currently stores canonical documentation under `Docs Updated/`.

- `Docs Updated/PROCESS/AGENTS.md`
- `Docs Updated/PROCESS/WORKFLOW.md`
- `Docs Updated/PROCESS/CODING_RULES.md`
- `Docs Updated/PROCESS/DESIGN_SYSTEM.md`
- `Docs Updated/PROCESS/DEVELOPMENT_RULES.md`
- `Docs Updated/SYSTEM_STATE/SYSTEM_STATE_FINAL.md`

For task-specific context, also consult the relevant module or architecture documents in:

- `Docs Updated/ARCHITECTURE/`
- `Docs Updated/SYSTEMS/`
- `Docs Updated/modules/`

If project documentation, runtime behavior, and evidence conflict, stop and report the conflict before making changes. The current runtime state documented in `Docs Updated/SYSTEM_STATE/SYSTEM_STATE_FINAL.md` is the default reference for project reality, with more recent audit/remediation evidence taking precedence when relevant.

## 2. Architecture and working model

Follow the project architecture:

React -> services -> apiClient -> Fastify backend -> PostgreSQL / storage / external services

Rules:

- Frontend components must not call backend endpoints directly in bypass of the service layer and `apiClient`.
- Components must not contain backend business logic, SQL, DB access, storage logic, or secret handling.
- Backend routes and server logic remain the authoritative boundary for authentication, authorization, permissions, data validation, and persistence.
- Keep changes within the smallest safe scope and preserve the existing module boundaries.

## 3. Before making changes

Before editing code or docs, review:

- the relevant project documentation;
- the affected code path and direct dependencies;
- the exact data flow and user-facing behavior;
- whether the task touches architecture, permissions, DB schema, or deployment.

Do not guess intent. Prefer reading the related code and docs before proposing or implementing a fix.

## 4. Local development vs production

This repository must be treated as a local-development workspace unless there is explicit approval for a production action.

Rules:

- Local development is separate from production.
- Do not connect to production servers or production databases.
- Do not apply production migrations.
- Do not deploy to production without explicit, separate confirmation.
- Do not expose secrets, credentials, tokens, or the contents of any `.env` file.

## 5. Validation and verification

Use the smallest relevant validation for the changed area:

- frontend: available build/lint checks for the project;
- backend: run the relevant local validation or startup check without altering production state;
- if the task changes DB schema or data flow, validate only in the local environment and keep the change controlled.

Do not claim success without checking the relevant result. Report what was verified and what remains unverified.

## 6. Documentation and project state

Documentation is part of the project and must stay aligned with the real architecture and confirmed project state.

Rules:

- Update documentation only when architecture or confirmed project state genuinely changes.
- Do not create duplicate copies of the same guidance.
- Preserve the existing source-of-truth roles of the canonical documents in `Docs Updated/`.
- If a change affects architecture, routing, access control, storage, DB schema, or deployment assumptions, call out the documentation impact explicitly.

## 7. Working safely with repo state

- Preserve all existing uncommitted changes.
- Do not reset, overwrite, or discard user changes.
- Before editing, check whether the task is affected by local modifications and avoid causing conflicts.

## 8. Reporting requirement

At the end of a task, provide a brief status summary that includes:

- what was changed;
- which checks were run;
- what remains unverified or deferred;
- any risks, blockers, or unresolved conflicts.

## 9. Default operating principle

Keep the implementation consistent with the canonical project rules, the current system state, and the minimum required architectural scope for the task.
