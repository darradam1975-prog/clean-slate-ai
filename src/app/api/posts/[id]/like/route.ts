import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to like posts." }, { status: 401 });
  }

  const { id: postId } = await context.params;
  const post = await prisma.post.findFirst({
    where: { id: postId, status: "approved" },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId: user.id, postId } });
  }

  const likeCount = await prisma.like.count({ where: { postId } });
  return NextResponse.json({ liked: !existing, likeCount });
}
