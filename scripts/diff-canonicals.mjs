#!/usr/bin/env node
/**
 * Diff <link rel="canonical"> and <meta property="og:url"> between a previous
 * build output tree and the current build output tree, per post/page.
 *
 * Usage:
 *   node scripts/diff-canonicals.mjs <prev-dist-dir> <current-dist-dir> [out-dir]
 *
 * Writes <out-dir>/canonical-diff.json and canonical-diff.md.
 * Exits 0 always (report-only).
 */
import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { join, relative } from "node:path";

const [prevDir, curDir, outDir = "dist-static"] = process.argv.slice(2);
if (!prevDir || !curDir) {
  console.error("usage: diff-canonicals.mjs <prev-dist> <current-dist> [out-dir]");
  process.exit(2);
}

async function walk(root, sub = "") {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(join(root, sub), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = sub ? `${sub}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await walk(root, rel)));
    else if (e.name === "index.html") out.push(rel);
  }
  return out;
}

async function extract(path) {
  let html;
  try {
    html = await readFile(path, "utf8");
  } catch {
    return null;
  }
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || null;
  const ogUrl = html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
  return { canonical, ogUrl };
}

async function collect(root) {
  const files = (await walk(root)).filter((f) => f.startsWith("blog/") || f.startsWith("pages/"));
  const map = new Map();
  for (const f of files) {
    const data = await extract(join(root, f));
    if (data) map.set(f, data);
  }
  return map;
}

const [prev, cur] = await Promise.all([collect(prevDir), collect(curDir)]);

const allKeys = new Set([...prev.keys(), ...cur.keys()]);
const changes = [];
for (const f of [...allKeys].sort()) {
  const a = prev.get(f);
  const b = cur.get(f);
  if (!a && b) { changes.push({ file: f, kind: "added", current: b }); continue; }
  if (a && !b) { changes.push({ file: f, kind: "removed", previous: a }); continue; }
  if (a && b && (a.canonical !== b.canonical || a.ogUrl !== b.ogUrl)) {
    changes.push({ file: f, kind: "changed", previous: a, current: b });
  }
}

const report = {
  timestamp: new Date().toISOString(),
  had_previous: prev.size > 0,
  previous_count: prev.size,
  current_count: cur.size,
  totals: {
    added: changes.filter((c) => c.kind === "added").length,
    removed: changes.filter((c) => c.kind === "removed").length,
    changed: changes.filter((c) => c.kind === "changed").length,
  },
  changes,
};

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "canonical-diff.json"), JSON.stringify(report, null, 2));

const md = [
  `# Canonical & og:url diff`,
  ``,
  prev.size === 0 ? `_No previous build available — reporting all ${cur.size} pages as new._` : `Previous pages: ${prev.size}  ·  Current pages: ${cur.size}`,
  ``,
  `**Added:** ${report.totals.added}  ·  **Removed:** ${report.totals.removed}  ·  **Changed:** ${report.totals.changed}`,
  ``,
  ...(changes.length === 0
    ? ["_No canonical or og:url changes between builds._"]
    : changes.slice(0, 200).map((c) => {
        if (c.kind === "added") return `## ADDED \`${c.file}\`\n- canonical: ${c.current.canonical || "—"}\n- og:url:    ${c.current.ogUrl || "—"}`;
        if (c.kind === "removed") return `## REMOVED \`${c.file}\`\n- was canonical: ${c.previous.canonical || "—"}\n- was og:url:    ${c.previous.ogUrl || "—"}`;
        return `## CHANGED \`${c.file}\`\n- canonical: ${c.previous.canonical || "—"} → ${c.current.canonical || "—"}\n- og:url:    ${c.previous.ogUrl || "—"} → ${c.current.ogUrl || "—"}`;
      })),
  changes.length > 200 ? `\n_…and ${changes.length - 200} more (see canonical-diff.json)._` : "",
]
  .filter(Boolean)
  .join("\n");
await writeFile(join(outDir, "canonical-diff.md"), md);

console.log(`Canonical diff: +${report.totals.added} / -${report.totals.removed} / ~${report.totals.changed}`);
