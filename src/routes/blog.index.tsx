import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { getPosts } from "@/lib/wordpress.functions";

export const Route = createFileRoute("/blog/")({
  validateSearch: (search: Record<string, unknown>) => ({
    page: Math.max(1, Number(search.page) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps }) => getPosts({ data: { page: deps.page } }),
  head: ({ loaderData }) => {
    const page = loaderData?.page ?? 1;
    const suffix = page > 1 ? ` — Page ${page}` : "";
    return {
      meta: [
        { title: `Blog — All Articles${suffix} · The Patch` },
        {
          name: "description",
          content:
            "Every dispatch from The Patch — independent journalism on the Juridical Singularity, the World Succession Deed 1400/98, NATO infrastructure and AI governance.",
        },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: `Blog — All Articles${suffix} · The Patch` },
        {
          property: "og:description",
          content:
            "Every dispatch from The Patch — independent journalism on the Juridical Singularity and the World Succession Deed 1400/98.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: "https://the-patch.lovable.app/blog" },
      ],
      links: [{ rel: "canonical", href: "https://the-patch.lovable.app/blog" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "The Patch — Blog",
            url: "https://the-patch.lovable.app/blog",
            description:
              "Every dispatch from The Patch — independent journalism on the Juridical Singularity and the World Succession Deed 1400/98.",
          }),
        },
      ],
    };
  },
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load the blog</h1>
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
  component: BlogIndex,
});

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function BlogIndex() {
  const { posts, page, totalPages, found } = Route.useLoaderData();
  return (
    <div className="text-foreground">
      <section className="border-b-2 border-dashed border-primary/40 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <span className="rounded-sm border border-primary/40 bg-card/70 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Archive
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">
            The Blog — All Dispatches
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {found} articles · Page {page} of {totalPages}. Synced live from WordPress.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: any) => (
            <li key={post.ID}>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)]"
              >
                {post.featured_image ? (
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-44 w-full bg-[image:var(--gradient-primary)] opacity-90" />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <time className="text-xs uppercase tracking-wider text-muted-foreground">
                    {fmt(post.date)}
                  </time>
                  <h2 className="mt-2 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <nav className="mt-12 flex flex-wrap items-center justify-between gap-4" aria-label="Pagination">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex flex-wrap gap-2">
            {page > 1 && (
              <Link
                to="/blog"
                search={{ page: page - 1 }}
                className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                ← Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                to="/blog"
                search={{ page: n }}
                aria-current={n === page ? "page" : undefined}
                className={
                  n === page
                    ? "rounded-full bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-primary-foreground"
                    : "rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
                }
              >
                {n}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                to="/blog"
                search={{ page: page + 1 }}
                className="rounded-full border border-border bg-card/70 px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                Next →
              </Link>
            )}
          </div>
        </nav>
      </section>
    </div>
  );
}
