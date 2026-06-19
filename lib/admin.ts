import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUserId() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims?.sub) {
    return null;
  }

  return data.claims.sub;
}

export async function isAdminUser(userId: string) {
  if (!hasSupabaseEnv()) {
    return false;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function requireAdmin(redirectTo = "/admin/blog") {
  if (!hasSupabaseEnv()) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (adminError || !admin) {
    redirect("/login?error=admin");
  }

  return { supabase, userId };
}
