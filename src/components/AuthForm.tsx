"use client";

import { Avatar } from "@/components/Avatar";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type RegisteredUser = {
  username: string;
  avatarKind: AvatarKind;
  avatarStyle: string;
};

type AuthFormProps = {
  mode: "login" | "register";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<RegisteredUser | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setRegisteredUser(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      if (mode === "register" && data.user?.username) {
        setRegisteredUser({
          username: data.user.username,
          avatarKind: data.user.avatarKind,
          avatarStyle: data.user.avatarStyle,
        });
        setTimeout(() => router.push("/"), 2400);
        return;
      }

      router.push("/");
      router.refresh();
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
        <h1 className="text-2xl font-semibold text-white">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-zinc-400">
          {mode === "login"
            ? "Sign in with your email and password."
            : "You'll get a random username and profile picture in colors or patterns — both permanent."}
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
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-zinc-200">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {registeredUser && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
          <div className="flex items-center gap-3">
            <Avatar
              kind={registeredUser.avatarKind}
              style={registeredUser.avatarStyle}
              username={registeredUser.username}
              size="lg"
            />
            <div>
              <p className="font-medium text-white">{registeredUser.username}</p>
              <p className="mt-1 text-emerald-200/90">
                {registeredUser.avatarStyle} {registeredUser.avatarKind} profile
                picture — permanent and never changeable.
              </p>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:opacity-60"
      >
        {loading
          ? "Please wait..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="text-center text-sm text-zinc-400">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-violet-300 hover:text-violet-200">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-violet-300 hover:text-violet-200">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}