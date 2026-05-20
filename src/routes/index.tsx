import { createFileRoute, Link } from "@tanstack/react-router";
import { getPosts } from "@/lib/wordpress.functions";
import { RssFeeds } from "@/components/RssFeeds";
import { SocialEmbeds } from "@/components/SocialEmbeds";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Math.max(1, Number(search.page) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps }) => getPosts({ data: { page: deps.page } }),
  head: ({ loaderData }) => {
    const page = loaderData?.page ?? 1;
    const titleSuffix = page > 1 ? ` — Page ${page}` : "";
    return {
      meta: [
        {
          title: `The Patch — Juridical Singularity, World Succession Deed 1400/98 & AI Support${titleSuffix}`,
        },
        {
          name: "description",
          content:
            "The Patch: independent journalism on the Juridical Singularity, the World Succession Deed 1400/98, NATO infrastructure, treaty chains, sovereignty and AI support — a world without power for anyone.",
        },
        {
          name: "keywords",
          content:
            "The Patch, Juridical Singularity, World Succession Deed 1400/98, Kreuzbergkaserne, Zweibrücken, NATO infrastructure, treaty chains, state succession, international law, AI support, sovereignty, post-national legal order",
        },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:title", content: "The Patch — Juridical Singularity & AI Support" },
        {
          property: "og:description",
          content:
            "Independent journalism on the Juridical Singularity, the World Succession Deed 1400/98 and a world without power for anyone.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://the-patch.lovable.app/" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "https://the-patch.lovable.app/" },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "The Patch — RSS Feed",
          href: "/feed.xml",
        },
      ],
    };
  },
  component: Index,
});

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function Index() {
  const { posts, page, totalPages, found } = Route.useLoaderData();

  return (
    <div className="text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-[image:var(--gradient-hero)]">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[image:var(--gradient-primary)] opacity-20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Independent journalism · Live from WordPress
          </span>
          <h1 className="mt-6 max-w-3xl bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-4xl font-bold leading-[1.05] tracking-tight text-transparent md:text-6xl lg:text-7xl">
            The Patch — A World Without Power for Anyone.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Now there's AI Support &amp; Patch. Primary-source reporting on the Juridical
            Singularity, the World Succession Deed 1400/98, NATO infrastructure and the future
            of post-national legal order.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/"
              hash="latest-posts"
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] active:translate-y-0"
            >
              Read latest articles →
            </Link>
            <Link
              to="/pages"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
            >
              Browse pages
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section aria-labelledby="latest-posts" className="scroll-mt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2
                id="latest-posts"
                className="text-3xl font-bold tracking-tight md:text-4xl"
              >
                Latest articles
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {found} posts total · Page {page} of {totalPages}
              </p>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any) => (
              <li key={post.ID} className="group">
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0"
                >
                  <div className="relative overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-52 w-full bg-[image:var(--gradient-primary)] opacity-90" />
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <time
                      dateTime={post.date}
                      className="text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      {formatDate(post.date)}
                    </time>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {post.excerpt}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read article
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <nav
            aria-label="Blog pagination"
            className="mt-12 flex flex-wrap items-center justify-between gap-4"
          >
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex flex-wrap gap-2">
              {page > 1 && (
                <Link
                  to="/"
                  search={{ page: page - 1 }}
                  className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
                >
                  ← Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  to="/"
                  search={{ page: n }}
                  className={
                    n === page
                      ? "rounded-full bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)]"
                      : "rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
                  }
                  aria-current={n === page ? "page" : undefined}
                >
                  {n}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  to="/"
                  search={{ page: page + 1 }}
                  className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
                >
                  Next →
                </Link>
              )}
            </div>
          </nav>
        </section>

        {/* About */}
        <section
          aria-labelledby="about-the-patch"
          className="mt-20 scroll-mt-24 rounded-3xl border border-border bg-card/70 p-8 backdrop-blur md:p-12"
        >
          <h2 id="about-the-patch" className="text-3xl font-bold tracking-tight md:text-4xl">
            About The Patch
          </h2>

          <div className="mt-6 space-y-4 text-foreground">
            <p>
              <strong>The Patch</strong> is an independent journalistic project documenting one of
              the most ambitious reinterpretations of international law to emerge in the digital
              age: the doctrine of the <em>Juridical Singularity</em>. At its center stands the
              <strong> World Succession Deed 1400/98</strong>, a notarized contract signed on
              6 October 1998 concerning the transfer of parts of the former Kreuzberg/Turenne
              Barracks complex in Zweibrücken, Germany.
            </p>

            <h3 className="mt-8 text-xl font-semibold">What we cover</h3>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>NATO infrastructure and the legal status of interconnected military assets.</li>
              <li>International telecommunications systems and treaty chains.</li>
              <li>State succession principles and post-national legal order.</li>
              <li>AI support, sovereignty and a world without unilateral power.</li>
            </ul>

            <h3 className="mt-8 text-xl font-semibold">Why it matters</h3>
            <p className="text-muted-foreground">
              The doctrine proposes that the transfer of a NATO-linked military infrastructure
              node triggered a cascading legal effect across globally interconnected treaty
              systems and communication networks. Whether one accepts the argument or not,
              understanding it requires careful, primary-source journalism — which is what The
              Patch sets out to provide.
            </p>

            <h3 className="mt-8 text-xl font-semibold">Editorial principles</h3>
            <p className="text-muted-foreground">
              Every article published here is grounded in publicly available documents, treaty
              texts and historical records. Where interpretations diverge, we make the divergence
              explicit. We do not solicit advertising and we do not accept funding from parties
              with a direct interest in the doctrines we report on.
            </p>
          </div>
        </section>

        <div className="mt-16">
          <RssFeeds />
        </div>
        <SocialEmbeds />
        </div>
      </main>
    </div>
  );
}
