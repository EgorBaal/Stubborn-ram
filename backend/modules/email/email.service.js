const UNISENDER_API_URL =
  "https://goapi.unisender.ru/ru/transactional/api/v1/email/send.json";

export async function sendEmail({ email, subject, html, text }) {
  const apiKey = process.env.UNISENDER_API_KEY;

  if (!apiKey) {
    throw new Error("UNISENDER_API_KEY is not configured");
  }

  const response = await fetch(UNISENDER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-API-KEY": apiKey,
    },
    body: JSON.stringify({
      message: {
        recipients: [
          {
            email,
          },
        ],
        body: {
          html,
          plaintext: text ?? "",
        },
        subject,
        from_email: "noreply@stubbornram.ru",
        from_name: "Stubborn Ram",
        track_links: 0,
        track_read: 0,
      },
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      `Unisender Go error: ${response.status} ${
        data ? JSON.stringify(data) : "empty response"
      }`,
    );

    error.status = response.status;
    error.providerResponse = data;

    throw error;
  }

  return data;
}
