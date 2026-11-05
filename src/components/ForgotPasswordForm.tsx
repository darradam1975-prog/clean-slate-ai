"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResetUrl(null);

    try {
      const response = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not start a password reset.");
        return;
      }
      setResetUrl(data.resetUrl ?? null);
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-violet-900/20 sm:p-8"
    >
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-white">Forgot password</h1>
        <p className="text-sm text-zinc-400">
          Enter the email on your account. You will get a one-time link to choose a new password. The link expires in 30 minutes.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-zinc-200">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {resetUrl && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <p>Your reset link is ready.</p>
          <Link href={resetUrl} className="mt-2 inline-block font-medium text-white underline">
            Choose a new password
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {loading ? "Please wait..." : "Forgot password"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        <Link href="/login" className="text-violet-300 hover:text-violet-200">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
