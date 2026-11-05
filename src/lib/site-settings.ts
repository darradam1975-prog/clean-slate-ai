import { prisma } from "@/lib/db";

const DRIVE_ENABLED = "googleDriveEnabled";
const DRIVE_API_KEY = "googleApiKey";
const DRIVE_CLIENT_ID = "googleClientId";

export type DriveSettings = {
  enabled: boolean;
  apiKey: string;
  clientId: string;
};

async function readSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function getDriveSettings(): Promise<DriveSettings> {
  const [enabledRaw, storedKey, storedClientId] = await Promise.all([
    readSetting(DRIVE_ENABLED),
    readSetting(DRIVE_API_KEY),
    readSetting(DRIVE_CLIENT_ID),
  ]);

  const apiKey = (storedKey ?? process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "").trim();
  const clientId = (storedClientId ?? process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "").trim();
  const turnedOn = enabledRaw == null ? Boolean(apiKey && clientId) : enabledRaw === "1";

  return {
    enabled: turnedOn && Boolean(apiKey && clientId),
    apiKey,
    clientId,
  };
}

export async function saveDriveSettings(input: {
  enabled: boolean;
  apiKey: string;
  clientId: string;
}): Promise<DriveSettings> {
  const apiKey = input.apiKey.trim();
  const clientId = input.clientId.trim();

  if (input.enabled && !apiKey) {
    throw new Error("Enter a Google API key to enable Drive imports.");
  }
  if (input.enabled && !clientId) {
    throw new Error("Enter a Google OAuth client ID. Drive import needs it with the API key.");
  }
  if (apiKey.length > 256 || clientId.length > 256) {
    throw new Error("That key is too long.");
  }

  const rows = [
    { key: DRIVE_ENABLED, value: input.enabled ? "1" : "0" },
    { key: DRIVE_API_KEY, value: apiKey },
    { key: DRIVE_CLIENT_ID, value: clientId },
  ];

  await prisma.$transaction(
    rows.map((row) =>
      prisma.siteSetting.upsert({
        where: { key: row.key },
        create: row,
        update: { value: row.value },
      }),
    ),
  );

  return getDriveSettings();
}
