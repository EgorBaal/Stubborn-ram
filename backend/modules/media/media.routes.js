import { randomUUID } from "node:crypto";

import { getAuthenticatedUser } from "../auth/auth.session.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
]);

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function getExtension(originalName, mimeType) {
  const nameExtension = originalName?.match(/\.([a-zA-Z0-9]+)$/)?.[1];

  if (nameExtension) {
    return nameExtension.toLowerCase();
  }

  const mimeExtension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "audio/mpeg": "mp3",
    "audio/mp4": "m4a",
    "audio/webm": "webm",
  };

  return mimeExtension[mimeType] || "bin";
}

function createObjectKey(userId, mediaId, originalName, mimeType) {
  const extension = getExtension(originalName, mimeType);

  return `users/${userId}/media/${mediaId}.${extension}`;
}

export default async function mediaRoutes(app) {
  app.post("/api/media/upload", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { originalName, mimeType, sizeBytes } = request.body ?? {};

    if (!mimeType || typeof mimeType !== "string") {
      return reply.code(400).send({
        error: "INVALID_MIME_TYPE",
        message: "Не указан MIME-тип файла.",
      });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return reply.code(400).send({
        error: "UNSUPPORTED_MIME_TYPE",
        message: "Тип файла не поддерживается.",
      });
    }

    if (
      !Number.isInteger(sizeBytes) ||
      sizeBytes <= 0 ||
      sizeBytes > MAX_FILE_SIZE
    ) {
      return reply.code(400).send({
        error: "INVALID_FILE_SIZE",
        message: "Недопустимый размер файла.",
      });
    }

    if (
      originalName !== undefined &&
      originalName !== null &&
      typeof originalName !== "string"
    ) {
      return reply.code(400).send({
        error: "INVALID_ORIGINAL_NAME",
        message: "Некорректное имя файла.",
      });
    }

    const mediaId = randomUUID();

    const objectKey = createObjectKey(
      authUser.userId,
      mediaId,
      originalName,
      mimeType,
    );

    const result = await app.pg.query(
      `
        INSERT INTO media (
          id,
          owner_id,
          author_id,
          object_key,
          original_name,
          mime_type,
          size_bytes,
          status
        )
        VALUES ($1, $2, $2, $3, $4, $5, $6, 'UPLOADING')
        RETURNING
          id,
          object_key,
          status,
          created_at
      `,
      [
        mediaId,
        authUser.userId,
        objectKey,
        originalName?.trim() || null,
        mimeType,
        sizeBytes,
      ],
    );

    const media = result.rows[0];

    let uploadUrl;

    try {
      uploadUrl = await app.storage.getSignedUploadUrl({
        key: media.object_key,
        contentType: media.mime_type,
      });
    } catch (error) {
      await app.pg.query(
        `
          DELETE FROM media
          WHERE id = $1
            AND owner_id = $2
            AND status = 'UPLOADING'
        `,
        [media.id, authUser.userId],
      );

      throw error;
    }

    return reply.code(201).send({
      media: {
        id: media.id,
        status: media.status,
        createdAt: media.created_at,
      },
      uploadUrl,
    });
  });

  app.post("/api/media/:id/complete", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { id } = request.params;

    if (!id) {
      return reply.code(400).send({
        error: "INVALID_MEDIA_ID",
        message: "Не указан ID Media.",
      });
    }

    const mediaResult = await app.pg.query(
      `
        SELECT
          id,
          owner_id,
          object_key,
          mime_type,
          size_bytes,
          status
        FROM media
        WHERE id = $1
          AND owner_id = $2
        LIMIT 1
      `,
      [id, authUser.userId],
    );

    if (mediaResult.rowCount === 0) {
      return reply.code(404).send({
        error: "MEDIA_NOT_FOUND",
        message: "Media не найден.",
      });
    }

    const media = mediaResult.rows[0];

    if (media.status !== "UPLOADING") {
      return reply.code(409).send({
        error: "MEDIA_NOT_UPLOADING",
        message: "Media уже не находится в состоянии загрузки.",
      });
    }

    let object;

    try {
      object = await app.storage.headObject({
        key: media.object_key,
      });
    } catch (error) {
      if (
        error?.name === "NotFound" ||
        error?.$metadata?.httpStatusCode === 404
      ) {
        return reply.code(409).send({
          error: "MEDIA_OBJECT_NOT_FOUND",
          message: "Файл ещё не загружен в Storage.",
        });
      }

      throw error;
    }

    if (object.ContentLength !== Number(media.size_bytes)) {
      await app.pg.query(
        `
          UPDATE media
          SET
            status = 'FAILED',
            updated_at = now()
          WHERE id = $1
            AND owner_id = $2
            AND status = 'UPLOADING'
        `,
        [media.id, authUser.userId],
      );

      return reply.code(409).send({
        error: "MEDIA_SIZE_MISMATCH",
        message: "Размер загруженного файла не совпадает.",
      });
    }

    if (object.ContentType && object.ContentType !== media.mime_type) {
      await app.pg.query(
        `
          UPDATE media
          SET
            status = 'FAILED',
            updated_at = now()
          WHERE id = $1
            AND owner_id = $2
            AND status = 'UPLOADING'
        `,
        [media.id, authUser.userId],
      );

      return reply.code(409).send({
        error: "MEDIA_CONTENT_TYPE_MISMATCH",
        message: "Тип загруженного файла не совпадает.",
      });
    }

    const result = await app.pg.query(
      `
        UPDATE media
        SET
          status = 'READY',
          size_bytes = $1,
          updated_at = now()
        WHERE id = $2
          AND owner_id = $3
          AND status = 'UPLOADING'
        RETURNING
          id,
          original_name,
          mime_type,
          size_bytes,
          status,
          created_at,
          updated_at
      `,
      [object.ContentLength, media.id, authUser.userId],
    );

    return {
      media: result.rows[0],
    };
  });

  app.get("/api/media/:id", async (request, reply) => {
    const authUser = await getAuthenticatedUser(app.pg, request);

    if (!authUser) {
      return reply.code(401).send({
        error: "UNAUTHENTICATED",
        message: "Требуется авторизация.",
      });
    }

    const { id } = request.params;

    if (!id) {
      return reply.code(400).send({
        error: "INVALID_MEDIA_ID",
        message: "Не указан ID Media.",
      });
    }

    const result = await app.pg.query(
      `
        SELECT
          id,
          owner_id,
          original_name,
          mime_type,
          size_bytes,
          status,
          created_at,
          updated_at
        FROM media
        WHERE id = $1
          AND owner_id = $2
        LIMIT 1
      `,
      [id, authUser.userId],
    );

    if (result.rowCount === 0) {
      return reply.code(404).send({
        error: "MEDIA_NOT_FOUND",
        message: "Media не найден.",
      });
    }

    const media = result.rows[0];

    let downloadUrl = null;

    if (media.status === "READY") {
      const objectResult = await app.pg.query(
        `
          SELECT object_key
          FROM media
          WHERE id = $1
            AND owner_id = $2
          LIMIT 1
        `,
        [id, authUser.userId],
      );

      if (objectResult.rowCount > 0) {
        downloadUrl = await app.storage.getSignedDownloadUrl({
          key: objectResult.rows[0].object_key,
        });
      }
    }

    return {
      media: {
        id: media.id,
        originalName: media.original_name,
        mimeType: media.mime_type,
        sizeBytes: Number(media.size_bytes),
        status: media.status,
        createdAt: media.created_at,
        updatedAt: media.updated_at,
        downloadUrl,
      },
    };
  });
}
