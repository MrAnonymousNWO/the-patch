import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-sidebar">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/" className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Independent Journalism
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">The Patch</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex flex-wrap gap-6 text-sm font-medium">
            <li>
              <Link
                to="/"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-primary underline underline-offset-4" }}
                className="text-foreground hover:text-primary"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/"
                hash="latest-posts"
                className="text-foreground hover:text-primary"
              >
                Articles
              </Link>
            </li>
            <li>
              <Link
                to="/"
                hash="about-the-patch"
                className="text-foreground hover:text-primary"
              >
                About
              </Link>
            </li>
            <li>
              <a
                href="/sitemap.xml"
                className="text-foreground hover:text-primary"
              >
                Sitemap
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-muted-foreground">
        © 2026 The Patch · Independent journalism · Now There's AI Support &amp; Patch — A World Without Power for Anyone.
      </div>
    </footer>
  );
}
