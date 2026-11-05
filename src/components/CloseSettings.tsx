"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function CloseSettings() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.push("/");
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <button
      type="button"
      onClick={() => router.push("/")}
      className="rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-black/70"
    >
      Close
    </button>
  );
}
