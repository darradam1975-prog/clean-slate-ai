import { COLORS, PATTERNS } from "@/lib/identity";
import { prisma } from "@/lib/db";

function randomTwoDigits(): string {
  return String(Math.floor(Math.random() * 100)).padStart(2, "0");
}

function pickBaseName(): string {
  const useColor = Math.random() < 0.5;
  const pool = useColor ? COLORS : PATTERNS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function generateUniqueUsername(): Promise<string> {
  for (let attempt = 0; attempt < 200; attempt++) {
    const username = `${pickBaseName()}${randomTwoDigits()}`;
    const existing = await prisma.user.findUnique({ where: { username } });
    if (!existing) return username;
  }

  throw new Error("Unable to generate a unique username. Please try again.");
}