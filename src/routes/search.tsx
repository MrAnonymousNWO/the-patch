import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

type IndexEntry = {
  type: "post" | "page";
  slug: string;
  title: string;
  excerpt: string;
  modified: string;
};

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — The Patch" },
      {
        name: "description",
        content:
          "Static search across every article and page on The Patch. The index is regenerated automatically when WordPress content changes.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://the-patch.lovable.app/search" }],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [entries, setEntries] = useState<IndexEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ generatedAt: string; total: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json", { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error(`Index failed (${r.status})`);
        return r.json();
      })
      .then((j) => {
        if (cancelled) return;
        setEntries(j.entries || []);
        setMeta({ generatedAt: j.generatedAt, total: j.total });
      })
      .catch((e) => !cancelled && setError(String(e.message || e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    if (!entries) return [];
    const needle = q.trim().toLowerCase();
    if (!needle) return entries.slice(0, 30);
    const tokens = needle.split(/\s+/).filter(Boolean);
    return entries
      .map((e) => {
        const hay = `${e.title} ${e.excerpt}`.toLowerCase();
        let score = 0;
        for (const t of tokens) {
          if (hay.includes(t)) score += 2;
          if (e.title.toLowerCase().includes(t)) score += 3;
        }
        return { e, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 80)
      .map((r) => r.e);
  }, [q, entries]);

  return (
    <div className="text-foreground">
      <section className="border-b-2 border-dashed border-primary/40 bg-[image:var(--gradient-hero)]">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <span className="rounded-sm border border-primary/40 bg-card/70 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Search · Auto-indexed
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">
            Search The Patch
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            A fully static search index across every article and page. The index regenerates
            automatically whenever WordPress content changes.
          </p>
          <div className="mt-8">
            <input
              type="search"
              autoFocus
              placeholder="Search posts, pages, treaty chains…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border-2 border-primary/40 bg-card/80 px-5 py-4 font-mono text-lg shadow-[var(--shadow-elegant)] outline-none focus:border-primary"
            />
            {meta && (
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {meta.total} entries · index built {new Date(meta.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load search index: {error}
          </p>
        )}
        {!entries && !error && (
          <p className="text-sm text-muted-foreground">Loading index…</p>
        )}
        {entries && results.length === 0 && (
          <p className="text-sm text-muted-foreground">No matches for "{q}".</p>
        )}
        <ul className="space-y-3">
          {results.map((r) => (
            <li key={`${r.type}-${r.slug}`}>
              <Link
                to={r.type === "post" ? "/blog/$slug" : "/pages/$slug"}
                params={{ slug: r.slug }}
                className="block rounded-xl border border-border bg-card/70 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]"
              >
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="rounded-sm bg-background/60 px-2 py-0.5">{r.type}</span>
                  <span>/{r.type === "post" ? "blog" : "pages"}/{r.slug}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-foreground">{r.title}</h2>
                {r.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
