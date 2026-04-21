"use client";

import { useActionState } from "react";
import type { LoginState } from "@/app/login/actions";

type LoginFormProps = {
  action: (state: LoginState, formData: FormData) => Promise<LoginState>;
  initialState: LoginState;
  next?: string;
};

export function LoginForm({ action, initialState, next }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <div className="panel-strong p-8 sm:p-10">
      <p className="eyebrow">Email Login</p>
      <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
        Request a magic link
      </h2>
      <p className="mt-3 text-[color:var(--muted)]">
        Enter your school email and we&apos;ll send a secure sign-in link.
      </p>

      <form action={formAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next ?? "/review"} />

        <label className="block space-y-2 text-sm font-medium">
          <span>Stony Brook email</span>
          <input
            type="email"
            name="email"
            placeholder="you@stonybrook.edu"
            className="field"
            required
          />
        </label>

        {state.error ? (
          <p className="rounded-2xl bg-[color:rgba(159,58,56,0.08)] px-4 py-3 text-sm text-[color:var(--danger)]">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="rounded-2xl bg-[color:rgba(42,157,143,0.1)] px-4 py-3 text-sm text-[color:var(--brand-deep)]">
            {state.success}
          </p>
        ) : null}

        <button type="submit" disabled={isPending} className="btn-primary w-full disabled:opacity-70">
          {isPending ? "Sending link..." : "Send Magic Link"}
        </button>
      </form>
    </div>
  );
}
