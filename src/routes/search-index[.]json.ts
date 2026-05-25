import { createFileRoute } from "@tanstack/react-router";

const SITE = "patch98.wordpress.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress_com";

const strip = (h = "") => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

async function fetchType(type: "post" | "page", headers: Record<string, string>) {
  const out: any[] = [];
  for (let page = 1; page <= 10; page++) {
    const url = `${GATEWAY_URL}/rest/v1.1/sites/${SITE}/posts/?type=${type}&number=100&page=${page}&fields=slug,title,excerpt,modified,date`;
    const r = await fetch(url, { headers });
    if (!r.ok) break;
    const j: any = await r.json();
    const posts = j.posts || [];
    out.push(...posts);
    if (posts.length < 100) break;
  }
  return out;
}

export const Route = createFileRoute("/search-index.json")({
  server: {
    handlers: {
      GET: async () => {
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const WORDPRESS_COM_API_KEY = process.env.WORDPRESS_COM_API_KEY;
        if (!LOVABLE_API_KEY || !WORDPRESS_COM_API_KEY) {
          return new Response(
            JSON.stringify({ entries: [], total: 0, generatedAt: new Date().toISOString(), error: "WP not configured" }),
            { headers: { "Content-Type": "application/json" } },
          );
        }
        const headers = {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": WORDPRESS_COM_API_KEY,
        };
        const [posts, pages] = await Promise.all([fetchType("post", headers), fetchType("page", headers)]);
        const entries = [
          ...posts.map((p) => ({
            type: "post" as const,
            slug: p.slug,
            title: strip(p.title),
            excerpt: strip(p.excerpt).slice(0, 220),
            modified: p.modified || p.date,
          })),
          ...pages.map((p) => ({
            type: "page" as const,
            slug: p.slug,
            title: strip(p.title),
            excerpt: strip(p.excerpt).slice(0, 220),
            modified: p.modified || p.date,
          })),
        ].sort((a, b) => (b.modified || "").localeCompare(a.modified || ""));

        return new Response(
          JSON.stringify({ generatedAt: new Date().toISOString(), total: entries.length, entries }),
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
              "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
            },
          },
        );
      },
    },
  },
});
