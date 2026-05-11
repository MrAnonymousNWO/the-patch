import { createFileRoute } from "@tanstack/react-router";

const SITE = "patch98.wordpress.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/wordpress_com";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/feed.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
        const WORDPRESS_COM_API_KEY = process.env.WORDPRESS_COM_API_KEY;
        let posts: any[] = [];

        if (LOVABLE_API_KEY && WORDPRESS_COM_API_KEY) {
          try {
            const res = await fetch(
              `${GATEWAY_URL}/rest/v1.1/sites/${SITE}/posts/?number=50&fields=ID,slug,title,excerpt,date,modified,URL,author`,
              {
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "X-Connection-Api-Key": WORDPRESS_COM_API_KEY,
                },
              },
            );
            if (res.ok) {
              const data: any = await res.json();
              posts = data.posts || [];
            }
          } catch (e) {
            console.error("feed.xml: failed to fetch posts", e);
          }
        }

        const lastBuild = posts[0]?.modified || new Date().toISOString();
        const items = posts
          .map((p) => {
            const link = `${origin}/blog/${p.slug}`;
            const desc = (p.excerpt || "").replace(/<[^>]+>/g, "").trim();
            return `    <item>
      <title>${escapeXml(p.title || "")}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(desc)}</description>
    </item>`;
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>The Patch</title>
    <link>${origin}/</link>
    <description>Independent journalism on the Juridical Singularity, the World Succession Deed 1400/98, and AI support.</description>
    <language>en</language>
    <lastBuildDate>${new Date(lastBuild).toUTCString()}</lastBuildDate>
    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
