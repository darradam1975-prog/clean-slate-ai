import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

if (process.platform !== "win32") {
  process.exit(0);
}

const target = path.join(
  process.cwd(),
  "node_modules",
  "@netlify",
  "plugin-nextjs",
  "dist",
  "build",
  "content",
  "server.js",
);

let source = readFileSync(target, "utf8");

const nodeModulesCpBlock = `    if (existsSync(join(srcDir, "node_modules"))) {
      const filter = ctx.constants.IS_LOCAL ? void 0 : nodeModulesFilter;
      const src = join(srcDir, "node_modules");
      const dest = join(destDir, "node_modules");
      await cp(src, dest, {
        recursive: true,
        verbatimSymlinks: false,
        force: true,
        filter
      });
    }`;

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

if (source.includes(nodeModulesCpBlock)) {
  source = source.replace(nodeModulesCpBlock, nodeModulesRobocopyBlock);
}

if (!source.includes('if (process.platform === "win32") return;')) {
  source = source.replace(
    "async function recreateNodeModuleSymlinks(src, dest, org) {",
    'async function recreateNodeModuleSymlinks(src, dest, org) {\n  if (process.platform === "win32") return;',
  );
}

writeFileSync(target, source);
console.log("Applied Netlify Windows deploy patch.");