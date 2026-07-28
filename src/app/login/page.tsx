"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OtpInput from "@/components/OtpInput";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "verifying" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [codeKey, setCodeKey] = useState(0);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setStatus("error");
      setErrorMessage("Couldn't send a code. Check the email and try again.");
      return;
    }
    setStatus("idle");
    setStep("code");
    setCodeKey((k) => k + 1);
  }

  async function verifyCode(code: string) {
    setStatus("verifying");
    setErrorMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) {
      setStatus("error");
      setErrorMessage("That code didn't work. Check it and try again.");
      setCodeKey((k) => k + 1);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-stone-50 px-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        {step === "email" ? (
          <>
            <h1 className="text-xl font-semibold text-stone-900">Welcome back</h1>
            <p className="mt-1 text-sm text-stone-500">
              Enter your email and we&apos;ll send you a 6-digit code to sign in.
            </p>

            <form onSubmit={sendCode} className="mt-6 flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                inputMode="email"
                autoComplete="email"
                autoFocus
                className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base outline-none focus:border-stone-400"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-2xl bg-stone-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send code"}
              </button>
              {status === "error" && (
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-stone-900">Enter your code</h1>
            <p className="mt-1 text-sm text-stone-500">
              We sent a 6-digit code to <span className="font-medium text-stone-700">{email}</span>.
            </p>

            <div className="mt-6">
              <OtpInput key={codeKey} onComplete={verifyCode} disabled={status === "verifying"} />
            </div>

            {status === "verifying" && (
              <p className="mt-3 text-sm text-stone-400">Verifying…</p>
            )}
            {status === "error" && (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            )}

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setStatus("idle");
                  setErrorMessage("");
                }}
                className="text-stone-400"
              >
                Change email
              </button>
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={status === "sending"}
                className="font-medium text-stone-700"
              >
                {status === "sending" ? "Sending…" : "Resend code"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
