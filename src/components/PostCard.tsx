import { Avatar } from "@/components/Avatar";
import { ExpandableImage } from "@/components/ExpandableImage";
import { NoAiMark } from "@/components/NoAiMark";
import { PostActions } from "@/components/PostActions";
import type { PostCardPost } from "@/lib/post-social";
import Link from "next/link";

type PostCardProps = {
  post: PostCardPost;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function PostCard({ post }: PostCardProps) {
  const mediaUrl = `/api/media/${post.mediaPath}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl shadow-black/20 transition hover:border-violet-400/30 hover:bg-white/[0.05]">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        {post.mediaType === "video" ? (
          <video
            src={mediaUrl}
            controls
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <ExpandableImage
            src={mediaUrl}
            alt={post.title}
            showMark={post.noAiMark}
          />
        )}
        {post.noAiMark && <NoAiMark />}
      </div>

      <div className="space-y-2 p-4">
        <h2 className="text-lg font-semibold text-white">{post.title}</h2>
        <div className="flex items-center justify-between gap-3 text-sm text-zinc-400">
          <Link
            href={`/user/${post.user.username}`}
            className="flex min-w-0 items-center gap-2 transition hover:text-violet-100"
          >
            <Avatar
              kind={post.user.avatarKind}
              style={post.user.avatarStyle}
              username={post.user.username}
              size="sm"
            />
            <span className="truncate font-medium text-violet-200">
              {post.user.username}
            </span>
          </Link>
          <span className="shrink-0">{formatDate(post.createdAt)}</span>
        </div>
        {post.mediaType === "video" && post.durationSeconds != null && (
          <p className="text-xs text-zinc-500">
            Short clip · {post.durationSeconds.toFixed(1)}s
          </p>
        )}
        <PostActions
          postId={post.id}
          likeCount={post.likeCount}
          liked={post.liked}
          comments={post.comments}
          viewerUsername={post.viewerUsername}
        />
      </div>
    </article>
  );
}