#!/usr/bin/env node
/**
 * Diff two sitemap.xml files and emit added/removed URL reports.
 *
 * Usage:
 *   node scripts/diff-sitemap.mjs <previous.xml> <current.xml> [out-dir]
 *
 * Writes <out-dir>/sitemap-diff.json and <out-dir>/sitemap-diff.md.
 * Exits 0 even on differences (report-only).
 */
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const [prevPath, curPath, outDir = "dist-static"] = process.argv.slice(2);
if (!prevPath || !curPath) {
  console.error("usage: diff-sitemap.mjs <previous.xml> <current.xml> [out-dir]");
  process.exit(2);
}

const locs = (xml) =>
  new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim()));

async function read(path) {
  try {
    await stat(path);
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

const prevXml = await read(prevPath);
const curXml = await read(curPath);

if (!curXml) {
  console.error(`Current sitemap not found: ${curPath}`);
  process.exit(1);
}

const prev = prevXml ? locs(prevXml) : new Set();
const cur = locs(curXml);
const added = [...cur].filter((u) => !prev.has(u)).sort();
const removed = [...prev].filter((u) => !cur.has(u)).sort();

const report = {
  timestamp: new Date().toISOString(),
  previous_count: prev.size,
  current_count: cur.size,
  added_count: added.length,
  removed_count: removed.length,
  added,
  removed,
  had_previous: prevXml !== null,
};

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "sitemap-diff.json"), JSON.stringify(report, null, 2));

const md = [
  `# Sitemap diff`,
  ``,
  prevXml ? `Previous URLs: **${prev.size}**  ·  Current URLs: **${cur.size}**` : `_No previous sitemap available — treating all ${cur.size} URLs as new._`,
  ``,
  `**Added:** ${added.length}  ·  **Removed:** ${removed.length}`,
  ``,
  added.length ? `## Added\n${added.map((u) => `- ${u}`).join("\n")}` : "",
  removed.length ? `\n## Removed\n${removed.map((u) => `- ${u}`).join("\n")}` : "",
  !added.length && !removed.length ? `_No URL changes between runs._` : "",
]
  .filter(Boolean)
  .join("\n");
await writeFile(join(outDir, "sitemap-diff.md"), md);

console.log(`Sitemap diff: +${added.length} / -${removed.length} (prev ${prev.size}, cur ${cur.size})`);
