import { Avatar } from "@/components/Avatar";
import { aiLabelToneClasses, getAiLabel } from "@/lib/ai-labels";
import type { AvatarKind } from "@/lib/identity";
import Link from "next/link";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    mediaType: string;
    mediaPath: string;
    mimeType: string;
    durationSeconds: number | null;
    isAiGenerated: boolean;
    aiConfidence: number;
    createdAt: string;
    user: {
      username: string;
      avatarKind: AvatarKind;
      avatarStyle: string;
    };
  };
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
  const aiLabel = getAiLabel(post.isAiGenerated, post.aiConfidence);

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
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaUrl}
            alt={post.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
        )}
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-col gap-1.5">
          <span
            className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${aiLabelToneClasses[aiLabel.tone]}`}
          >
            {aiLabel.badge}
          </span>
          <span
            className="w-fit max-w-full rounded-full bg-black/55 px-2.5 py-1 text-[11px] leading-snug text-zinc-200 backdrop-blur-md"
            title={aiLabel.hint}
          >
            {aiLabel.hint}
          </span>
        </div>
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
      </div>
    </article>
  );
}