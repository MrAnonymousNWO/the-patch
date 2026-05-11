import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type NavLink =
  | { type: "internal"; to: "/"; label: string; exact?: boolean }
  | { type: "hash"; to: "/"; hash: string; label: string }
  | { type: "external"; href: string; label: string };

const navLinks: NavLink[] = [
  { type: "internal", to: "/", label: "Home", exact: true },
  { type: "hash", to: "/", hash: "latest-posts", label: "Articles" },
  { type: "hash", to: "/", hash: "about-the-patch", label: "About" },
  { type: "external", href: "https://patch98.wordpress.com/", label: "Patch98" },
  { type: "external", href: "https://electric-paradise.start.page", label: "Electric Paradise" },
  { type: "external", href: "/sitemap.xml", label: "Sitemap" },
];

const baseCls = "transition-colors text-foreground hover:text-primary";
const activeCls = "text-primary underline underline-offset-4";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });

  // Auto-close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  const renderLink = (link: NavLink, onClick?: () => void) => {
    if (link.type === "internal") {
      const isActive = pathname === "/" && !hash;
      return (
        <Link
          to={link.to}
          activeOptions={{ exact: link.exact }}
          className={`${baseCls} ${isActive ? activeCls : ""}`}
          onClick={onClick}
        >
          {link.label}
        </Link>
      );
    }
    if (link.type === "hash") {
      const isActive = pathname === "/" && hash === link.hash;
      return (
        <Link
          to={link.to}
          hash={link.hash}
          className={`${baseCls} ${isActive ? activeCls : ""}`}
          onClick={onClick}
        >
          {link.label}
        </Link>
      );
    }
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseCls}
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

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex flex-wrap gap-6 text-sm font-medium">
            {navLinks.map((l) => (
              <li key={l.label}>{renderLink(l)}</li>
            ))}
          </ul>
        </nav>

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
