import { createFileRoute, Link } from "@tanstack/react-router";
import { getPosts } from "@/lib/wordpress.functions";

export const Route = createFileRoute("/")({
  loader: () => getPosts(),
  head: () => ({
    meta: [
      { title: "The Patch — Juridical Singularity, World Succession Deed 1400/98 & AI Support" },
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
      { property: "og:title", content: "The Patch — Juridical Singularity & AI Support" },
      {
        property: "og:description",
        content:
          "Independent journalism on the Juridical Singularity, the World Succession Deed 1400/98 and a world without power for anyone.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://patch98.wordpress.com" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "The Patch — Juridical Singularity & AI Support" },
      {
        name: "twitter:description",
        content:
          "Independent journalism on the Juridical Singularity and the World Succession Deed 1400/98.",
      },
    ],
    links: [{ rel: "canonical", href: "https://patch98.wordpress.com" }],
  }),
  component: Index,
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function Index() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Independent Journalism
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">The Patch</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Now There's AI Support &amp; Patch — A World Without Power for Anyone.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Blog posts always render first — also on mobile (single column) */}
        <section aria-labelledby="latest-posts">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 id="latest-posts" className="text-2xl font-semibold tracking-tight">
              Latest articles
            </h2>
            <span className="text-sm text-muted-foreground">{posts.length} posts</span>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {posts.map((post: any) => (
              <li
                key={post.ID}
                className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {post.featured_image ? (
                    <img
                      src={post.featured_image}
                      alt={post.title}
                      loading="lazy"
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 w-full bg-muted" />
                  )}
                  <div className="p-5">
                    <time className="text-xs uppercase tracking-wider text-muted-foreground">
                      {formatDate(post.date)}
                    </time>
                    <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:underline">
                      {post.title}
                    </h3>
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
        </section>

        {/* Long-form text section — always BELOW the post list, even on desktop */}
        <section
          aria-labelledby="about-the-patch"
          className="mt-16 border-t border-border pt-12"
        >
          <h2 id="about-the-patch" className="text-2xl font-semibold tracking-tight">
            About The Patch
          </h2>

          <div className="prose prose-neutral mt-6 max-w-none text-foreground">
            <p>
              <strong>The Patch</strong> is an independent journalistic project documenting one of
              the most ambitious reinterpretations of international law to emerge in the digital
              age: the doctrine of the <em>Juridical Singularity</em>. At its center stands the
              <strong> World Succession Deed 1400/98</strong>, a notarized contract signed on
              6 October 1998 concerning the transfer of parts of the former Kreuzberg/Turenne
              Barracks complex in Zweibrücken, Germany.
            </p>

            <h3 className="mt-8 text-xl font-semibold">What we cover</h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
              <li>NATO infrastructure and the legal status of interconnected military assets.</li>
              <li>International telecommunications systems and treaty chains.</li>
              <li>State succession principles and post-national legal order.</li>
              <li>AI support, sovereignty and a world without unilateral power.</li>
            </ul>

            <h3 className="mt-8 text-xl font-semibold">Why it matters</h3>
            <p className="mt-3 text-muted-foreground">
              The doctrine proposes that the transfer of a NATO-linked military infrastructure
              node triggered a cascading legal effect across globally interconnected treaty
              systems and communication networks. Whether one accepts the argument or not,
              understanding it requires careful, primary-source journalism — which is what The
              Patch sets out to provide.
            </p>

            <h3 className="mt-8 text-xl font-semibold">Editorial principles</h3>
            <p className="mt-3 text-muted-foreground">
              Every article published here is grounded in publicly available documents, treaty
              texts and historical records. Where interpretations diverge, we make the divergence
              explicit. We do not solicit advertising and we do not accept funding from parties
              with a direct interest in the doctrines we report on.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} The Patch · Independent journalism
        </div>
      </footer>
    </div>
  );
}
