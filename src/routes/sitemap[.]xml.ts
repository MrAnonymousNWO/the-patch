import { createFileRoute } from "@tanstack/react-router";

const SITE = "patch98.wordpress.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress_com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const origin = "https://the-patch.lovable.app";

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const WORDPRESS_COM_API_KEY = process.env.WORDPRESS_COM_API_KEY;
        let posts: { slug: string; modified: string; date: string }[] = [];
        let pages: { slug: string; modified: string; date: string }[] = [];
        if (LOVABLE_API_KEY && WORDPRESS_COM_API_KEY) {
          const headers = {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": WORDPRESS_COM_API_KEY,
          };
          async function fetchAll(type: "post" | "page") {
            const out: { slug: string; modified: string; date: string }[] = [];
            let page = 1;
            // Cap at 20 pages * 100 = 2000 items to avoid runaway loops
            for (; page <= 20; page++) {
              const typeQuery = type === "page" ? "&type=page" : "";
              const url = `${GATEWAY_URL}/rest/v1.1/sites/${SITE}/posts/?number=100&page=${page}${typeQuery}&fields=slug,modified,date`;
              const res = await fetch(url, { headers });
              if (!res.ok) break;
              const data: any = await res.json();
              const batch = (data.posts || []).map((p: any) => ({
                slug: p.slug,
                modified: p.modified || p.date,
                date: p.date,
              }));
              out.push(...batch);
              if (batch.length < 100) break;
            }
            return out;
          }
          try {
            const [p, pg] = await Promise.all([fetchAll("post"), fetchAll("page")]);
            posts = p;
            pages = pg;
          } catch (e) {
            console.error("sitemap: failed to fetch", e);
          }
        }

        const now = new Date().toISOString();
        const urls = [
          `<url><loc>${origin}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          `<url><loc>${origin}/blog</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
          `<url><loc>${origin}/pages</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
          `<url><loc>${origin}/search</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.5</priority></url>`,
          `<url><loc>${origin}/feed.xml</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>0.6</priority></url>`,
          ...posts.map(
            (p) =>
              `<url><loc>${origin}/blog/${p.slug}</loc><lastmod>${new Date(p.modified).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
          ),
          ...pages.map(
            (p) =>
              `<url><loc>${origin}/pages/${p.slug}</loc><lastmod>${new Date(p.modified).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`,
          ),
        ];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            // Short cache so new posts/pages appear quickly in the sitemap
            "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
          },
        });
      },
    },
  },
});
