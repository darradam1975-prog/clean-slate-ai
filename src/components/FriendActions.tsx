"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FriendActionsProps = {
  friendshipId: string;
  kind: "incoming" | "outgoing" | "friends";
};

export function FriendActions({ friendshipId, kind }: FriendActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "accept" | "decline" | "cancel" | "unfriend") {
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
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-2">
        {kind === "incoming" && (
          <>
            <button
              type="button"
              onClick={() => act("accept")}
              disabled={busy}
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => act("decline")}
              disabled={busy}
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 disabled:opacity-60"
            >
              Decline
            </button>
          </>
        )}
        {kind === "outgoing" && (
          <button
            type="button"
            onClick={() => act("cancel")}
            disabled={busy}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 disabled:opacity-60"
          >
            Cancel
          </button>
        )}
        {kind === "friends" && (
          <button
            type="button"
            onClick={() => act("unfriend")}
            disabled={busy}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-200 disabled:opacity-60"
          >
            Unfriend
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
