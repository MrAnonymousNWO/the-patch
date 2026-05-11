import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { type: "internal" as const, to: "/", label: "Home", exact: true },
  { type: "hash" as const, to: "/", hash: "latest-posts", label: "Articles" },
  { type: "hash" as const, to: "/", hash: "about-the-patch", label: "About" },
  { type: "external" as const, href: "https://patch98.wordpress.com/", label: "Patch98" },
  { type: "external" as const, href: "https://electric-paradise.start.page", label: "Electric Paradise" },
  { type: "external" as const, href: "/sitemap.xml", label: "Sitemap" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  const renderLink = (
    link: (typeof navLinks)[number],
    onClick?: () => void,
  ) => {
    const cls = "text-foreground hover:text-primary";
    if (link.type === "internal") {
      return (
        <Link
          to={link.to}
          activeOptions={{ exact: link.exact }}
          activeProps={{ className: "text-primary underline underline-offset-4" }}
          className={cls}
          onClick={onClick}
        >
          {link.label}
        </Link>
      );
    }
    if (link.type === "hash") {
      return (
        <Link to={link.to} hash={link.hash} className={cls} onClick={onClick}>
          {link.label}
        </Link>
      );
    }
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onClick={onClick}
      >
        {link.label}
      </a>
    );
  };

  return (
    <header className="border-b border-border bg-sidebar">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-6">
        <Link to="/" className="flex flex-col" onClick={() => setOpen(false)}>
          <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Independent Journalism
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">The Patch</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex flex-wrap gap-6 text-sm font-medium">
            {navLinks.map((l) => (
              <li key={l.label}>{renderLink(l)}</li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile primary"
          className="border-t border-border bg-sidebar md:hidden"
        >
          <ul className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-4 text-base font-medium">
            {navLinks.map((l) => (
              <li key={l.label}>{renderLink(l, () => setOpen(false))}</li>
            ))}
          </ul>
        </nav>
      )}
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
