import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isSiteOwner } from "@/lib/owner";
import { getDriveSettings, saveDriveSettings } from "@/lib/site-settings";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isSiteOwner(user.email)) {
    return NextResponse.json({ error: "Only the site owner can open settings." }, { status: 403 });
  }

  const drive = await getDriveSettings();
  return NextResponse.json({ drive });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isSiteOwner(user.email)) {
    return NextResponse.json({ error: "Only the site owner can change settings." }, { status: 403 });
  }

  let enabled = false;
  let apiKey = "";
  let clientId = "";
  try {
    const body = (await request.json()) as {
      enabled?: unknown;
      apiKey?: unknown;
      clientId?: unknown;
    };
    enabled = body.enabled === true;
    apiKey = typeof body.apiKey === "string" ? body.apiKey : "";
    clientId = typeof body.clientId === "string" ? body.clientId : "";
  } catch {
    return NextResponse.json({ error: "Settings could not be read." }, { status: 400 });
  }

  try {
    const drive = await saveDriveSettings({ enabled, apiKey, clientId });
    return NextResponse.json({ drive });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save settings." },
      { status: 400 },
    );
  }
}
