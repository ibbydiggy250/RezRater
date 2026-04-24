"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/data";
import { consumeRateLimit, sanitizePlainText } from "@/lib/security";
import { isSbuEmail } from "@/lib/utils";

export type LoginState = {
  error: string | null;
  success: string | null;
};

export async function requestMagicLink(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = sanitizePlainText(formData.get("email")?.toString() ?? "").toLowerCase();
  const next = sanitizePlainText(formData.get("next")?.toString() ?? "") || "/review";

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
  const clientIp =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  if (
    !consumeRateLimit({
      key: `magic-link:${email}:${clientIp}`,
      limit: 5,
      windowMs: 15 * 60 * 1000
    })
  ) {
    return {
      error: "Too many login attempts. Please try again later.",
      success: null
    };
  }

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
      error: "Magic link could not be sent. Please try again.",
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
