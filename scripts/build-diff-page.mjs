#!/usr/bin/env node
/**
 * Assemble dist-static/diff/index.html from whichever diff artifacts exist
 * (jsonld-diff.md/json, sitemap-diff.md/json, canonical-diff.md/json).
 *
 * Also emits a summarized dist-static/diff/summary.json for quick review.
 */
import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "dist-static";
const OUT = join(ROOT, "diff");
await mkdir(OUT, { recursive: true });

const artifacts = [
  { key: "jsonld", md: "jsonld-diff.md", json: "jsonld-diff.json", title: "JSON-LD schema diff" },
  { key: "sitemap", md: "sitemap-diff.md", json: "sitemap-diff.json", title: "Sitemap URL diff" },
  { key: "canonical", md: "canonical-diff.md", json: "canonical-diff.json", title: "Canonical & og:url diff" },
];

async function readSafe(p) { try { await stat(p); return await readFile(p, "utf8"); } catch { return null; } }

const summary = { generatedAt: new Date().toISOString(), artifacts: {} };
const sections = [];
for (const a of artifacts) {
  const md = await readSafe(join(ROOT, a.md));
  const jsonRaw = await readSafe(join(ROOT, a.json));
  let json = null;
  try { json = jsonRaw ? JSON.parse(jsonRaw) : null; } catch {}
  if (md) await writeFile(join(OUT, a.md), md);
  if (jsonRaw) await writeFile(join(OUT, a.json), jsonRaw);
  summary.artifacts[a.key] = json
    ? { available: true, totals: json.totals || null, timestamp: json.timestamp || json.current_timestamp || null }
    : { available: false };
  sections.push({ ...a, md, hasJson: !!jsonRaw });
}

await writeFile(join(OUT, "summary.json"), JSON.stringify(summary, null, 2));

function mdToHtml(md) {
  return md
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^/, "<p>") + "</p>";
}

const html = `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><title>Build diff — The Patch</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime:wght@400;700&display=swap">
<style>
:root{--bg:#cfe6f5;--surface:#e6f1f9;--ink:#0f1b2a;--muted:#456079;--accent:#1d3557;--line:#88b8d8}
body{margin:0;font-family:"Courier Prime",ui-monospace,monospace;background:var(--bg);color:var(--ink);line-height:1.55}
header{padding:20px 24px;border-bottom:1px solid var(--line);background:rgba(188,220,239,.9)}
main{max-width:900px;margin:0 auto;padding:32px 24px}
h1,h2,h3{font-family:"Special Elite",serif;color:var(--accent)}
section{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px 24px;margin:20px 0}
code{background:#fff;border:1px solid var(--line);padding:1px 6px;border-radius:4px}
a{color:var(--accent)}
.small{font-size:.85rem;color:var(--muted)}
ul{padding-left:22px}
</style></head><body>
<header><a href="../">← Back to The Patch</a> · <strong>Build diff report</strong></header>
<main>
  <h1>Build diff report</h1>
  <p class="small">Generated ${summary.generatedAt}</p>
  ${sections.map((s) => `
    <section>
      <h2>${s.title}</h2>
      ${s.md ? mdToHtml(s.md) : `<p class="small"><em>No ${s.title.toLowerCase()} available for this build.</em></p>`}
      <p class="small">
        ${s.md ? `<a href="./${s.md}">Markdown</a>` : ""}
        ${s.md && s.hasJson ? " · " : ""}
        ${s.hasJson ? `<a href="./${s.json}">JSON</a>` : ""}
      </p>
    </section>`).join("")}
  <p class="small"><a href="./summary.json">summary.json</a></p>
</main></body></html>`;

await writeFile(join(OUT, "index.html"), html);
console.log(`Diff page written to ${OUT}/index.html`);
