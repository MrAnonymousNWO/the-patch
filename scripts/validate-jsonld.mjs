#!/usr/bin/env node
/**
 * Validate JSON-LD blocks.
 *
 * Modes:
 *   node scripts/validate-jsonld.mjs                 # local: scan dist-static/
 *   node scripts/validate-jsonld.mjs --crawl <URL>   # remote: fetch home, /blog,
 *                                                      /pages, and a sample of posts
 *
 * Always writes a report:
 *   dist-static/jsonld-report.json
 *   dist-static/jsonld-report.html
 * (for --crawl mode the reports go to ./jsonld-report.{json,html})
 *
 * Exits non-zero on any failure so the GitHub Action surfaces the regression
 * and uploads the report as a build artifact.
 */
import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";

const args = process.argv.slice(2);
const crawlIdx = args.indexOf("--crawl");
const CRAWL_URL = crawlIdx >= 0 ? args[crawlIdx + 1]?.replace(/\/$/, "") : null;
const SAMPLE = parseInt(args[args.indexOf("--sample") + 1] || "5", 10);

const ROOT = "dist-static";
const failures = [];
const passes = [];
const checked = [];

const REQUIRED = {
  WebSite: ["name", "url"],
  Organization: ["name", "url"],
  CollectionPage: ["name", "url"],
  ItemList: ["itemListElement"],
  Article: ["headline", "datePublished", "mainEntityOfPage"],
  BlogPosting: ["headline", "datePublished", "mainEntityOfPage"],
  BreadcrumbList: ["itemListElement"],
  SearchAction: ["target"],
  FAQPage: ["mainEntity"],
  SearchResultsPage: ["name"],
};

function extractJsonLd(html) {
  const blocks = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) blocks.push(m[1].trim());
  return blocks;
}

function validate(file, raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    failures.push({ file, reason: `JSON parse error: ${e.message}` });
    return;
  }
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const obj of items) {
    if (!obj || typeof obj !== "object") {
      failures.push({ file, reason: "JSON-LD root must be an object" });
      continue;
    }
    if (obj["@context"] !== "https://schema.org" && obj["@context"] !== "http://schema.org") {
      failures.push({ file, reason: `Missing/invalid @context: ${obj["@context"]}` });
      continue;
    }
    const type = obj["@type"];
    if (!type) {
      failures.push({ file, reason: "Missing @type" });
      continue;
    }
    const required = REQUIRED[type];
    if (!required) {
      passes.push({ file, type, note: "no schema rule registered" });
      continue;
    }
    const missing = required.filter((k) => obj[k] == null || obj[k] === "");
    if (missing.length) {
      failures.push({ file, reason: `${type} missing required: ${missing.join(", ")}` });
    } else {
      passes.push({ file, type });
    }
  }
}

async function checkLocal(path, expectAtLeastOne = true) {
  checked.push(path);
  try {
    await stat(path);
  } catch {
    failures.push({ file: path, reason: "file not found in build output" });
    return;
  }
  const html = await readFile(path, "utf8");
  const blocks = extractJsonLd(html);
  if (expectAtLeastOne && blocks.length === 0) {
    failures.push({ file: path, reason: "no <script type=application/ld+json> block found" });
    return;
  }
  for (const raw of blocks) validate(path, raw);
}

async function checkRemote(url, expectAtLeastOne = true) {
  checked.push(url);
  let html;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "lovable-jsonld-validator/1.0" } });
    if (!res.ok) {
      failures.push({ file: url, reason: `HTTP ${res.status}` });
      return;
    }
    html = await res.text();
  } catch (e) {
    failures.push({ file: url, reason: `fetch error: ${e.message}` });
    return;
  }
  const blocks = extractJsonLd(html);
  if (expectAtLeastOne && blocks.length === 0) {
    failures.push({ file: url, reason: "no <script type=application/ld+json> block found" });
    return;
  }
  for (const raw of blocks) validate(url, raw);
}

async function writeReports(outDir) {
  const summary = {
    mode: CRAWL_URL ? "crawl" : "local",
    target: CRAWL_URL || ROOT,
    timestamp: new Date().toISOString(),
    checked,
    passes,
    failures,
    totals: { checked: checked.length, passes: passes.length, failures: failures.length },
  };
  await mkdir(outDir, { recursive: true });
  await writeFile(join(outDir, "jsonld-report.json"), JSON.stringify(summary, null, 2));
  const ok = failures.length === 0;
  const html = `<!doctype html><meta charset="utf-8"><title>JSON-LD report</title>
<style>body{font-family:system-ui;max-width:960px;margin:2rem auto;padding:0 1rem}
h1{margin:0}.ok{color:#0a7d2c}.fail{color:#c0392b}
table{width:100%;border-collapse:collapse;margin:1rem 0}td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left;font-size:14px;vertical-align:top}
code{background:#f4f4f4;padding:.1rem .3rem;border-radius:3px}</style>
<h1>JSON-LD validation <span class="${ok ? "ok" : "fail"}">${ok ? "✓ PASS" : "✗ FAIL"}</span></h1>
<p>Mode: <code>${summary.mode}</code> · Target: <code>${summary.target}</code> · ${summary.timestamp}</p>
<p>${summary.totals.checked} pages · ${summary.totals.passes} schemas valid · <strong>${summary.totals.failures} failures</strong></p>
${
  failures.length
    ? `<h2 class="fail">Failures</h2><table><tr><th>File / URL</th><th>Reason</th></tr>${failures
        .map((f) => `<tr><td><code>${f.file}</code></td><td>${f.reason}</td></tr>`)
        .join("")}</table>`
    : ""
}
<h2>Passes</h2><table><tr><th>File / URL</th><th>@type</th></tr>${passes
    .map((p) => `<tr><td><code>${p.file}</code></td><td>${p.type}</td></tr>`)
    .join("")}</table>`;
  await writeFile(join(outDir, "jsonld-report.html"), html);
  console.log(`Report written to ${outDir}/jsonld-report.{json,html}`);
}

async function runLocal() {
  await checkLocal(join(ROOT, "index.html"));
  await checkLocal(join(ROOT, "blog", "index.html"));
  await checkLocal(join(ROOT, "pages", "index.html"));
  let blogDirs = [];
  try {
    blogDirs = await readdir(join(ROOT, "blog"));
  } catch {
    failures.push({ file: join(ROOT, "blog"), reason: "blog directory missing" });
  }
  for (const d of blogDirs) {
    if (d === "index.html") continue;
    await checkLocal(join(ROOT, "blog", d, "index.html"));
  }
}

async function runCrawl() {
  const base = CRAWL_URL;
  await checkRemote(`${base}/`);
  await checkRemote(`${base}/blog/`);
  await checkRemote(`${base}/pages/`);
  // Try to read the sitemap to pick a sample of post URLs
  try {
    const res = await fetch(`${base}/sitemap.xml`);
    if (res.ok) {
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      const posts = locs.filter((u) => u.includes("/blog/") && !u.endsWith("/blog/")).slice(0, SAMPLE);
      for (const u of posts) await checkRemote(u);
    } else {
      failures.push({ file: `${base}/sitemap.xml`, reason: `HTTP ${res.status}` });
    }
  } catch (e) {
    failures.push({ file: `${base}/sitemap.xml`, reason: `sitemap fetch failed: ${e.message}` });
  }
}

async function main() {
  if (CRAWL_URL) {
    console.log(`Crawl mode: ${CRAWL_URL}`);
    await runCrawl();
    await writeReports(".");
  } else {
    await runLocal();
    await writeReports(ROOT);
  }
  console.log(`\nJSON-LD validation: ${passes.length} pass, ${failures.length} fail`);
  if (failures.length) {
    console.log("\nFailures:");
    for (const f of failures) console.log(`  ✗ ${f.file} — ${f.reason}`);
    process.exit(1);
  }
  console.log("All JSON-LD blocks valid ✓");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
