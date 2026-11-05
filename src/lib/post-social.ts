import type { AvatarKind } from "@/lib/identity";

export type PostAuthor = {
  username: string;
  avatarKind: AvatarKind;
  avatarStyle: string;
};

export type PostComment = {
  id: string;
  body: string;
  createdAt: string;
  user: PostAuthor;
};

export type PostCardPost = {
  id: string;
  title: string;
  mediaType: string;
  mediaPath: string;
  mimeType: string;
  durationSeconds: number | null;
  noAiMark: boolean;
  createdAt: string;
  user: PostAuthor;
  likeCount: number;
  liked: boolean;
  viewerUsername: string | null;
  comments: PostComment[];
};

const authorSelect = {
  username: true,
  avatarKind: true,
  avatarStyle: true,
} as const;

export function postSocialInclude(viewerId: string | null) {
  return {
    user: { select: authorSelect },
    comments: {
      orderBy: { createdAt: "asc" as const },
      include: { user: { select: authorSelect } },
    },
    likes: {
      where: { userId: viewerId ?? "" },
      select: { id: true },
      take: 1,
    },
    _count: { select: { likes: true } },
  };
}

type AuthorRow = {
  username: string;
  avatarKind: string;
  avatarStyle: string;
};

type SocialPostRow = {
  id: string;
  title: string;
  mediaType: string;
  mediaPath: string;
  mimeType: string;
  durationSeconds: number | null;
  noAiMark: boolean;
  createdAt: Date;
  user: AuthorRow;
  likes: { id: string }[];
  comments: {
    id: string;
    body: string;
    createdAt: Date;
    user: AuthorRow;
  }[];
  _count: { likes: number };
};

function toAuthor(user: AuthorRow) {
  return {
    username: user.username,
    avatarKind: user.avatarKind as AvatarKind,
    avatarStyle: user.avatarStyle,
  };
}

export function serializePost(
  post: SocialPostRow,
  viewerUsername: string | null,
): PostCardPost {
  return {
    id: post.id,
    title: post.title,
    mediaType: post.mediaType,
    mediaPath: post.mediaPath,
    mimeType: post.mimeType,
    durationSeconds: post.durationSeconds,
    noAiMark: post.noAiMark,
    createdAt: post.createdAt.toISOString(),
    user: toAuthor(post.user),
    likeCount: post._count.likes,
    liked: post.likes.length > 0,
    viewerUsername,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      user: toAuthor(comment.user),
    })),
  };
}
