import { request } from "@/shared/lib/apiClient";

export async function createLead(lead) {
  const { data, error } = await request("/leads", {
    method: "POST",
    body: JSON.stringify(lead),
  });

  if (error) {
    const requestError = new Error(
      error.message || "Не удалось отправить заявку.",
    );

    requestError.code = error.error;
    requestError.details = error.details;

    throw requestError;
  }

  return data;
}
