import { NextResponse } from "next/server";
import { getDriveSettings } from "@/lib/site-settings";

export async function GET() {
  const drive = await getDriveSettings();
  if (!drive.enabled) {
    return NextResponse.json({ enabled: false });
  }

  return NextResponse.json({
    enabled: true,
    apiKey: drive.apiKey,
    clientId: drive.clientId,
  });
}
