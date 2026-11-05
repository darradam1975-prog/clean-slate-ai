import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateFriendship } from "@/lib/friends";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to update friends." }, { status: 401 });
  }

  const { id } = await context.params;

  let action = "";
  try {
    const body = (await request.json()) as { action?: unknown };
    action = typeof body.action === "string" ? body.action : "";
  } catch {
    return NextResponse.json({ error: "Action is required." }, { status: 400 });
  }

  const result = await updateFriendship(user.id, id, action);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true });
}
