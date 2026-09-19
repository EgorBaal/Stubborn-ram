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
