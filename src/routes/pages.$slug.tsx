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
    const description = page.excerpt || `${page.title} — The Patch`;
    const url = `https://the-patch.lovable.app/pages/${params.slug}`;
    return {
      meta: [
        { title: `${page.title} — The Patch` },
        { name: "description", content: description },
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
        <div
          className="prose prose-neutral mt-8 max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: page.content }}
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
