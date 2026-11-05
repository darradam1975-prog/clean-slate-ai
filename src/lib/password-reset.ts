import { createHash, randomBytes } from "node:crypto";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";

const RESET_TTL_MS = 30 * 60 * 1000;

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createPasswordReset(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);

  await prisma.passwordReset.deleteMany({ where: { userId } });
  await prisma.passwordReset.create({
    data: {
      userId,
      tokenHash: hashResetToken(token),
      expiresAt,
    },
  });

  return token;
}

export async function consumePasswordReset(
  token: string,
  password: string,
): Promise<{ userId: string } | { error: string; status: number }> {
  const tokenHash = hashResetToken(token);
  const row = await prisma.passwordReset.findUnique({ where: { tokenHash } });

  if (!row || row.expiresAt.getTime() < Date.now()) {
    if (row) {
      await prisma.passwordReset.delete({ where: { id: row.id } });
    }
    return { error: "This reset link is invalid or expired.", status: 400 };
  }

  const passwordHash = await hashPassword(password);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.deleteMany({ where: { userId: row.userId } }),
  ]);

  return { userId: row.userId };
}
