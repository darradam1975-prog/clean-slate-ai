import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getFriendBoard, sendFriendRequest } from "@/lib/friends";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to see friends." }, { status: 401 });
  }

  const board = await getFriendBoard(user.id);
  return NextResponse.json(board);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to add friends." }, { status: 401 });
  }

  let username = "";
  try {
    const body = (await request.json()) as { username?: unknown };
    username = typeof body.username === "string" ? body.username : "";
  } catch {
    return NextResponse.json({ error: "Username is required." }, { status: 400 });
  }

  const result = await sendFriendRequest(user.id, username);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result, { status: 201 });
}
