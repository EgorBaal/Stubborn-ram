import { request } from "../../../shared/lib/apiClient";

export async function createMediaUpload({ originalName, mimeType, sizeBytes }) {
  return request("/media/upload", {
    method: "POST",
    body: JSON.stringify({
      originalName,
      mimeType,
      sizeBytes,
    }),
  });
}

export async function completeMediaUpload(mediaId) {
  return request(`/media/${mediaId}/complete`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function getMedia(mediaId) {
  return request(`/media/${mediaId}`);
}

export async function deleteMedia(mediaId) {
  return request(`/media/${mediaId}`, {
    method: "DELETE",
    body: JSON.stringify({}),
  });
}

export async function uploadMediaFile(file) {
  const createResult = await createMediaUpload({
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  });

  if (createResult.error) {
    return createResult;
  }

  const mediaId = createResult.data?.media?.id;
  const uploadUrl = createResult.data?.uploadUrl;

  if (!mediaId || !uploadUrl) {
    return {
      data: null,
      error: {
        error: "INVALID_UPLOAD_RESPONSE",
        message: "Сервер не вернул данные для загрузки файла.",
      },
    };
  }

  let uploadResponse;

  try {
    uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
  } catch (error) {
    return {
      data: null,
      error: {
        error: "UPLOAD_NETWORK_ERROR",
        message: "Не удалось загрузить файл в Storage.",
      },
    };
  }

  if (!uploadResponse.ok) {
    return {
      data: null,
      error: {
        error: "UPLOAD_FAILED",
        message: "Не удалось загрузить файл в Storage.",
      },
      status: uploadResponse.status,
    };
  }

  const completeResult = await completeMediaUpload(mediaId);

  if (completeResult.error) {
    return completeResult;
  }

  return {
    data: completeResult.data,
    error: null,
    status: completeResult.status,
  };
}
