const API_BASE_URL = "https://api.stubbornram.ru/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      data: null,
      error: data ?? {
        error: "REQUEST_FAILED",
        message: "роизошла ошибка запроса.",
      },
    };
  }

  return {
    data,
    error: null,
  };
}

export { request };
