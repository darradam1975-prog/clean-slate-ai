import { Header } from "@/components/Header";
import { ProfileView } from "@/components/ProfileView";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProfileSocial } from "@/lib/friends";
import type { AvatarKind } from "@/lib/identity";
import { postSocialInclude, serializePost } from "@/lib/post-social";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type UserProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params;
  const viewer = await getCurrentUser();

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

  const social = await getProfileSocial(viewer?.id ?? null, user.id);

  const posts = await prisma.post.findMany({
    where: { userId: user.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    include: postSocialInclude(viewer?.id ?? null),
  });

  return (
    <div className="min-h-screen bg-[#07080f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_40%)]" />
      <Header />
      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ProfileView
          isOwnProfile={viewer?.id === user.id}
          social={{
            friendCount: social.friendCount,
            status: social.status,
            friendshipId: social.friendshipId,
            signedIn: social.viewerSignedIn,
          }}
          user={{
            username: user.username,
            avatarKind: user.avatarKind as AvatarKind,
            avatarStyle: user.avatarStyle,
            createdAt: user.createdAt.toISOString(),
          }}
          posts={posts.map((post) => serializePost(post, viewer?.username ?? null))}
        />
      </main>
    </div>
  );
}