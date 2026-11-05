"use client";

import { Avatar } from "@/components/Avatar";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Person = {
  id: string;
  username: string;
  avatarKind: AvatarKind;
  avatarStyle: string;
};

export function PeopleSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [searched, setSearched] = useState(false);
  const [busyName, setBusyName] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function search(event?: FormEvent) {
    event?.preventDefault();
    const q = query.trim();
    setError(null);
    setSearched(true);
    if (!q) {
      setPeople([]);
      return;
    }

    const response = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Search failed.");
      setPeople([]);
      return;
    }
    setPeople(data.users ?? []);
  }

  async function addFriend(username: string) {
    setBusyName(username);
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
      setSent((current) => ({
        ...current,
        [username]: data.accepted ? "Friends" : "Requested",
      }));
      router.refresh();
    } catch {
      setError("Could not send the friend request.");
    } finally {
      setBusyName(null);
    }
  }

  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h2 className="text-lg font-semibold text-white">Find people</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Search a username and send a friend request. Their AI art shows up in your Friends feed once they accept.
      </p>
      <form onSubmit={search} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Username"
          aria-label="Search usernames"
          className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
        />
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-900"
        >
          Search
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
      {searched && people.length === 0 && query.trim() && !error && (
        <p className="mt-4 text-sm text-zinc-500">No usernames match that search.</p>
      )}
      <ul className="mt-4 space-y-3">
        {people.map((person) => (
          <li
            key={person.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3"
          >
            <Link
              href={`/user/${person.username}`}
              className="flex min-w-0 items-center gap-3 text-violet-100"
            >
              <Avatar
                kind={person.avatarKind}
                style={person.avatarStyle}
                username={person.username}
                size="sm"
              />
              <span className="truncate font-medium">{person.username}</span>
            </Link>
            {sent[person.username] ? (
              <span className="text-sm text-violet-200">{sent[person.username]}</span>
            ) : (
              <button
                type="button"
                onClick={() => addFriend(person.username)}
                disabled={busyName === person.username}
                className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {busyName === person.username ? "Sending..." : "Add friend"}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
