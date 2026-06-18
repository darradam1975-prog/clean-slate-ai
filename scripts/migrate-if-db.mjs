import { spawnSync } from "node:child_process";

if (process.env.NETLIFY_DB_URL) {
  console.log(
    "Netlify Database detected — schema is managed by netlify/database/migrations.",
  );
  process.exit(0);
}

const hasDatabase =
  process.env.DATABASE_URL?.startsWith("postgresql://") ||
  process.env.DATABASE_URL?.startsWith("postgres://");

if (!hasDatabase) {
  console.log("Skipping prisma migrate deploy (no Postgres URL in this environment).");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);