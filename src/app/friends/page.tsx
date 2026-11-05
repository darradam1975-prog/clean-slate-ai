import { Avatar } from "@/components/Avatar";
import { FriendActions } from "@/components/FriendActions";
import { Header } from "@/components/Header";
import { PeopleSearch } from "@/components/PeopleSearch";
import { getCurrentUser } from "@/lib/auth";
import { getFriendBoard } from "@/lib/friends";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type BoardPerson = {
  id: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatarKind: string;
    avatarStyle: string;
  };
};

function PersonRow({
  item,
  kind,
}: {
  item: BoardPerson;
  kind: "incoming" | "outgoing" | "friends";
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
      <Link
        href={`/user/${item.user.username}`}
        className="flex min-w-0 items-center gap-3 text-violet-100"
      >
        <Avatar
          kind={item.user.avatarKind as AvatarKind}
          style={item.user.avatarStyle}
          username={item.user.username}
          size="sm"
        />
        <span className="truncate font-medium">{item.user.username}</span>
      </Link>
      <FriendActions friendshipId={item.id} kind={kind} />
    </li>
  );
}

export default async function FriendsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const board = await getFriendBoard(user.id);

  return (
    <div className="min-h-screen bg-[#07080f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_40%)]" />
      <Header />
      <main className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <section className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Friend requests
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Friends
          </h1>
          <p className="mt-3 text-sm text-zinc-400">
            Connect with other people who share AI art. Accepted friends appear in
            the Friends tab of the post feed.
          </p>
        </section>

        <PeopleSearch />

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Incoming
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {board.incoming.length}
            </span>
          </h2>
          {board.incoming.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-500">
              No pending requests.
            </p>
          ) : (
            <ul className="space-y-3">
              {board.incoming.map((item) => (
                <PersonRow key={item.id} item={item} kind="incoming" />
              ))}
            </ul>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold text-white">
            Sent
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {board.outgoing.length}
            </span>
          </h2>
          {board.outgoing.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-500">
              You have not sent a request.
            </p>
          ) : (
            <ul className="space-y-3">
              {board.outgoing.map((item) => (
                <PersonRow key={item.id} item={item} kind="outgoing" />
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Your friends
            <span className="ml-2 text-sm font-normal text-zinc-500">
              {board.friends.length}
            </span>
          </h2>
          {board.friends.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-zinc-500">
              No friends yet. Search a username above or open someone&apos;s profile from the feed.
            </p>
          ) : (
            <ul className="space-y-3">
              {board.friends.map((item) => (
                <PersonRow key={item.id} item={item} kind="friends" />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
