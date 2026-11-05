import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

if (process.platform !== "win32") {
  process.exit(0);
}

const targets = [
  path.join(
    process.cwd(),
    "node_modules",
    "@netlify",
    "plugin-nextjs",
    "dist",
    "build",
    "content",
    "server.js",
  ),
  path.join(
    process.cwd(),
    ".netlify",
    "plugins",
    "node_modules",
    "@netlify",
    "plugin-nextjs",
    "dist",
    "build",
    "content",
    "server.js",
  ),
].filter((candidate) => existsSync(candidate));

if (targets.length === 0) {
  console.log("Netlify Next plugin was not installed yet. Skipping Windows patch.");
  process.exit(0);
}

const nodeModulesCpBlocks = [
  `    if (existsSync(join(srcDir, "node_modules"))) {
      const filter = ctx.constants.IS_LOCAL ? void 0 : nodeModulesFilter;
      const src = join(srcDir, "node_modules");
      const dest = join(destDir, "node_modules");
      await cp(src, dest, {
        recursive: true,
        verbatimSymlinks: false,
        force: true,
        filter
      });
    }`,
  `    if (existsSync(join(srcDir, "node_modules"))) {
      const filter = ctx.constants.IS_LOCAL ? void 0 : nodeModulesFilter;
      const src = join(srcDir, "node_modules");
      const dest = join(destDir, "node_modules");
      await cp(src, dest, {
        recursive: true,
        verbatimSymlinks: true,
        force: true,
        filter
      });
    }`,
];

const nodeModulesRobocopyBlock = `    if (existsSync(join(srcDir, "node_modules"))) {
      const src = join(srcDir, "node_modules");
      const dest = join(destDir, "node_modules");
      const { execFileSync } = await import("node:child_process");
      await mkdir(dest, { recursive: true });
      try {
        execFileSync(
          "robocopy",
          [src, dest, "/E", "/COPY:DAT", "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np"],
          { stdio: "ignore" },
        );
      } catch (error) {
        if (error?.status > 7) throw error;
      }
    }`;

for (const target of targets) {
  let source = readFileSync(target, "utf8");

  for (const block of nodeModulesCpBlocks) {
    if (source.includes(block)) {
      source = source.replace(block, nodeModulesRobocopyBlock);
    }
  }

  if (!source.includes('if (process.platform === "win32") return;')) {
    source = source.replace(
      "async function recreateNodeModuleSymlinks(src, dest, org) {",
      'async function recreateNodeModuleSymlinks(src, dest, org) {\n  if (process.platform === "win32") return;',
    );
  }

  source = source.replaceAll("verbatimSymlinks: true", "verbatimSymlinks: false");

  writeFileSync(target, source);
  console.log(`Applied Netlify Windows deploy patch to ${target}`);
}
