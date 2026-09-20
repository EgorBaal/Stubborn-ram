# MEDIA

## Назначение

Каноническое описание file/media architecture и runtime-поведения:

- использования object storage;
- модели metadata;
- flows upload/complete/download/delete;
- границ ownership и access;
- verified production-поведения и ограничений провайдера.

## Architecture

Статус: CURRENT

Runtime chain:

Frontend module service
-> backend media routes
-> backend storage service
-> S3-compatible object storage
-> media metadata in PostgreSQL

Правила границ:

- frontend не получает storage secrets;
- backend контролирует auth и ownership checks;
- доступ к object storage использует signed URLs.

## Object Storage

Статус: CURRENT

- Для binary files используется S3-compatible storage.
- Backend storage client читает S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY из backend environment.
- Storage operations включают head/get signed upload/get signed download/delete.

## Bucket Privacy

Статус: VERIFIED (эффективное поведение)

- Production verification зафиксировала блокировку unsigned direct read/write (403).
- Режим public bucket не был включён во время проверки F1-NV-01.

## Upload Flow

Статус: CURRENT и VERIFIED

1. Authenticated client calls POST /api/media/upload with metadata.
2. Backend validates mime type, size, and payload shape.
3. Backend creates media row with status UPLOADING and generated object_key.
4. Backend returns signed upload URL.
5. Client uploads binary by direct PUT to signed URL.

## Complete Flow

Статус: CURRENT и VERIFIED

1. Client calls POST /api/media/{id}/complete.
2. Backend checks owner scope and current status.
3. Backend verifies object in storage via headObject.
4. Backend compares size/content-type.
5. Backend sets status READY on success or FAILED on mismatch.

## Download Flow

Статус: CURRENT и VERIFIED

1. Authenticated client calls GET /api/media/{id}.
2. Backend confirms owner scope.
3. For READY state backend returns signed download URL.
4. Signed URL download is validated in production evidence for F1-NV-01.

## Delete Flow

Статус: CURRENT и VERIFIED

1. Authenticated client calls DELETE /api/media/{id}.
2. Backend verifies ownership.
3. Backend deletes object in storage.
4. Backend deletes media metadata row.

## Media Metadata

Статус: CURRENT

Базовая metadata table: media

Ключевые поля, используемые в runtime:

- id
- owner_id
- author_id
- object_key (unique)
- original_name
- mime_type
- size_bytes
- status
- created_at/updated_at

Link table: media_links

- Связывает media records с родительскими entities.

## Ownership

Статус: CURRENT

- Владение media задано явно через media.owner_id.
- Доступ API read/delete/complete ограничен owner scope в текущей реализации.
- Само знание media id/object key не даёт доступ.

## API

Статус: CURRENT

Endpoints:

- POST /api/media/upload
- POST /api/media/{id}/complete
- GET /api/media/{id}
- DELETE /api/media/{id}

Поведение auth:

- unauthenticated вызовы получают 401 на защищённых media routes.

## Signed URLs

Статус: CURRENT

- Signed upload и signed download URLs генерируются на server-side.
- Default signed URL TTL в storage service: 900 seconds.
- Direct storage PUT со стороны client ожидается только на шаге signed URL.

## Production Verification

Статус: FIXED - VERIFIED (F1-NV-01)

Проверено в документированных production checks:

- authenticated upload init;
- signed upload URL issuance;
- upload to signed URL;
- complete;
- signed download;
- download content match;
- unsigned direct read/write blocked;
- delete flow success.

## Provider Limitations

Статус: PARTIALLY VERIFIED / NOT VERIFIED CONTROL-PLANE AREAS

Документированное ограничение текущего provider path:

- GetPublicAccessBlock returned 501 NotImplemented.
- GetBucketPolicyStatus returned 501 NotImplemented.

Следствие:

- effective private behavior проверено runtime-тестами;
- часть control-plane attributes остаётся недоступной для прямой проверки через эти конкретные API calls в данном окружении.

## Planned Extensions

Статус: PLANNED / DEFERRED

- более широкая стратегия media lifecycle governance и cleanup поверх текущего baseline;
- более глубокие cross-entity media policies по мере расширения module scope.

## Связанные Документы

- docs/SYSTEM_STATE/SYSTEM_STATE_UPDATED_FULL.md
- docs/SYSTEMS/SERVER.md
- docs/SYSTEMS/DATABASE.md
- docs/AUDIT/PROJECT_FOUNDATION_REMEDIATION_LOG_2026-09-19.md
- docs/AUDIT/PROJECT_FULL_AUDIT_2026-09-19.md
- docs/MEDIA.md
