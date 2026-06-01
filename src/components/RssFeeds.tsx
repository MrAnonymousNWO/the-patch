const FEEDS = [
  {
    title: "Electric Technocracy — Blog",
    href: "https://worldsold.wixsite.com/electric-technocracy/blog",
    src: "https://widgets.sociablekit.com/rss-feed/iframe/25686177",
  },
  {
    title: "World Sold — Blog",
    href: "https://worldsold.wixsite.com/world-sold/en/blog",
    src: "https://widgets.sociablekit.com/rss-feed/iframe/25686179",
  },
];

export function RssFeeds() {
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
        {FEEDS.map((feed) => (
          <div
            key={feed.src}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">{feed.title}</h3>
              <a
                href={feed.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-wider text-primary hover:underline"
              >
                Open ↗
              </a>
            </div>
            <iframe
              src={feed.src}
              title={feed.title}
              loading="lazy"
              frameBorder={0}
              width="100%"
              height={550}
              className="rounded-md bg-background"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
