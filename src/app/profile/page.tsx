import { Header } from "@/components/Header";
import { ProfileView } from "@/components/ProfileView";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getProfileSocial } from "@/lib/friends";
import type { AvatarKind } from "@/lib/identity";
import { postSocialInclude, serializePost } from "@/lib/post-social";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const social = await getProfileSocial(user.id, user.id);

  const posts = await prisma.post.findMany({
    where: { userId: user.id, status: "approved" },
    orderBy: { createdAt: "desc" },
    include: postSocialInclude(user.id),
  });

  return (
    <div className="min-h-screen bg-[#07080f]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_right,_rgba(217,70,239,0.12),_transparent_40%)]" />
      <Header />
      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <ProfileView
          isOwnProfile
          user={{
            username: user.username,
            avatarKind: user.avatarKind as AvatarKind,
            avatarStyle: user.avatarStyle,
            createdAt: user.createdAt.toISOString(),
          }}
          social={{
            friendCount: social.friendCount,
            status: social.status,
            friendshipId: social.friendshipId,
            signedIn: social.viewerSignedIn,
          }}
          posts={posts.map((post) => serializePost(post, user.username))}
        />
      </main>
    </div>
  );
}