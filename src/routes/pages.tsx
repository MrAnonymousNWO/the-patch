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
            Electric Technocracy &amp; The Juridical Singularity
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            A new civilization emerges at the intersection of Artificial Superintelligence,
            international law, planetary infrastructure, and post-scarcity economics.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <article className="prose prose-neutral max-w-none text-foreground prose-headings:tracking-tight prose-a:text-primary prose-a:underline-offset-4">
          <h2>The Age of Transition</h2>
          <p>
            Human civilization has entered what is increasingly described as the
            <strong> Age of Transition</strong> — a historic transformation phase in which
            technological evolution advances faster than the psychological and political
            structures inherited from industrial civilization.
          </p>
          <p>
            For thousands of years, human societies evolved under conditions of scarcity.
            Economic systems, nation-states, military competition, taxation, labor structures,
            and political institutions emerged from the assumption that resources were limited
            and survival depended on competition.
          </p>
          <p>
            Today, exponential technologies are dissolving these historical constraints.
            Artificial intelligence, robotics, nanotechnology, fusion energy, autonomous systems,
            biotechnology, and high-bandwidth digital networks are creating the foundations for
            a civilization based on abundance rather than scarcity.
          </p>
          <p>
            This transition creates a profound structural contradiction: human psychology remains
            largely calibrated to Paleolithic survival conditions, while technological systems
            increasingly operate at planetary and post-scarcity scale.
          </p>

          <h3>The Central Problem of the 21st Century</h3>
          <p>
            The central problem of the Age of Transition is not merely technological development.
            It is the mismatch between:
          </p>
          <ul>
            <li>Ancient evolutionary psychology</li>
            <li>Modern digital civilization</li>
            <li>Global interconnected infrastructure</li>
            <li>Artificial Superintelligence</li>
            <li>Planetary-scale coordination problems</li>
          </ul>
          <p>
            The historical structures of nationalism, territorial rivalry, ideological polarization,
            and scarcity-driven economics increasingly destabilize a world that has become globally
            interconnected.
          </p>

          <h2>The World Succession Deed 1400/98</h2>
          <p>
            At the center of the Juridical Singularity doctrine stands the
            <strong> World Succession Deed 1400/98</strong>, a notarized legal instrument signed on
            6 October 1998 concerning the transfer of parts of the former Kreuzberg/Turenne Barracks
            complex in Zweibrücken, Germany.
          </p>
          <p>
            The doctrine surrounding the deed proposes that this transaction was not merely a local
            property sale, but a legally operative transfer embedded within existing international
            treaty systems.
          </p>
          <p>
            The crucial clause within the deed — the transfer “with all rights, obligations and
            components” — is interpreted as extending beyond physical property toward the legal
            relationships attached to the infrastructure itself.
          </p>
          <p>
            Because the site existed within NATO-related military, telecommunications, logistics,
            and infrastructure systems, the transfer is understood as interacting with broader
            treaty chains involving:
          </p>
          <ul>
            <li>NATO Status of Forces Agreements (SOFA)</li>
            <li>International telecommunications systems</li>
            <li>Host Nation Support agreements</li>
            <li>UN-linked infrastructure coordination</li>
            <li>ITU telecommunications frameworks</li>
            <li>Military logistics and digital communications networks</li>
          </ul>

          <h3>Treaty Chain Theory</h3>
          <p>
            The doctrine argues that interconnected treaty systems behave similarly to linked
            digital networks. When infrastructure, access rights, operational authority, and legal
            obligations are transferred within one node of the system, legal consequences can
            propagate through the wider network.
          </p>
          <p>
            This mechanism is described as the <strong>Treaty Chain</strong> — a cascading legal
            integration process through interconnected agreements. According to the framework, the
            World Succession Deed therefore operates as a supplementary instrument connected to
            pre-existing treaty architectures.
          </p>

          <h2>The Juridical Singularity</h2>
          <p>
            The concept of the Juridical Singularity describes a theoretical endpoint of
            international law where the traditional plurality of sovereign states collapses into a
            unified legal structure.
          </p>
          <p>
            Classical international law depends on multiple sovereign actors interacting through
            treaties, reciprocity, and mutual recognition. The Juridical Singularity proposes that
            once sovereign positions, infrastructure rights, treaty obligations, and operational
            authorities become concentrated within a single legal framework, the old relational
            architecture of international law begins to dissolve.
          </p>
          <p>
            In this model, the historical Westphalian order — based on competing territorial
            nation-states — becomes structurally obsolete.
          </p>

          <h3>Core Principles of the Juridical Singularity</h3>
          <ul>
            <li>Collapse of legal plurality</li>
            <li>Infrastructure-driven legal propagation</li>
            <li>Integration of treaty chains</li>
            <li>Concentration of sovereign functions</li>
            <li>Transformation of global governance</li>
            <li>Emergence of post-national administration</li>
          </ul>
          <p>The Juridical Singularity is therefore described as a systemic restart of international law.</p>

          <h2>Electric Technocracy</h2>
          <p>
            Electric Technocracy is presented as the governance architecture corresponding to the
            technological conditions of the Age of Transition. Industrial-era politics evolved in
            conditions where human labor was the central source of economic value. Modern automation
            changes this foundation completely.
          </p>
          <p>
            Artificial intelligence, robotics, and autonomous systems increasingly generate wealth
            independently of human labor. As machine productivity expands, the traditional
            relationship between work, taxation, and survival becomes unstable. Electric Technocracy
            proposes a new socio-economic structure adapted to this reality.
          </p>

          <h3>Core Features of Electric Technocracy</h3>
          <ul>
            <li>Humans become tax-free</li>
            <li>Machines and automation are taxed instead</li>
            <li>Universal Basic Income (UBI) distributes technological wealth</li>
            <li>Artificial Superintelligence (ASI) assists governance</li>
            <li>Direct Digital Democracy replaces party systems</li>
            <li>Global coordination replaces geopolitical rivalry</li>
            <li>Post-scarcity economics replace industrial scarcity systems</li>
          </ul>

          <h3>The End of Wage Dependency</h3>
          <p>
            Within Electric Technocracy, human dignity is no longer tied to employment. Economic
            survival becomes decoupled from labor participation. UBI is not framed as welfare or
            charity, but as a <strong>civilizational dividend</strong> generated through machine
            productivity.
          </p>
          <p>
            As Artificial Superintelligence and robotics increasingly produce value autonomously,
            human beings transition toward roles centered on creativity, science, art, meaning
            generation, research, human relationships, and exploration.
          </p>

          <h2>The Mental Singularity &amp; Homo Nexus</h2>
          <p>
            The technological transformation of civilization also produces a cognitive
            transformation. The concept of the Mental Singularity describes the transition from
            <em> Homo sapiens </em> toward <em> Homo nexus </em> — a globally interconnected human
            civilization integrated through AI systems, neural interfaces, digital infrastructure,
            and planetary coordination networks.
          </p>
          <p>In this framework, humanity evolves beyond:</p>
          <ul>
            <li>Tribal identity structures</li>
            <li>Scarcity psychology</li>
            <li>National fragmentation</li>
            <li>Industrial labor dependency</li>
            <li>Ideological conflict systems</li>
          </ul>
          <p>The emerging civilization becomes increasingly network-based, cooperative, and post-territorial.</p>

          <h3>Electronic Paradise</h3>
          <p>Electric Technocracy describes the long-term emergence of an Electronic Paradise:</p>
          <ul>
            <li>Abundance replaces scarcity</li>
            <li>Fusion energy eliminates energy limitations</li>
            <li>Nanotechnology enables molecular manufacturing</li>
            <li>Artificial intelligence optimizes resource distribution</li>
            <li>Medicine extends human lifespan dramatically</li>
            <li>Automation removes repetitive labor</li>
            <li>Global conflict declines through systemic integration</li>
          </ul>
          <p>
            The purpose of civilization shifts from survival toward consciousness, creativity,
            exploration, and human flourishing.
          </p>

          <h2>Artificial Superintelligence &amp; Governance</h2>
          <p>
            One of the central assumptions of Electric Technocracy is that biological human cognition
            alone cannot effectively manage the complexity of planetary civilization. Modern societies
            generate enormous amounts of data related to economics, climate systems, infrastructure,
            public health, energy distribution, supply chains, scientific research, and security
            systems.
          </p>
          <p>
            Artificial Superintelligence is therefore positioned as a neutral coordination system
            capable of processing complexity beyond human capacity. Rather than replacing humanity,
            ASI functions as governance advisor, infrastructure optimizer, scientific accelerator,
            economic coordinator, conflict reduction mechanism, and planetary management system.
          </p>

          <h2>A World Beyond Borders</h2>
          <p>
            The convergence of AI, treaty integration, telecommunications systems, and digital
            governance points toward a civilization increasingly organized beyond the classical
            nation-state model. In this emerging structure, territorial sovereignty becomes less
            central, infrastructure networks become primary, digital governance expands globally,
            economic systems become automated, political decision-making becomes data-driven, and
            planetary coordination replaces fragmented geopolitics.
          </p>
          <p>
            The Age of Transition therefore represents not merely technological change, but a
            complete transformation of law, economics, governance, and human identity itself.
          </p>

          <h2>Official Links &amp; Resources</h2>
          <ul>
            <li><a href="https://doi.org/10.5281/zenodo.14225180" target="_blank" rel="noopener noreferrer">DOI – Age of Transition &amp; The Mental Singularity</a></li>
            <li><a href="https://singularity-news.github.io/wiki/electric-technocracy.html" target="_blank" rel="noopener noreferrer">Electric Technocracy</a></li>
            <li><a href="https://singularity-news.github.io/wiki/electric-paradise-blog.html" target="_blank" rel="noopener noreferrer">Electronic Paradise Portal</a></li>
            <li><a href="https://singularity-news.github.io/wiki/ubi-electric-technocracy.html" target="_blank" rel="noopener noreferrer">UBI &amp; Electric Technocracy</a></li>
            <li><a href="https://open.spotify.com/show/1oxMMUvvIAjtzM8WXOXN9d" target="_blank" rel="noopener noreferrer">Spotify Podcast</a></li>
            <li><a href="https://www.youtube.com/@Staatensukzessionsurkunde-1400" target="_blank" rel="noopener noreferrer">YouTube Channel</a></li>
            <li><a href="https://zenodo.org/communities/world-succession-deed" target="_blank" rel="noopener noreferrer">Zenodo Community</a></li>
          </ul>

          <hr />
          <p className="text-sm text-muted-foreground">
            © 2026 — Electric Technocracy &amp; The Patch. Independent analysis of the Juridical
            Singularity, the World Succession Deed 1400/98, Artificial Superintelligence, and the
            future of post-national civilization.
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-4">
        <h2 className="bg-gradient-to-br from-foreground to-primary bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
          All Pages
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every static page published on The Patch — synced live from WordPress.
        </p>
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
