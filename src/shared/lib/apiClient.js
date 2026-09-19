const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
    });
  } catch (error) {
    return {
      data: null,
      error: {
        error: "NETWORK_ERROR",
        message: "Нет подключения к серверу.",
      },
    };
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      data: null,
      error: data ?? {
        error: "REQUEST_FAILED",
        message: "Произошла ошибка запроса.",
      },
      status: response.status,
    };
  }

  return {
    data,
    error: null,
    status: response.status,
  };
}

export { request };
