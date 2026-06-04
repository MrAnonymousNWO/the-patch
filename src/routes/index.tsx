import { createFileRoute, Link } from "@tanstack/react-router";
import { getPosts } from "@/lib/wordpress.functions";
import { RssFeeds } from "@/components/RssFeeds";
import { SocialEmbeds } from "@/components/SocialEmbeds";
import { ThreadsEmbeds } from "@/components/ThreadsEmbeds";
import patchLogo from "@/assets/patch-logo.png";

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
      {/* Hero — 1960s declassified dispatch */}
      <section className="relative overflow-hidden border-b-2 border-dashed border-primary/40">
        <div className="absolute inset-0 bg-[image:var(--gradient-hero)]" aria-hidden />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0, transparent 27px, color-mix(in oklab, var(--primary) 25%, transparent) 28px), repeating-linear-gradient(90deg, transparent 0, transparent 80px, color-mix(in oklab, var(--primary) 8%, transparent) 81px)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[auto_1fr] md:py-24">
          <div className="flex items-start justify-center md:justify-start">
            <div className="relative">
              <img
                src={patchLogo}
                alt="The Patch — official seal"
                className="h-40 w-40 rotate-[-4deg] rounded-full object-contain shadow-[var(--shadow-glow)] md:h-52 md:w-52"
              />
              <span className="stamp absolute -right-3 -top-3 text-[10px]">Top Secret</span>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
              <span className="rounded-sm border border-primary/40 bg-card/70 px-2 py-1">
                Dossier № 1400/98
              </span>
              <span className="hidden md:inline">·</span>
              <span>For Public Release</span>
              <span className="hidden md:inline">·</span>
              <span>
                {new Date().toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            </div>

            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              The Patch —<br />
              <span className="underline decoration-primary decoration-[3px] underline-offset-[10px]">
                A World Without Power
              </span>{" "}
              for Anyone.
            </h1>

            <p className="mt-6 max-w-2xl border-l-4 border-primary/60 bg-card/40 px-4 py-2 text-base md:text-lg">
              Primary-source reporting on the Juridical Singularity, the World Succession Deed
              1400/98, NATO infrastructure and the future of post-national legal order. Now with
              AI Support &amp; Patch.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                hash="latest-posts"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-primary bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
              >
                ▸ Read the dispatches
              </Link>
              <Link
                to="/pages"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-primary/60 bg-card/70 px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-foreground backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary active:translate-y-0"
              >
                ▸ Browse pages
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              <span className="rounded-sm bg-card/60 px-2 py-1">NATO · SOFA</span>
              <span className="rounded-sm bg-card/60 px-2 py-1">Treaty Chains</span>
              <span className="rounded-sm bg-card/60 px-2 py-1">ITU</span>
              <span className="rounded-sm bg-card/60 px-2 py-1">ASI Governance</span>
              <span className="rounded-sm bg-card/60 px-2 py-1">Electric Technocracy</span>
            </div>
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

        {/* Landing Page Long-form */}
        <section
          aria-labelledby="patch-overview"
          className="mt-20 space-y-12 scroll-mt-24"
        >
          <div className="rounded-3xl border border-border bg-[image:var(--gradient-hero)] p-8 backdrop-blur md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary backdrop-blur">
              Manifesto
            </span>
            <h2
              id="patch-overview"
              className="mt-4 bg-gradient-to-br from-foreground via-foreground to-primary bg-clip-text text-3xl font-bold tracking-tight text-transparent md:text-5xl"
            >
              The Patch — A World Without Power for Anyone
            </h2>
            <p className="mt-5 max-w-3xl text-base text-muted-foreground md:text-lg">
              Independent journalism documenting the rise of the{" "}
              <strong className="text-foreground">Juridical Singularity</strong>, the{" "}
              <strong className="text-foreground">World Succession Deed 1400/98</strong>,
              international treaty chains, NATO-linked infrastructure, and the future of a
              post-national legal civilization.
            </p>
            <a
              href="#patch-what-is"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-primary)] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-elegant)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              Explore the Future of International Law →
            </a>
          </div>

          <div
            id="patch-what-is"
            className="grid gap-6 rounded-3xl border border-border bg-card/70 p-8 backdrop-blur md:p-12 lg:grid-cols-2"
          >
            <div>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">What Is The Patch?</h3>
              <p className="mt-4 text-muted-foreground">
                The Patch is a digital platform dedicated to{" "}
                <strong className="text-foreground">primary-source reporting</strong>, legal
                analysis, and technological foresight. It investigates the global implications of
                the <strong className="text-foreground">World Succession Deed 1400/98</strong>, a
                notarized legal instrument connected to NATO-linked infrastructure and
                international treaty systems.
              </p>
              <p className="mt-4 text-muted-foreground">
                The project explores how interconnected telecommunications networks, military
                infrastructure, treaty obligations, and digital governance may have triggered what
                is described as the{" "}
                <strong className="text-foreground">Juridical Singularity</strong> — a structural
                transformation of international law itself.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-6">
              <h4 className="text-lg font-semibold text-primary">Core Topics Covered</h4>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "International treaty chains and state succession",
                  "NATO, UN and ITU infrastructure systems",
                  "Artificial Superintelligence (ASI) and governance",
                  "Electric Technocracy and post-national administration",
                  "Universal Basic Income (UBI) funded through machine productivity",
                  "Digital democracy and algorithmic governance",
                  "Telecommunications sovereignty and network jurisdiction",
                  "The Age of Transition and the Mental Singularity",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-8 backdrop-blur md:p-12">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              The Juridical Singularity
            </h3>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                The doctrine of the Juridical Singularity proposes that international law can
                collapse into a unified legal subject when treaty chains, sovereign rights, and
                infrastructure systems become consolidated through a total-transfer mechanism.
              </p>
              <p>
                According to the framework surrounding the{" "}
                <strong className="text-foreground">World Succession Deed 1400/98</strong>, the
                transfer of a NATO-linked infrastructure node initiated a global domino effect
                across military, telecommunications, and treaty networks.
              </p>
              <p>
                This transformation is described as the end of the traditional{" "}
                <em>Westphalian nation-state order</em> and the beginning of a network-based
                planetary governance system.
              </p>
            </div>

            <h4 className="mt-8 text-lg font-semibold text-primary">Important Concepts</h4>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                {
                  t: "Treaty Chains",
                  d: "Existing NATO, UN, SOFA, ITU and telecommunications agreements interconnect through supplementary legal mechanisms.",
                },
                {
                  t: "Infrastructure Sovereignty",
                  d: "Telecommunications systems, military logistics, and network infrastructure become central to legal authority.",
                },
                {
                  t: "Post-National Governance",
                  d: "Borders, political parties, and classical state competition are replaced by digitally coordinated governance structures.",
                },
                {
                  t: "AI Governance",
                  d: "Artificial Superintelligence acts as a neutral decision-support system for civilization-scale coordination.",
                },
              ].map((c) => (
                <div
                  key={c.t}
                  className="rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-glow)]"
                >
                  <h5 className="font-semibold text-foreground">{c.t}</h5>
                  <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/70 p-8 backdrop-blur md:p-10">
              <h3 className="text-2xl font-bold tracking-tight">
                The Age of Transition &amp; The Mental Singularity
              </h3>
              <div className="mt-4 space-y-4 text-muted-foreground">
                <p>
                  Humanity is entering the{" "}
                  <strong className="text-foreground">Age of Transition</strong>, a civilizational
                  phase where exponential technologies radically transform economics, law,
                  identity, and governance.
                </p>
                <p>
                  Artificial intelligence, robotics, fusion energy, biotechnology, nanotechnology,
                  and cognitive interfaces are creating conditions of{" "}
                  <strong className="text-foreground">post-scarcity abundance</strong>.
                </p>
                <p>
                  The <strong className="text-foreground">Mental Singularity</strong> describes the
                  transition from <em>Homo sapiens</em> to <em>Homo nexus</em> — a civilization
                  integrated through high-bandwidth digital coordination, AI systems, and shared
                  planetary infrastructure.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/70 p-8 backdrop-blur md:p-10">
              <h3 className="text-2xl font-bold tracking-tight">Electric Technocracy</h3>
              <p className="mt-4 text-muted-foreground">
                A proposed governance framework for a post-scarcity civilization.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {[
                  "Humans become tax-free",
                  "Machine productivity funds society",
                  "Universal Basic Income replaces wage dependency",
                  "Direct Digital Democracy replaces political parties",
                  "AI-assisted governance optimizes planetary coordination",
                  "Longevity and biotechnology redefine human existence",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-[image:var(--gradient-hero)] p-8 backdrop-blur md:p-12">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Why The Patch Matters</h3>
            <div className="mt-4 space-y-4 text-muted-foreground">
              <p>
                The Patch is not traditional media. It is a research-oriented journalistic platform
                documenting one of the most ambitious reinterpretations of international law in the
                digital age.
              </p>
              <p>
                By combining legal analysis, infrastructure history, AI governance theory, and
                technological forecasting, The Patch provides a unique archive for understanding
                the future of sovereignty, law, and civilization.
              </p>
              <p>
                Whether one approaches the doctrine critically, academically, or strategically, the
                implications for global governance, treaty systems, and digital infrastructure are
                profound.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card/70 p-8 backdrop-blur md:p-12">
            <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
              Research, Media &amp; Resources
            </h3>
            <h4 className="mt-6 text-lg font-semibold text-primary">Official Links</h4>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { t: "DOI – Age of Transition & The Mental Singularity", u: "https://doi.org/" },
                { t: "Electric Technocracy", u: "https://worldsold.wixsite.com/electric-technocracy" },
                { t: "Electronic Paradise Portal", u: "https://electric-paradise.start.page" },
                { t: "World Sold", u: "https://worldsold.wixsite.com/world-sold" },
                { t: "Spotify Podcast", u: "https://open.spotify.com/show/1oxMMUvvIAjtzM8WXOXN9d" },
                { t: "YouTube Channel", u: "https://www.youtube.com/@Staatensukzessionsurkunde-1400" },
                { t: "International Treaty Law Wiki", u: "https://en.wikipedia.org/wiki/Treaty" },
                { t: "Zenodo Community", u: "https://zenodo.org/" },
                { t: "Juridical Singularity Wiki", u: "https://patch98.wordpress.com/" },
              ].map((l) => (
                <li key={l.t}>
                  <a
                    href={l.u}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2 rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary"
                  >
                    <span>{l.t}</span>
                    <span className="text-primary transition-transform group-hover:translate-x-1">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-16">
          <RssFeeds />
        </div>
        <SocialEmbeds />
        <ThreadsEmbeds />
      </main>
    </div>
  );
}
