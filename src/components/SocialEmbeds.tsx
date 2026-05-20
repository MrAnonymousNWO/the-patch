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
        Music, podcast and video channels from the World Succession Deed
        ecosystem.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* SoundCloud */}
        <div className="rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
          <h3 className="text-lg font-semibold">
            Cassandra Cries — Music vs War
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            SoundCloud profile of World Succession Deed.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl">
            <iframe
              title="SoundCloud — World Succession Deed"
              width="100%"
              height="450"
              scrolling="no"
              frameBorder="0"
              allow="autoplay"
              src="https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/world-succession-deed&color=%2358a6ff&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"
              loading="lazy"
            />
          </div>
          <a
            href="https://soundcloud.com/world-succession-deed?utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Open on SoundCloud →
          </a>
        </div>

        {/* Spotify Podcast */}
        <div className="rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
          <h3 className="text-lg font-semibold">Podcast on Spotify</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Listen to the latest episodes.
          </p>
          <div className="mt-4 overflow-hidden rounded-xl">
            <iframe
              data-testid="embed-iframe"
              title="Spotify Podcast"
              style={{ borderRadius: 12 }}
              src="https://open.spotify.com/embed/show/1oxMMUvvIAjtzM8WXOXN9d?utm_source=generator&theme=0"
              width="100%"
              height="232"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* YouTube */}
      <div className="mt-8 rounded-2xl border border-border bg-background/60 p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-elegant)]">
        <h3 className="text-lg font-semibold">YouTube Channel</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Latest videos directly from the channel.
        </p>
        <div className="mt-4 overflow-hidden rounded-xl">
          <iframe
            title="YouTube Channel Videos"
            src="https://widgets.sociablekit.com/youtube-channel-videos/iframe/25680810"
            frameBorder="0"
            width="100%"
            height="550"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
