import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  if (
    process.env.DATABASE_URL?.startsWith("postgresql://") ||
    process.env.DATABASE_URL?.startsWith("postgres://")
  ) {
    return process.env.DATABASE_URL;
  }

  // Prisma CLI only needs a valid URL shape for `generate`, not a live connection.
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