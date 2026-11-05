"use client";

import type { FriendUiStatus } from "@/lib/friends";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FriendButtonProps = {
  username: string;
  status: FriendUiStatus;
  friendshipId: string | null;
  signedIn: boolean;
};

const primaryButton =
  "rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25 disabled:cursor-not-allowed disabled:opacity-60";
const quietButton =
  "rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-200 disabled:cursor-not-allowed disabled:opacity-60";

export function FriendButton({
  username,
  status,
  friendshipId,
  signedIn,
}: FriendButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "self") return null;

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not send the friend request.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not send the friend request.");
    } finally {
      setBusy(false);
    }
  }

  async function act(action: "accept" | "decline" | "cancel" | "unfriend") {
    if (!friendshipId) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update the friend request.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update the friend request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {!signedIn && (
          <Link href="/login" className={primaryButton}>
            Sign in to add friend
          </Link>
        )}
        {signedIn && (status === "none" || status === "declined") && (
          <button type="button" onClick={send} disabled={busy} className={primaryButton}>
            {busy ? "Sending..." : status === "declined" ? "Request again" : "Add friend"}
          </button>
        )}
        {signedIn && status === "outgoing" && (
          <>
            <span className="rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2.5 text-sm text-violet-100">
              Requested
            </span>
            <button
              type="button"
              onClick={() => act("cancel")}
              disabled={busy}
              className={quietButton}
            >
              Cancel
            </button>
          </>
        )}
        {signedIn && status === "incoming" && (
          <>
            <button
              type="button"
              onClick={() => act("accept")}
              disabled={busy}
              className={primaryButton}
            >
              Accept request
            </button>
            <button
              type="button"
              onClick={() => act("decline")}
              disabled={busy}
              className={quietButton}
            >
              Decline
            </button>
          </>
        )}
        {signedIn && status === "friends" && (
          <>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2.5 text-sm text-emerald-100">
              Friends
            </span>
            <button
              type="button"
              onClick={() => act("unfriend")}
              disabled={busy}
              className={quietButton}
            >
              Unfriend
            </button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
