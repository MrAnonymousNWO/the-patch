import { useEffect, useRef, useState } from "react";

function LazyEmbed({
  title,
  src,
  aspect = "16 / 9",
  allow,
  allowFullScreen,
  style,
}: {
  title: string;
  src: string;
  aspect?: string;
  allow?: string;
  allowFullScreen?: boolean;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ref.current || visible) return;
    const el = ref.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-xl bg-muted/40"
      style={{ aspectRatio: aspect, ...style }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
          <span className="sr-only">Loading {title}…</span>
        </div>
      )}
      {visible && (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          frameBorder="0"
          allow={allow}
          allowFullScreen={allowFullScreen}
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

export function SocialEmbeds() {
  return (
    <section
      aria-labelledby="social-embeds-heading"
      className="mt-16 rounded-3xl border border-border bg-card/70 p-6 backdrop-blur md:p-10"
    >
      <h2
        id="social-embeds-heading"
        className="text-2xl font-bold tracking-tight md:text-3xl"
      >
        Listen, watch &amp; follow
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Music, podcast and video channels from the World Succession Deed ecosystem.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
          <h3 className="text-lg font-semibold">Cassandra Cries — Music vs War</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            SoundCloud profile of World Succession Deed.
          </p>
          <div className="mt-4">
            <LazyEmbed
              title="SoundCloud — World Succession Deed"
              aspect="4 / 3"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/world-succession-deed&color=%2358a6ff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
            />
          </div>
          <a
            href="https://soundcloud.com/world-succession-deed"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Open on SoundCloud →
          </a>
        </div>

        <div className="rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
          <h3 className="text-lg font-semibold">Podcast on Spotify</h3>
          <p className="mt-1 text-sm text-muted-foreground">Listen to the latest episodes.</p>
          <div className="mt-4">
            <LazyEmbed
              title="Spotify Podcast"
              aspect="21 / 9"
              style={{ borderRadius: 12 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              src="https://open.spotify.com/embed/show/1oxMMUvvIAjtzM8WXOXN9d?utm_source=generator&theme=0"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
        <h3 className="text-lg font-semibold">YouTube Channel</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest videos directly from the channel.
        </p>
        <div className="mt-4">
          <LazyEmbed
            title="YouTube Channel Videos"
            aspect="16 / 11"
            src="https://widgets.sociablekit.com/youtube-channel-videos/iframe/25680810"
          />
        </div>
      </div>
    </section>
  );
}
