import { getConnectionString } from "@netlify/database";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getDatabaseUrl(): string {
  try {
    return getConnectionString();
  } catch {
    const databaseUrl = process.env.DATABASE_URL;
    if (
      databaseUrl?.startsWith("postgresql://") ||
      databaseUrl?.startsWith("postgres://")
    ) {
      return databaseUrl;
    }
  }

  throw new Error(
    "No database configured. Run npx netlify dev locally or deploy on Netlify with Database enabled.",
  );
}

function createPrismaClient(): PrismaClient {
  const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});