import { withSupabase } from "npm:@supabase/server@^1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const TRAINER_EMAIL = Deno.env.get("TRAINER_EMAIL")!;

export default {
  fetch: withSupabase({ auth: "none" }, async (req) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    const lead = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Stubborn Ram <onboarding@resend.dev>",
        to: [TRAINER_EMAIL],
        subject: "Новая заявка Stubborn Ram",
        html: `
          <h2>Получена новая заявка</h2>

          <p><strong>Имя:</strong> ${lead.name ?? "-"}</p>
          <p><strong>Возраст:</strong> ${lead.age ?? "-"}</p>
          <p><strong>Рост:</strong> ${lead.height ?? "-"}</p>
          <p><strong>Вес:</strong> ${lead.weight ?? "-"}</p>
          <p><strong>Telegram:</strong> ${lead.telegram ?? "-"}</p>
          <p><strong>Телефон:</strong> ${lead.phone ?? "-"}</p>
        `,
      }),
    });

    const data = await res.json();

    return Response.json(data);
  }),
};