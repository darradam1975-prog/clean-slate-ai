import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { friendUserSelect } from "@/lib/friends";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to find people." }, { status: 401 });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      username: { contains: query, mode: "insensitive" },
    },
    select: friendUserSelect,
    orderBy: { username: "asc" },
    take: 8,
  });

  return NextResponse.json({ users });
}
