"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  assertSupabaseEnv,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

export function createClient() {
  assertSupabaseEnv();

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
