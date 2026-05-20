import { createFileRoute } from "@tanstack/react-router";

const SITE = "patch98.wordpress.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress_com";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const WORDPRESS_COM_API_KEY = process.env.WORDPRESS_COM_API_KEY;
        let posts: { slug: string; modified: string; date: string }[] = [];
        let pages: { slug: string; modified: string; date: string }[] = [];
        if (LOVABLE_API_KEY && WORDPRESS_COM_API_KEY) {
          const headers = {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "X-Connection-Api-Key": WORDPRESS_COM_API_KEY,
          };
          try {
            const [pRes, pgRes] = await Promise.all([
              fetch(
                `${GATEWAY_URL}/rest/v1.1/sites/${SITE}/posts/?number=100&fields=slug,modified,date`,
                { headers },
              ),
              fetch(
                `${GATEWAY_URL}/rest/v1.1/sites/${SITE}/posts/?type=page&number=100&fields=slug,modified,date`,
                { headers },
              ),
            ]);
            if (pRes.ok) {
              const data: any = await pRes.json();
              posts = (data.posts || []).map((p: any) => ({
                slug: p.slug,
                modified: p.modified || p.date,
                date: p.date,
              }));
            }
            if (pgRes.ok) {
              const data: any = await pgRes.json();
              pages = (data.posts || []).map((p: any) => ({
                slug: p.slug,
                modified: p.modified || p.date,
                date: p.date,
              }));
            }
          } catch (e) {
            console.error("sitemap: failed to fetch", e);
          }
        }

        const now = new Date().toISOString();
        const urls = [
          `<url><loc>${origin}/</loc><lastmod>${now}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          `<url><loc>${origin}/pages</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
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
