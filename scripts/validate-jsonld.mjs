#!/usr/bin/env node
/**
 * Validate JSON-LD blocks in the built static site.
 *
 * Checks:
 *   - dist-static/index.html               → WebSite + ItemList
 *   - dist-static/blog/index.html          → CollectionPage
 *   - dist-static/blog/<slug>/index.html   → Article (every post)
 *
 * Each <script type="application/ld+json"> must:
 *   1. parse as JSON
 *   2. have @context + @type
 *   3. have the required fields for its @type
 *
 * Failures are logged with file path + reason. Exits non-zero if any failed,
 * so the GitHub Action surfaces the regression.
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const ROOT = "dist-static";
const failures = [];
const passes = [];

const REQUIRED = {
  WebSite: ["name", "url"],
  Organization: ["name", "url"],
  CollectionPage: ["name", "url"],
  ItemList: ["itemListElement"],
  Article: ["headline", "datePublished", "mainEntityOfPage"],
  BlogPosting: ["headline", "datePublished", "mainEntityOfPage"],
  BreadcrumbList: ["itemListElement"],
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
      passes.push({ file, type, note: "no schema rule registered, skipping field check" });
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

async function checkFile(path, expectAtLeastOne = true) {
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

async function main() {
  await checkFile(join(ROOT, "index.html"));
  await checkFile(join(ROOT, "blog", "index.html"));
  await checkFile(join(ROOT, "pages", "index.html"));

  // Every blog post
  let blogDirs = [];
  try {
    blogDirs = await readdir(join(ROOT, "blog"));
  } catch {
    failures.push({ file: join(ROOT, "blog"), reason: "blog directory missing" });
  }
  for (const d of blogDirs) {
    if (d === "index.html") continue;
    await checkFile(join(ROOT, "blog", d, "index.html"));
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
