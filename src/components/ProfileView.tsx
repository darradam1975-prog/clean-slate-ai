import { Avatar } from "@/components/Avatar";
import { FriendButton } from "@/components/FriendButton";
import { PostCard } from "@/components/PostCard";
import type { FriendUiStatus } from "@/lib/friends";
import type { AvatarKind } from "@/lib/identity";
import type { PostCardPost } from "@/lib/post-social";
import Link from "next/link";

type ProfilePost = PostCardPost;

type ProfileViewProps = {
  user: {
    username: string;
    avatarKind: AvatarKind;
    avatarStyle: string;
    createdAt: string;
  };
  posts: ProfilePost[];
  isOwnProfile?: boolean;
  social: {
    friendCount: number;
    status: FriendUiStatus;
    friendshipId: string | null;
    signedIn: boolean;
  };
};

function formatJoinDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileView({
  user,
  posts,
  isOwnProfile = false,
  social,
}: ProfileViewProps) {
  return (
    <>
      <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              kind={user.avatarKind}
              style={user.avatarStyle}
              username={user.username}
              size="lg"
            />
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-violet-300">
                {isOwnProfile ? "Your profile" : "Creator profile"}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {user.username}
              </h1>
              <p className="mt-2 text-sm text-zinc-400">
                Joined {formatJoinDate(user.createdAt)}
                <span className="text-zinc-600">
                  {" "}
                  · {social.friendCount}{" "}
                  {social.friendCount === 1 ? "friend" : "friends"}
                  {" "}
                  · {user.avatarStyle} {user.avatarKind}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isOwnProfile ? (
              <>
                <Link
                  href="/upload"
                  className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/25"
                >
                  Share AI art
                </Link>
                <Link
                  href="/friends"
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-zinc-200"
                >
                  Friends
                </Link>
              </>
            ) : (
              <FriendButton
                username={user.username}
                status={social.status}
                friendshipId={social.friendshipId}
                signedIn={social.signedIn}
              />
            )}
          </div>
        </div>

        <p className="mt-6 max-w-2xl text-sm text-zinc-500">
          Usernames and avatars are randomly assigned at signup and cannot be changed.
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">
            {isOwnProfile ? "Your uploads" : "Uploads"}
          </h2>
          <span className="text-sm text-zinc-500">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <p className="text-lg font-medium text-white">
              {isOwnProfile ? "No uploads yet" : "No public uploads yet"}
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {isOwnProfile
                ? "Share your first piece of AI art."
                : "This person has not shared any AI art yet."}
            </p>
            {isOwnProfile && (
              <Link
                href="/upload"
                className="mt-6 inline-flex rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-medium text-white"
              >
                Share AI art
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}