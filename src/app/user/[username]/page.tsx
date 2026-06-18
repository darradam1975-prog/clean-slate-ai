import { Header } from "@/components/Header";
import { ProfileView } from "@/components/ProfileView";
import { prisma } from "@/lib/db";
import type { AvatarKind } from "@/lib/identity";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatarKind: true,
      avatarStyle: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const posts = await prisma.post.findMany({
    where: { userId: user.id, status: "approved" },
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
        <ProfileView
          user={{
            username: user.username,
            avatarKind: user.avatarKind as AvatarKind,
            avatarStyle: user.avatarStyle,
            createdAt: user.createdAt.toISOString(),
          }}
          posts={posts.map((post) => ({
            ...post,
            createdAt: post.createdAt.toISOString(),
            user: {
              ...post.user,
              avatarKind: post.user.avatarKind as AvatarKind,
            },
          }))}
        />
      </main>
    </div>
  );
}