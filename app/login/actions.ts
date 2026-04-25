"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/data";
import { sanitizePlainText } from "@/lib/security";
import { isSbuEmail } from "@/lib/utils";

export type LoginState = {
  error: string | null;
  success: string | null;
  email: string;
  codeSent: boolean;
};

function getSafeNextPath(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/review";
  }

  return value;
}

export async function requestLoginCode(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = sanitizePlainText(formData.get("email")?.toString() ?? "").toLowerCase();

  if (!hasSupabaseEnv()) {
    return {
      error: "Supabase environment variables are missing. Add them before using auth.",
      success: null,
      email,
      codeSent: false
    };
  }

  if (!isSbuEmail(email)) {
    return {
      error: "Use a valid @stonybrook.edu email address.",
      success: null,
      email,
      codeSent: false
    };
  }

  console.info("[auth] Login code requested", {
    emailDomain: email.split("@")[1] ?? "unknown"
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true
    }
  });

  if (error) {
    console.error("[auth] Login code request failed", {
      status: error.status,
      name: error.name,
      message: error.message
    });

    return {
      error: "Login code could not be sent. Please try again.",
      success: null,
      email,
      codeSent: false
    };
  }

  return {
    error: null,
    success: `Login code sent to ${email}.`,
    email,
    codeSent: true
  };
}

export async function verifyLoginCode(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = sanitizePlainText(formData.get("email")?.toString() ?? "").toLowerCase();
  const token = sanitizePlainText(formData.get("token")?.toString() ?? "");
  const next = getSafeNextPath(sanitizePlainText(formData.get("next")?.toString() ?? ""));

  if (!hasSupabaseEnv()) {
    return {
      error: "Supabase environment variables are missing. Add them before using auth.",
      success: null,
      email,
      codeSent: true
    };
  }

  if (!isSbuEmail(email)) {
    return {
      error: "Use a valid @stonybrook.edu email address.",
      success: null,
      email,
      codeSent: false
    };
  }

  if (!token || token.length > 64) {
    return {
      error: "Enter the code from your email.",
      success: null,
      email,
      codeSent: true
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email"
  });

  if (error) {
    console.error("[auth] Login code verification failed", {
      status: error.status,
      name: error.name,
      message: error.message
    });

    return {
      error: "Code could not be verified. Request a new code or try again.",
      success: null,
      email,
      codeSent: true
    };
  }

  redirect(next);
}

export async function signOut() {
  if (!hasSupabaseEnv()) {
    return;
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
