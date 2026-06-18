import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function readRuntimeEnv(key: string): string | undefined {
  const netlifyEnv = (globalThis as { Netlify?: { env?: { get: (name: string) => string | undefined } } })
    .Netlify?.env;
  const value = netlifyEnv?.get(key) ?? process.env[key];
  return value && value.length > 0 ? value : undefined;
}

function getDatabaseUrl(): string {
  const connectionString =
    readRuntimeEnv("NETLIFY_DB_URL") ??
    (() => {
      const databaseUrl = readRuntimeEnv("DATABASE_URL");
      if (
        databaseUrl?.startsWith("postgresql://") ||
        databaseUrl?.startsWith("postgres://")
      ) {
        return databaseUrl;
      }
      return undefined;
    })();

  if (!connectionString) {
    throw new Error(
      "No database configured. Run npx netlify dev locally or set NETLIFY_DB_URL on Netlify.",
    );
  }

  return connectionString;
}

function createPrismaClient(): PrismaClient {
  const { PrismaPg } = require("@prisma/adapter-pg") as typeof import("@prisma/adapter-pg");
  const { Pool } = require("pg") as typeof import("pg");

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