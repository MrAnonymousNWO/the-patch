const THREADS = [
  {
    title: "Threads — Homo Nexus / The Patch",
    href: "https://www.threads.net/",
    src: "https://widgets.sociablekit.com/threads-posts/iframe/25684134",
  },
  {
    title: "Threads — Singularity University Free Courses",
    href: "https://www.threads.net/",
    src: "https://widgets.sociablekit.com/threads-posts/iframe/25686181",
  },
];

export function ThreadsEmbeds() {
  return (
    <section
      aria-labelledby="threads-embeds"
      className="mt-16 border-t border-border pt-12"
    >
      <h2 id="threads-embeds" className="text-2xl font-semibold tracking-tight">
        Threads
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Latest posts from connected Threads accounts.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {THREADS.map((t) => (
          <div
            key={t.src}
            className="rounded-lg border border-border bg-card p-4"
          >
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
              <a
                href={t.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-wider text-primary hover:underline"
              >
                Open ↗
              </a>
            </div>
            <iframe
              src={t.src}
              title={t.title}
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
