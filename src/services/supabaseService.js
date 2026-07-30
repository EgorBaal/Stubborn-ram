import { supabase } from "@/lib/supabaseClient";

export async function testConnection() {
  const { data, error } = await supabase
    .from("questionnaires")
    .select("id")
    .limit(1);

  return { data, error };
}
