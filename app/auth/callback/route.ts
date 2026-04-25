import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "@/lib/data";

type ResponseCookies = ReturnType<typeof NextResponse.redirect>["cookies"];
type CookieOptions = Parameters<ResponseCookies["set"]>[2];
type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/review";
  }

  return value;
}

function getRedirectUrl(requestUrl: URL, next: string) {
  const safeNextUrl = new URL(next, requestUrl.origin);
  const redirectUrl = new URL(requestUrl);

  redirectUrl.pathname = safeNextUrl.pathname;
  redirectUrl.search = safeNextUrl.search;
  redirectUrl.searchParams.delete("code");
  redirectUrl.searchParams.delete("token_hash");
  redirectUrl.searchParams.delete("type");
  redirectUrl.searchParams.delete("next");

  return redirectUrl;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNextPath(requestUrl.searchParams.get("next"));
  const redirectUrl = getRedirectUrl(requestUrl, next);

  console.info("[auth] Callback received", {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type,
    next
  });

  if (!hasSupabaseEnv()) {
    console.error("[auth] Callback missing Supabase environment variables");
    return NextResponse.redirect(new URL("/login", requestUrl.origin));
  }

  const response = NextResponse.redirect(redirectUrl);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    });

    if (!error) {
      console.info("[auth] Callback verified OTP");
      return response;
    }

    console.error("[auth] Callback OTP verification failed", {
      status: error.status,
      name: error.name,
      message: error.message
    });
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      console.info("[auth] Callback exchanged code for session");
      return response;
    }

    console.error("[auth] Callback code exchange failed", {
      status: error.status,
      name: error.name,
      message: error.message
    });
  }

  console.error("[auth] Callback did not receive a usable code or token hash");

  return NextResponse.redirect(
    new URL(`/login?next=${encodeURIComponent(next)}`, requestUrl.origin)
  );
}

export async function HEAD() {
  return new Response(null, {
    status: 204
  });
}
