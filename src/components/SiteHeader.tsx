import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import patchLogo from "@/assets/patch-logo.png";

type NavLink =
  | { type: "internal"; to: "/" | "/pages" | "/blog" | "/search"; label: string; exact?: boolean }
  | { type: "hash"; to: "/"; hash: string; label: string }
  | { type: "external"; href: string; label: string };

const navLinks: NavLink[] = [
  { type: "internal", to: "/", label: "Home", exact: true },
  { type: "internal", to: "/blog", label: "Blog" },
  { type: "internal", to: "/pages", label: "Pages" },
  { type: "internal", to: "/search", label: "Search" },
  { type: "hash", to: "/", hash: "about-the-patch", label: "About" },
  { type: "external", href: "https://wiki.technocracy.tech/", label: "Treaty Law Wiki" },
  { type: "external", href: "https://patch98.wordpress.com/", label: "Patch98" },
  { type: "external", href: "https://electric-paradise.start.page", label: "Electric Paradise" },
  { type: "external", href: "https://singularity41.wordpress.com/", label: "Singularity University" },
];

const baseCls =
  "relative inline-flex items-center transition-colors text-foreground/80 hover:text-primary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full";
const activeCls = "text-primary after:w-full";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const drawerRef = useRef<HTMLDivElement>(null);
  const lastYRef = useRef(0);

  useEffect(() => {
    setOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const delta = y - lastYRef.current;
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80) setHidden(true);
        else if (delta < 0) setHidden(false);
        lastYRef.current = y;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on outside click and ESC
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Lock body scroll while drawer open so the page underneath cannot show through
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const renderLink = (link: NavLink, onClick?: () => void, inDrawer = false) => {
    const drawerBase = inDrawer
      ? "block w-full rounded-md px-3 py-2 bg-[hsl(205_85%_96%)] hover:bg-[hsl(205_85%_86%)]"
      : "";
    const drawerActive = inDrawer ? "bg-[hsl(205_85%_78%)] !text-primary" : "";
    if (link.type === "internal") {
      const isActive =
        link.to === "/"
          ? pathname === "/" && !hash
          : pathname === link.to || pathname.startsWith(link.to + "/");
      return (
        <Link
          to={link.to}
          activeOptions={{ exact: link.exact }}
          className={`${baseCls} ${drawerBase} ${isActive ? `${activeCls} ${drawerActive}` : ""}`}
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
          className={`${baseCls} ${drawerBase} ${isActive ? `${activeCls} ${drawerActive}` : ""}`}
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
        className={`${baseCls} ${drawerBase}`}
        onClick={onClick}
      >
        {link.label}
      </a>
    );
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 will-change-transform ${
        hidden && !open ? "-translate-y-full" : "translate-y-0"
      } ${
        scrolled
          ? "border-border/60 bg-[hsl(205_85%_88%)] shadow-[var(--shadow-elegant)]"
          : "border-transparent bg-[hsl(205_85%_92%)]"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="side-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-[hsl(205_85%_92%)] text-foreground transition-all hover:border-primary hover:text-primary active:scale-95 lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link to="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
            <img
              src={patchLogo}
              alt="The Patch — declassified seal"
              className="h-12 w-12 rounded-full object-contain shadow-[var(--shadow-elegant)] transition-transform group-hover:rotate-3 group-hover:scale-105 group-active:scale-95"
            />
            <span className="flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                · · · Declassified Dispatches · · ·
              </span>
              <span className="mt-1 font-display text-xl font-bold tracking-tight text-foreground">
                The Patch
              </span>
            </span>
          </Link>
        </div>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex flex-wrap items-center gap-6 text-sm font-medium">
            {navLinks.map((l) => (
              <li key={l.label}>{renderLink(l)}</li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Left-side drawer (mobile/tablet) */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          ref={drawerRef}
          id="side-nav"
          aria-label="Side navigation"
          style={{ backgroundColor: "hsl(205 85% 92%)" }}
          className={`absolute left-0 top-0 h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            style={{ backgroundColor: "hsl(205 85% 92%)" }}
            className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-5 py-4"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Menu
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{ backgroundColor: "hsl(205 85% 92%)" }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:border-primary hover:text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Mobile primary" style={{ backgroundColor: "hsl(205 85% 92%)" }}>
            <ul className="flex flex-col gap-1 px-3 py-4 text-base font-medium">
              {navLinks.map((l) => (
                <li key={l.label} className="rounded-md">
                  {renderLink(l, () => setOpen(false), true)}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
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
