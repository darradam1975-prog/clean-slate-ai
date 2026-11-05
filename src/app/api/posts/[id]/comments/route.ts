import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { AvatarKind } from "@/lib/identity";
import { moderateTitleOnly } from "@/lib/sfw-moderation";
import { validateComment } from "@/lib/validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });
  }

  const { id: postId } = await context.params;
  const post = await prisma.post.findFirst({
    where: { id: postId, status: "approved" },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  let body = "";
  try {
    const payload = (await request.json()) as { body?: unknown };
    body = typeof payload.body === "string" ? payload.body : "";
  } catch {
    return NextResponse.json({ error: "Write a comment first." }, { status: 400 });
  }

  const commentError = validateComment(body);
  if (commentError) {
    return NextResponse.json({ error: commentError }, { status: 400 });
  }

  const trimmed = body.trim();
  const moderation = moderateTitleOnly(trimmed);
  if (!moderation.isSfw) {
    return NextResponse.json(
      { error: "That comment is not allowed on this site." },
      { status: 422 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      body: trimmed,
      postId,
      userId: user.id,
    },
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

  return NextResponse.json(
    {
      comment: {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        user: {
          username: comment.user.username,
          avatarKind: comment.user.avatarKind as AvatarKind,
          avatarStyle: comment.user.avatarStyle,
        },
      },
    },
    { status: 201 },
  );
}
