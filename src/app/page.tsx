import { Header } from "@/components/Header";
import { PostCard } from "@/components/PostCard";
import { prisma } from "@/lib/db";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: "approved" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          username: true,
          avatarKind: true,
          avatarStyle: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#07080f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_40%)]" />
      <Header />

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
            Safe for work AI gallery
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Share AI art and short clips with automatic scanning
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Browse the gallery without signing in. Uploads are scanned for embedded
            prompts, C2PA tags, and visual AI patterns when configured — creators can
            also self-label AI work. Photo-realistic AI without hints may still slip
            through. Content is moderated for safe-for-work posting. Usernames and
            profile pictures are randomly assigned colors or
            patterns like Crimson42 or a Dotted avatar — both permanent and never
            changeable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/upload"
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25"
            >
              Upload media
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-200"
            >
              Get a random username
            </Link>
          </div>
        </section>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">No posts yet</p>
            <p className="mt-2 text-sm text-zinc-400">
              Be the first to share a safe-for-work AI creation.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={{
                  ...post,
                  createdAt: post.createdAt.toISOString(),
                  userDeclaredAi: post.userDeclaredAi,
                  user: {
                    ...post.user,
                    avatarKind: post.user.avatarKind as AvatarKind,
                  },
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}