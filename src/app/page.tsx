import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAcceptedFriendIds } from "@/lib/friends";
import { postSocialInclude, serializePost } from "@/lib/post-social";
import Link from "next/link";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams: Promise<{ feed?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const feedParam = (await searchParams).feed;
  const friendsFeed = feedParam === "friends";
  const viewer = await getCurrentUser();

  const where: {
    status: string;
    userId?: { in: string[] };
  } = { status: "approved" };

  if (friendsFeed && viewer) {
    where.userId = { in: await getAcceptedFriendIds(viewer.id) };
  }

  const posts =
    friendsFeed && !viewer
      ? []
      : await prisma.post.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: postSocialInclude(viewer?.id ?? null),
        });

  return (
    <div className="min-h-screen bg-[#07080f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_40%)]" />
      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Social network for AI art
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Share AI art with a post feed, profiles, and friend requests
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            The feed is for AI art. Anyone can browse it. Sign in to post, open a
            profile, and send friend requests. The noAI checkmark is on by default
            and can be turned off for a single post. Content stays safe for work.
            Usernames and profile pictures are assigned at signup and stay fixed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25"
            >
              Share AI art
            </Link>
            <Link
              href={viewer ? "/friends" : "/register"}
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-200"
            >
              {viewer ? "Friend requests" : "Get a random username"}
            </Link>
          </div>
        </section>

        <div className="mb-6 flex gap-2">
          <Link
            href="/"
            className={`rounded-full px-4 py-2 text-sm ${
              friendsFeed
                ? "border border-white/10 text-zinc-300"
                : "bg-white text-zinc-900"
            }`}
          >
            All art
          </Link>
          <Link
            href="/?feed=friends"
            className={`rounded-full px-4 py-2 text-sm ${
              friendsFeed
                ? "bg-white text-zinc-900"
                : "border border-white/10 text-zinc-300"
            }`}
          >
            Friends
          </Link>
        </div>

        {friendsFeed && !viewer ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">Sign in to see friends&apos; art</p>
            <p className="mt-2 text-sm text-zinc-400">
              Friend requests unlock a feed of art from people you connect with.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-zinc-900"
            >
              Sign in
            </Link>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">
              {friendsFeed ? "No art from friends yet" : "No posts yet"}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {friendsFeed
                ? "Send a friend request, then their posts show up here."
                : "Be the first to share a piece of AI art."}
            </p>
            {friendsFeed && (
              <Link
                href="/friends"
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white"
              >
                Find friends
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={serializePost(post, viewer?.username ?? null)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}