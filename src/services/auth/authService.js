import { supabase } from "@/shared/lib/supabaseClient";

export async function getSession() {
  return await supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signUp(email, password) {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: "https://stubbornram.ru/app/home",
    },
  });
}

export async function signIn(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

export async function resetPassword(email) {
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://stubbornram.ru/reset-password",
  });
}
