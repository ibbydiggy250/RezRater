"use client";

import { useActionState } from "react";
import type { LoginState } from "@/app/login/actions";

type LoginFormProps = {
  requestCodeAction: (state: LoginState, formData: FormData) => Promise<LoginState>;
  verifyCodeAction: (state: LoginState, formData: FormData) => Promise<LoginState>;
  initialState: LoginState;
  next?: string;
};

export function LoginForm({
  requestCodeAction,
  verifyCodeAction,
  initialState,
  next
}: LoginFormProps) {
  const [requestState, requestAction, isRequestPending] = useActionState(
    requestCodeAction,
    initialState
  );
  const [verifyState, verifyAction, isVerifyPending] = useActionState(
    verifyCodeAction,
    initialState
  );
  const state = verifyState.error || verifyState.success ? verifyState : requestState;
  const email = state.email || requestState.email;
  const codeSent = state.codeSent || requestState.codeSent;

  return (
    <div className="panel-strong p-8 sm:p-10">
      <p className="eyebrow">Email Login</p>
      <h2 className="mt-2 font-[family-name:var(--font-heading)] text-3xl font-semibold">
        Request a login code
      </h2>
      <p className="mt-3 text-[color:var(--muted)]">
        Enter your school email and we&apos;ll send a secure sign-in code.
      </p>

      <form action={requestAction} className="mt-8 space-y-5">
        <input type="hidden" name="next" value={next ?? "/review"} />

        <label className="block space-y-2 text-sm font-medium">
          <span>Stony Brook email</span>
          <input
            type="email"
            name="email"
            placeholder="you@stonybrook.edu"
            defaultValue={email}
            className="field"
            required
          />
        </label>

        {state.error ? (
          <p className="feedback-error">
            {state.error}
          </p>
        ) : null}

        {state.success ? (
          <p className="feedback-success">
            {state.success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isRequestPending}
          className="btn-primary w-full disabled:opacity-70"
        >
          {isRequestPending ? "Sending code..." : codeSent ? "Send New Code" : "Send Login Code"}
        </button>
      </form>

      {codeSent ? (
        <form action={verifyAction} className="mt-5 space-y-5 border-t border-[color:var(--border)] pt-5">
          <input type="hidden" name="next" value={next ?? "/review"} />
          <input type="hidden" name="email" value={email} />

          <label className="block space-y-2 text-sm font-medium">
            <span>Verification code</span>
            <input
              type="text"
              name="token"
              inputMode="text"
              maxLength={64}
              placeholder="Enter your code"
              className="field"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isVerifyPending}
            className="btn-primary w-full disabled:opacity-70"
          >
            {isVerifyPending ? "Verifying code..." : "Verify Code"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
