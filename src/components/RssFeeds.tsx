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
  error?: string;
};

const FEED_URLS = [
  {
    url: "https://worldsold.wixsite.com/world-sold/en/blog-feed.xml",
    title: "World Sold — Blog",
  },
  {
    url: "https://worldsold.wixsite.com/electric-technocracy/blog-feed.xml",
    title: "Electric Technocracy — Blog",
  },
];

function stripHtml(html: string): string {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 220 ? text.slice(0, 220) + "…" : text;
}

function parseFeed(xml: string): FeedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const items = Array.from(doc.querySelectorAll("item, entry")).slice(0, 5);
    return items.map((item) => {
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
  } catch {
    return [];
  }
}

export function RssFeeds() {
  const [feeds, setFeeds] = useState<Feed[]>(
    FEED_URLS.map((f) => ({ ...f, items: [] })),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const results = await Promise.all(
        FEED_URLS.map(async (f) => {
          try {
            const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(f.url)}`;
            const res = await fetch(proxy);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const xml = await res.text();
            return { ...f, items: parseFeed(xml) };
          } catch (e: any) {
            return { ...f, items: [], error: e?.message ?? "Could not load feed" };
          }
        }),
      );
      if (!cancelled) {
        setFeeds(results);
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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
        {feeds.map((feed) => (
          <div
            key={feed.url}
            className="rounded-lg border border-border bg-card p-6"
          >
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

            {loading && feed.items.length === 0 && !feed.error && (
              <p className="text-sm text-muted-foreground">Loading feed…</p>
            )}
            {feed.error && (
              <p className="text-sm text-muted-foreground">
                Could not load this feed right now.
              </p>
            )}

            <ul className="space-y-5">
              {feed.items.map((item, i) => (
                <li key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
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
                        {new Date(item.pubDate).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          timeZone: "UTC",
                        })}
                      </time>
                    )}
                    {item.snippet && (
                      <p className="mt-2 text-sm text-muted-foreground">{item.snippet}</p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
