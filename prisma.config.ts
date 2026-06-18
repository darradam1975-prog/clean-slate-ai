import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  if (process.env.NETLIFY_DB_URL) {
    return process.env.NETLIFY_DB_URL;
  }

  if (
    process.env.DATABASE_URL?.startsWith("postgresql://") ||
    process.env.DATABASE_URL?.startsWith("postgres://")
  ) {
    return process.env.DATABASE_URL;
  }

  // Used only by Prisma CLI during `prisma generate` when no DB URL is present.
  return "postgresql://prisma-generate-only:prisma-generate-only@127.0.0.1:1/prisma";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});