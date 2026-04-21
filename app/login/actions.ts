"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/data";
import { isSbuEmail } from "@/lib/utils";

export type LoginState = {
  error: string | null;
  success: string | null;
};

export async function requestMagicLink(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const next = formData.get("next")?.toString().trim() || "/review";

  if (!hasSupabaseEnv()) {
    return {
      error: "Supabase environment variables are missing. Add them before using auth.",
      success: null
    };
  }

  if (!isSbuEmail(email)) {
    return {
      error: "Use a valid @stonybrook.edu email address.",
      success: null
    };
  }

  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error) {
    return {
      error: error.message,
      success: null
    };
  }

  return {
    error: null,
    success: `Magic link sent to ${email}. Open it on this device to finish signing in.`
  };
}

export async function signOut() {
  if (!hasSupabaseEnv()) {
    return;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
