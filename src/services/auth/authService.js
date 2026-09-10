import { request } from "@/shared/lib/apiClient";

export async function getSession() {
  const result = await request("/auth/session");

  if (result.error) {
    return {
      data: {
        session: null,
      },
      error: result.error,
    };
  }

  return {
    data: {
      session: result.data?.authenticated ? result.data : null,
    },
    error: null,
  };
}

export function onAuthStateChange(callback) {
  return {
    data: {
      subscription: {
        unsubscribe() {},
      },
    },
    error: null,
  };
}

export async function signUp(email, password) {
  const result = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return {
    data: result.data,
    error: result.error,
  };
}

export async function signIn(email, password) {
  const result = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return {
    data: result.data,
    error: result.error,
  };
}

export async function signOut() {
  const result = await request("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });

  return { data: result.data, error: result.error };
}

export async function resetPassword(email) {
  const result = await request("/auth/reset-password/request", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

  return {
    data: result.data,
    error: result.error,
  };
}

export async function updatePassword(password, token) {
  const result = await request("/auth/reset-password/complete", {
    method: "POST",
    body: JSON.stringify({
      password,
      token,
    }),
  });

  return {
    data: result.data,
    error: result.error,
  };
}

export async function verifyEmail(token) {
  const result = await request("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({
      token,
    }),
  });

  return {
    data: result.data,
    error: result.error,
  };
}

export async function resendVerification(email) {
  const result = await request("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({
      email,
    }),
  });

  return {
    data: result.data,
    error: result.error,
  };
}
