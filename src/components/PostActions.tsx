"use client";

import { Avatar } from "@/components/Avatar";
import type { PostComment } from "@/lib/post-social";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type PostActionsProps = {
  postId: string;
  likeCount: number;
  liked: boolean;
  comments: PostComment[];
  viewerUsername: string | null;
};

function formatWhen(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function PostActions({
  postId,
  likeCount,
  liked,
  comments,
  viewerUsername,
}: PostActionsProps) {
  const router = useRouter();
  const [likeState, setLikeState] = useState(liked);
  const [likes, setLikes] = useState(likeCount);
  const [likeStamp, setLikeStamp] = useState(`${liked}:${likeCount}`);
  const [thread, setThread] = useState(comments);
  const commentKey = comments.map((comment) => comment.id).join(",");
  const [seenComments, setSeenComments] = useState(commentKey);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState<"like" | "comment" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nextLikeStamp = `${liked}:${likeCount}`;

  if (likeStamp !== nextLikeStamp) {
    setLikeStamp(nextLikeStamp);
    setLikeState(liked);
    setLikes(likeCount);
  }

  if (seenComments !== commentKey) {
    setSeenComments(commentKey);
    setThread(comments);
  }

  async function toggleLike() {
    if (!viewerUsername) {
      router.push("/login");
      return;
    }
    setBusy("like");
    setError(null);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update the like.");
        return;
      }
      setLikeState(data.liked);
      setLikes(data.likeCount);
      router.refresh();
    } catch {
      setError("Could not update the like.");
    } finally {
      setBusy(null);
    }
  }

  async function submitComment(event: FormEvent) {
    event.preventDefault();
    if (!viewerUsername) {
      router.push("/login");
      return;
    }
    setBusy("comment");
    setError(null);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not post the comment.");
        return;
      }
      setThread((current) => [...current, data.comment]);
      setBody("");
      router.refresh();
    } catch {
      setError("Could not post the comment.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3 border-t border-white/10 pt-3">
      <button
        type="button"
        onClick={toggleLike}
        disabled={busy === "like"}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition disabled:opacity-60 ${
          likeState
            ? "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-100"
            : "border-white/10 text-zinc-300 hover:border-white/25 hover:text-white"
        }`}
        aria-pressed={likeState}
      >
        <span aria-hidden>{likeState ? "♥" : "♡"}</span>
        {likeState ? "Liked" : "Like"}
        <span className="text-zinc-400">{likes}</span>
      </button>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          {thread.length} {thread.length === 1 ? "comment" : "comments"}
        </p>
        {thread.length > 0 && (
          <ul className="max-h-40 space-y-2 overflow-y-auto pr-1">
            {thread.map((comment) => (
              <li key={comment.id} className="flex items-start gap-2 text-sm">
                <Link href={`/user/${comment.user.username}`} className="mt-0.5 shrink-0">
                  <Avatar
                    kind={comment.user.avatarKind}
                    style={comment.user.avatarStyle}
                    username={comment.user.username}
                    size="xs"
                  />
                </Link>
                <p className="min-w-0 text-zinc-300">
                  <Link
                    href={`/user/${comment.user.username}`}
                    className="font-medium text-violet-200 hover:text-violet-100"
                  >
                    {comment.user.username}
                  </Link>{" "}
                  <span className="break-words">{comment.body}</span>
                  <span className="ml-2 text-xs text-zinc-500">
                    {formatWhen(comment.createdAt)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewerUsername ? (
        <form onSubmit={submitComment} className="space-y-2">
          <label htmlFor={`comment-${postId}`} className="text-xs text-zinc-400">
            Comment as {viewerUsername}
          </label>
          <div className="flex gap-2">
            <input
              id={`comment-${postId}`}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              maxLength={500}
              placeholder="Write a comment"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-violet-400/50"
            />
            <button
              type="submit"
              disabled={busy === "comment" || body.trim().length === 0}
              className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-zinc-900 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-zinc-400">
          <Link href="/login" className="text-violet-300 hover:text-violet-200">
            Sign in
          </Link>{" "}
          to like and comment with your username.
        </p>
      )}

      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
