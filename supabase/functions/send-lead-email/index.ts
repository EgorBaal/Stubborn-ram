import { withSupabase } from "npm:@supabase/server@^1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const TRAINER_EMAIL = Deno.env.get("TRAINER_EMAIL")!;

interface Lead {
  full_name?: string;

  age?: number;
  height?: number;
  weight?: number;

  goals?: string[];
  goal_details?: string;

  training_experience?: string;
  training_experience_details?: string;

  difficulties?: string[];
  difficulties_details?: string;

  ideal_results?: string[];
  ideal_result_details?: string;

  report_preferences?: string[];
  report_preferences_details?: string;

  telegram?: string;
  vk?: string;
  instagram?: string;
  phone?: string;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (req) => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    const lead = (await req.json()) as Lead;
    const now = new Date().toLocaleString("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
  from: "Stubborn Ram <noreply@stubbornram.ru>",
  to: [TRAINER_EMAIL],
  subject: `Новая заявка — ${lead.full_name ?? "Без имени"}`,
  html: `

<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
</head>

<body style="margin:0;padding:40px;background:#080808;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;">
<tr>
<td align="center">

<table role="presentation" width="760" cellpadding="0" cellspacing="0" style="background:#121212;border-radius:18px;overflow:hidden;border:1px solid #222;">

<tr>
<td style="background:#ff6200;padding:38px;color:#ffffff;">

<div style="font-size:34px;font-weight:bold;">
Stubborn Ram
</div>

<div style="margin-top:8px;font-size:18px;">
Новая заявка с сайта
</div>

<div style="margin-top:12px;font-size:14px;opacity:.9;">
${now}
</div>

</td>
</tr>

<tr>
<td style="padding:35px;">

<div style="font-size:24px;font-weight:bold;color:#ff6200;margin-bottom:24px;">
👤 Информация о клиенте
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;color:#ffffff;">

<tr>
<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;width:180px;">
ФИО
</td>

<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
${lead.full_name || "-"}
</td>
</tr>

<tr>
<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
Возраст
</td>

<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
${lead.age || "-"}
</td>
</tr>

<tr>
<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
Рост
</td>

<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
${lead.height || "-"} см
</td>
</tr>

<tr>
<td style="padding:14px 0;">
Вес
</td>

<td style="padding:14px 0;">
${lead.weight || "-"} кг
</td>
</tr>

</table>

</td>
</tr>

<tr>
<td style="padding:35px;border-top:1px solid #202020;">

<div style="font-size:22px;font-weight:bold;color:#ff6200;margin-bottom:18px;">
🎯 Цели
</div>

<ul style="margin:0;color:#ffffff;line-height:28px;">

${
Array.isArray(lead.goals)
? lead.goals.map(item=>`<li>${item}</li>`).join("")
: "<li>-</li>"
}

</ul>

<div style="
margin-top:20px;
background:#1b1b1b;
border-left:5px solid #ff6200;
padding:18px;
border-radius:10px;
color:#d8d8d8;
white-space:pre-wrap;
">

${lead.goal_details || "Не указан"}

</div>

</td>
</tr>

<tr>
<td style="padding:35px;border-top:1px solid #202020;">

<div style="font-size:22px;font-weight:bold;color:#ff6200;margin-bottom:18px;">
🏋️ Опыт тренировок
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;color:#ffffff;">

<tr>

<td style="padding:14px 0;width:180px;">
Опыт
</td>

<td style="padding:14px 0;">
${lead.training_experience || "-"}
</td>

</tr>

</table>

<div style="
margin-top:20px;
background:#1b1b1b;
border-left:5px solid #ff6200;
padding:18px;
border-radius:10px;
color:#d8d8d8;
white-space:pre-wrap;
">

${lead.training_experience_details || "Не указан"}

</div>

</td>
</tr>
<tr>
<td style="padding:35px;border-top:1px solid #202020;">

<div style="font-size:22px;font-weight:bold;color:#ff6200;margin-bottom:18px;">
⚠️ Основные трудности
</div>

<ul style="margin:0;color:#ffffff;line-height:28px;">

${
Array.isArray(lead.difficulties)
? lead.difficulties.map(item => `<li>${item}</li>`).join("")
: "<li>-</li>"
}

</ul>

<div style="
margin-top:20px;
background:#1b1b1b;
border-left:5px solid #ff6200;
padding:18px;
border-radius:10px;
color:#d8d8d8;
white-space:pre-wrap;
">

${lead.difficulties_details || "Не указан"}

</div>

</td>
</tr>

<tr>
<td style="padding:35px;border-top:1px solid #202020;">

<div style="font-size:22px;font-weight:bold;color:#ff6200;margin-bottom:18px;">
🏆 Желаемый результат
</div>

<ul style="margin:0;color:#ffffff;line-height:28px;">

${
Array.isArray(lead.ideal_results)
? lead.ideal_results.map(item => `<li>${item}</li>`).join("")
: "<li>-</li>"
}

</ul>

<div style="
margin-top:20px;
background:#1b1b1b;
border-left:5px solid #ff6200;
padding:18px;
border-radius:10px;
color:#d8d8d8;
white-space:pre-wrap;
">

${lead.ideal_result_details || "Не указан"}

</div>

</td>
</tr>

<tr>
<td style="padding:35px;border-top:1px solid #202020;">

<div style="font-size:22px;font-weight:bold;color:#ff6200;margin-bottom:18px;">
📅 Готов регулярно отправлять
</div>

<ul style="margin:0;color:#ffffff;line-height:28px;">

${
Array.isArray(lead.report_preferences)
? lead.report_preferences.map(item => `<li>${item}</li>`).join("")
: "<li>-</li>"
}

</ul>

<div style="
margin-top:20px;
background:#1b1b1b;
border-left:5px solid #ff6200;
padding:18px;
border-radius:10px;
color:#d8d8d8;
white-space:pre-wrap;
">

${lead.report_preferences_details || "Не указан"}

</div>

</td>
</tr>

<tr>
<td style="padding:35px;border-top:1px solid #202020;">

<div style="font-size:22px;font-weight:bold;color:#ff6200;margin-bottom:24px;">
📞 Контакты
</div>

<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;color:#ffffff;">

<tr>
<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;width:180px;">
Telegram
</td>

<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
${lead.telegram || "-"}
</td>
</tr>

<tr>
<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
VK
</td>

<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
${lead.vk || "-"}
</td>
</tr>

<tr>
<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
Instagram
</td>

<td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
${lead.instagram || "-"}
</td>
</tr>

<tr>
<td style="padding:14px 0;">
Телефон
</td>

<td style="padding:14px 0;">
${lead.phone || "-"}
</td>
</tr>

</table>

</td>
</tr>

<tr>
<td style="
background:#0f0f0f;
padding:30px;
text-align:center;
border-top:1px solid #202020;
">

<div style="
font-size:20px;
font-weight:bold;
color:#ff6200;
margin-bottom:10px;
">
Stubborn Ram
</div>

<div style="
color:#9a9a9a;
font-size:14px;
line-height:24px;
">
Это письмо сформировано автоматически после заполнения анкеты на сайте.
</div>

<div style="
margin-top:10px;
color:#666666;
font-size:12px;
line-height:20px;
">
📅 Получено: <strong>${now}</strong>
</div>

<div style="
margin-top:6px;
color:#666666;
font-size:12px;
">
© Stubborn Ram
</div>

</td>
</tr>

</table>

</td>
</tr>

</table>

</body>
</html>

`,
}),
    });

    const data = await res.json();
    if (!res.ok) {
  console.error("Resend error:", data);

  return Response.json(
    {
      success: false,
      error: data,
    },
    {
      status: 500,
    }
  );
}

    return Response.json({
  success: true,
  resend: data,
});
  }),
};