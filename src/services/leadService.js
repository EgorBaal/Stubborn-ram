import { supabase } from "@/lib/supabaseClient";

export async function createLead(lead) {
  // Сохраняем заявку
  const { error } = await supabase.from("leads").insert([lead]);

  if (error) {
    throw error;
  }

  // Пытаемся отправить уведомление
  const { error: functionError } = await supabase.functions.invoke(
    "send-lead-email",
    {
      body: lead,
    }
  );

  if (functionError) {
    console.error("Ошибка отправки письма:", functionError);
  }
}