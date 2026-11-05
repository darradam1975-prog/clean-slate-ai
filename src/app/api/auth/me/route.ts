import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null, incomingFriendRequests: 0 }, { status: 401 });
  }

  const incomingFriendRequests = await prisma.friendship.count({
    where: { addresseeId: user.id, status: "pending" },
  });

  return NextResponse.json({ user, incomingFriendRequests });
}