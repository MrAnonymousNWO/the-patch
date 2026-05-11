import { useEffect, useState } from "react";

type FeedItem = {
  title: string;
  link: string;
  snippet: string;
  pubDate?: string;
};

type Feed = {
  url: string;
  title: string;
  items: FeedItem[];
  status: "loading" | "ready" | "error";
  error?: string;
};

const FEED_SOURCES = [
  {
    url: "https://worldsold.wixsite.com/world-sold/en/blog-feed.xml",
    title: "World Sold — Blog",
  },
  {
    url: "https://worldsold.wixsite.com/electric-technocracy/blog-feed.xml",
    title: "Electric Technocracy — Blog",
  },
];

const DEFAULT_MAX_ITEMS = 30;
const CACHE_TTL_MS = 10 * 60 * 1000;
const STORAGE_KEY = "rss-feed-cache-v1";

type CacheEntry = { items: FeedItem[]; ts: number };
const memoryCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<FeedItem[]>>();

function readPersisted(): Record<string, CacheEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writePersisted(data: Record<string, CacheEntry>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

function getCached(url: string): FeedItem[] | null {
  const mem = memoryCache.get(url);
  if (mem && Date.now() - mem.ts < CACHE_TTL_MS) return mem.items;
  const persisted = readPersisted()[url];
  if (persisted && Date.now() - persisted.ts < CACHE_TTL_MS) {
    memoryCache.set(url, persisted);
    return persisted.items;
  }
  return null;
}

function setCached(url: string, items: FeedItem[]) {
  const entry = { items, ts: Date.now() };
  memoryCache.set(url, entry);
  const persisted = readPersisted();
  persisted[url] = entry;
  writePersisted(persisted);
}

function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 260 ? text.slice(0, 260) + "…" : text;
}

function parseFeed(xml: string): FeedItem[] {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  if (doc.querySelector("parsererror")) return [];
  return Array.from(doc.querySelectorAll("item, entry")).map((item) => {
    const title = item.querySelector("title")?.textContent?.trim() ?? "Untitled";
    const linkEl = item.querySelector("link");
    const link =
      linkEl?.textContent?.trim() ||
      linkEl?.getAttribute("href") ||
      item.querySelector("guid")?.textContent?.trim() ||
      "#";
    const desc =
      item.querySelector("description")?.textContent ??
      item.querySelector("summary")?.textContent ??
      item.querySelector("content")?.textContent ??
      "";
    const pubDate =
      item.querySelector("pubDate")?.textContent ??
      item.querySelector("updated")?.textContent ??
      undefined;
    return { title, link, snippet: stripHtml(desc), pubDate };
  });
}

async function fetchFeed(url: string, signal: AbortSignal): Promise<FeedItem[]> {
  const cached = getCached(url);
  if (cached) return cached;
  const existing = inflight.get(url);
  if (existing) return existing;

  const proxies = [
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
  ];

  const promise = (async () => {
    let lastErr: unknown;
    for (const make of proxies) {
      try {
        const res = await fetch(make(url), { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();
        const items = parseFeed(xml);
        if (items.length > 0) {
          setCached(url, items);
          return items;
        }
        lastErr = new Error("Empty feed");
      } catch (e) {
        if ((e as any)?.name === "AbortError") throw e;
        lastErr = e;
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error("Feed unavailable");
  })();

  inflight.set(url, promise);
  try {
    return await promise;
  } finally {
    inflight.delete(url);
  }
}

export function RssFeeds({ maxItems = DEFAULT_MAX_ITEMS }: { maxItems?: number } = {}) {
  // SSR-safe: always start in loading state. Cache hydrates after mount.
  const [feeds, setFeeds] = useState<Feed[]>(() =>
    FEED_SOURCES.map((f) => ({ ...f, items: [], status: "loading" as const })),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const controller = new AbortController();

    // Synchronously serve cached entries to avoid flicker
    setFeeds((prev) =>
      prev.map((feed) => {
        const cached = getCached(feed.url);
        return cached ? { ...feed, items: cached, status: "ready" } : feed;
      }),
    );

    FEED_SOURCES.forEach((source, idx) => {
      if (getCached(source.url)) return;
      fetchFeed(source.url, controller.signal)
        .then((items) => {
          if (controller.signal.aborted) return;
          setFeeds((prev) => {
            const next = [...prev];
            next[idx] = { ...source, items, status: "ready" };
            return next;
          });
        })
        .catch((e: Error) => {
          if (controller.signal.aborted || e.name === "AbortError") return;
          setFeeds((prev) => {
            const next = [...prev];
            next[idx] = { ...source, items: [], status: "error", error: e.message };
            return next;
          });
        });
    });

    return () => controller.abort();
  }, []);

  return (
    <section
      aria-labelledby="rss-feeds"
      className="mt-16 border-t border-border pt-12"
    >
      <h2 id="rss-feeds" className="text-2xl font-semibold tracking-tight">
        Related feeds
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Latest posts from partner blogs. Click any item to open it in a new window.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {feeds.map((feed) => {
          const visible = feed.items.slice(0, maxItems);
          return (
            <div key={feed.url} className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">{feed.title}</h3>
                <a
                  href={feed.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-wider text-primary hover:underline"
                >
                  RSS
                </a>
              </div>

              {feed.status === "loading" && (
                <ul className="space-y-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
                      <div className="mt-3 h-3 w-full rounded bg-muted" />
                      <div className="mt-1 h-3 w-5/6 rounded bg-muted" />
                    </li>
                  ))}
                </ul>
              )}

              {feed.status === "error" && (
                <div className="rounded-md border border-border bg-secondary p-4 text-sm text-muted-foreground">
                  Could not load this feed right now.{" "}
                  <a
                    href={feed.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Open it directly
                  </a>
                  .
                </div>
              )}

              {feed.status === "ready" && hydrated && (
                <>
                  <ul className="space-y-5">
                    {visible.map((item, i) => (
                      <li
                        key={`${feed.url}-${i}`}
                        className="border-b border-border pb-4 last:border-0 last:pb-0"
                      >
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <h4 className="text-base font-semibold text-foreground group-hover:text-primary">
                            {item.title}
                          </h4>
                          {item.pubDate && (
                            <time className="mt-1 block text-xs uppercase tracking-wider text-muted-foreground">
                              {(() => {
                                const d = new Date(item.pubDate!);
                                return Number.isNaN(d.getTime())
                                  ? item.pubDate
                                  : d.toLocaleDateString("en-GB", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      timeZone: "UTC",
                                    });
                              })()}
                            </time>
                          )}
                          {item.snippet && (
                            <p className="mt-2 text-sm text-muted-foreground">{item.snippet}</p>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                  {feed.items.length > visible.length && (
                    <p className="mt-4 text-xs text-muted-foreground">
                      Showing {visible.length} of {feed.items.length} entries.
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
