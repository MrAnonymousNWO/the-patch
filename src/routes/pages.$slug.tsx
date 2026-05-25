import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { getPageBySlug, getPages } from "@/lib/wordpress.functions";
import { SocialEmbeds } from "@/components/SocialEmbeds";
import { RssFeeds } from "@/components/RssFeeds";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function buildTocAndContent(html: string): { toc: { id: string; text: string; level: number }[]; content: string } {
  const toc: { id: string; text: string; level: number }[] = [];
  const seen = new Set<string>();
  const content = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl, attrs, inner) => {
    const text = String(inner).replace(/<[^>]+>/g, "").trim();
    if (!text) return _m;
    let id = slugify(text);
    let i = 2;
    while (seen.has(id)) id = `${slugify(text)}-${i++}`;
    seen.add(id);
    toc.push({ id, text, level: Number(lvl) });
    const hasId = /\sid=/.test(attrs);
    const newAttrs = hasId ? attrs : `${attrs} id="${id}"`;
    return `<h${lvl}${newAttrs}>${inner}</h${lvl}>`;
  });
  return { toc, content };
}


function deriveKeywords(title: string, content: string): string {
  const text = `${title} ${content.replace(/<[^>]+>/g, " ")}`.toLowerCase();
  const stop = new Set([
    "the","and","for","that","with","this","from","into","were","have","has","had","but","not","are","was","you","your","their","they","its","our","also","such","than","then","over","under","about","more","most","some","any","all","one","two","new","per","via","upon","each","other","which","while","where","when","what","who","how","why",
  ]);
  const counts = new Map<string, number>();
  for (const w of text.match(/[a-zäöüß]{4,}/g) || []) {
    if (stop.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  const base = ["Juridical Singularity","Electric Technocracy","World Succession Deed 1400/98","Treaty Chain","The Patch"];
  const top = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([w])=>w);
  return [...base, ...top].join(", ");
}

export const Route = createFileRoute("/pages/$slug")({
  loader: async ({ params }) => {
    const [{ page }, { pages }] = await Promise.all([
      getPageBySlug({ data: { slug: params.slug } }),
      getPages(),
    ]);
    return { page, pages };
  },
  head: ({ loaderData, params }) => {
    const page = loaderData?.page;
    if (!page) return { meta: [{ title: "Page — The Patch" }] };
    const plain = (page.content || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const description = (page.excerpt || plain).slice(0, 160) || `${page.title} — The Patch`;
    const keywords = deriveKeywords(page.title, page.content || "");
    const url = `https://the-patch.lovable.app/pages/${params.slug}`;
    return {
      meta: [
        { title: `${page.title} — The Patch` },
        { name: "description", content: description },
        { name: "keywords", content: keywords },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: page.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "The Patch" },
        { name: "twitter:card", content: page.featured_image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: page.title },
        { name: "twitter:description", content: description },
        ...(page.featured_image
          ? [
              { property: "og:image", content: page.featured_image },
              { name: "twitter:image", content: page.featured_image },
            ]
          : []),
      ],
      links: [
        { rel: "canonical", href: url },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "The Patch — RSS Feed",
          href: "/feed.xml",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: page.title,
            description,
            keywords,
            mainEntityOfPage: url,
            datePublished: page.date,
            dateModified: page.modified,
            ...(page.featured_image ? { image: page.featured_image } : {}),
            publisher: { "@type": "Organization", name: "The Patch" },
          }),
        },
      ],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load this page</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Try again
        </button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-6 inline-block text-primary underline">
        Back to home
      </Link>
    </div>
  ),
  component: PageView,
});

function PageView() {
  const { page, pages } = Route.useLoaderData();
  const { toc, content } = useMemo(
    () => buildTocAndContent(page.content || ""),
    [page.content]
  );
  return (
    <article className="text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
          ← Back to home
        </Link>
        <h1 className="mt-6 bg-gradient-to-br from-foreground to-primary bg-clip-text text-3xl font-bold leading-tight text-transparent md:text-5xl">
          {page.title}
        </h1>
        {page.featured_image && (
          <img
            src={page.featured_image}
            alt={page.title}
            className="mt-8 w-full rounded-2xl object-cover shadow-[var(--shadow-elegant)]"
          />
        )}

        {toc.length >= 2 && (
          <nav
            aria-label="Table of contents"
            className="mt-8 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              On this page
            </p>
            <ol className="mt-3 space-y-1.5 text-sm">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={item.level === 3 ? "ml-4" : ""}
                >
                  <a
                    href={`#${item.id}`}
                    className="text-foreground/80 underline-offset-4 hover:text-primary hover:underline"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div
          className="prose prose-neutral mt-8 max-w-none text-foreground scroll-mt-24 [&_h2]:scroll-mt-24 [&_h3]:scroll-mt-24"
          dangerouslySetInnerHTML={{ __html: content }}
        />


        <SocialEmbeds />
        <RssFeeds />



        {pages.length > 1 && (
          <nav className="mt-16 border-t border-border pt-8" aria-label="Other pages">
            <h2 className="text-lg font-semibold">More pages</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {pages
                .filter((p: { slug: string }) => p.slug !== page.slug)
                .map((p: { ID: number; slug: string; title: string }) => (
                  <li key={p.ID}>
                    <Link
                      to="/pages/$slug"
                      params={{ slug: p.slug }}
                      className="block rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-[var(--shadow-elegant)] active:translate-y-0"
                    >
                      {p.title} →
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}
      </div>
    </article>
  );
}
