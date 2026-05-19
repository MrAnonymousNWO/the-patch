import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type NavLink =
  | { type: "internal"; to: "/" | "/pages"; label: string; exact?: boolean }
  | { type: "hash"; to: "/"; hash: string; label: string }
  | { type: "external"; href: string; label: string };

const navLinks: NavLink[] = [
  { type: "internal", to: "/", label: "Home", exact: true },
  { type: "hash", to: "/", hash: "latest-posts", label: "Articles" },
  { type: "internal", to: "/pages", label: "Pages" },
  { type: "hash", to: "/", hash: "about-the-patch", label: "About" },
  { type: "external", href: "https://patch98.wordpress.com/", label: "Patch98" },
  { type: "external", href: "https://electric-paradise.start.page", label: "Electric Paradise" },
  { type: "external", href: "/sitemap.xml", label: "Sitemap" },
];

const baseCls =
  "relative inline-flex items-center transition-colors text-foreground/80 hover:text-primary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full";
const activeCls = "text-primary after:w-full";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const renderLink = (link: NavLink, onClick?: () => void) => {
    if (link.type === "internal") {
      const isActive =
        link.to === "/"
          ? pathname === "/" && !hash
          : pathname === link.to || pathname.startsWith(link.to + "/");
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
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-border/60 bg-sidebar/80 backdrop-blur-xl shadow-[var(--shadow-elegant)]"
          : "border-transparent bg-sidebar/40 backdrop-blur"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span
            aria-hidden
            className="grid h-10 w-10 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)] transition-transform group-hover:scale-105 group-active:scale-95"
          >
            <span className="text-sm font-black tracking-tighter">TP</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Independent Journalism
            </span>
            <span className="mt-1 text-xl font-bold tracking-tight text-foreground">
              The Patch
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium">
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
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70 text-foreground backdrop-blur transition-all hover:border-primary hover:text-primary active:scale-95 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Mobile primary"
          className="border-t border-border bg-sidebar/95 backdrop-blur-xl lg:hidden"
        >
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 text-base font-medium">
            {navLinks.map((l) => (
              <li key={l.label} className="rounded-lg px-2 py-2 transition-colors hover:bg-accent/60">
                {renderLink(l, () => setOpen(false))}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-sidebar/60 backdrop-blur">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <div className="text-base font-semibold text-foreground">The Patch</div>
          <p className="mt-2 max-w-md">
            Independent journalism on the Juridical Singularity, the World Succession Deed
            1400/98 and a world without unilateral power.
          </p>
        </div>
        <div className="sm:text-right">
          <p>© 2026 The Patch</p>
          <p className="mt-1">
            <a
              href="/feed.xml"
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              RSS
            </a>
            {" · "}
            <a
              href="/sitemap.xml"
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Sitemap
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
