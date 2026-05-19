import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { getPages } from "@/lib/wordpress.functions";

export const Route = createFileRoute("/pages")({
  loader: () => getPages(),
  head: () => ({
    meta: [
      { title: "All Pages — The Patch" },
      {
        name: "description",
        content:
          "Browse all editorial pages from The Patch — primary-source journalism on the Juridical Singularity and the World Succession Deed 1400/98.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://the-patch.lovable.app/pages" }],
  }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-semibold">Couldn't load pages</h1>
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
  notFoundComponent: () => <div className="p-12 text-center">No pages found.</div>,
  component: PagesIndex,
});

function PagesIndex() {
  const { pages } = Route.useLoaderData();
  return (
    <div className="text-foreground">
      <section className="border-b border-border bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
            All Pages
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every static page published on The Patch — synced live from WordPress.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {pages.length === 0 ? (
          <p className="text-muted-foreground">No pages available yet.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p: { ID: number; slug: string; title: string; excerpt: string; featured_image: string }) => (
              <li key={p.ID}>
                <Link
                  to="/pages/$slug"
                  params={{ slug: p.slug }}
                  className="group block h-full overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-[var(--shadow-glow)] active:translate-y-0"
                >
                  {p.featured_image ? (
                    <img
                      src={p.featured_image}
                      alt={p.title}
                      className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-40 w-full bg-[image:var(--gradient-primary)] opacity-80" />
                  )}
                  <div className="p-5">
                    <h2 className="text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                      {p.title}
                    </h2>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Read page
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
