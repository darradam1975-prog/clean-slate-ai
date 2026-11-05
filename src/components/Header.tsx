"use client";

import { Avatar } from "@/components/Avatar";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  username: string;
  avatarKind: AvatarKind;
  avatarStyle: string;
};

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [incomingFriendRequests, setIncomingFriendRequests] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
        setIncomingFriendRequests(data.incomingFriendRequests ?? 0);
        setIsOwner(Boolean(data.isOwner));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setIncomingFriendRequests(0);
    setIsOwner(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-violet-500/20 bg-[#0b0d14]/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-2 sm:px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
            CSA
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight text-white">
              Clean Slate AI
            </p>
            <p className="text-xs text-violet-200/70">AI art network</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-2">
          {!loading && user ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-1 transition hover:border-violet-300/50 hover:bg-violet-500/20 sm:flex"
              >
                <Avatar
                  kind={user.avatarKind}
                  style={user.avatarStyle}
                  username={user.username}
                  size="sm"
                />
                <span className="pr-1 text-sm text-violet-100">{user.username}</span>
              </Link>
              <Link
                href="/profile"
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white sm:hidden sm:px-4"
              >
                Profile
              </Link>
              <Link
                href="/friends"
                className="relative rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white sm:px-4"
              >
                Friends
                {incomingFriendRequests > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[10px] font-semibold text-white">
                    {incomingFriendRequests}
                  </span>
                )}
              </Link>
              {isOwner && (
                <Link
                  href="/settings"
                  className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-200 transition hover:border-white/25 hover:text-white sm:px-4"
                >
                  Settings
                </Link>
              )}
              <Link
                href="/upload"
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-sm font-medium text-white shadow-md shadow-violet-500/25 transition hover:brightness-110 sm:px-4"
              >
                Share
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/25 hover:text-white sm:px-4"
              >
                Sign out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 transition hover:border-white/25"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100"
              >
                Create account
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}