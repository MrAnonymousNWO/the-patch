#!/usr/bin/env node
/**
 * Validate JSON-LD blocks with severity thresholds.
 *
 * Severities:
 *   critical — JSON parse error, missing @context, missing @type,
 *              missing required fields on a registered schema type.
 *              These FAIL the build / post-deploy crawl.
 *   warning  — page has zero JSON-LD, unregistered @type, soft hints.
 *              Reported in the artifact, but do NOT fail the run.
 *
 * Modes:
 *   node scripts/validate-jsonld.mjs                  # local dist-static/
 *   node scripts/validate-jsonld.mjs --crawl <URL>    # live site
 *
 * Flags:
 *   --sample N           number of blog posts to crawl (default 5)
 *   --strict             escalate warnings to critical
 *   --diff <prev.json>   compare against a previous report and write
 *                        jsonld-diff.{json,md}
 *
 * Always writes:
 *   <out>/jsonld-report.json
 *   <out>/jsonld-report.html
 *   <out>/jsonld-diff.json   (when --diff given)
 *   <out>/jsonld-diff.md     (when --diff given)
 *
 * Exit code is non-zero only when there is at least one CRITICAL finding
 * (or any finding when --strict).
 */
import { readFile, readdir, stat, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2);
const arg = (k) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i + 1] : null;
};
const has = (k) => args.includes(k);

const CRAWL_URL = arg("--crawl")?.replace(/\/$/, "") || null;
const SAMPLE = parseInt(arg("--sample") || process.env.CRAWL_SAMPLE_SIZE || "5", 10);
const STRICT = has("--strict");
const DIFF_PREV = arg("--diff");
// Regression gate: fail only when a page's critical count INCREASED vs prev.
const REGRESSION_ONLY = has("--regression-gate");

const ROOT = "dist-static";
const OUT = CRAWL_URL ? "." : ROOT;

const findings = []; // { file, severity, code, reason, type? }
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

function pushFail(file, severity, code, reason, extra = {}) {
  findings.push({ file, severity, code, reason, ...extra });
}

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
    pushFail(file, "critical", "parse_error", `JSON parse error: ${e.message}`);
    return;
  }
  const items = Array.isArray(parsed) ? parsed : [parsed];
  for (const obj of items) {
    if (!obj || typeof obj !== "object") {
      pushFail(file, "critical", "not_object", "JSON-LD root must be an object");
      continue;
    }
    const ctx = obj["@context"];
    if (ctx !== "https://schema.org" && ctx !== "http://schema.org") {
      pushFail(file, "critical", "bad_context", `Missing/invalid @context: ${ctx}`);
      continue;
    }
    const type = obj["@type"];
    if (!type) {
      pushFail(file, "critical", "missing_type", "Missing @type");
      continue;
    }
    const required = REQUIRED[type];
    if (!required) {
      pushFail(file, "warning", "unregistered_type", `No schema rule for @type=${type}`, { type });
      passes.push({ file, type, note: "unregistered, skipped field check" });
      continue;
    }
    const missing = required.filter((k) => obj[k] == null || obj[k] === "");
    if (missing.length) {
      pushFail(file, "critical", "missing_fields", `${type} missing required: ${missing.join(", ")}`, { type });
    } else {
      passes.push({ file, type });
    }
  }
}

async function checkLocal(path) {
  checked.push(path);
  try {
    await stat(path);
  } catch {
    pushFail(path, "critical", "missing_file", "file not found in build output");
    return;
  }
  const html = await readFile(path, "utf8");
  const blocks = extractJsonLd(html);
  if (blocks.length === 0) {
    pushFail(path, "warning", "no_jsonld", "no <script type=application/ld+json> block found");
    return;
  }
  for (const raw of blocks) validate(path, raw);
}

async function checkRemote(url) {
  checked.push(url);
  let html;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "lovable-jsonld-validator/1.0" } });
    if (!res.ok) {
      pushFail(url, "critical", "http_error", `HTTP ${res.status}`);
      return;
    }
    html = await res.text();
  } catch (e) {
    pushFail(url, "critical", "fetch_error", `fetch error: ${e.message}`);
    return;
  }
  const blocks = extractJsonLd(html);
  if (blocks.length === 0) {
    pushFail(url, "warning", "no_jsonld", "no <script type=application/ld+json> block found");
    return;
  }
  for (const raw of blocks) validate(url, raw);
}

async function runLocal() {
  await checkLocal(join(ROOT, "index.html"));
  await checkLocal(join(ROOT, "blog", "index.html"));
  await checkLocal(join(ROOT, "pages", "index.html"));
  let dirs = [];
  try {
    dirs = await readdir(join(ROOT, "blog"));
  } catch {
    pushFail(join(ROOT, "blog"), "critical", "missing_dir", "blog directory missing");
  }
  for (const d of dirs) {
    if (d === "index.html") continue;
    await checkLocal(join(ROOT, "blog", d, "index.html"));
  }
}

async function runCrawl() {
  const base = CRAWL_URL;
  await checkRemote(`${base}/`);
  await checkRemote(`${base}/blog/`);
  await checkRemote(`${base}/pages/`);
  try {
    const res = await fetch(`${base}/sitemap.xml`);
    if (res.ok) {
      const xml = await res.text();
      const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
      const posts = locs.filter((u) => u.includes("/blog/") && !u.endsWith("/blog/")).slice(0, SAMPLE);
      for (const u of posts) await checkRemote(u);
    } else {
      pushFail(`${base}/sitemap.xml`, "critical", "http_error", `HTTP ${res.status}`);
    }
  } catch (e) {
    pushFail(`${base}/sitemap.xml`, "critical", "fetch_error", `sitemap fetch failed: ${e.message}`);
  }
}

function summarizeByFile(list) {
  const by = {};
  for (const p of list) {
    by[p.file] ||= { types: [], count: 0 };
    if (p.type) by[p.file].types.push(p.type);
    by[p.file].count++;
  }
  return by;
}

async function writeReport() {
  const critical = findings.filter((f) => f.severity === "critical");
  const warnings = findings.filter((f) => f.severity === "warning");
  const passByFile = summarizeByFile(passes);

  const summary = {
    mode: CRAWL_URL ? "crawl" : "local",
    target: CRAWL_URL || ROOT,
    timestamp: new Date().toISOString(),
    strict: STRICT,
    checked,
    passes,
    findings,
    passByFile,
    totals: {
      checked: checked.length,
      passes: passes.length,
      critical: critical.length,
      warning: warnings.length,
    },
  };
  await mkdir(OUT, { recursive: true });
  await writeFile(join(OUT, "jsonld-report.json"), JSON.stringify(summary, null, 2));

  const ok = critical.length === 0 && (!STRICT || warnings.length === 0);
  const row = (f) =>
    `<tr><td><code>${f.file}</code></td><td>${f.severity}</td><td>${f.code}</td><td>${f.reason}</td></tr>`;
  const html = `<!doctype html><meta charset="utf-8"><title>JSON-LD report</title>
<style>body{font-family:system-ui;max-width:1024px;margin:2rem auto;padding:0 1rem}
.ok{color:#0a7d2c}.fail{color:#c0392b}.warn{color:#b7791f}
table{width:100%;border-collapse:collapse;margin:1rem 0}
td,th{border-bottom:1px solid #ddd;padding:.4rem;text-align:left;font-size:14px;vertical-align:top}
code{background:#f4f4f4;padding:.1rem .3rem;border-radius:3px}
.badge{display:inline-block;padding:.1rem .5rem;border-radius:3px;font-size:12px;color:#fff}
.b-c{background:#c0392b}.b-w{background:#b7791f}.b-p{background:#0a7d2c}</style>
<h1>JSON-LD validation <span class="${ok ? "ok" : "fail"}">${ok ? "✓ PASS" : "✗ FAIL"}</span></h1>
<p>Mode: <code>${summary.mode}</code> · Target: <code>${summary.target}</code> · ${summary.timestamp}${STRICT ? " · <strong>strict</strong>" : ""}</p>
<p><span class="badge b-p">${summary.totals.passes} passes</span>
<span class="badge b-c">${summary.totals.critical} critical</span>
<span class="badge b-w">${summary.totals.warning} warnings</span> across ${summary.totals.checked} pages</p>
${critical.length ? `<h2 class="fail">Critical</h2><table><tr><th>File / URL</th><th>Sev</th><th>Code</th><th>Reason</th></tr>${critical.map(row).join("")}</table>` : ""}
${warnings.length ? `<h2 class="warn">Warnings</h2><table><tr><th>File / URL</th><th>Sev</th><th>Code</th><th>Reason</th></tr>${warnings.map(row).join("")}</table>` : ""}
<h2>Passes</h2><table><tr><th>File / URL</th><th>@types</th></tr>${Object.entries(passByFile)
    .map(([f, v]) => `<tr><td><code>${f}</code></td><td>${v.types.join(", ") || "—"}</td></tr>`)
    .join("")}</table>`;
  await writeFile(join(OUT, "jsonld-report.html"), html);
  return summary;
}

async function writeDiff(current) {
  if (!DIFF_PREV) return;
  let prev;
  try {
    prev = JSON.parse(await readFile(DIFF_PREV, "utf8"));
  } catch (e) {
    console.warn(`No previous report at ${DIFF_PREV}: ${e.message}. Skipping diff.`);
    return;
  }
  const allFiles = new Set([
    ...Object.keys(prev.passByFile || {}),
    ...Object.keys(current.passByFile || {}),
    ...(prev.findings || []).map((f) => f.file),
    ...current.findings.map((f) => f.file),
  ]);
  const fingerprint = (report, file) => {
    const types = (report.passByFile?.[file]?.types || []).slice().sort().join("|");
    const codes = (report.findings || [])
      .filter((f) => f.file === file)
      .map((f) => `${f.severity}:${f.code}`)
      .sort()
      .join("|");
    return `${types}::${codes}`;
  };
  const changes = [];
  for (const file of allFiles) {
    const a = fingerprint(prev, file);
    const b = fingerprint(current, file);
    if (a === b) continue;
    let kind = "schema_changed";
    if (!prev.passByFile?.[file] && !(prev.findings || []).some((f) => f.file === file)) kind = "added";
    else if (!current.passByFile?.[file] && !current.findings.some((f) => f.file === file)) kind = "removed";
    changes.push({
      file,
      kind,
      previous: { types: prev.passByFile?.[file]?.types || [], findings: (prev.findings || []).filter((f) => f.file === file) },
      current: { types: current.passByFile?.[file]?.types || [], findings: current.findings.filter((f) => f.file === file) },
    });
  }
  const diff = {
    previous_timestamp: prev.timestamp,
    current_timestamp: current.timestamp,
    totals: {
      added: changes.filter((c) => c.kind === "added").length,
      removed: changes.filter((c) => c.kind === "removed").length,
      changed: changes.filter((c) => c.kind === "schema_changed").length,
    },
    changes,
  };
  await writeFile(join(OUT, "jsonld-diff.json"), JSON.stringify(diff, null, 2));
  const md = [
    `# JSON-LD diff`,
    ``,
    `Previous: ${prev.timestamp}`,
    `Current:  ${current.timestamp}`,
    ``,
    `**Added:** ${diff.totals.added}  ·  **Removed:** ${diff.totals.removed}  ·  **Schema changed:** ${diff.totals.changed}`,
    ``,
    ...(changes.length === 0
      ? ["_No schema changes between runs._"]
      : changes.map((c) => {
          const prevTypes = c.previous.types.join(", ") || "—";
          const curTypes = c.current.types.join(", ") || "—";
          return `## ${c.kind.toUpperCase()} — \`${c.file}\`\n- previous @types: ${prevTypes}\n- current  @types: ${curTypes}`;
        })),
  ].join("\n");
  await writeFile(join(OUT, "jsonld-diff.md"), md);
  console.log(`Diff written: ${diff.totals.added} added, ${diff.totals.removed} removed, ${diff.totals.changed} changed`);
}

async function main() {
  if (CRAWL_URL) {
    console.log(`Crawl mode: ${CRAWL_URL}`);
    await runCrawl();
  } else {
    await runLocal();
  }
  const summary = await writeReport();
  await writeDiff(summary);

  const { critical, warning } = summary.totals;
  console.log(`\nJSON-LD: ${summary.totals.passes} pass · ${critical} critical · ${warning} warning`);
  for (const f of findings) {
    const icon = f.severity === "critical" ? "✗" : "⚠";
    console.log(`  ${icon} [${f.severity}] ${f.file} — ${f.reason}`);
  }

  // Regression-gate mode: fail only when a page's critical count INCREASED vs prev.
  if (REGRESSION_ONLY) {
    let prev = null;
    if (DIFF_PREV) {
      try { prev = JSON.parse(await readFile(DIFF_PREV, "utf8")); } catch {}
    }
    const criticalsByFile = (rep) => {
      const m = new Map();
      for (const f of rep?.findings || []) {
        if (f.severity !== "critical") continue;
        m.set(f.file, (m.get(f.file) || 0) + 1);
      }
      return m;
    };
    const prevMap = criticalsByFile(prev);
    const curMap = criticalsByFile(summary);
    const regressions = [];
    for (const [file, count] of curMap) {
      const before = prevMap.get(file) || 0;
      if (count > before) regressions.push({ file, before, after: count });
    }
    if (regressions.length) {
      console.log(`\nREGRESSION — ${regressions.length} page(s) with more critical JSON-LD violations than previous run:`);
      for (const r of regressions) console.log(`  ✗ ${r.file}: ${r.before} → ${r.after}`);
      process.exit(1);
    }
    console.log(`\nPASS (regression gate) — no page increased its critical-violation count.`);
    return;
  }

  const fail = critical > 0 || (STRICT && warning > 0);
  if (fail) {
    console.log(`\nFAIL — ${critical} critical${STRICT ? `, ${warning} warning (strict)` : ""}`);
    process.exit(1);
  }
  console.log(`\nPASS${warning > 0 ? ` (${warning} warnings, non-blocking)` : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
