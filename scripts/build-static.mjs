#!/usr/bin/env node
/**
 * Build a fully static mirror of the Patch site from WordPress.com.
 *
 * Source of truth: WordPress.com public API (no auth required for public sites).
 * Output:          ./dist-static  (HTML pages + sitemap.xml + robots.txt)
 *
 * GitHub Action runs this on push, on a 30-min cron, and on repository_dispatch
 * so WordPress edits become static HTML and are pushed to GitHub Pages.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const WP_SITE = process.env.WP_SITE || "patch98.wordpress.com";
const SITE_URL = (process.env.SITE_URL || "https://mranonymousnwo.github.io/the-patch").replace(/\/$/, "");
const OUT = "dist-static";
const API = `https://public-api.wordpress.com/rest/v1.1/sites/${WP_SITE}`;

async function fetchAll(type) {
  const all = [];
  let page = 1;
  while (true) {
    const url = `${API}/posts/?type=${type}&number=100&page=${page}&fields=ID,slug,title,excerpt,content,date,modified,featured_image,author,tags,categories`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${type} page ${page}: ${r.status}`);
    const j = await r.json();
    const posts = j.posts || [];
    all.push(...posts);
    if (posts.length < 100) break;
    page++;
    if (page > 20) break;
  }
  return all;
}

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

function keywords(title, content) {
  const text = `${title} ${strip(content)}`.toLowerCase();
  const stop = new Set("the and for that with this from into were have has had but not are was you your their they its our also such than then over under about more most some any all one two new per via upon each other which while where when what who how why".split(" "));
  const counts = new Map();
  for (const w of text.match(/[a-zäöüß]{4,}/g) || []) {
    if (stop.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const base = ["Juridical Singularity", "Electric Technocracy", "World Succession Deed 1400/98", "Treaty Chain", "The Patch"];
  return [...base, ...[...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w)].join(", ");
}

function layout({ title, description, kw, url, image, body, jsonld }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<meta name="keywords" content="${esc(kw)}" />
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
<meta name="google-site-verification" content="POS6A_n9nSGi6W4cWi-49r84-3ML8vTuLRBZQX-OFBc" />
<meta name="google-site-verification" content="bL0Q0TMItHr_gRP_a2on4EXDhl5UO2VaOsbH0pSmEqU" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:type" content="article" />
${image ? `<meta property="og:image" content="${esc(image)}" />` : ""}
<style>
:root{--bg:#cfe6f5;--ink:#0f1b2a;--accent:#1d3557}
body{margin:0;font-family:"Courier Prime",ui-monospace,monospace;background:var(--bg);color:var(--ink)}
header{background:#bcdcef;border-bottom:1px solid #88b8d8;position:sticky;top:0;padding:14px 24px}
header a{color:var(--accent);text-decoration:none;margin-right:18px;font-weight:700}
main{max-width:760px;margin:0 auto;padding:32px 24px}
img{max-width:100%;height:auto}
h1{font-family:"Special Elite",serif;font-size:2.1rem;line-height:1.15}
a{color:var(--accent)}
footer{border-top:1px solid #88b8d8;margin-top:48px;padding:24px;text-align:center;font-size:.85rem;color:#456}
</style>
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
</head>
<body>
<header>
  <a href="/the-patch/">Home</a>
  <a href="/the-patch/blog/">Blog</a>
  <a href="/the-patch/pages/">Pages</a>
  <a href="/the-patch/search/">Search</a>
  <a href="https://wiki.technocracy.tech/" target="_blank" rel="noopener">Treaty Law Wiki</a>
</header>
<main>${body}</main>
<footer>© ${new Date().getFullYear()} The Patch — Generated ${new Date().toISOString()}</footer>
</body>
</html>`;
}

function articleBody(p) {
  return `
<article>
  <h1>${esc(strip(p.title))}</h1>
  <p><small>${esc(new Date(p.date).toDateString())}${p.author?.name ? ` · ${esc(p.author.name)}` : ""}</small></p>
  ${p.featured_image ? `<img src="${esc(p.featured_image)}" alt="${esc(strip(p.title))}" />` : ""}
  <div>${p.content || ""}</div>
</article>`;
}

function listBody(title, items, base) {
  return `<h1>${esc(title)}</h1><ul>${items
    .map((p) => `<li><a href="${base}/${p.slug}/">${esc(strip(p.title))}</a></li>`)
    .join("")}</ul>`;
}

async function writePage(path, html) {
  const dir = join(OUT, path);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), html);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log("Fetching posts…");
  const posts = await fetchAll("post");
  console.log(`  ${posts.length} posts`);
  console.log("Fetching pages…");
  const pages = await fetchAll("page");
  console.log(`  ${pages.length} pages`);

  // robots.txt — allow all
  await writeFile(
    join(OUT, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
  );

  // verification file (text variant the user uploaded earlier)
  await writeFile(
    join(OUT, "google1e9099cf0125c333.html"),
    "google-site-verification: google1e9099cf0125c333.html\n",
  );

  const urls = [`${SITE_URL}/`, `${SITE_URL}/pages/`];

  // Home
  await writePage(".", layout({
    title: "The Patch — A World Without Power for Anyone",
    description: "Independent journalism documenting the Juridical Singularity, World Succession Deed 1400/98, and the future of post-national legal civilization.",
    kw: "Juridical Singularity, Electric Technocracy, World Succession Deed 1400/98, The Patch, treaty chain",
    url: `${SITE_URL}/`,
    body: `
      <h1>The Patch</h1>
      <p>Independent journalism on the Juridical Singularity and a world beyond unilateral power.</p>
      <h2>Latest articles</h2>
      <ul>${posts.slice(0, 30).map((p) => `<li><a href="/the-patch/blog/${p.slug}/">${esc(strip(p.title))}</a></li>`).join("")}</ul>
      <h2>Pages</h2>
      <ul>${pages.map((p) => `<li><a href="/the-patch/pages/${p.slug}/">${esc(strip(p.title))}</a></li>`).join("")}</ul>`,
  }));

  // /pages index
  await writePage("pages", layout({
    title: "Pages — The Patch",
    description: "Editorial dossiers from The Patch.",
    kw: "The Patch, pages, Juridical Singularity",
    url: `${SITE_URL}/pages/`,
    body: listBody("Pages", pages, "/the-patch/pages"),
  }));

  // /blog index
  await writePage("blog", layout({
    title: "Blog — All Articles · The Patch",
    description: "Every dispatch from The Patch — articles synced from WordPress.",
    kw: "The Patch, blog, articles",
    url: `${SITE_URL}/blog/`,
    body: listBody("Blog — All Articles", posts, "/the-patch/blog"),
  }));

  // /search (static client-side search over search-index.json)
  await writePage("search", layout({
    title: "Search — The Patch",
    description: "Static search across every article and page on The Patch.",
    kw: "The Patch, search, index",
    url: `${SITE_URL}/search/`,
    body: `
      <h1>Search</h1>
      <input id="q" type="search" placeholder="Search…" style="width:100%;padding:14px;font-size:1rem;border:2px solid #88b8d8;border-radius:8px;background:#fff" />
      <ul id="r" style="list-style:none;padding:0;margin-top:16px"></ul>
      <script>
        (async () => {
          const res = await fetch('/the-patch/search-index.json');
          const { entries = [] } = await res.json();
          const r = document.getElementById('r');
          const q = document.getElementById('q');
          function render(list){
            r.innerHTML = list.slice(0,80).map(e =>
              '<li style="margin:8px 0;padding:12px;border:1px solid #88b8d8;border-radius:8px;background:#fff">' +
              '<small style="text-transform:uppercase;letter-spacing:.15em;color:#456">' + e.type + '</small><br>' +
              '<a href="/the-patch/' + (e.type==='post'?'blog':'pages') + '/' + e.slug + '/" style="font-weight:700">' + e.title + '</a>' +
              (e.excerpt? '<p style="margin:6px 0 0;color:#456">'+e.excerpt+'</p>':'') +
              '</li>').join('');
          }
          render(entries);
          q.addEventListener('input', () => {
            const n = q.value.trim().toLowerCase();
            if(!n) return render(entries);
            render(entries.filter(e => (e.title+' '+e.excerpt).toLowerCase().includes(n)));
          });
        })();
      </script>`,
  }));

  // Static search index JSON
  const searchEntries = [
    ...posts.map((p) => ({ type: "post", slug: p.slug, title: strip(p.title), excerpt: strip(p.excerpt).slice(0, 220), modified: p.modified || p.date })),
    ...pages.map((p) => ({ type: "page", slug: p.slug, title: strip(p.title), excerpt: strip(p.excerpt).slice(0, 220), modified: p.modified || p.date })),
  ].sort((a, b) => (b.modified || "").localeCompare(a.modified || ""));
  await writeFile(
    join(OUT, "search-index.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), total: searchEntries.length, entries: searchEntries }),
  );



  // Posts
  for (const p of posts) {
    const url = `${SITE_URL}/blog/${p.slug}/`;
    urls.push(url);
    const desc = (strip(p.excerpt) || strip(p.content)).slice(0, 160);
    await writePage(`blog/${p.slug}`, layout({
      title: `${strip(p.title)} — The Patch`,
      description: desc,
      kw: keywords(p.title, p.content),
      url,
      image: p.featured_image,
      body: articleBody(p),
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: strip(p.title),
        description: desc,
        datePublished: p.date,
        dateModified: p.modified,
        mainEntityOfPage: url,
        ...(p.featured_image ? { image: p.featured_image } : {}),
        author: p.author?.name ? { "@type": "Person", name: p.author.name } : undefined,
        publisher: { "@type": "Organization", name: "The Patch" },
      },
    }));
  }

  // Pages
  for (const p of pages) {
    const url = `${SITE_URL}/pages/${p.slug}/`;
    urls.push(url);
    const desc = (strip(p.excerpt) || strip(p.content)).slice(0, 160);
    await writePage(`pages/${p.slug}`, layout({
      title: `${strip(p.title)} — The Patch`,
      description: desc,
      kw: keywords(p.title, p.content),
      url,
      image: p.featured_image,
      body: articleBody(p),
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: strip(p.title),
        description: desc,
        datePublished: p.date,
        dateModified: p.modified,
        mainEntityOfPage: url,
        ...(p.featured_image ? { image: p.featured_image } : {}),
        publisher: { "@type": "Organization", name: "The Patch" },
      },
    }));
  }

  // sitemap.xml
  const now = new Date().toISOString();
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${now}</lastmod></url>`).join("\n")}
</urlset>`;
  await writeFile(join(OUT, "sitemap.xml"), sitemap);

  // GitHub Pages: prevent Jekyll processing
  await writeFile(join(OUT, ".nojekyll"), "");

  console.log(`Wrote ${urls.length} URLs to ${OUT}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
