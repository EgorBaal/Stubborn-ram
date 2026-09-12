import { createLeadSchema } from "./leads.schemas.js";
import { sendEmail } from "../email/email.service.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return "—";
  }

  return value.map((item) => escapeHtml(item)).join(", ");
}

function formatText(value) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "—";
  }

  return escapeHtml(text).replaceAll("\n", "<br>");
}

function buildLeadEmail(lead) {
  return `
    <div style="background:#0d0d0d;padding:30px;font-family:Arial,sans-serif;color:#ffffff;">
      <div style="max-width:700px;margin:0 auto;background:#161616;border:1px solid #2b2b2b;border-radius:18px;padding:28px;">

        <h1 style="margin:0 0 24px;color:#ff6200;font-size:26px;">
          Новая заявка
        </h1>

        <div style="font-size:18px;font-weight:bold;margin-bottom:24px;">
          ${escapeHtml(lead.full_name)}
        </div>

        <div style="line-height:1.7;font-size:15px;">

          <p><strong>Возраст:</strong> ${lead.age}</p>
          <p><strong>Рост:</strong> ${lead.height} см</p>
          <p><strong>Вес:</strong> ${lead.weight} кг</p>

          <hr style="border:0;border-top:1px solid #2b2b2b;margin:24px 0;">

          <p><strong>Цели:</strong><br>${formatList(lead.goals)}</p>
          <p><strong>Подробнее о целях:</strong><br>${formatText(lead.goal_details)}</p>

          <p><strong>Опыт тренировок:</strong><br>${formatText(lead.training_experience)}</p>
          <p><strong>Подробнее об опыте:</strong><br>${formatText(lead.training_experience_details)}</p>

          <p><strong>Трудности:</strong><br>${formatList(lead.difficulties)}</p>
          <p><strong>Подробнее о трудностях:</strong><br>${formatText(lead.difficulties_details)}</p>

          <p><strong>Желаемый результат:</strong><br>${formatList(lead.ideal_results)}</p>
          <p><strong>Подробнее о результате:</strong><br>${formatText(lead.ideal_result_details)}</p>

          <p><strong>Предпочтения по отчётам:</strong><br>${formatList(lead.report_preferences)}</p>
          <p><strong>Подробнее о предпочтениях:</strong><br>${formatText(lead.report_preferences_details)}</p>

          <hr style="border:0;border-top:1px solid #2b2b2b;margin:24px 0;">

          <p><strong>Telegram:</strong> ${formatText(lead.telegram)}</p>
          <p><strong>VK:</strong> ${formatText(lead.vk)}</p>
          <p><strong>Instagram:</strong> ${formatText(lead.instagram)}</p>
          <p><strong>Телефон:</strong> ${formatText(lead.phone)}</p>

        </div>

        <div style="margin-top:28px;padding-top:18px;border-top:1px solid #2b2b2b;color:#888;font-size:12px;">
          Stubborn Ram
        </div>

      </div>
    </div>
  `;
}

function buildLeadText(lead) {
  return [
    "Новая заявка",
    "",
    `Имя: ${lead.full_name}`,
    `Возраст: ${lead.age}`,
    `Рост: ${lead.height} см`,
    `Вес: ${lead.weight} кг`,
    "",
    `Цели: ${lead.goals.join(", ") || "—"}`,
    `Подробнее о целях: ${lead.goal_details || "—"}`,
    "",
    `Опыт тренировок: ${lead.training_experience || "—"}`,
    `Подробнее об опыте: ${lead.training_experience_details || "—"}`,
    "",
    `Трудности: ${lead.difficulties.join(", ") || "—"}`,
    `Подробнее о трудностях: ${lead.difficulties_details || "—"}`,
    "",
    `Желаемый результат: ${lead.ideal_results.join(", ") || "—"}`,
    `Подробнее о результате: ${lead.ideal_result_details || "—"}`,
    "",
    `Предпочтения по отчётам: ${lead.report_preferences.join(", ") || "—"}`,
    `Подробнее о предпочтениях: ${lead.report_preferences_details || "—"}`,
    "",
    `Telegram: ${lead.telegram || "—"}`,
    `VK: ${lead.vk || "—"}`,
    `Instagram: ${lead.instagram || "—"}`,
    `Телефон: ${lead.phone || "—"}`,
  ].join("\n");
}

export default async function leadsRoutes(app) {
  app.post(
    "/api/leads",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const parsed = createLeadSchema.safeParse(request.body);

      if (!parsed.success) {
        return reply.code(400).send({
          error: "VALIDATION_ERROR",
          message: "Проверьте данные анкеты.",
          details: parsed.error.flatten(),
        });
      }

      const lead = parsed.data;

      const result = await app.pg.query(
        `
          INSERT INTO leads (
            full_name,
            age,
            height,
            weight,
            goals,
            goal_details,
            training_experience,
            training_experience_details,
            difficulties,
            difficulties_details,
            ideal_results,
            ideal_result_details,
            report_preferences,
            report_preferences_details,
            telegram,
            vk,
            instagram,
            phone
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5::jsonb,
            $6,
            $7,
            $8,
            $9::jsonb,
            $10,
            $11::jsonb,
            $12,
            $13::jsonb,
            $14,
            $15,
            $16,
            $17,
            $18
          )
          RETURNING id, created_at, status
        `,
        [
          lead.full_name,
          lead.age,
          lead.height,
          lead.weight,
          JSON.stringify(lead.goals),
          lead.goal_details,
          lead.training_experience,
          lead.training_experience_details,
          JSON.stringify(lead.difficulties),
          lead.difficulties_details,
          JSON.stringify(lead.ideal_results),
          lead.ideal_result_details,
          JSON.stringify(lead.report_preferences),
          lead.report_preferences_details,
          lead.telegram,
          lead.vk,
          lead.instagram,
          lead.phone,
        ],
      );

      const savedLead = result.rows[0];

      try {
        const trainerEmail = process.env.TRAINER_EMAIL;

        if (!trainerEmail) {
          throw new Error("TRAINER_EMAIL is not configured");
        }

        await sendEmail({
          email: trainerEmail,
          subject: `Новая заявка — ${lead.full_name}`,
          html: buildLeadEmail(lead),
          text: buildLeadText(lead),
        });
      } catch (error) {
        app.log.error(
          {
            error,
            leadId: savedLead.id,
          },
          "Lead email sending failed",
        );

        return reply.code(503).send({
          error: "EMAIL_SEND_FAILED",
          message: "Заявка сохранена, но уведомление не удалось отправить.",
        });
      }

      return reply.code(201).send({
        ok: true,
        lead: savedLead,
      });
    },
  );
}
