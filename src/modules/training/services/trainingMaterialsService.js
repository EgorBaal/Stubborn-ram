import { request } from "../../../shared/lib/apiClient";

export async function getSetMaterials(setId) {
  if (!setId) {
    return {
      data: null,
      error: {
        error: "INVALID_SET_ID",
        message: "Не указан ID подхода.",
      },
    };
  }

  return request(`/training/sets/${setId}/materials`);
}
export async function saveSetMaterials(setId, { comment, mediaIds }) {
  if (!setId) {
    return {
      data: null,
      error: {
        error: "INVALID_SET_ID",
        message: "Не указан ID подхода.",
      },
    };
  }

  return request(`/training/sets/${setId}/materials`, {
    method: "PUT",
    body: JSON.stringify({
      comment: typeof comment === "string" ? comment : "",
      mediaIds: Array.isArray(mediaIds) ? mediaIds : [],
    }),
  });
}
